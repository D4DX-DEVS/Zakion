import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db, env } from "./env";
import { hashSecret, newRecoveryCode, normalizeCode, randomHex, sameStr as same, verifySecret } from "./password";

const COOKIE = "zk_session";
const TTL = 60 * 60 * 24 * 7;
const enc = new TextEncoder();

async function sign(data: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(env().SESSION_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, "0")).join("");
}

type AuthRow = { pass_hash: string; pass_salt: string; recovery_hash: string; recovery_salt: string; session_ver: number; updated_at: string };
// No row yet (or the migration hasn't run): the ADMIN_PASSWORD secret is the password, so a deploy can never lock the admin out.
async function authRow() {
  try { return await db().prepare("SELECT * FROM admin_auth WHERE id=1").first<AuthRow>(); } catch { return null; }
}

async function startSession(ver: number) {
  const exp = String(Math.floor(Date.now() / 1000) + TTL);
  (await cookies()).set(COOKIE, `${exp}.${ver}.${await sign(`${exp}.${ver}`)}`, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: TTL });
}

async function passwordOk(pass: string, row: AuthRow | null) {
  return row ? verifySecret(pass, row.pass_salt, row.pass_hash) : same(pass, env().ADMIN_PASSWORD || "");
}

export async function login(user: string, pass: string) {
  const row = await authRow();
  const userOk = same(user, env().ADMIN_USER || "admin");
  const passOk = await passwordOk(pass, row);
  if (!(userOk && passOk)) return false;
  await startSession(row?.session_ver ?? 0);
  return true;
}
export async function logout() { (await cookies()).delete(COOKIE); }

export async function isAdmin() {
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return false;
  const [exp, ver, sig] = v.split(".");
  if (!(Number(exp) > Date.now() / 1000) || !same(sig || "", await sign(`${exp}.${ver}`))) return false;
  return Number(ver) === ((await authRow())?.session_ver ?? 0);
}
export async function requireAdmin() { if (!(await isAdmin())) redirect("/admin/login"); }

// Stores the new password and a fresh recovery code, signs out every other session and keeps this one signed in.
// Returns the recovery code: it is shown once and only its hash is kept.
async function savePassword(next: string, row: AuthRow | null) {
  const code = newRecoveryCode();
  const ps = randomHex(16), rs = randomHex(16), ver = (row?.session_ver ?? 0) + 1;
  await db()
    .prepare(`INSERT INTO admin_auth (id,pass_hash,pass_salt,recovery_hash,recovery_salt,session_ver,updated_at) VALUES (1,?,?,?,?,?,datetime('now'))
      ON CONFLICT(id) DO UPDATE SET pass_hash=excluded.pass_hash,pass_salt=excluded.pass_salt,recovery_hash=excluded.recovery_hash,recovery_salt=excluded.recovery_salt,session_ver=excluded.session_ver,updated_at=excluded.updated_at`)
    .bind(await hashSecret(next, ps), ps, await hashSecret(normalizeCode(code), rs), rs, ver)
    .run();
  await startSession(ver);
  return code;
}

export async function changePassword(current: string, next: string) {
  const row = await authRow();
  return (await passwordOk(current, row)) ? savePassword(next, row) : null;
}

// "Forgot password": the recovery code proves it's the owner. Only possible once a code exists, i.e. after the first change.
export async function resetWithRecovery(code: string, next: string) {
  const row = await authRow();
  if (!row || !(await verifySecret(normalizeCode(code), row.recovery_salt, row.recovery_hash))) return null;
  return savePassword(next, row);
}
// When the current recovery code was created (UTC "YYYY-MM-DD HH:MM:SS"), or null if none exists yet.
export const recoverySetOn = async () => (await authRow())?.updated_at ?? null;

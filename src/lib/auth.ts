import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "./env";

const COOKIE = "zk_session";
const TTL = 60 * 60 * 24 * 7;
const enc = new TextEncoder();

async function sign(data: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(env().SESSION_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, "0")).join("");
}
const same = (a: string, b: string) => a.length === b.length && [...a].reduce((r, c, i) => r | (c.charCodeAt(0) ^ b.charCodeAt(i)), 0) === 0;

export async function login(user: string, pass: string) {
  const e = env();
  if (!same(user, e.ADMIN_USER || "admin") || !same(pass, e.ADMIN_PASSWORD)) return false;
  const exp = String(Math.floor(Date.now() / 1000) + TTL);
  (await cookies()).set(COOKIE, `${exp}.${await sign(exp)}`, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: TTL });
  return true;
}
export async function logout() { (await cookies()).delete(COOKIE); }

export async function isAdmin() {
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return false;
  const [exp, sig] = v.split(".");
  return Number(exp) > Date.now() / 1000 && same(sig || "", await sign(exp));
}
export async function requireAdmin() { if (!(await isAdmin())) redirect("/admin/login"); }

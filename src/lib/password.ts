// Password and recovery-code helpers (WebCrypto only, so they run in Workers, Node and the browser).
const enc = new TextEncoder();
const hex = (b: ArrayBuffer | Uint8Array) => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");

export const randomHex = (bytes: number) => hex(crypto.getRandomValues(new Uint8Array(bytes)));
export const sameStr = (a: string, b: string) => a.length === b.length && [...a].reduce((r, c, i) => r | (c.charCodeAt(0) ^ b.charCodeAt(i)), 0) === 0;

// shortcut: 100k PBKDF2 rounds because Cloudflare Workers refuses more; move to a slower hash if the host ever allows it.
export async function hashSecret(secret: string, salt: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), "PBKDF2", false, ["deriveBits"]);
  return hex(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: enc.encode(salt), iterations: 100000 }, key, 256));
}
export async function verifySecret(secret: string, salt: string, hash: string) {
  return sameStr(await hashSecret(secret, salt), hash);
}

// 32 letters and digits with no I, O, 0 or 1, so a code read off paper can't be mistyped. 25 chars = 125 bits.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function newRecoveryCode() {
  const code = [...crypto.getRandomValues(new Uint8Array(25))].map(b => ALPHABET[b % 32]).join("");
  return code.match(/.{5}/g)!.join("-");
}
export const normalizeCode = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");

export const MIN_LENGTH = 12;
export function passwordProblem(p: string): string | null {
  if (p.length < MIN_LENGTH) return `Use at least ${MIN_LENGTH} characters`;
  if (new Set(p).size < 5) return "Use a more varied password";
  return null;
}

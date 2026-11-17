// Self-check for the password helpers: node tools/password-check.mjs
import assert from "node:assert/strict";
import { hashSecret, verifySecret, newRecoveryCode, normalizeCode, passwordProblem, randomHex } from "../src/lib/password.ts";

const salt = randomHex(16), h = await hashSecret("correct horse battery", salt);
assert.equal(h.length, 64);
assert.ok(await verifySecret("correct horse battery", salt, h));
assert.ok(!(await verifySecret("correct horse batterY", salt, h)), "wrong password must fail");
assert.notEqual(h, await hashSecret("correct horse battery", randomHex(16)), "salt must change the hash");

const codes = new Set(Array.from({ length: 200 }, newRecoveryCode));
assert.equal(codes.size, 200, "codes must not repeat");
for (const c of codes) assert.match(c, /^([A-HJ-NP-Z2-9]{5}-){4}[A-HJ-NP-Z2-9]{5}$/);
const c = [...codes][0];
assert.equal(normalizeCode(c.toLowerCase().replaceAll("-", " ")), normalizeCode(c), "codes are typed in any case, with or without dashes");

assert.equal(passwordProblem("short"), "Use at least 12 characters");
assert.ok(passwordProblem("aaaaaaaaaaaaaa"));
assert.equal(passwordProblem("sun-river-4821-maple"), null);
console.log("password helpers: all checks passed");

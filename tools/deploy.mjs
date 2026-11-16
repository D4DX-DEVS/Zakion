// Build + deploy without local-only env files: OpenNext inlines .env into the Worker bundle, which would publish local dev
// secrets. Production secrets live in Cloudflare (wrangler secret), so the files are parked during the build and always restored.
import fs from "fs";
import { execSync } from "child_process";

const FILES = [".env", ".env.local", ".env.production", ".env.production.local"].filter((f) => fs.existsSync(f));
for (const f of FILES) fs.renameSync(f, f + ".parked");
try {
  const cmd = process.argv[2] === "preview" ? "preview" : "deploy"; // only these two, never raw input
  execSync(`npx opennextjs-cloudflare build && npx opennextjs-cloudflare ${cmd}`, { stdio: "inherit" });
} finally {
  for (const f of FILES) fs.renameSync(f + ".parked", f);
}

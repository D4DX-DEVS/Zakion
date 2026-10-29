// split seed.sql into ~800KB files and run via wrangler d1 execute (--local | --remote)
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
const ROOT = path.resolve(import.meta.dirname, '..');
const mode = process.argv[2] || '--local';
const lines = JSON.parse(fs.readFileSync(ROOT + '/seed/seed.json', 'utf8'));
const dir = ROOT + '/seed/parts'; fs.mkdirSync(dir, { recursive: true });
let n = 0, buf = [], size = 0;
const flush = () => { if (!buf.length) return; const f = `${dir}/part${n++}.sql`; fs.writeFileSync(f, buf.join('\n') + '\n'); buf = []; size = 0; };
for (const l of lines) { if (size + l.length > 700000) flush(); buf.push(l); size += l.length; }
flush();
execSync(`npx wrangler d1 execute zakion-db ${mode} --command "DELETE FROM pages; DELETE FROM posts;"`, { stdio: 'inherit', cwd: ROOT });
for (let i = 0; i < n; i++) execSync(`npx wrangler d1 execute zakion-db ${mode} --yes --file seed/parts/part${i}.sql`, { stdio: 'inherit', cwd: ROOT });

// Writes SEO titles/descriptions into D1 without a full reseed: node tools/apply-seo.mjs --local|--remote
import { execSync } from 'child_process';
import path from 'path';
import { SEO } from './seo-data.mjs';
const ROOT = path.resolve(import.meta.dirname, '..');
const mode = process.argv[2] || '--local';
const q = s => "'" + s.split("'").join("''") + "'";
const sql = Object.entries(SEO).map(([p, [t, d]]) => `UPDATE pages SET title=${q(t)}, description=${q(d)} WHERE path=${q(p)};`).join(' ');
execSync(`npx wrangler d1 execute zakion-db ${mode} --command "${sql.split('"').join('\\"')}"`, { stdio: 'inherit', cwd: ROOT });

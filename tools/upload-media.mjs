// upload seed/media/** to R2 bucket. usage: node tools/upload-media.mjs --local|--remote
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
const ROOT = path.resolve(import.meta.dirname, '..');
const mode = process.argv[2] || '--local';
const BUCKET = 'zakion-media';
const types = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml', mp4: 'video/mp4', webm: 'video/webm', ico: 'image/x-icon', pdf: 'application/pdf', css: 'text/css', js: 'text/javascript', json: 'application/json', woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf' };
const files = [];
const only = process.argv[3] || '';
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : files.push(p); } })(ROOT + '/seed/media' + (only ? '/' + only : ''));
const wr = path.join(ROOT, 'node_modules/wrangler/bin/wrangler.js');
const run = f => new Promise(res => {
  const key = path.relative(ROOT + '/seed/media', f).split(path.sep).join('/');
  const ct = types[key.split('.').pop().toLowerCase()] || 'application/octet-stream';
  const p = spawn(process.execPath, [wr, 'r2', 'object', 'put', `${BUCKET}/${key}`, '--file', f, '--content-type', ct, mode], { cwd: ROOT, stdio: 'ignore' });
  p.on('close', c => { if (c) console.log('FAIL', key); res(); });
});
let i = 0, done = 0;
await Promise.all(Array.from({ length: 3 }, async () => { while (i < files.length) { await run(files[i++]); if (++done % 25 === 0) console.log(done + '/' + files.length); } }));
console.log('uploaded', done);

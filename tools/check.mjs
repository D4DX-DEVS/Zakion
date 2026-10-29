import fs from 'fs';
const P = JSON.parse(fs.readFileSync('seed/pages.json', 'utf8'));
const miss = new Set(), ext = new Set();
for (const p of P) {
  const all = p.head_html + p.body_html + p.foot_html;
  for (const m of all.matchAll(/\/(media|wp)\/[^"'\s)<>,;\\]+\.(?:png|jpe?g|gif|webp|svg|css|js|woff2?|mp4|ico)/gi)) {
    const u = decodeURI(m[0].split('?')[0]);
    const f = u.startsWith('/media/') ? 'seed/media/' + u.slice(7) : 'public' + u;
    if (!fs.existsSync(f)) miss.add(u);
  }
  for (const m of all.matchAll(/https?:\/\/[^"'\s)<>,]+/g)) { try { ext.add(new URL(m[0].replace(/&amp;/g, '&')).host); } catch {} }
}
console.log('missing', [...miss].slice(0, 30), miss.size);
console.log([...ext].join('\n'));
console.log(P.map(p => p.path + ' ' + p.body_html.length).join('\n'));

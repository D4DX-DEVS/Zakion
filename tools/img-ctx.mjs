import fs from 'fs';
const P = JSON.parse(fs.readFileSync('seed/pages.json', 'utf8'));
const strip = s => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
for (const path of process.argv.slice(2)) {
  const b = P.find(x => x.path === path).body_html;
  console.log('==', path);
  for (const m of b.matchAll(/<img\b[^>]*>/g)) {
    const src = (m[0].match(/src="([^"]+)"/) || [])[1] || '';
    const ctx = b.slice(Math.max(0, m.index - 260), m.index).replace(/<(?!div|figure|a )[^>]*>/g, '').match(/class="([^"]*)"[^>]*>\s*$/);
    const after = strip(b.slice(m.index + m[0].length, m.index + m[0].length + 500)).slice(0, 50);
    console.log(src.split('/').pop().padEnd(34), '|', (ctx ? ctx[1] : '').slice(-45).padEnd(45), '|', after);
  }
}

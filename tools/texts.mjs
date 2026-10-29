import fs from 'fs';
const P = JSON.parse(fs.readFileSync('seed/pages.json', 'utf8'));
const strip = s => s.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, ' ').replace(/&#?\w+;/g, ' ').replace(/\s+/g, ' ').trim();
for (const path of process.argv.slice(2)) {
  const b = P.find(x => x.path === path).body_html;
  const i = Math.max(0, b.indexOf('<main')), j = b.indexOf('We are a team of social');
  console.log('==', path, '\n', strip(b.slice(i, j > 0 ? j : undefined)).slice(0, +process.env.N || 700), '\n');
}

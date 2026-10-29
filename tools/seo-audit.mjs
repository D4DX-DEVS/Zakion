import fs from 'fs';
const P = JSON.parse(fs.readFileSync('seed/pages.json', 'utf8'));
const dir = 'crawl/pages/';
const strip = s => s.replace(/<[^>]+>/g, ' ').replace(/&#?\w+;/g, ' ').replace(/\s+/g, ' ').trim();
console.log('path | title | desc | h1 | h2 | imgs(noalt/emptyalt) | words | canon | robots | ld+json');
for (const p of P) {
  const f = dir + (p.path === '/' ? '_home' : p.path.replace(/\//g, '__')) + '.html';
  const raw = fs.readFileSync(f, 'utf8');
  const b = p.body_html;
  const h1 = [...b.matchAll(/<h1[\s\S]*?<\/h1>/g)].map(m => strip(m[0]));
  const h2 = (b.match(/<h2/g) || []).length;
  const imgs = [...b.matchAll(/<img\b[^>]*>/g)].map(m => m[0]);
  const noAlt = imgs.filter(i => !/\salt=/.test(i)).length, emptyAlt = imgs.filter(i => /\salt=(""|'')/.test(i)).length;
  const words = strip(b.replace(/<style[\s\S]*?<\/style>/g, '')).split(' ').length;
  const canon = (raw.match(/<link rel=["']canonical["'] href=["']([^"']+)/) || [])[1] || '-';
  const robots = (raw.match(/<meta name=["']robots["'] content=["']([^"']+)/) || [])[1] || '-';
  const ld = (raw.match(/application\/ld\+json/g) || []).length;
  console.log([p.path, p.title, p.description ? p.description.slice(0, 40) : 'NONE', h1.length + ':' + h1.join('/').slice(0, 40), h2, `${imgs.length}(${noAlt}/${emptyAlt})`, words, canon.replace(/.*cloudwaysapps.com/, ''), robots.slice(0, 30), ld].join(' | '));
}
const home = fs.readFileSync(dir + '_home.html', 'utf8');
console.log('\nHOME head metas:\n' + [...home.matchAll(/<(?:meta|link)[^>]*(?:canonical|og:|twitter:|robots|description|alternate|generator)[^>]*>/g)].map(m => m[0].replace(/https:\/\/wordpress-1683093-6757014.cloudwaysapps.com/g, '')).join('\n'));

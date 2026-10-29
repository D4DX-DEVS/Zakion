// Crawl WP site -> out/pages/*.json (raw html), out/assets (css/js/fonts/uploads)
import fs from 'fs'; import path from 'path';
const ORIGIN = 'https://wordpress-1683093-6757014.cloudwaysapps.com';
const OUT = new URL('../crawl/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const SKIP = /^\/(home-\d|home-slider|home-video|landing-|header-footer|test|sample-page|wp-|feed|xmlrpc|cart|checkout|my-account|shop|tag|author|comments)/;
fs.mkdirSync(OUT + 'pages', { recursive: true });
const seen = new Set(), queue = ['/'], pages = {};
while (queue.length) {
  const p = queue.shift(); if (seen.has(p)) continue; seen.add(p);
  const r = await fetch(ORIGIN + p, { redirect: 'follow' });
  if (!r.ok || !(r.headers.get('content-type') || '').includes('html')) continue;
  const html = await r.text(); pages[p] = html;
  for (const m of html.matchAll(/href=["']([^"'#?]+)["']/g)) {
    let u = m[1]; if (u.startsWith(ORIGIN)) u = u.slice(ORIGIN.length); else if (/^https?:/.test(u)) continue;
    if (!u.startsWith('/') || /\.\w{2,4}$/.test(u) || SKIP.test(u) || seen.has(u) || queue.includes(u)) continue;
    queue.push(u);
  }
  if (Object.keys(pages).length > 150) break;
}
for (const [p, h] of Object.entries(pages)) fs.writeFileSync(OUT + 'pages/' + (p === '/' ? '_home' : p.replace(/\//g, '__')) + '.html', h);
console.log(Object.keys(pages).join('\n'), '\n', Object.keys(pages).length);

// crawl/pages/*.html -> downloads assets, rewrites urls, emits seed/pages.json
import fs from 'fs'; import path from 'path';
const ORIGIN = 'https://wordpress-1683093-6757014.cloudwaysapps.com';
const ROOT = path.resolve(import.meta.dirname, '..');
const CR = ROOT + '/crawl', PUB = ROOT + '/public/wp', MEDIA = ROOT + '/seed/media';
fs.mkdirSync(PUB, { recursive: true }); fs.mkdirSync(MEDIA, { recursive: true }); fs.mkdirSync(ROOT + '/seed', { recursive: true });
const got = new Set(); const todo = [];
const esc = s => s.split(String.fromCharCode(92)+"/").join("/");
const local = u => { // abs-path on origin -> local url
  const p = u.replace(ORIGIN, '');
  return p.startsWith('/wp-content/uploads/') ? '/media/' + p.slice(20) : '/wp' + p.replace(/^\/wp-/, '/');
};
// '/wp-content/x' -> '/wp/content/x', '/wp-includes/x' -> '/wp/includes/x'
function fileFor(u) { const l = local(u).split('?')[0]; return l.startsWith('/media/') ? MEDIA + '/' + decodeURI(l.slice(7)) : ROOT + '/public' + decodeURI(l); }
function want(u) { u = u.split('#')[0].replace(/&#038;|&amp;/g, '&'); const k = u.split('?')[0]; if (!got.has(k)) { got.add(k); todo.push(u); } }
function scan(text) {
  for (const m of esc(text).matchAll(/https?:\/\/wordpress-1683093-6757014\.cloudwaysapps\.com(\/wp-(?:content|includes)\/[^"'\s)<>\,]+\.(?:css|js|png|jpe?g|gif|webp|svg|woff2?|ttf|eot|otf|mp4|webm|ico|json))/gi)) want(ORIGIN + m[1]);
}
const BS = String.fromCharCode(92);
const PAIRS = [[ORIGIN + '/wp-content/uploads/', '/media/'], [ORIGIN + '/wp-content/', '/wp/content/'], [ORIGIN + '/wp-includes/', '/wp/includes/'],
  ['//wordpress-1683093-6757014.cloudwaysapps.com/wp-content/uploads/', '/media/'], [ORIGIN, ''], ['/wp-content/uploads/', '/media/'], ['/wp-content/', '/wp/content/'], ['/wp-includes/', '/wp/includes/']];
function rewrite(text) {
  for (const [f, t] of PAIRS) {
    text = text.split(f).join(t);
    text = text.split(f.split('/').join(BS + '/')).join(t.split('/').join(BS + '/'));
  }
  return text;
}
const pages = [];
for (const f of fs.readdirSync(CR + '/pages')) {
  let html = fs.readFileSync(CR + '/pages/' + f, 'utf8');
  scan(html);
  const urlPath = f === '_home.html' ? '/' : f.replace(/\.html$/, '').replace(/__/g, '/');
  const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
  const desc = (html.match(/<meta name=["']description["'] content=["']([^"']*)/) || [])[1] || '';
  const og = (html.match(/<meta property=["']og:image["'] content=["']([^"']*)/) || [])[1] || '';
  const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/)[1];
  const bodyTag = html.match(/<body([^>]*)>/)[1];
  let body = html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];
  const headAssets = [...head.matchAll(/<link[^>]+rel=['"]stylesheet['"][^>]*>|<style[\s\S]*?<\/style>/g)].map(m => m[0]);
  const scripts = [...(head + body).matchAll(/<script[\s\S]*?<\/script>/g)].map(m => m[0]).filter(s => !/application\/ld\+json|breeze|ymc|cf7|contact-form-7|wpcf7|search-form|googletagmanager/i.test(s));
  body = body.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<noscript[\s\S]*?<\/noscript>/g, '');
  pages.push({ path: urlPath, title: title.replace(/&#8211;/g, '–').replace(/&amp;/g, '&').replace(/&#038;/g, '&'), description: desc, og_image: og ? rewrite(og) : '', body_class: (bodyTag.match(/class="([^"]*)"/) || [])[1] || '', head_html: rewrite(headAssets.join('\n')), body_html: rewrite(body), foot_html: rewrite(scripts.join('\n')) });
}
// download loop
let n = 0;
while (todo.length) {
  const u = todo.shift(); const dest = fileFor(u);
  if (fs.existsSync(dest)) { if (/\.css$/.test(dest)) scanCss(dest, u); continue; }
  try {
    const r = await fetch(u.startsWith('http') ? u : ORIGIN + u); if (!r.ok) { console.log('FAIL', r.status, u); continue; }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const buf = Buffer.from(await r.arrayBuffer());
    if (/\.(css|js)$/i.test(dest)) { let t = buf.toString('utf8'); if (/\.css$/i.test(dest)) scanCssText(t, u); fs.writeFileSync(dest, /\.css$/i.test(dest) ? cssRewrite(t, u) : rewrite(t)); }
    else fs.writeFileSync(dest, buf);
    n++;
  } catch (e) { console.log('ERR', u, e.message); }
}
function scanCss(dest, u) { scanCssText(fs.readFileSync(dest, 'utf8'), u); }
function scanCssText(t, base) {
  scan(t);
  for (const m of t.matchAll(/url\(\s*['"]?(?!data:|https?:|\/\/|#)([^'")]+)['"]?\s*\)/g)) { // relative refs
    try { want(new URL(m[1], base.startsWith('http') ? base : ORIGIN + base).href); } catch {}
  }
}
function cssRewrite(t, base) { return rewrite(t); }
fs.writeFileSync(ROOT + '/seed/pages.json', JSON.stringify(pages, null, 1));
console.log('downloaded', n, 'pages', pages.length);

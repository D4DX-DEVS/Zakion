// node tools/seo-verify.mjs [base]  -> checks every URL in the sitemap + known duplicate/variant URLs
const base = process.argv[2] || 'http://localhost:3000';
const get = async (p, init) => { const r = await fetch(base + p, { redirect: 'manual', ...init }); return { r, t: r.status < 300 ? await r.text() : '' }; };
const sm = await get('/sitemap.xml');
console.log('sitemap', sm.r.status, sm.r.headers.get('content-type'));
const locs = [...sm.t.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(m[1]).pathname);
const rb = await get('/robots.txt');
console.log('robots', rb.r.status, JSON.stringify(rb.t));
const titles = new Map(), descs = new Map();
let bad = 0;
const fail = (p, m) => { bad++; console.log('FAIL', p, m); };
for (const p of [...locs, '/portfolio/ecoharbor/', '/exploring-the-latest-innovations-in-solar-technology/']) {
  const { r, t } = await get(p);
  if (r.status !== 200) { fail(p, 'status ' + r.status); continue; }
  const title = (t.match(/<title>([^<]*)/) || [])[1], desc = (t.match(/<meta name="description" content="([^"]*)/) || [])[1];
  const canon = (t.match(/<link rel="canonical" href="([^"]+)/) || [])[1], robots = (t.match(/<meta name="robots" content="([^"]+)/) || [])[1];
  const h1 = (t.match(/<h1\b/g) || []).length;
  let ld = 0;
  for (const m of t.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); ld++; } catch { fail(p, 'bad JSON-LD'); } }
  if (!title) fail(p, 'no title');
  if (!desc) fail(p, 'no description');
  if (!canon) fail(p, 'no canonical');
  if (ld !== 1) fail(p, 'ld+json blocks ' + ld);
  if (h1 !== 1) console.log('WARN', p, 'h1 count', h1);
  if (locs.includes(p)) { if (titles.has(title)) fail(p, 'dup title with ' + titles.get(title)); titles.set(title, p); if (desc) { if (descs.has(desc)) fail(p, 'dup desc with ' + descs.get(desc)); descs.set(desc, p); } }
  console.log(p.padEnd(55), String(title).slice(0, 38).padEnd(38), '|', canon?.replace(/https?:\/\/[^/]+/, ''), '|', robots);
}
for (const p of ['/home/', '/photovoltaic-solutions/', '/portfolio/', '/category/uncategorized/']) { const { r } = await get(p); if (r.status !== 301) fail(p, 'expected 301, got ' + r.status); console.log('redirect', p, r.status, r.headers.get('location')); }
for (const p of ['/about-us', '/blog', '/nope/', '/admin/login', '/favicon.ico']) { const { r } = await get(p); console.log('variant', p, r.status, r.headers.get('location') || '', r.headers.get('x-robots-tag') || ''); }
console.log(bad ? `${bad} problems` : 'all checks passed');

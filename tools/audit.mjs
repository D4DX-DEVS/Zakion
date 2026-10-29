import fs from 'fs';
const P = JSON.parse(fs.readFileSync('seed/pages.json', 'utf8'));
const keys = ['ymc', 'mejs', 'mediaelement', 'wp-emoji', 'emoji', 'comment-reply', 'datepicker', 'ui-core', 'joinchat', 'woo', 'wpcf7', 'filter-everything', 'wpc-', 'breeze'];
for (const k of keys) {
  const hs = P.filter(p => (p.head_html + p.foot_html).includes(k)).length;
  const bs = P.filter(p => p.body_html.includes(k)).length;
  console.log(k.padEnd(18), 'head/foot pages', hs, 'body pages', bs);
}
const p = P[0];
console.log([...(p.head_html + p.foot_html).matchAll(/(?:href|src)=['"]([^'"]+)['"]/g)].map(m => m[1].replace(/\?.*/, '')).filter(u => /emoji|comment|mediaelement|ui\/|ymc|woo|filter|wpc|cf7|contact-form|i18n|hooks/.test(u)).join('\n'));
console.log(p.foot_html.match(/<script[^>]*>(?![^<]*<\/script>)/g)?.length, (p.foot_html.match(/<script(?![^>]*src)[^>]*>[\s\S]*?<\/script>/g) || []).map(s => s.slice(0, 90).replace(/\s+/g, ' ')).join('\n'));

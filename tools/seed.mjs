// seed/pages.json (+ WP REST posts) -> seed/seed.sql (chunked: D1 caps a statement at 100KB)
import fs from 'fs';
import path from 'path';
import { SEO } from './seo-data.mjs';
const ROOT = path.resolve(import.meta.dirname, '..');
const ORIGIN = 'https://wordpress-1683093-6757014.cloudwaysapps.com';
const pages = JSON.parse(fs.readFileSync(ROOT + '/seed/pages.json', 'utf8'));
const BS = String.fromCharCode(92);
const loc = t => t.split(BS + '/').join('/').split(ORIGIN).join('').split('/wp-content/uploads/').join('/media/');
const decode = t => t.replace(/&#8217;/g, '’').replace(/&#8211;/g, '–').replace(/&#038;/g, '&').replace(/&amp;/g, '&').replace(/&#8220;/g, '“').replace(/&#8221;/g, '”');

const wp = async u => (await fetch(ORIGIN + '/wp-json/wp/v2/' + u)).json();
const posts = await wp('posts?per_page=100&_embed=wp:featuredmedia');
const postSlugs = new Set(posts.map(p => '/' + p.slug + '/'));

const sq = s => "'" + String(s).split("'").join("''") + "'";
const sql = [];
const CH = 30000;
function ins(table, cols, vals, big) {
  const small = cols.filter(c => !big.includes(c));
  sql.push(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map(c => big.includes(c) ? "''" : sq(vals[c])).join(',')});`);
  const key = table === 'pages' ? `path=${sq(vals.path)}` : `slug=${sq(vals.slug)}`;
  for (const c of big) for (let i = 0; i < vals[c].length; i += CH)
    sql.push(`UPDATE ${table} SET ${c}=${c}||${sq(vals[c].slice(i, i + CH))} WHERE ${key};`);
}

// --- templates
const adminLink = html => html.replace(/(Powered by D4DX)(<\/p>)/, '$1 &middot; <a href="/admin" class="admin-link">Admin</a>$2');

const CARD_START = '<div class="col-lg-4 col-md-6">';
function listTemplate(body) {
  const a = body.indexOf(CARD_START);
  const last = body.lastIndexOf(CARD_START);
  const end = body.indexOf('<div class="col-md-12">', last);
  return body.slice(0, a) + '{{CARDS}}' + body.slice(end);
}

// WordPress leftovers no page uses: each costs a request (emoji -> s.w.org, prefetch -> extra page loads)
const JUNK = /wp-emoji|speculationrules|comment-reply|jquery\/ui\/|jquery-ui|ymc|filter-everything|woo\.css|ak_js_|elementskit_module_parallax_url|wp-i18n-js-after|wpc-/i;
const strip = (html, re) => (html.match(re) || []).filter(t => !JUNK.test(t)).join('\n');
for (const p of pages) {
  p.head_html = strip(p.head_html, /<link[^>]*>|<style[\s\S]*?<\/style>/g);
  p.foot_html = strip(p.foot_html, /<script[\s\S]*?<\/script>/g);
}

const out = [];
for (const p of pages) {
  const isPost = postSlugs.has(p.path);
  let body = adminLink(p.body_html);
  body = body.split('/wp-json/wp/v2/pages?per_page=100').join('/api/contact'); // CF7 action noise
  let kind = p.path.startsWith('/portfolio/') ? 'project' : 'page';
  if (p.path === '/blog/' || p.path === '/category/uncategorized/') { body = listTemplate(body); kind = 'page'; }
  if (isPost) {
    if (p.path !== '/' + posts[0].slug + '/') continue; // only one post page used as template
    const post = posts[0];
    const title = decode(post.title.rendered);
    const date = new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
    const enc = encodeURIComponent(title).split("'").join('%27');
    body = body.split(post.slug).join('{{SLUG}}').split(enc).join('{{TITLE_ENC}}').split(title).join('{{TITLE}}')
      .split(title.replace(/’/g, '&#8217;')).join('{{TITLE}}').split(`<li>${date}</li>`).join('<li>{{DATE}}</li>');
    // featured image + content
    body = body.replace(/<div class="col-md-12"><div class="post-featured-image">[\s\S]*?<\/figure><\/a><\/div><\/div>/, '{{IMAGE_BLOCK}}');
    body = body.replace(/(<div class="post-entry solor-block-style">)[\s\S]*?(<\/div>\s*<div class="row">\s*<div class="col-lg-8">\s*<div class="post-tags">)/, '$1{{CONTENT}}$2');
    out.push({ ...p, path: '__tpl_post', body_html: body, kind: 'template', title: 'Post template (single post layout)' });
    continue;
  }
  out.push({ ...p, body_html: body, kind });
}
for (const p of out) {
  const seo = SEO[p.path];
  if (seo) [p.title, p.description] = seo;
  p.og_image = p.og_image || '';
  p.title = decode(p.title);
  ins('pages', ['path', 'title', 'description', 'og_image', 'body_class', 'head_html', 'body_html', 'foot_html', 'kind'], p, ['head_html', 'body_html', 'foot_html']);
}
for (const p of posts) {
  const fm = p._embedded?.['wp:featuredmedia']?.[0];
  const image = fm ? loc(fm.media_details?.sizes?.large?.source_url || fm.source_url) : '';
  const ins_ = {
    slug: p.slug, title: decode(p.title.rendered), excerpt: decode(p.excerpt.rendered.replace(/<[^>]+>/g, '')).trim(),
    content: loc(p.content.rendered), image, category: 'Uncategorized', author: 'Amjad', status: 'publish' === p.status ? 'published' : 'draft',
    published_at: p.date.replace('T', ' '),
  };
  ins('posts', Object.keys(ins_), ins_, ['content']);
}
fs.writeFileSync(ROOT + '/seed/seed.json', JSON.stringify(sql));
console.log('pages', out.length, 'posts', posts.length, 'statements', sql.length);

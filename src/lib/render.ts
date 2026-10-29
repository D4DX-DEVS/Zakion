import { db } from "./env";

type Page = { path: string; title: string; description: string; og_image: string; body_class: string; head_html: string; body_html: string; foot_html: string };
export type Post = { id: number; slug: string; title: string; excerpt: string; content: string; image: string; category: string; author: string; status: string; published_at: string };

export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fmtDate = (d: string) => new Date(d.replace(" ", "T") + "Z").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

const FORM_JS = `<script>document.addEventListener('submit',async function(e){var f=e.target;if(!f.classList||!f.classList.contains('wpcf7-form'))return;e.preventDefault();var out=f.querySelector('.wpcf7-response-output');var b=f.querySelector('[type=submit]');b&&(b.disabled=true);try{var r=await fetch('/api/contact',{method:'POST',body:new FormData(f)});var j=await r.json();out.textContent=j.message;out.style.display='block';if(j.ok)f.reset()}catch(x){out.textContent='Something went wrong. Please try again.';out.style.display='block'}b&&(b.disabled=false)});</script>`;

function card(p: Post) {
  const u = `/${p.slug}/`;
  const img = p.image ? `<div class="post-featured-image"><a href="${u}"><figure class="image-anime"><img loading="lazy" width="800" height="450" src="${esc(p.image)}" class="attachment-large size-large wp-post-image" alt="${esc(p.title)}" decoding="async" /></figure></a></div>` : "";
  return `<div class="col-lg-4 col-md-6"><div class="blog-item">${img}<div class="post-item-body"><h3><a href="${u}">${esc(p.title)}</a></h3><div class="post-meta"><ul><li><a href="${u}"><i class="fa-regular fa-calendar-days"></i> ${fmtDate(p.published_at)}</a></li><li><i class="fa-solid fa-tag"></i> <a href="/category/uncategorized/" rel="category tag">${esc(p.category)}</a></li></ul></div><div class="btn-readmore"><a href="${u}" class="btn-default">Read More</a></div></div></div></div>`;
}

function document_(p: Page, body: string) {
  const t = esc(p.title);
  return `<!doctype html><html lang="en-US"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${t}</title>` +
    (p.description ? `<meta name="description" content="${esc(p.description)}">` : "") +
    `<meta property="og:title" content="${t}">` + (p.og_image ? `<meta property="og:image" content="${esc(p.og_image)}">` : "") +
    `<link rel="icon" href="/media/2025/04/cropped-energy-32x32.png" sizes="32x32"><link rel="apple-touch-icon" href="/media/2025/04/cropped-energy-180x180.png">${p.head_html}</head>` +
    `<body class="${esc(p.body_class)}">${body}${p.foot_html}${FORM_JS}</body></html>`;
}

const html = (s: string, status = 200) => new Response(s, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" } });

async function published(): Promise<Post[]> {
  const r = await db().prepare("SELECT * FROM posts WHERE status='published' ORDER BY published_at DESC").all<Post>();
  return r.results;
}

function notFound() {
  return html(`<!doctype html><meta charset="utf-8"><title>Not found</title><body style="font-family:sans-serif;text-align:center;padding:12vh 1rem"><h1>404</h1><p>Page not found.</p><a href="/">Back to home</a>`, 404);
}

function postBody(tpl: string, p: Post) {
  const image = p.image
    ? `<div class="col-md-12"><div class="post-featured-image"><figure class="image-anime"><img width="800" height="450" src="${esc(p.image)}" class="attachment-large size-large wp-post-image" alt="${esc(p.title)}" decoding="async" /></figure></div></div>`
    : "";
  return tpl
    .replaceAll("{{IMAGE_BLOCK}}", () => image)
    .replaceAll("{{CONTENT}}", () => p.content)
    .replaceAll("{{TITLE_ENC}}", () => encodeURIComponent(p.title))
    .replaceAll("{{TITLE}}", () => esc(p.title))
    .replaceAll("{{DATE}}", () => fmtDate(p.published_at))
    .replaceAll("{{SLUG}}", () => p.slug);
}

export async function renderPath(path: string): Promise<Response> {
  const d = db();
  const norm = path === "/" ? "/" : "/" + path.replace(/^\/+|\/+$/g, "") + "/";
  const page = await d.prepare("SELECT * FROM pages WHERE path=? AND status='published' AND kind!='template'").bind(norm).first<Page>();
  if (page) {
    let body = page.body_html;
    if (body.includes("{{CARDS}}")) { const cards = (await published()).map(card).join(""); body = body.replace("{{CARDS}}", () => cards); }
    return html(document_(page, body));
  }
  const slug = norm.slice(1, -1);
  if (slug && !slug.includes("/")) {
    const post = await d.prepare("SELECT * FROM posts WHERE slug=? AND status='published'").bind(slug).first<Post>();
    const tpl = post && (await d.prepare("SELECT * FROM pages WHERE path='__tpl_post'").first<Page>());
    if (post && tpl) return html(document_({ ...tpl, title: post.title + " – Zakionenergy", description: post.excerpt, og_image: post.image }, postBody(tpl.body_html, post)));
  }
  return notFound();
}

export async function previewPost(p: Post) {
  const tpl = await db().prepare("SELECT * FROM pages WHERE path='__tpl_post'").first<Page>();
  return tpl ? html(document_({ ...tpl, title: p.title }, postBody(tpl.body_html, p))) : notFound();
}

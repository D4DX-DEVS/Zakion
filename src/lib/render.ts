import { db } from "./env";
import { improveBody, isPlaceholder, isStaging, seoHead } from "./seo";
import { applyBanner } from "./banners";
import { stripLegacyBlocks } from "./legacy-blocks";
import { applyPage, HOME_HEAD, PAGE_PLAN, replaceMain } from "./home";
import { type Content, loadContent, type Project } from "./content";
import { BACK_TO_TOP, FONT_HEAD, LIGHT_JS, MOTION_EARLY, MOTION_JS } from "./chrome";
import { swapFooter } from "./footer";
import { applyHeader } from "./header";
import { renderSections, SCRIPT_EARLY } from "./sections";
import { isThemed, siteHead, siteOf, socialOf, themeKey, themeText } from "./site";

type Page = { path: string; title: string; description: string; og_image: string; body_class: string; head_html: string; body_html: string; foot_html: string };
export type Post = { id: number; slug: string; title: string; excerpt: string; content: string; image: string; category: string; author: string; status: string; published_at: string; updated_at?: string };

export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fmtDate = (d: string) => new Date(d.replace(" ", "T") + "Z").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

const FORM_JS = `<script>document.addEventListener('submit',async function(e){var f=e.target;if(!f.classList||!f.classList.contains('wpcf7-form'))return;e.preventDefault();var out=f.querySelector('.wpcf7-response-output');var b=f.querySelector('[type=submit]');b&&(b.disabled=true);try{var r=await fetch('/api/contact',{method:'POST',body:new FormData(f)});var j=await r.json();out.textContent=j.message;out.style.display='block';if(j.ok)f.reset()}catch(x){out.textContent='Something went wrong. Please try again.';out.style.display='block'}b&&(b.disabled=false)});</script>`;

// search snippets cut off around 155 characters
const clip = (s: string) => (s.length <= 155 ? s : s.slice(0, 155).replace(/\s+\S*$/, "") + "…");

function card(p: Post) {
  const u = `/${p.slug}/`;
  const img = p.image ? `<div class="post-featured-image"><a href="${u}"><figure class="image-anime"><img loading="lazy" width="800" height="450" src="${esc(p.image)}" class="attachment-large size-large wp-post-image" alt="${esc(p.title)}" decoding="async" /></figure></a></div>` : "";
  return `<div class="col-lg-4 col-md-6"><div class="blog-item">${img}<div class="post-item-body"><h3><a href="${u}">${esc(p.title)}</a></h3><div class="post-meta"><ul><li><a href="${u}"><i class="fa-regular fa-calendar-days"></i> ${fmtDate(p.published_at)}</a></li><li><i class="fa-solid fa-tag"></i> <a href="/category/uncategorized/" rel="category tag">${esc(p.category)}</a></li></ul></div><div class="btn-readmore"><a href="${u}" class="btn-default">Read More</a></div></div></div></div>`;
}

// Fixes that apply to every mirrored page: the theme's breadcrumb widget ships without CSS (a numbered list),
// and header contact/social links are too small to tap on phones.
const PUBLIC_CSS = `<style>
ol.ekit-breadcrumb{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px}
ol.ekit-breadcrumb li{display:inline-flex;align-items:center;list-style:none;margin:0;padding:0}
ol.ekit-breadcrumb li::marker{content:""}
.page-header-box ol.ekit-breadcrumb a,.page-header-box ol.ekit-breadcrumb span{color:inherit}
@media(max-width:767px){
a[href^="mailto:"],a[href^="tel:"]{display:inline-flex;align-items:center;min-height:44px}
.ekit_social_media a{display:inline-flex;align-items:center;justify-content:center;min-width:44px;min-height:44px}
img,video,iframe{max-width:100%}
}
</style>`;

// The theme's "SmoothScroll" script takes over the mouse wheel and animates every scroll itself (400ms), which feels laggy and
// keeps scrolling on the main thread. Native scrolling is smoother, so the script tag is removed from every page.
const noSmoothScroll = (h: string) => h.replace(/<script[^>]*id=["']SmoothScroll-js["'][^>]*><\/script>/g, "");

function document_(p: Page, body: string, c: Content, post?: Post) {
  const t = esc(p.title);
  const site = siteOf(c); // Site settings: theme, fonts, layout and the on/off switches
  const sameAs = socialOf(c).filter((x) => x.network !== "WhatsApp").map((x) => x.url); // wa.me is a chat link, not a profile
  body = stripLegacyBlocks(body, p.path); // no Technology Partners grid or call to action baked into inner pages
  body = applyBanner(body, p.path, c, !!post); // the picture behind the page title (Studio > Page banners)
  if (!site.scrollAnimations) body = body.split(SCRIPT_EARLY).join(""); // the sections then never hide their content for the reveal
  // A chosen theme also recolours what the stored pages hard-code: inline colours, and the Elementor stylesheets (recoloured when they are
  // served, see the media route; the key in the link makes the browser fetch the recoloured copy).
  let head = p.head_html, foot = p.foot_html;
  if (isThemed(site)) {
    body = themeText(body, site);
    foot = themeText(foot, site);
    head = themeText(head, site).replace(/(\/media\/elementor\/css\/[^'"?]+\?ver=\d+)/g, `$1&th=${themeKey(site)}`);
  }
  return `<!doctype html><html lang="en-US"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${site.scrollAnimations ? MOTION_EARLY : ""}<title>${t}</title>` +
    (p.description ? `<meta name="description" content="${esc(p.description)}">` : "") +
    `<meta property="og:title" content="${t}">` + seoHead(p, post, isPlaceholder(body), sameAs.length ? sameAs : undefined) +
    `<link rel="icon" href="/favicon.ico" sizes="32x32"><link rel="icon" type="image/png" href="/icon-192.png" sizes="192x192"><link rel="apple-touch-icon" href="/apple-touch-icon.png">${head}${PUBLIC_CSS}<link rel="stylesheet" href="/zk-deck.css?v=15">${FONT_HEAD}<link rel="stylesheet" href="/zk-wide.css?v=10">${p.path in PAGE_PLAN || p.path.startsWith("/projects/") ? HOME_HEAD : ""}<link rel="stylesheet" href="/zk-footer.css?v=2"><link rel="stylesheet" href="/zk-motion.css?v=12"><link rel="stylesheet" href="/zk-menu.css?v=7">${siteHead(site)}</head>` +
    `<body class="${esc(p.body_class)}">${improveBody(swapFooter(noSmoothScroll(applyHeader(body, c, p.path)), c), post ? post.title : p.title.split(/ [–|] /)[0])}${site.scrollAnimations ? MOTION_JS : ""}${site.imageShine ? LIGHT_JS : ""}${noSmoothScroll(foot)}${FORM_JS}${site.backToTop ? BACK_TO_TOP : ""}<script src="/zk-deck.js?v=12" defer></script></body></html>`;
}

const html = (s: string, status = 200) => {
  const headers = new Headers({ "content-type": "text/html; charset=utf-8" });
  if (isStaging()) headers.set("x-robots-tag", "noindex, nofollow");
  return new Response(s, { status, headers });
};

async function published(): Promise<Post[]> {
  const r = await db().prepare("SELECT * FROM posts WHERE status='published' ORDER BY published_at DESC").all<Post>();
  return r.results;
}

function notFound() {
  return html(`<!doctype html><meta charset="utf-8"><title>Page not found</title><meta name="robots" content="noindex"><body style="font-family:sans-serif;text-align:center;padding:12vh 1rem"><h1>404</h1><p>Page not found.</p><a href="/">Back to home</a>`, 404);
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
    const content = await loadContent();
    let body = norm in PAGE_PLAN ? applyPage(norm, page.body_html, content) : page.body_html;
    if (body.includes("{{CARDS}}")) { const cards = (await published()).map(card).join(""); body = body.replace("{{CARDS}}", () => cards); }
    return html(document_(page, body, content));
  }
  // a project's own page: the Projects page's header and footer around the project (Admin > Projects)
  const pm = /^\/projects\/([^/]+)\/$/.exec(norm);
  if (pm) {
    const project = await d.prepare("SELECT * FROM projects WHERE slug=? AND status='published'").bind(pm[1]).first<Project>().catch(() => null);
    const shell = project && (await d.prepare("SELECT * FROM pages WHERE path='/projects/' AND kind!='template'").first<Page>());
    if (project && shell) {
      const content = await loadContent();
      const body = replaceMain(shell.body_html, renderSections(["projectDetail"], { ...content, _project: project }));
      return html(document_({ ...shell, path: norm, title: `${project.title} | Zakion Energy`, description: clip(project.summary), og_image: project.image }, body, content));
    }
  }
  const slug = norm.slice(1, -1);
  if (slug && !slug.includes("/")) {
    const post = await d.prepare("SELECT * FROM posts WHERE slug=? AND status='published'").bind(slug).first<Post>();
    const tpl = post && (await d.prepare("SELECT * FROM pages WHERE path='__tpl_post'").first<Page>());
    if (post && tpl) return html(document_({ ...tpl, path: norm, title: post.title + " | Zakion Energy", description: clip(post.excerpt), og_image: post.image }, postBody(tpl.body_html, post), await loadContent(), post));
  }
  return notFound();
}

export async function previewPost(p: Post) {
  const tpl = await db().prepare("SELECT * FROM pages WHERE path='__tpl_post'").first<Page>();
  return tpl ? html(document_({ ...tpl, path: `/${p.slug}/`, title: p.title }, postBody(tpl.body_html, p), await loadContent(), p)) : notFound();
}

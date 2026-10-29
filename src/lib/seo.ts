import { env } from "./env";

export type SeoPage = { path: string; title: string; description: string; og_image: string };
export type SeoPost = { slug: string; title: string; excerpt: string; image: string; author: string; published_at: string; updated_at?: string };

const BRAND = "Zakion Energy";
const ORG = {
  name: "Zakion Energy Pvt. Ltd.",
  email: "info@zakion.com",
  telephone: "+91 9497 113001",
  foundingDate: "2015",
  address: { streetAddress: "D Space, Sky Tower, Bank Road", addressLocality: "Calicut", postalCode: "673001", addressCountry: "IN" },
  sameAs: ["https://www.facebook.com/zakionenergy/", "https://x.com/zakionenergy20", "https://www.instagram.com/zakionenergy/", "https://in.linkedin.com/company/zakion-energy"],
};

// Duplicate URLs that stay reachable (no redirect) but point search engines at the real page.
export const CANONICAL: Record<string, string> = {
  "/home/": "/",
  "/photovoltaic-solutions/": "/services/photovoltaic-solutions/",
  "/portfolio/": "/projects/",
  "/category/uncategorized/": "/blog/",
};
const NOINDEX = new Set(["/category/uncategorized/"]);
const CRUMB: Record<string, string> = { "/about-us/": "About Us", "/services/": "Solutions", "/projects/": "Projects", "/blog/": "Blog", "/contact/": "Contact", "/portfolio/": "Projects" };
const PAGE_TYPE: Record<string, string> = { "/about-us/": "AboutPage", "/contact/": "ContactPage" };

export const siteUrl = () => (env().SITE_URL || "").replace(/\/$/, "");
// Until a real domain is set as SITE_URL, the site is a staging copy and must stay out of search results.
export const isStaging = () => { const s = siteUrl(); return !s || /\.workers\.dev$|localhost/.test(new URL(s).hostname); };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const shortName = (title: string) => title.split(/ [–|] /)[0];

function crumbs(path: string, name: string, base: string) {
  const items: [string, string][] = [["Home", "/"]];
  const parts = path.split("/").filter(Boolean);
  if (path.startsWith("/services/") && parts.length > 1) items.push([CRUMB["/services/"], "/services/"]);
  else if (path.startsWith("/portfolio/") && parts.length > 1) items.push([CRUMB["/projects/"], "/projects/"]);
  if (path !== "/") items.push([CRUMB[path] || name, path]);
  return { "@type": "BreadcrumbList", itemListElement: items.map(([n, u], i) => ({ "@type": "ListItem", position: i + 1, name: n, item: base + u })) };
}

// Demo text from the WordPress theme. Pages/posts containing it stay noindex until it is replaced.
export const PLACEHOLDER_SQL = "%Lorem Ipsum is simply dummy text%";
export const isPlaceholder = (html: string) => html.includes("Lorem Ipsum is simply dummy text");

export function seoHead(p: SeoPage, post?: SeoPost, placeholder = false) {
  const base = siteUrl();
  const path = p.path;
  const canonicalPath = CANONICAL[path] || path;
  const url = base + canonicalPath;
  const title = p.title;
  const desc = p.description;
  const image = p.og_image ? (p.og_image.startsWith("http") ? p.og_image : base + p.og_image) : `${base}/media/2024/03/hero.jpg`;
  const robots = isStaging() ? "noindex, nofollow" : NOINDEX.has(path) || placeholder ? "noindex, follow" : "index, follow, max-image-preview:large";
  const name = post ? post.title : shortName(title);
  const org = { "@type": "Organization", "@id": base + "/#organization", name: ORG.name, url: base + "/", logo: base + "/media/2024/03/zak-logo.png", email: ORG.email, telephone: ORG.telephone, foundingDate: ORG.foundingDate, address: { "@type": "PostalAddress", ...ORG.address }, sameAs: ORG.sameAs };
  const site = { "@type": "WebSite", "@id": base + "/#website", url: base + "/", name: BRAND, publisher: { "@id": base + "/#organization" }, inLanguage: "en" };
  const graph: object[] = [org, site];
  const page = { "@type": post ? "WebPage" : PAGE_TYPE[path] || "WebPage", "@id": url + "#webpage", url, name, ...(desc && { description: desc }), isPartOf: { "@id": base + "/#website" }, about: { "@id": base + "/#organization" }, breadcrumb: { "@id": url + "#breadcrumb" }, inLanguage: "en" };
  graph.push(page, { ...(post ? { "@type": "BreadcrumbList", itemListElement: [["Home", "/"], ["Blog", "/blog/"], [post.title, canonicalPath]].map(([n, u], i) => ({ "@type": "ListItem", position: i + 1, name: n, item: base + u })) } : crumbs(path, name, base)), "@id": url + "#breadcrumb" });
  if (post) graph.push({ "@type": "BlogPosting", "@id": url + "#article", mainEntityOfPage: { "@id": url + "#webpage" }, headline: post.title, ...(post.excerpt && { description: post.excerpt }), ...(post.image && { image: base + post.image }), datePublished: post.published_at.replace(" ", "T") + "Z", dateModified: (post.updated_at || post.published_at).replace(" ", "T") + "Z", author: { "@type": "Person", name: post.author }, publisher: { "@id": base + "/#organization" }, inLanguage: "en" });
  else if (/^\/services\/[^/]+\/$/.test(path)) graph.push({ "@type": "Service", "@id": url + "#service", name, ...(desc && { description: desc }), provider: { "@id": base + "/#organization" }, url });
  return (
    `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` +
    `<meta name="robots" content="${robots}"><link rel="canonical" href="${esc(url)}">` +
    `<meta property="og:site_name" content="${BRAND}"><meta property="og:locale" content="en_US"><meta property="og:type" content="${post ? "article" : "website"}">` +
    `<meta property="og:url" content="${esc(url)}"><meta property="og:image" content="${esc(image)}">` + (desc ? `<meta property="og:description" content="${esc(desc)}">` : "") +
    `<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}">` + (desc ? `<meta name="twitter:description" content="${esc(desc)}">` : "") + `<meta name="twitter:image" content="${esc(image)}">` +
    `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>`
  );
}

const nameFromFile = (src: string) => src.split("/").pop()!.replace(/\.\w+$/, "").replace(/[-_]+/g, " ").replace(/^./, c => c.toUpperCase());

// Alt text only where the page gives us something true to say; decorative images keep alt="".
export function improveBody(html: string, pageName: string) {
  let gallery = 0;
  const withAlt = html.replace(/<img\b[^>]*>/g, (tag, idx: number) => {
    if (!/\salt=(""|'')/.test(tag)) return tag;
    const src = (tag.match(/\ssrc="([^"]+)"/) || [])[1] || "";
    const ctx = html.slice(Math.max(0, idx - 300), idx);
    let alt = "";
    if (/zak-logo/.test(src)) alt = `${BRAND} logo`;
    else if (/content-image/.test(ctx.slice(-120))) alt = `${nameFromFile(src)} logo`;
    else if (/data-elementor-open-lightbox/.test(ctx.slice(-200))) alt = `${pageName} project photo ${++gallery}`;
    return alt ? tag.replace(/\salt=(""|'')/, ` alt="${esc(alt)}"`) : tag;
  });
  return withAlt.replace(/<(input|textarea)\b(?![^>]*aria-label)([^>]*?)\splaceholder="([^"]+)"/g, '<$1$2 aria-label="$3" placeholder="$3"');
}

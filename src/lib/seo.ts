import { isHiddenPath, redirectTarget } from "./canonical";
import { env } from "./env";

export { isHiddenPath };

export type SeoPage = { path: string; title: string; description: string; og_image: string };
export type SeoPost = { slug: string; title: string; excerpt: string; image: string; author: string; published_at: string; updated_at?: string };

const BRAND = "Zakion Energy";
const ORG = {
  name: "Zakion Energy Pvt. Ltd.",
  email: "zakionenergy20@gmail.com",
  telephone: "+91 9188 944 337",
  foundingDate: "2015",
  address: { streetAddress: "D Space, Sky Tower, Bank Road", addressLocality: "Calicut", addressRegion: "Kerala", postalCode: "673001", addressCountry: "IN" },
  description: "Zakion Energy Pvt. Ltd. is a solar EPC, energy engineering and eMobility infrastructure company founded in 2015 and based in Calicut, Kerala, India.",
  slogan: "Powering Homes. Empowering Businesses. Building a Sustainable Future.",
  // Both offices come from the company profile deck.
  offices: [
    { name: "Zakion Energy, Calicut", address: { streetAddress: "63/700, D Space, Sky Tower, Bank Road", addressLocality: "Calicut", addressRegion: "Kerala", postalCode: "673001", addressCountry: "IN" } },
    { name: "Zakion Energy, Pulamanthole", address: { streetAddress: "Kalathil Complex, opp. Federal Bank", addressLocality: "Pulamanthole", addressRegion: "Kerala", postalCode: "679323", addressCountry: "IN" } },
  ],
  services: ["On-grid solar systems", "Hybrid solar systems", "Off-grid solar systems", "Solar lighting", "Battery Energy Storage System (BESS)", "Energy audits and energy engineering", "EV charging infrastructure"],
  sameAs: ["https://www.facebook.com/zakionenergy/", "https://x.com/zakionenergy20", "https://www.instagram.com/zakionenergy/", "https://in.linkedin.com/company/zakion-energy"],
};

// Duplicate URLs that stay reachable (no redirect) but point search engines at the real page.
export const CANONICAL: Record<string, string> = {
  "/home/": "/",
  "/photovoltaic-solutions/": "/services/photovoltaic-solutions/",
  "/portfolio/": "/projects/",
  "/category/uncategorized/": "/blog/",
};
const CRUMB: Record<string, string> = { "/about-us/": "About Us", "/services/": "Solutions", "/projects/": "Projects", "/testimonials/": "Testimonials", "/blog/": "Blog", "/faq/": "FAQ", "/solar-calculator/": "Solar Calculator", "/contact/": "Contact", "/portfolio/": "Projects" };
const PAGE_TYPE: Record<string, string> = { "/about-us/": "AboutPage", "/contact/": "ContactPage" };

export const siteUrl = () => (env().SITE_URL || "").replace(/\/$/, "");
// Until a real domain is set as SITE_URL, the site is a staging copy and must stay out of search results.
export const isStaging = () => { const s = siteUrl(); return !s || /\.workers\.dev$|localhost/.test(new URL(s).hostname); };

/** 301 to the one real address (http -> https, www and *.workers.dev -> SITE_URL), or null when the request is already right. */
export const canonicalRedirect = (req: Request) => { const to = redirectTarget(req.url, siteUrl()); return to ? Response.redirect(to, 301) : null; };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const shortName = (title: string) => title.split(/ [–|] /)[0];

function crumbs(path: string, name: string, base: string) {
  const items: [string, string][] = [["Home", "/"]];
  const parts = path.split("/").filter(Boolean);
  if (path.startsWith("/services/") && parts.length > 1) items.push([CRUMB["/services/"], "/services/"]);
  else if ((path.startsWith("/portfolio/") || path.startsWith("/projects/")) && parts.length > 1) items.push([CRUMB["/projects/"], "/projects/"]);
  if (path !== "/") items.push([CRUMB[path] || name, path]);
  return { "@type": "BreadcrumbList", itemListElement: items.map(([n, u], i) => ({ "@type": "ListItem", position: i + 1, name: n, item: base + u })) };
}

// Demo text from the WordPress theme. Pages/posts containing it stay noindex until it is replaced.
export const PLACEHOLDER_SQL = "%Lorem Ipsum is simply dummy text%";
export const isPlaceholder = (html: string) => html.includes("Lorem Ipsum is simply dummy text");

// The "Our Work Process" steps shown on the Solutions page.
const PROCESS: [string, string][] = [
  ["Site Auditing", "First assessment of the site and its energy use."],
  ["Consulting", "Advice on the right system and options for your needs and budget."],
  ["Designing & Architecting", "Design and layout of the system for the site."],
  ["Supply of Material", "Supply of the solar panels, inverters and other equipment."],
  ["Installation", "Installation of the system on site."],
  ["Testing", "Testing of the installed system."],
  ["Commissioning", "Commissioning and handover of the working system."],
  ["AMC", "Annual maintenance contract for long-term performance."],
];

/** `sameAs` is the list of official profile links (Site settings > Social media); without it the built-in list is used. */
export function seoHead(p: SeoPage, post?: SeoPost, placeholder = false, sameAs?: string[]) {
  const base = siteUrl();
  const path = p.path;
  const canonicalPath = CANONICAL[path] || path;
  const url = base + canonicalPath;
  const title = p.title;
  const desc = p.description;
  const image = p.og_image ? (p.og_image.startsWith("http") ? p.og_image : base + p.og_image) : `${base}/media/2024/03/hero.jpg`;
  const robots = isStaging() ? "noindex, nofollow" : isHiddenPath(path) || placeholder ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
  const name = post ? post.title : shortName(title);
  const place = (o: { name: string; address: object }) => ({ "@type": "Place", name: o.name, address: { "@type": "PostalAddress", ...o.address } });
  const org = {
    "@type": ["Organization", "LocalBusiness"], "@id": base + "/#organization", name: ORG.name, alternateName: ["Zakion Energy", "Zakion"], url: base + "/",
    logo: base + "/media/2024/03/zak-logo.png", image: `${base}/media/2024/03/hero.jpg`, description: ORG.description, slogan: ORG.slogan,
    email: ORG.email, telephone: ORG.telephone, foundingDate: ORG.foundingDate, address: { "@type": "PostalAddress", ...ORG.address },
    location: ORG.offices.map(place), areaServed: { "@type": "AdministrativeArea", name: "Kerala, India" }, knowsAbout: ORG.services,
    contactPoint: [{ "@type": "ContactPoint", contactType: "customer service", telephone: ORG.telephone, email: ORG.email, areaServed: "IN" }],
    hasOfferCatalog: { "@type": "OfferCatalog", name: "Zakion Energy services", itemListElement: ORG.services.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s } })) },
    sameAs: sameAs ?? ORG.sameAs,
  };
  const site = { "@type": "WebSite", "@id": base + "/#website", url: base + "/", name: BRAND, publisher: { "@id": base + "/#organization" }, inLanguage: "en-IN" };
  const graph: object[] = [org, site];
  const page = { "@type": post ? "WebPage" : PAGE_TYPE[path] || "WebPage", "@id": url + "#webpage", url, name, ...(desc && { description: desc }), isPartOf: { "@id": base + "/#website" }, about: { "@id": base + "/#organization" }, breadcrumb: { "@id": url + "#breadcrumb" }, inLanguage: "en-IN" };
  graph.push(page, { ...(post ? { "@type": "BreadcrumbList", itemListElement: [["Home", "/"], ["Blog", "/blog/"], [post.title, canonicalPath]].map(([n, u], i) => ({ "@type": "ListItem", position: i + 1, name: n, item: base + u })) } : crumbs(path, name, base)), "@id": url + "#breadcrumb" });
  if (post) graph.push({ "@type": "BlogPosting", "@id": url + "#article", mainEntityOfPage: { "@id": url + "#webpage" }, headline: post.title, ...(post.excerpt && { description: post.excerpt }), ...(post.image && { image: base + post.image }), datePublished: post.published_at.replace(" ", "T") + "Z", dateModified: (post.updated_at || post.published_at).replace(" ", "T") + "Z", author: { "@type": "Person", name: post.author }, publisher: { "@id": base + "/#organization" }, inLanguage: "en-IN" });
  else if (/^\/services\/[^/]+\/$/.test(path)) graph.push({ "@type": "Service", "@id": url + "#service", name, ...(desc && { description: desc }), provider: { "@id": base + "/#organization" }, serviceType: name, areaServed: { "@type": "AdministrativeArea", name: "Kerala, India" }, url });
  if (path === "/services/") graph.push({ "@type": "HowTo", "@id": url + "#howto", name: "How a Zakion Energy solar project is delivered", step: PROCESS.map(([n, t], i) => ({ "@type": "HowToStep", position: i + 1, name: n, text: t })) });
  return (
    `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` +
    `<meta name="robots" content="${robots}"><link rel="canonical" href="${esc(url)}"><link rel="alternate" hreflang="en-IN" href="${esc(url)}"><link rel="alternate" hreflang="x-default" href="${esc(url)}">` +
    `<meta property="og:site_name" content="${BRAND}"><meta property="og:locale" content="en_IN"><meta property="og:type" content="${post ? "article" : "website"}">` +
    `<meta property="og:url" content="${esc(url)}"><meta property="og:image" content="${esc(image)}"><meta property="og:image:alt" content="${esc(name)}">` + (desc ? `<meta property="og:description" content="${esc(desc)}">` : "") +
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

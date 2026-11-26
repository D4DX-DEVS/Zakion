// Inner page banners: the picture behind the page title (About Us, Solutions, Projects, Contact, Blog and the pages under them).
// The admin picks one per page under Studio > Page banners (section "banners" in content.ts). The page's own stylesheet rule in
// public/zk-wide.css paints whatever --zk-banner holds on the banner block, so all this does is set that one custom property.
import { BANNER_PAGES, safeUrl, type Content } from "./content";

/** Which banner a page uses ("about", "projects", ...), or null for the home page, which has its own banner. */
export function bannerKey(path: string, isPost = false): string | null {
  if (path === "/" || path === "/home/") return null;
  if (isPost) return "blog";
  if (path === "/about-us/") return "about";
  if (path === "/contact/") return "contact";
  if (path === "/testimonials/") return "testimonials";
  if (path === "/solar-calculator/") return "calculator";
  if (path === "/faq/") return "faq";
  if (path === "/projects/" || path.startsWith("/portfolio/")) return "projects";
  if (path === "/blog/" || path.startsWith("/category/")) return "blog";
  if (path === "/services/photovoltaic-solutions/" || path === "/photovoltaic-solutions/") return "pv";
  if (path === "/services/solar-home/") return "solarHome";
  if (path === "/services/energy-engineering/") return "energy";
  if (path === "/services/emobility-infrastructure/") return "emobility";
  if (path.startsWith("/services/")) return "solutions";
  return "other";
}

/** The picture for a page: the admin's choice, else the built-in one. */
export function bannerImage(c: Content, key: string): string {
  return safeUrl(c.banners?.[key]) || BANNER_PAGES.find((b) => b.key === key)?.image || "";
}

// a CSS url() that cannot be broken out of: spaces, quotes and brackets in a file name are percent-encoded
const cssUrl = (u: string) => "url(" + encodeURI(u).replace(/[()'"]/g, (ch) => "%" + ch.charCodeAt(0).toString(16).toUpperCase()) + ")";

/** Puts the custom property on a tag's style attribute (adding the attribute when the tag has none). */
const withVar = (attrs: string, v: string) => (/\sstyle="/.test(attrs) ? attrs.replace(/(\sstyle=")/, `$1${v};`) : `style="${v}" ${attrs}`);

/** Gives the page's banner block its picture. Pages built in Elementor have a container marked "parallaxie" first; the blog pages have a
 *  plain "page-header" block (the stylesheet paints both, see public/zk-wide.css). */
export function applyBanner(body: string, path: string, c: Content, isPost = false): string {
  const key = bannerKey(path, isPost);
  const src = key ? bannerImage(c, key) : "";
  if (!key || !src) return body;
  const v = `--zk-banner:${cssUrl(src)}`;
  const parallax = /<div ([^>]*\bclass="[^"]*\bparallaxie\b[^"]*"[^>]*)>/;
  const header = /<div ([^>]*\bclass="page-header"[^>]*)>/;
  const re = parallax.test(body) ? parallax : header;
  return body.replace(re, (_m, attrs: string) => `<div ${withVar(attrs, v)}>`);
}

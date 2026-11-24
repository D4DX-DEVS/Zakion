// Site header: the main menu, the Contact button and the Brochure button come from the admin (Studio > Header menu and brochure).
// The stored pages keep their Elementor header; this rebuilds the menu list and the two buttons inside it, using the same markup
// and classes the theme's menu script and styles expect (dropdowns and the mobile slide-in menu work as before).
// If a stored page does not have the pieces this looks for, it is returned unchanged.
import { type Content, safeUrl } from "./content";

const esc = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const NAV_OPEN = /<ul id="menu-main-menu" class="elementskit-navbar-nav[^"]*"[^>]*>/;
const ext = (u: string) => (/^https?:\/\//i.test(u) ? ' target="_blank" rel="noopener"' : "");
const here = (path: string, url: string) => { const u = url.replace(/[?#].*$/, ""); return u === "/" ? path === "/" : path === u || path.startsWith(u.endsWith("/") ? u : u + "/"); };

type Link = { label: string; url: string };
const clean = (v: unknown): Link[] => (Array.isArray(v) ? v : []).map((i: any) => ({ label: String(i?.label ?? "").trim(), url: safeUrl(i?.url) })).filter((i) => i.label && i.url);

function menuHtml(open: string, items: any[], path: string) {
  let n = 0;
  const lis = (Array.isArray(items) ? items : []).map((it) => {
    const label = String(it?.label ?? "").trim(), url = safeUrl(it?.url);
    if (!label || !url) return "";
    const kids = clean(it.children);
    const on = here(path, url);
    const id = 9100 + ++n;
    const sub = kids.length
      ? `<ul class="elementskit-dropdown elementskit-submenu-panel" id="ekit-submenu-${id}">${kids.map((k) => `<li class="menu-item menu-item-type-post_type menu-item-object-page nav-item elementskit-mobile-builder-content" data-vertical-menu="750px"><a href="${esc(k.url)}"${ext(k.url)} class=" dropdown-item">${esc(k.label)}</a></li>`).join("")}</ul>`
      : "";
    return `<li class="menu-item menu-item-type-post_type menu-item-object-page${kids.length ? " menu-item-has-children" : ""} nav-item${kids.length ? " elementskit-dropdown-has relative_position elementskit-dropdown-menu-default_width" : ""} elementskit-mobile-builder-content${on ? " current-menu-item active" : ""}" data-vertical-menu="750px">` +
      `<a href="${esc(url)}"${ext(url)} class="ekit-menu-nav-link${kids.length ? " ekit-menu-dropdown-toggle" : ""}${on ? " active" : ""}"${kids.length ? ` aria-haspopup="true" aria-expanded="false" aria-controls="ekit-submenu-${id}"` : ""}>${esc(label)}${kids.length ? '<i aria-hidden="true" class="icon icon-down-arrow1 elementskit-submenu-indicator"></i>' : ""}</a>${sub}</li>`;
  }).join("");
  return open + lis + "</ul>";
}

/** Sets the link and the label of one of the header's two buttons (found by its Elementor element id). */
function button(body: string, id: string, label: string, href: string, newTab = false) {
  const at = body.indexOf("elementor-element-" + id);
  if (at < 0) return body;
  const end = body.indexOf("</a>", at);
  if (end < 0) return body;
  let seg = body.slice(at, end);
  seg = seg.replace(/<a href="[^"]*"/, () => `<a href="${esc(href)}"${newTab ? ' target="_blank" rel="noopener"' : ""}`);
  seg = seg.replace(/(<span class="ekit_creative_button_text">)[^<]*(<\/span>)/, (_, a, b) => a + esc(label) + b);
  return body.slice(0, at) + seg + body.slice(end);
}

const telHref = (p: string) => "tel:" + p.replace(/[^+\d]/g, "");

/** Sets the link and the text of one of the two contact items in the top bar (found by its Elementor element id). Empty hides the item. */
function topItem(body: string, id: string, text: string, href: string) {
  const at = body.indexOf("elementor-element-" + id + " ");
  if (at < 0) return body;
  const end = body.indexOf("</a>", at);
  if (end < 0) return body;
  if (!text) return body.slice(0, at) + "elementor-element-" + id + " zk-hide " + body.slice(at + ("elementor-element-" + id + " ").length);
  let seg = body.slice(at, end);
  seg = seg.replace(/<a href="[^"]*"/, () => `<a href="${esc(href)}"`);
  seg = seg.replace(/(<h3 class="elementskit-info-box-title">)[\s\S]*?(<\/h3>)/, (_, a, b) => `${a} ${esc(text)} ${b}`);
  return body.slice(0, at) + seg + body.slice(end);
}

// On tablets and phones the menu is a slide-in drawer (public/zk-menu.css). The Contact and Brochure buttons are hidden there by the
// stored page, so the drawer gets its own copies at the bottom, plus the logo at the top and the phone and email under the buttons.
// None of this shows on a computer: zk-menu.css only displays it below 1025px.
const IDENT = '<div class="elementskit-nav-identity-panel">';
const ICON_PHONE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.2 3.5h3.4l1.8 4.6-2.3 1.5a11 11 0 0 0 5.3 5.3l1.5-2.3 4.6 1.8v3.4a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3.2 5.7a2 2 0 0 1 2-2.2z"/></svg>';
const ICON_MAIL = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 7.5 8.5 6 8.5-6"/></svg>';

function drawer(body: string, c: Content): string {
  const at = body.indexOf(IDENT);
  if (at < 0) return body;
  const h = c.header;
  const pdf = safeUrl(h.brochurePdf);
  const btns =
    `<a class="zk-mm-btn zk-mm-btn--a" href="${esc(safeUrl(h.contactUrl) || "/contact/")}">${esc(h.contactLabel || "Contact Us")}</a>` +
    (h.showBrochure ? `<a class="zk-mm-btn zk-mm-btn--p" href="${esc(pdf || "/contact/")}"${pdf ? ' target="_blank" rel="noopener"' : ""}>${esc(h.brochureLabel || "Brochure")}</a>` : "");
  const phone = String(h.topPhone ?? "").trim(), email = String(h.topEmail ?? "").trim();
  const info =
    (phone ? `<a class="zk-mm-i" href="${esc(telHref(phone))}">${ICON_PHONE}<span>${esc(phone)}</span></a>` : "") +
    (email ? `<a class="zk-mm-i" href="mailto:${esc(email)}">${ICON_MAIL}<span>${esc(email)}</span></a>` : "");
  const foot = `<div class="zk-mm-foot"><div class="zk-mm-btns">${btns}</div>${info ? `<div class="zk-mm-info">${info}</div>` : ""}</div>`;
  const logo = '<a class="zk-mm-logo" href="/" aria-label="Zakion Energy home"><img src="/media/2024/03/zak-logo.png" width="260" height="62" alt="Zakion Energy"></a>';
  return body.slice(0, at) + foot + IDENT + logo + body.slice(at + IDENT.length);
}

/** The logo in the menu bar links to the home page on every page (the stored header leaves its address empty, which only reloads the page). */
const logoHome = (body: string) =>
  body
    .replace(/(<div class="ata-site-logo">\s*<a\b[^>]*?\bhref=)""/, '$1"/"')
    .replace('alt="default-logo"', 'alt="Zakion Energy, home page"');

export function applyHeader(body: string, c: Content, path: string): string {
  const h = c.header;
  if (!h) return logoHome(body);
  let out = logoHome(body);
  const m = NAV_OPEN.exec(out);
  if (m) {
    let depth = 0, end = -1, t: RegExpExecArray | null;
    const re = /<(\/?)ul\b[^>]*>/g;
    re.lastIndex = m.index;
    while ((t = re.exec(out))) { if (t[1]) { if (--depth === 0) { end = t.index + t[0].length; break; } } else depth++; }
    if (end > 0) out = drawer(out.slice(0, m.index) + menuHtml(m[0], h.menu, path) + out.slice(end), c);
  }
  // The menu bar sticks by CSS (position: sticky, public/zk-wide.css). The theme's own sticky script would pull it out of the page flow
  // and make the banner jump up when it fires, so its class and setting are removed.
  out = out.replace("main-header ekit-sticky--top ", "main-header ").split("&quot;ekit_sticky&quot;:&quot;top&quot;").join("&quot;ekit_sticky&quot;:&quot;&quot;");
  out = button(out, "bf7f4fc", String(h.contactLabel || "Contact Us"), safeUrl(h.contactUrl) || "/contact/");
  const pdf = safeUrl(h.brochurePdf);
  out = button(out, "7b710eb", String(h.brochureLabel || "Brochure"), pdf || "/contact/", !!pdf);
  if (!h.showBrochure) out = out.replace("elementor-element-7b710eb ", "elementor-element-7b710eb zk-hide ");
  const mail = String(h.topEmail ?? "").trim(), tel = String(h.topPhone ?? "").trim();
  out = topItem(out, "dc51af0", mail, "mailto:" + mail);
  out = topItem(out, "513e104", tel, telHref(tel));
  return out;
}

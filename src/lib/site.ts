// Site settings: the look and feel of the whole site, edited in the admin under Site settings.
//
//  - Theme colours: two colours (primary navy, accent amber). Every other shade the stylesheets use is derived from them ("retinted"):
//    public/zk-*.css write each brand colour as var(--zc-<hex>,<original>) and this file works out the new value of each variable.
//    With the default colours nothing is emitted, so the site renders exactly as before.
//  - Fonts: a heading font and a body font from a short Google Fonts list.
//  - Layout: content width, section spacing, and three switches (back to top button, scroll animations, image shine).
//
// Saved as one JSON document in site_content under SITE_KEY; read it with siteOf(content). The header, footer, menu and social links
// stay in their own sections (content.ts) so the Studio editors and Site settings edit the same data.
import { clean, type Content, type Field, SECTION_BY_KEY } from "./content";
import { type Family, THEME_HEX, THEME_RGB } from "./theme-colors";

// ---------------------------------------------------------------- settings schema

export const DEFAULT_PRIMARY = "#0d3d7b";
export const DEFAULT_ACCENT = "#f5a800";

/** Google Fonts offered for headings and body text, with the weights each family actually has (a missing weight breaks the request). */
const WEIGHTS: Record<string, string> = { Roboto: "400;500;700", Lato: "400;700", Merriweather: "400;700" };
const SERIF = new Set(["Playfair Display", "Merriweather"]);
export const FONT_CHOICES = ["Default", "Rajdhani", "Poppins", "Rubik", "Inter", "Montserrat", "Roboto", "Open Sans", "Lato", "Nunito", "DM Sans", "Work Sans", "Manrope", "Outfit", "Space Grotesk", "Sora", "Oswald", "Barlow", "Saira", "Exo 2", "Playfair Display", "Merriweather"];

export const WIDTHS = { Narrow: 60, Standard: 0, Wide: 80, "Extra wide": 92 } as const;
export const SPACINGS_SITE = { Compact: "clamp(22px,calc(2.8*var(--u)),44px)", Standard: "", Roomy: "clamp(48px,calc(5.8*var(--u)),88px)" } as const;

export type SiteSettings = {
  primary: string; accent: string; headingFont: string; bodyFont: string;
  width: keyof typeof WIDTHS; spacing: keyof typeof SPACINGS_SITE; backToTop: boolean; calcButton: boolean; scrollAnimations: boolean; imageShine: boolean;
};
export const SITE_DEFAULTS: SiteSettings = {
  primary: DEFAULT_PRIMARY, accent: DEFAULT_ACCENT, headingFont: "Default", bodyFont: "Default",
  width: "Standard", spacing: "Standard", backToTop: true, calcButton: true, scrollAnimations: true, imageShine: true,
};

export const SITE_FIELDS: Field[] = [
  { k: "primary", label: "Primary colour", type: "color", help: "The deep colour used for headings, menus, the footer and dark panels. Pick a fairly dark colour so white text stays readable." },
  { k: "accent", label: "Accent colour", type: "color", help: "The bright highlight used for buttons, highlighted words and small details." },
  { k: "headingFont", label: "Heading font", type: "select", options: FONT_CHOICES, help: "Titles, the menu and buttons. Default is Rajdhani." },
  { k: "bodyFont", label: "Body font", type: "select", options: FONT_CHOICES, help: "Paragraphs and everything else. Default is Rubik (Poppins inside the home page blocks)." },
  { k: "width", label: "Content width", type: "select", options: Object.keys(WIDTHS), help: "How wide the page content is on a computer. Phones and tablets always use the full width." },
  { k: "spacing", label: "Space between blocks", type: "select", options: Object.keys(SPACINGS_SITE), help: "The gap above and below every block. A block's own spacing setting in Studio still wins." },
  { k: "backToTop", label: "Show the Back to top button", type: "bool" },
  { k: "calcButton", label: "Show the Solar Calculator button on the left side", type: "bool", help: "A small tab on the left edge of every page (except the calculator itself). It shows only the icon; the name slides out when the mouse is over it." },
  { k: "scrollAnimations", label: "Animate blocks as they scroll into view", type: "bool", help: "Off shows everything straight away, with no fade-in and no counting numbers." },
  { k: "imageShine", label: "Moving light over images on hover", type: "bool", help: "Computer only." },
];

/** The saved settings merged over the defaults, with every value checked (colours are #rrggbb, choices come from the lists above). */
export function cleanSite(input: unknown): SiteSettings {
  const src = input && typeof input === "object" ? input : {};
  return clean(SITE_FIELDS, { ...SITE_DEFAULTS, ...src }, SITE_DEFAULTS) as SiteSettings;
}
export const siteOf = (c: Content): SiteSettings => cleanSite(c._site);

// ---------------------------------------------------------------- colours

type Hsl = { h: number; s: number; l: number };
const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));

function toHsl(hex: string): Hsl {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: h * 60, s, l };
}
function toRgb({ h, s, l }: Hsl): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [r + m, g + m, b + m].map((v) => Math.round(clamp(v) * 255)) as [number, number, number];
}
const hex = (rgb: number[]) => "#" + rgb.map((n) => n.toString(16).padStart(2, "0")).join("");

/** Moves a colour from the default palette to the chosen one: same hue shift, saturation ratio and (anchored) lightness shift as
 *  the step from the default base colour to the chosen base colour. The default base colour itself maps exactly onto the chosen one. */
function retint(color: string, from: Hsl, to: Hsl): string {
  const c = toHsl(color);
  const h = (c.h + (to.h - from.h) + 360) % 360;
  const s = clamp(from.s ? c.s * (to.s / from.s) : to.s);
  const l = c.l <= from.l ? c.l * (to.l / (from.l || 1)) : to.l + (c.l - from.l) * ((1 - to.l) / (1 - from.l || 1));
  return hex(toRgb({ h, s, l: clamp(l) }));
}

/** "p" (navy family), "a" (amber family) or "" for any other colour. The same test as tools/theme-tokens.mjs. */
function familyOf(color: string): Family | "" {
  const { h, s, l } = toHsl(color);
  if (s >= 0.18 && h >= 195 && h <= 250) return "p";
  if (s >= 0.4 && l >= 0.18 && h >= 25 && h <= 55) return "a";
  return "";
}
type Theme = Pick<SiteSettings, "primary" | "accent">;
export const isThemed = (s: Theme) => s.primary !== DEFAULT_PRIMARY || s.accent !== DEFAULT_ACCENT;
/** The theme as a short URL-safe key ("14532d-facc15"), used to version the recoloured Elementor stylesheets. */
export const themeKey = (s: Theme) => `${s.primary.slice(1)}-${s.accent.slice(1)}`;
export const themeFromKey = (k: string): Theme | null => (/^[0-9a-f]{6}-[0-9a-f]{6}$/.test(k) ? { primary: "#" + k.slice(0, 6), accent: "#" + k.slice(7) } : null);

/** Recolours the brand-coloured hex codes in a piece of stored markup or in a stylesheet. The mirrored WordPress pages and the Elementor
 *  stylesheets hard-code a few (for example the header buttons), which the CSS variables above cannot reach. */
export function themeText(text: string, s: Theme): string {
  const swap: Record<string, [Hsl, Hsl] | null> = {
    p: s.primary === DEFAULT_PRIMARY ? null : [toHsl(DEFAULT_PRIMARY), toHsl(s.primary)],
    a: s.accent === DEFAULT_ACCENT ? null : [toHsl(DEFAULT_ACCENT), toHsl(s.accent)],
  };
  return text.replace(/#[0-9a-fA-F]{6}\b/g, (m) => {
    const hx = m.toLowerCase(), f = familyOf(hx), pair = f && swap[f];
    return pair ? retint(hx, pair[0], pair[1]) : m;
  });
}

// ---------------------------------------------------------------- what goes into <head>

const q = (name: string) => `"${name}"`;
const fontUrl = (names: string[]) =>
  "https://fonts.googleapis.com/css2?" + [...new Set(names)].map((n) => `family=${n.replace(/ /g, "+")}:wght@${WEIGHTS[n] ?? "400;500;600;700"}`).join("&") + "&display=swap";

/** Font links and one <style> that applies the chosen theme on top of the site's stylesheets. Empty when everything is at its default. */
export function siteHead(s: SiteSettings): string {
  const root: string[] = [], body: string[] = [], rules: string[] = [], fonts: string[] = [];

  const recolour = (fam: Family, base: string, from: string) => {
    if (base === from) return;
    const a = toHsl(from), b = toHsl(base);
    for (const [h, f] of THEME_HEX) if (f === fam) { const v = retint("#" + h, a, b); if (v !== "#" + h) root.push(`--zc-${h}:${v}`); }
    for (const [h, f] of THEME_RGB) if (f === fam) { const v = retint("#" + h, a, b); if (v !== "#" + h) root.push(`--zr-${h}:${parseInt(v.slice(1, 3), 16)},${parseInt(v.slice(3, 5), 16)},${parseInt(v.slice(5, 7), 16)}`); }
  };
  if (s.primary !== DEFAULT_PRIMARY) {
    recolour("p", s.primary, DEFAULT_PRIMARY);
    body.push(`--e-global-color-primary:${s.primary}`, `--e-global-color-a44a32f:${retint("#001633", toHsl(DEFAULT_PRIMARY), toHsl(s.primary))}a6`);
  }
  if (s.accent !== DEFAULT_ACCENT) {
    recolour("a", s.accent, DEFAULT_ACCENT);
    body.push(`--e-global-color-accent:${s.accent}`);
  }

  if (s.headingFont !== "Default") {
    fonts.push(s.headingFont);
    const fb = SERIF.has(s.headingFont) ? "serif" : "sans-serif";
    root.push(`--zk-head:${q(s.headingFont)}`);
    body.push(`--e-global-typography-primary-font-family:${q(s.headingFont)}`, `--e-global-typography-secondary-font-family:${q(s.headingFont)}`);
    rules.push(`html body[class] :is(h1,h2,h3,h4,h5,h6){font-family:${q(s.headingFont)},${fb}}`);
  }
  if (s.bodyFont !== "Default") {
    fonts.push(s.bodyFont);
    root.push(`--zk-body:${q(s.bodyFont)}`);
    body.push(`--e-global-typography-text-font-family:${q(s.bodyFont)}`, `--e-global-typography-accent-font-family:${q(s.bodyFont)}`);
  }

  const vw = WIDTHS[s.width];
  if (vw) rules.push(`@media(min-width:1024px){:root{--zk-w:min(max(${vw}vw,960px),calc(100vw - 48px))}}`);
  const pad = SPACINGS_SITE[s.spacing];
  if (pad) rules.push(`.zh{--zpad:${pad}}`);

  const css = (root.length ? `:root{${root.join(";")}}` : "") + (body.length ? `html body[class]{${body.join(";")}}` : "") + rules.join("");
  return (fonts.length ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${fontUrl(fonts)}">` : "") + (css ? `<style id="zk-site">${css}</style>` : "");
}

// ---------------------------------------------------------------- social links

export type Social = { network: string; url: string };
/** The Contact block keeps four links of its own; they are kept in step with the social list when it is saved. */
export const CONTACT_NETS: Record<string, string> = { facebook: "Facebook", instagram: "Instagram", linkedin: "LinkedIn", whatsapp: "WhatsApp" };

/** The social links shown in the footer. */
export const socialOf = (c: Content): Social[] => (Array.isArray(c.footer?.social) ? c.footer.social : []).map((x: any) => ({ network: String(x?.network ?? ""), url: String(x?.url ?? "") })).filter((x: Social) => x.network && x.url);

/** What the Social media editor starts from: the footer's icons plus any Contact block link that has no footer icon yet. */
export function socialForEditor(c: Content): Social[] {
  const list = socialOf(c), have = new Set(list.map((x) => x.network));
  for (const [k, network] of Object.entries(CONTACT_NETS)) if (!have.has(network) && String(c.contact?.[k] ?? "").trim()) list.push({ network, url: String(c.contact[k]).trim() });
  return list;
}

// ---------------------------------------------------------------- the editor's tabs

const pick = (key: string, ks: string[]) => ks.map((k) => (key === "_site" ? SITE_FIELDS : SECTION_BY_KEY[key].fields).find((f) => f.k === k)!);
export type SettingsGroup = { key: string; title: string; help?: string; fields: Field[] };
export type SettingsTab = { id: string; label: string; sub: string; groups: SettingsGroup[] };

export const SETTINGS_TABS: SettingsTab[] = [
  { id: "layout", label: "Layout", sub: "How wide the pages are and how they behave.", groups: [{ key: "_site", title: "Page layout", fields: pick("_site", ["width", "spacing", "backToTop", "calcButton", "scrollAnimations", "imageShine"]) }] },
  { id: "theme", label: "Theme colours", sub: "Two colours drive the whole site. Every other shade is worked out from them.", groups: [{ key: "_site", title: "Brand colours", fields: pick("_site", ["primary", "accent"]) }] },
  { id: "fonts", label: "Fonts", sub: "Pick the fonts for titles and for text.", groups: [{ key: "_site", title: "Fonts", fields: pick("_site", ["headingFont", "bodyFont"]) }] },
  { id: "header", label: "Header", sub: "The email and phone bar and the Contact and Brochure buttons at the top of every page.", groups: [
    { key: "header", title: "Top bar", help: "The email address and phone number in the thin bar above the logo and menu.", fields: pick("header", ["topEmail", "topPhone"]) },
    { key: "header", title: "Header buttons", help: "The menu itself is under Menu settings.", fields: pick("header", ["contactLabel", "contactUrl", "showBrochure", "brochureLabel", "brochurePdf"]) },
  ] },
  { id: "navigation", label: "Menu settings", sub: "Add, edit, reorder and delete menu items and their submenus.", groups: [
    { key: "header", title: "Main menu", help: "Shown at the top of every page. Press “Submenu” on an item to add links that drop down under it.", fields: pick("header", ["menu"]) },
    { key: "footer", title: "Footer quick links", fields: pick("footer", ["links"]) },
  ] },
  { id: "footer", label: "Footer", sub: "The bottom of every page: description, contact cards, map and credit line.", groups: [{ key: "footer", title: "Footer", fields: pick("footer", ["about", "email", "phone", "address", "mapQuery", "mapZoom", "copyright", "poweredLabel", "poweredName", "poweredUrl"]) }] },
  { id: "social", label: "Social media", sub: "Your profiles, shown in the footer and on the Contact page.", groups: [{ key: "footer", title: "Social links", help: "These icons appear in the footer and on the Contact page, and are shared with search engines as your official profiles. Facebook, Instagram, LinkedIn and WhatsApp also update the Contact page.", fields: pick("footer", ["social"]) }] },
];
export const TAB_BY_ID = Object.fromEntries(SETTINGS_TABS.map((t) => [t.id, t])) as Record<string, SettingsTab>;

// A small allow-list cleaner for the formatted text the admin writes (a project's Description): only the tags and attributes a formatted text
// needs are kept (headings, bold, lists, links, tables, images ...). Scripts, styles, event handlers, unknown tags and unsafe addresses are
// removed. It is used when a project is saved and again when it is shown, so nothing unsafe reaches a visitor either way.

const TAGS = new Set(["p", "br", "strong", "b", "em", "i", "u", "s", "strike", "sub", "sup", "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "a", "img", "hr", "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "div", "span", "figure", "figcaption"]);
const ATTRS: Record<string, string[]> = { a: ["href", "title", "target"], img: ["src", "alt", "width", "height"], td: ["colspan", "rowspan", "style"], th: ["colspan", "rowspan", "style"], p: ["style"], div: ["style"], h2: ["style"], h3: ["style"], h4: ["style"], li: ["style"], blockquote: ["style"] };
const VOID = new Set(["br", "img", "hr"]);
const URL_OK = /^(\/(?!\/)|https?:\/\/|mailto:|tel:|#)/i;
const attr = (v: string) => v.replace(/&(?!#?\w+;)/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// only text-align survives from a style attribute
const style = (v: string) => { const m = /text-align\s*:\s*(left|right|center|justify)/i.exec(v); return m ? `text-align:${m[1].toLowerCase()}` : ""; };

export function cleanHtml(input: unknown): string {
  const src = String(input ?? "")
    .replace(/<(script|style|iframe|object|embed|noscript|template|svg|math|form|textarea|select)\b[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  return src.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:"[^"]*"|'[^']*'|[^'">])*)>|[<>]/g, (m, close: string | undefined, name: string | undefined, rest: string | undefined) => {
    if (!name) return m === "<" ? "&lt;" : "&gt;"; // a stray bracket is just text
    const tag = name.toLowerCase();
    if (!TAGS.has(tag)) return "";
    if (close) return VOID.has(tag) ? "" : `</${tag}>`;
    const keep = ATTRS[tag] ?? [];
    let out = "";
    for (const a of (rest ?? "").matchAll(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
      const n = a[1].toLowerCase(), v = (a[2] ?? a[3] ?? a[4] ?? "").trim();
      if (!keep.includes(n)) continue;
      if ((n === "href" || n === "src") && !URL_OK.test(v)) continue;
      if (n === "style") { const s = style(v); if (s) out += ` style="${s}"`; continue; }
      if (n === "target") { if (v === "_blank") out += ' target="_blank" rel="noopener noreferrer"'; continue; }
      if ((n === "colspan" || n === "rowspan" || n === "width" || n === "height") && !/^\d{1,4}$/.test(v)) continue;
      out += ` ${n}="${attr(v)}"`;
    }
    if (tag === "img" && !/ alt=/.test(out)) out += ' alt=""';
    return `<${tag}${out}>`;
  });
}

const entities: Record<string, string> = { "&nbsp;": " ", "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" };
/** The plain text of some HTML, for search results and meta descriptions. */
export const htmlToText = (h: string) => h.replace(/<(br|\/p|\/h[1-6]|\/li|\/tr|\/div|\/blockquote)\b[^>]*>/gi, " ").replace(/<[^>]+>/g, "").replace(/&(nbsp|amp|lt|gt|quot|#39);/g, (m) => entities[m] ?? m).replace(/\s+/g, " ").trim();

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
/** Formatted text as safe HTML. Older plain text (no tags) becomes paragraphs, so descriptions written before the editor still show. */
export function richOrText(v: unknown): string {
  const s = String(v ?? "").trim();
  if (!s) return "";
  if (!/<[a-zA-Z][^>]*>/.test(s)) return s.split(/\n{2,}/).map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("");
  return cleanHtml(s);
}

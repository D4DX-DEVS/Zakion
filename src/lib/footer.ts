// Site footer. Replaces the footer that came with the mirrored WordPress pages (Elementor markup plus a large inline icon set
// on every page) with one footer that is styled in public/zk-footer.css and edited in the admin (Studio > Site footer).
// If a stored page has no footer block the page is returned unchanged.
import { type Content, safeUrl } from "./content";

const MARK = "ekit-template-content-footer";

const PATHS: Record<string, string> = {
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 7.5 8.5 6 8.5-6"/>',
  phone: '<path d="M5.2 3.5h3.4l1.8 4.6-2.3 1.5a11 11 0 0 0 5.3 5.3l1.5-2.3 4.6 1.8v3.4a2 2 0 0 1-2.200 2A16.500 16.500 0 0 1 3.200 5.700a2 2 0 0 1 2-2.200z"/>',
  pin: '<path d="M12 21.500s7-6.200 7-11.700a7 7 0 1 0-14 0c0 5.500 7 11.700 7 11.700z"/><circle cx="12" cy="9.800" r="2.600"/>',
  chev: '<path d="m9 6 6 6-6 6"/>',
  fb: '<path d="M13.600 21v-8h2.700l.5-3.300h-3.200V7.600c0-.9.400-1.700 1.800-1.700H17V3.100S15.800 3 14.700 3C12.300 3 10.600 4.500 10.600 7.100v2.600H8v3.300h2.600v8z"/>',
  x: '<path d="M18.240 2.250h3.310l-7.230 8.260 8.500 11.240h-6.650l-5.210-6.820-5.970 6.820H1.680l7.730-8.840L1.250 2.250h6.830l4.710 6.230zm-1.160 17.520h1.830L7.080 4.130H5.120z"/>',
  in: '<path d="M4.500 9.200h3.600V20H4.500zM6.300 3.500a2.100 2.100 0 1 1 0 4.200 2.100 2.100 0 0 1 0-4.200zM10.200 9.200h3.400v1.500c.5-.9 1.700-1.800 3.500-1.800 3.700 0 4.400 2.400 4.400 5.600V20h-3.600v-5c0-1.200 0-2.800-1.700-2.800s-2 1.300-2 2.700V20h-3.600z"/>',
  ig: '<rect x="3.500" y="3.500" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.300" cy="6.700" r="1" class="f"/>',
  yt: '<rect x="2.500" y="5.500" width="19" height="13" rx="4"/><path d="m10 9 5 3-5 3z" class="f"/>',
  wa: '<path d="M4 20l1.200-4.200A8 8 0 1 1 8.300 18.800zM9 8.500c0 3.500 3 6.500 6.500 6.500l1-1.500-2-1-1 .8a5 5 0 0 1-2.300-2.300l.8-1-1-2z"/>',
};
const FILLED = new Set(["fb", "x", "in"]);
const NETWORK_ICON: Record<string, string> = { Facebook: "fb", "X (Twitter)": "x", LinkedIn: "in", Instagram: "ig", YouTube: "yt", WhatsApp: "wa" };
const svg = (n: string) => `<svg class="zf-i${FILLED.has(n) ? " f" : ""}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${PATHS[n]}</svg>`;

const esc = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const lines = (s: unknown) => String(s ?? "").split("\n").map((x) => x.trim()).filter(Boolean);

export function footerHtml(f: Content[string], year = new Date().getFullYear()) {
  const q = String(f.mapQuery || f.address || "");
  const zoom = Math.max(1, Math.min(20, Math.round(Number(f.mapZoom)) || 14));
  const mapEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=m&z=${zoom}&output=embed&iwloc=near`;
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  const tel = "tel:" + String(f.phone ?? "").replace(/[^+\d]/g, "");
  const cards = [
    f.email ? { icon: "mail", title: "Support & Email", text: String(f.email), href: "mailto:" + String(f.email), ext: false } : null,
    f.phone ? { icon: "phone", title: "Customer Support", text: String(f.phone), href: tel, ext: false } : null,
    f.address ? { icon: "pin", title: "Our Location", text: lines(f.address).join(", "), href: mapLink, ext: true } : null,
  ].filter(Boolean) as { icon: string; title: string; text: string; href: string; ext: boolean }[];
  const links = ((Array.isArray(f.links) ? f.links : []) as any[]).map((l) => ({ label: String(l.label ?? ""), url: safeUrl(l.url) })).filter((l: { label: string; url: string }) => l.label && l.url);
  const social = ((Array.isArray(f.social) ? f.social : []) as any[]).map((s) => ({ icon: NETWORK_ICON[s.network], label: String(s.network), url: safeUrl(s.url) })).filter((s: { icon: string; label: string; url: string }) => s.icon && s.url);
  const credit = safeUrl(f.poweredUrl);
  return `<footer class="zf" id="site-footer">
<div class="zf-bg" aria-hidden="true"><i class="zf-grid"></i><i class="zf-rays"></i><i class="zf-sun"></i></div>
${cards.length ? `<ul class="zf-cards">${cards.map((c, n) => `<li class="zf-card zf-r" style="--n:${n}"><a href="${esc(c.href)}"${c.ext ? ' target="_blank" rel="noopener"' : ""}><span class="zf-tile">${svg(c.icon)}</span><span class="zf-ct"><b>${esc(c.title)}</b><em>${esc(c.text)}</em></span></a></li>`).join("")}</ul>` : ""}
<div class="zf-main">
<div class="zf-brand zf-r" style="--n:0">
<a class="zf-logo" href="/" aria-label="Zakion Energy home"><img src="/media/2024/03/zak-logo-w.png" width="619" height="120" alt="Zakion Energy logo" loading="lazy" decoding="async"></a>
${f.about ? `<p>${esc(f.about)}</p>` : ""}
${social.length ? `<ul class="zf-soc">${social.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(s.label)}">${svg(s.icon)}</a></li>`).join("")}</ul>` : ""}
</div>
${links.length ? `<nav class="zf-links zf-r" style="--n:1" aria-label="Quick links"><h3>Quick Links</h3><ul>${links.map((l) => `<li><a href="${esc(l.url)}">${svg("chev")}<span>${esc(l.label)}</span></a></li>`).join("")}</ul></nav>` : ""}
${q ? `<div class="zf-map zf-r" style="--n:2"><iframe src="${esc(mapEmbed)}" title="${esc(q)}" aria-label="${esc(q)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>` : ""}
</div>
<div class="zf-bar zf-r" style="--n:3"><p>Copyright &copy; ${year} ${esc(f.copyright)}</p>${f.poweredName ? `<p class="zf-pw">${esc(f.poweredLabel)} ${credit ? `<a href="${esc(credit)}" target="_blank" rel="noopener">${esc(f.poweredName)}</a>` : esc(f.poweredName)}</p>` : ""}</div>
</footer>`;
}

/** Cuts the stored footer block (the first div that carries the footer marker, up to its closing tag) and puts ours in its place. */
export function swapFooter(body: string, c: Content): string {
  const at = body.indexOf(MARK);
  if (at < 0) return body;
  const start = body.lastIndexOf("<div", at);
  if (start < 0) return body;
  const re = /<(\/?)div\b/g;
  re.lastIndex = start;
  let depth = 0, end = -1, m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    if (m[1]) { if (--depth === 0) { end = body.indexOf(">", m.index) + 1; break; } } else depth++;
  }
  return end < 0 ? body : body.slice(0, start) + footerHtml(c.footer) + body.slice(end);
}

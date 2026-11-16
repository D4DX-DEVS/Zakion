// Applies the deck sections to page bodies in D1. Safe to re-run (marker blocks are replaced in place).
//   node tools/deck/apply.mjs            -> local D1
//   node tools/deck/apply.mjs --remote   -> live D1 (backs up every page first)
import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";
import * as S from "./sections.mjs";
import * as C from "./content.mjs";

const REMOTE = process.argv.includes("--remote");
const MODE = REMOTE ? "--remote" : "--local";
const ROOT = path.resolve(import.meta.dirname, "../..");
const NPX = process.platform === "win32" ? "npx.cmd" : "npx";
const run = (args) => execFileSync(NPX, ["wrangler", "d1", "execute", "zakion-db", MODE, ...args], { cwd: ROOT, shell: true, encoding: "utf8", maxBuffer: 1 << 30, stdio: ["ignore", "pipe", "pipe"] });
const q = (sql) => { const out = run(["--json", "--command", `"${sql.replace(/"/g, '\\"')}"`]); return JSON.parse(out.slice(out.indexOf("[")))[0].results; };
const sq = (s) => "'" + String(s).split("'").join("''") + "'";
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "zk-deck-"));

function save(table, where, col, value) { // chunked: D1 caps a statement at 100KB
  const lines = [`UPDATE ${table} SET ${col}='' WHERE ${where};`];
  for (let i = 0; i < value.length; i += 20000) lines.push(`UPDATE ${table} SET ${col}=${col}||${sq(value.slice(i, i + 20000))} WHERE ${where};`);
  const f = path.join(TMP, "w.sql"); fs.writeFileSync(f, lines.join("\n"), "utf8");
  run(["--yes", "--file", `"${f}"`]);
}

// ---- body surgery
const open = (b, id) => { const m = new RegExp(`<div\\b[^>]*data-id="${id}"[^>]*data-element_type="container"`).exec(b); return m ? m.index : -1; };
function closeOf(b, start) {
  const re = /<div\b|<\/div>/g; re.lastIndex = start; let depth = 0, m;
  while ((m = re.exec(b))) { depth += m[0] === "</div>" ? -1 : 1; if (!depth) return m.index + 6; }
  throw new Error("unbalanced container");
}
// The footer template is a root-level wrapper after the last section; new sections go right before it.
const footerAt = (b) => { const i = b.indexOf('<div class="ekit-template-content-markup ekit-template-content-footer'); if (i < 0) throw new Error("footer not found"); return i; };
const markerRe = (n) => new RegExp(`<!--zk:${n}-->[\\s\\S]*?<!--/zk:${n}-->`);
function place(b, name, html, a) {
  if (markerRe(name).test(b)) return b.replace(markerRe(name), () => html);
  if (a.beforeMarker || a.afterMarker) {
    const n = a.beforeMarker || a.afterMarker, m = markerRe(n).exec(b); if (!m) throw new Error(`marker ${n} missing for ${name}`);
    const at = a.beforeMarker ? m.index : m.index + m[0].length; return b.slice(0, at) + html + b.slice(at);
  }
  if (a.beforeFooter) { const f = footerAt(b); return b.slice(0, f) + html + b.slice(f); }
  const id = a.before || a.after || a.replace; const s = open(b, id); if (s < 0) throw new Error(`container ${id} not found for ${name}`);
  if (a.before) return b.slice(0, s) + html + b.slice(s);
  if (a.after) { const e = closeOf(b, s); return b.slice(0, e) + html + b.slice(e); }
  if (a.replace) return b.slice(0, s) + html + b.slice(closeOf(b, s));
}
const sub = (b, re, to) => b.replace(re, typeof to === "string" ? () => to : to);

// ---- per page
const PROCESS_SUB = "From First Assessment to Long-Term Performance in 8 Steps";
const processSub = (b) => sub(b, />Our latest process</g, `>${PROCESS_SUB}<`);
// theme demo leftovers: lorem-ipsum testimonial slides (John Doe etc.) and a lorem band on Services
function dropDemoSlides(b) {
  for (let i = b.indexOf("Sed ut perspiciatis unde omnis"); i >= 0; i = b.indexOf("Sed ut perspiciatis unde omnis")) {
    const s = b.lastIndexOf('<div class="swiper-slide">', i); if (s < 0) break;
    b = b.slice(0, s) + b.slice(closeOf(b, s));
  }
  return b;
}
const fixProcess = (b) => sub(b, /(>)01(<\/figcaption>(?:(?!<\/figcaption>)[\s\S]){0,700}?>Supply of Material<)/, (_, a, rest) => a + "04" + rest);
const renewLabel = (b) => sub(b, />WHY CHOOSE US</g, ">Why Renewable Energy<");
// project pages: drop the template's invented facts (date, kWh, client, address) and lorem/email-marketing filler
const dropWidget = (b, label) => {
  const i = b.indexOf(label); if (i < 0) return b;
  const s = b.lastIndexOf('<div class="elementor-element elementor-element-', i);
  return b.slice(0, s) + b.slice(closeOf(b, s));
};
function project(b) {
  const name = (/<h1[^>]*>([^<]*)</.exec(b) || [, ""])[1].trim();
  for (const l of ["Project Date:", "Energy Generation:", "Client / Company:", "Project Location:"]) b = dropWidget(b, l);
  b = sub(b, /<p>Lorem Ipsum is simply dummy text[^<]*<\/p><p>Our inboxes are overloaded[^<]*<\/p>/, C.projectInfo(name));
  b = sub(b, /<p>Lorem Ipsum is simply dummy text[^<]*<\/p>/, `<p>${C.PROJECT_SCOPE}</p>`);
  let i = 0;
  return sub(b, /(<span class="elementor-icon-list-text">)(?:It has survived|Our inboxes|Prospects are more)[^<]*(<\/span>)/g, (_, o, c) => o + C.PROJECT_LIST[i++] + c);
}
const PAGES = {
  "/": (b) => {
    b = sub(b, />Welcome to solor</, ">Welcome to Zakion Energy<");
    b = sub(b, /<p>Duis ultricies[^<]*<\/p>/, "<p>Premium renewable energy solutions for a sustainable tomorrow. Powering homes. Empowering businesses. Building a sustainable future.</p>");
    b = sub(b, /href="#"([^>]*>\s*<span class="ekit_creative_button_text">Our Services)/, 'href="/services/"$1');
    b = sub(b, /href="#"([^>]*>\s*<span class="ekit_creative_button_text">Contact Now)/, 'href="/contact/"$1');
    b = place(b, "about", S.about(), { after: "f176d98" });
    b = place(b, "stats", S.stats(), { replace: "e367b2a" });
    b = place(b, "why", S.why(), { afterMarker: "stats" });
    b = fixProcess(dropDemoSlides(processSub(b)));
    b = renewLabel(b);
    b = place(b, "roi", S.roi(), { before: "9342535" });
    b = place(b, "quotes", S.quotes(), { before: "6ebaa38" });
    b = place(b, "delivered", S.delivered(), { before: "ed95027" });
    b = place(b, "partners", S.partners(), { replace: "746f7c6d" });
    return place(b, "cta", S.cta(), { afterMarker: "partners" });
  },
  "/about-us/": (b) => {
    b = place(b, "about", S.about(), { before: "2e5302d" });
    b = place(b, "vision", S.vision(), { replace: "2e5302d" });
    b = place(b, "stats", S.stats(), { replace: "070a1df" });
    b = place(b, "story", S.story(), { replace: "a4dba0c" });
    b = processSub(b);
    b = fixProcess(dropDemoSlides(b));
    b = place(b, "quotes", S.quotes(), { before: "710a667" });
    b = place(b, "partners", S.partners(), { beforeFooter: true });
    return place(b, "cta", S.cta(), { afterMarker: "partners" });
  },
  "/services/": (b) => {
    b = fixProcess(processSub(b));
    b = sub(b, /It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout\./, "Schedule your free consultation today and discover how solar can reduce your energy costs and power a sustainable future.");
    b = renewLabel(b);
    b = place(b, "why", S.why(), { before: "aa14e00" });
    b = place(b, "roi", S.roi(), { before: "4c169ee" });
    b = place(b, "partners", S.partners(), { beforeFooter: true });
    return place(b, "cta", S.cta(), { afterMarker: "partners" });
  },
  "/services/photovoltaic-solutions/": (b) => {
    b = place(b, "systems", S.systems(), { after: "8d5804e" });
    b = place(b, "components", S.components(), { afterMarker: "systems" });
    b = place(b, "aesthetics", S.aesthetics(), { afterMarker: "components" });
    b = place(b, "home-teaser", S.homeTeaser(), { afterMarker: "aesthetics" });
    b = place(b, "roi", S.roi(), { afterMarker: "home-teaser" });
    return place(b, "cta", S.cta(), { beforeFooter: true });
  },
  "/projects/": (b) => {
    b = place(b, "delivered", S.delivered(), { after: "74eed95" });
    return place(b, "cta", S.cta(), { afterMarker: "delivered" });
  },
  "/services/emobility-infrastructure/": (b) => {
    b = place(b, "ev-solar", S.evSolar(), { beforeFooter: true });
    return place(b, "cta", S.cta(), { afterMarker: "ev-solar" });
  },
  "/services/energy-engineering/": (b) => place(b, "cta", S.cta(), { beforeFooter: true }),
  "/contact/": (b) => place(b, "connect", S.connect(), { before: "c513d22" }),
  ...Object.fromEntries(["ecoharbor", "greenvista-homes", "helioharbor-dynamics", "luxsolar-dynamics", "solar-paneling", "solarburst-ventures", "solarloom-energy", "sunworks-initiative"].map((s) => [`/portfolio/${s}/`, project])),
};

// ---- site-wide text (contact details from the deck, nav link)
const NAV_LI = '<li class="menu-item menu-item-type-post_type menu-item-object-page nav-item elementskit-mobile-builder-content" data-vertical-menu=750px><a href="/services/solar-home/" class=" dropdown-item">Solar Home</a>';
// copy fixes in the mirrored WordPress content (typos, capitalisation, wording from the deck)
function copyFixes(b) {
  b = b.replaceAll("Electrcity", "Electricity").replaceAll("Soluions", "Solutions").replace(/([>\s])ailored solutions/g, (_, c) => c + "Tailored solutions").replaceAll("Loation", "Location")
    .replaceAll("See What People Say's About Us", "See What People Say About Us").replaceAll("Words From Our Customer<", "Words From Our Customers<")
    .replaceAll("Bank road", "Bank Road").replaceAll(">Photovoltaic solutions<", ">Photovoltaic Solutions<").replaceAll(">Contact us<", ">Contact Us<")
    .replace(/(["'>])our Average Monthly Bill/g, (_, q) => q + "Your Average Monthly Bill")
    .replace(/(aria-label|title)="(instagram|Linkedin)"/g, (_, k, v) => `${k}="${v === "Linkedin" ? "LinkedIn" : "Instagram"}"`)
    .replace(/One[ -]Time investment for 25 years/gi, "One-Time Investment for 25 Years").replace(/Reduce carbon footprints/gi, "Reduce Carbon Footprint")
    .replace(/Less global warming/gi, "Reduce Global Warming").replace(/Eco friendly and sustainable living/gi, "Eco-Friendly &amp; Sustainable Living")
    .replace(/Limitless and everlasting source of energy/gi, "Limitless &amp; Everlasting Energy");
  return b;
}
function global(b) {
  b = copyFixes(b).replaceAll(">Broucher<", ">Brochure<").replaceAll("+91 9497 113001", S.PHONE1).replaceAll("+91 9656 361776", `${S.PHONE1} / ${S.PHONE2}`).replaceAll("+91 9497 11 3001", S.PHONE1)
    .replaceAll("919497113001", "919188944337").replaceAll("800-001-658", S.PHONE1)
    .replaceAll("tel:+01%20248%20248%202481", S.TEL1).replaceAll("tel:+01%20547%20547%205478", S.TEL1).replaceAll("tel:+91 9497 113001", S.TEL1)
    .replaceAll("mailto:info@domain.com", "mailto:" + S.EMAIL).replaceAll("mailto:info@domainname.com", "mailto:" + S.EMAIL);
  if (!b.includes(NAV_LI))
    b = sub(b, /(<a href="\/services\/photovoltaic-solutions\/"[^>]*>Photovoltaic [Ss]olutions<\/a>)/g, (m) => m + NAV_LI);
  return b;
}

// ---- main
if (process.argv.includes("--restore")) {
  const f = process.argv[process.argv.indexOf("--restore") + 1];
  for (const r of JSON.parse(fs.readFileSync(f, "utf8"))) save("pages", `path=${sq(r.path)}`, "body_html", r.body_html);
  console.log("restored from", f); process.exit(0);
}
const rows = q("select path, body_html from pages");
const backup = path.join(os.tmpdir(), `zk-backup-${REMOTE ? "remote" : "local"}-${Date.now()}.json`);
fs.writeFileSync(backup, JSON.stringify(rows)); console.log("backup:", backup);

for (const r of rows) {
  let b = r.body_html; const fn = PAGES[r.path];
  if (fn) b = fn(b);
  b = global(b);
  if (b !== r.body_html) { save("pages", `path=${sq(r.path)}`, "body_html", b); console.log("updated", r.path, r.body_html.length, "->", b.length); }
}

// lorem blog posts -> real copy (only posts still holding lorem, so later admin edits are never overwritten)
for (const r of q("select id, slug, content, excerpt from posts")) {
  const c = C.POSTS[r.slug]; if (!c) continue;
  if (/Lorem Ipsum/.test(r.content)) { save("posts", `id=${r.id}`, "content", c.content); console.log("post content", r.slug); }
  if (/Lorem Ipsum/.test(r.excerpt)) { save("posts", `id=${r.id}`, "excerpt", c.excerpt); console.log("post excerpt", r.slug); }
}

// meta descriptions carry the old phone number too
for (const col of ["description", "title"]) run(["--yes", "--command", `"UPDATE pages SET ${col}=replace(replace(${col},'+91 9497 113001','${S.PHONE1}'),'+91 9656 361776','${S.PHONE1}') WHERE ${col} LIKE '%9497%' OR ${col} LIKE '%9656%'"`]);

// new page: Solar Home, built from the PV page shell (banner + footer) with deck content between
const SOLAR = "/services/solar-home/";
const pv = q("select * from pages where path='/services/photovoltaic-solutions/'")[0];
const full = global(pv.body_html);
const bannerEnd = open(full, "ec67107");
let sh = full.slice(0, bannerEnd);
// retitle the banner only: the nav links keep their own labels
sh = sub(sh, /(?<!<a href="\/services\/photovoltaic-solutions\/"[^>]*>\s*)Photovoltaic\s*Solutions/g, "Solar Home");
const SHDOC = sh + S.solarHome() + S.roi() + S.aesthetics() + S.cta() + full.slice(closeOf(full, open(full, "8d5804e"))).replace(/<!--zk:[\w-]+-->[\s\S]*?<!--\/zk:[\w-]+-->/g, "");
const exists = q(`select 1 x from pages where path=${sq(SOLAR)}`).length;
if (!exists) {
  const f = path.join(TMP, "i.sql");
  fs.writeFileSync(f, `INSERT INTO pages (path,title,description,og_image,body_class,head_html,body_html,foot_html,kind,status) SELECT '${SOLAR}','Solar Home – Rooftop Solar Plans for Your Home | Zakion Energy','Personalized on-grid rooftop solar plans (3 kW and 5 kW) for your home: savings, daily generation, area needed and what your system can power.','/zk/solarhome-photo.jpg',body_class,head_html,'',foot_html,'page','published' FROM pages WHERE path='/services/photovoltaic-solutions/';`, "utf8");
  run(["--yes", "--file", `"${f}"`]);
}
save("pages", `path=${sq(SOLAR)}`, "body_html", SHDOC);
console.log("solar-home page", exists ? "updated" : "created", SHDOC.length);

// HTML builders for the page sections. Each one renders from the editable content in lib/content.ts (defaults + admin edits).
import { CATEGORIES, Content, ICONS, parseFeatures, parseGallery, type Project, safeUrl, type System, type Testimonial } from "./content";
import { richOrText } from "./html";
import { ic, SPRITE } from "./sprite";
import { NEON_HOUSE, PHOTO_FX } from "./neon-house";

// ---- text helpers: every admin-entered string is escaped; ==x== (accent) and **x** (bold) are the only markup ----
export const esc = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const rt = (s: unknown, accent = "em") =>
  esc(s).replace(/==([\s\S]+?)==/g, `<${accent}>$1</${accent}>`).replace(/\*\*([\s\S]+?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>");
const url = (u: unknown) => esc(safeUrl(u));
const lines = (s: unknown) => String(s ?? "").split("\n").map((x) => x.trim()).filter(Boolean);
const img = (src: unknown, alt: string, w?: number, h?: number, cls = "") =>
  `<img${cls ? ` class="${cls}"` : ""} src="${url(src)}"${w ? ` width="${w}" height="${h}"` : ""} loading="lazy" decoding="async" alt="${esc(alt)}">`;

const head = (eyebrow: string, title: string, sub = "", cls = "") =>
  `<header class="zh-head zr ${cls}">${eyebrow ? `<span class="zh-eye">${rt(eyebrow)}</span>` : ""}<h2>${rt(title)}</h2>${sub ? `<p class="zh-sub">${rt(sub)}</p>` : ""}</header>`;

// ---- scripts: reveal on scroll, count-up, parallax, carousels (content stays visible if JS cannot run) ----
export const SCRIPT_EARLY = `<script>(function(){var d=document.documentElement;if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('zh-js')})()</script>`;
export const SCRIPT_MAIN = `<script>(function(){
var d=document;
function run(){
 if(!d.documentElement.classList.contains('zh-js'))return;
 var els=[].slice.call(d.querySelectorAll('.zh .zr'));
 els.forEach(function(el){var i=0,p=el.previousElementSibling;while(p){if(p.classList.contains('zr'))i++;p=p.previousElementSibling}el.style.setProperty('--i',Math.min(i,8))});
 var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.15,rootMargin:'0px 0px -5% 0px'});
 els.forEach(function(el){io.observe(el)});
 var nums=[].slice.call(d.querySelectorAll('[data-zh-count]'));
 nums.forEach(function(el){el.textContent=(el.getAttribute('data-zh-pad')|0)?'00':'0'});
 var co=new IntersectionObserver(function(es){es.forEach(function(e){
  if(!e.isIntersecting)return;co.unobserve(e.target);
  var el=e.target,to=parseInt(el.getAttribute('data-zh-count'),10),pad=el.getAttribute('data-zh-pad')|0,suf=el.getAttribute('data-zh-suffix')||'',t0=performance.now();
  (function tick(t){var p=Math.min((t-t0)/1500,1),v=Math.round(to*(1-Math.pow(1-p,3)));el.textContent=String(v).padStart(pad,'0')+suf;if(p<1)requestAnimationFrame(tick)})(t0);
 })},{threshold:.5});
 nums.forEach(function(el){co.observe(el)});
 var par=[].slice.call(d.querySelectorAll('[data-zh-par]')),tick=false;
 function frame(){tick=false;var vh=innerHeight;par.forEach(function(el){var r=el.getBoundingClientRect();if(r.bottom<-200||r.top>vh+200)return;var k=parseFloat(el.getAttribute('data-zh-par'))||.08;el.style.setProperty('--py',((r.top+r.height/2-vh/2)*k).toFixed(1)+'px')})}
 if(par.length&&innerWidth>900){addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(frame)}},{passive:true});frame()}
}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',run);else run();
})();</script>`;

// ---- sections ----
// About: light sky panel, the photo on a curved shape with a blue ribbon, a navy wave with line art along the bottom.
// The clip path and gradient below are shared by the shapes in this section only (ids are unique on the page).
const ABOUT_DEFS = `<svg class="zh-about-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>
<clipPath id="zh-blob" clipPathUnits="objectBoundingBox"><path d="M.21 0H1V1H.19C.1.92.02.76 0 .56C-.01.36.12.14.21 0Z"/></clipPath>
<linearGradient id="zh-wavegrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color:var(--zc-0a3270,#0a3270)"/><stop offset=".55" style="stop-color:var(--zc-0b3f86,#0b3f86)"/><stop offset="1" style="stop-color:var(--zc-0a2f68,#0a2f68)"/></linearGradient>
</defs></svg>`;
const ABOUT_WAVE = `<svg class="zh-about-wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0C70 70 150 120 330 112C560 100 760 96 980 78C1180 62 1320 50 1440 56V120H0Z" fill="url(#zh-wavegrad)"/></svg>`;
const ABOUT_LEAVES = `<svg class="zh-about-leaves" viewBox="0 0 90 70" aria-hidden="true"><g class="l1"><path d="M6 66C2 38 22 12 58 6C62 36 40 62 6 66Z" fill="#5fbf3c"/><path d="M6 66C22 44 38 28 58 6" fill="none" stroke="#2f8a2c" stroke-width="1.6" stroke-linecap="round"/></g><g class="l2"><path d="M30 68C34 46 58 30 88 34C84 56 62 70 30 68Z" fill="#3fa534"/><path d="M30 68C48 54 66 44 88 34" fill="none" stroke="#2a7d28" stroke-width="1.6" stroke-linecap="round"/></g></svg>`;
const ABOUT_ART = `<svg class="zh-about-art" viewBox="0 0 640 120" preserveAspectRatio="xMaxYMax meet" aria-hidden="true"><g fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" opacity=".55">
<path d="M10 118V84h22v34M36 118V58h26v60M66 118V72h18v-14h14v60M102 118V44h30v74M138 118V76h20v42M164 118V62h24v56M194 118V86h18v32"/>
<path class="win" d="M42 70h4M52 70h4M42 82h4M52 82h4M42 94h4M52 94h4M108 54h4M120 54h4M108 68h4M120 68h4M108 82h4M120 82h4M170 72h4M180 72h4M170 86h4M180 86h4"/>
<circle cx="236" cy="96" r="12"/><path d="M236 108v10M262 98a9 9 0 1 0 0 .1M262 107v11"/>
<path d="M300 118l14-30h44l-14 30zM316 118l12-30M340 118l12-30M307 103h44M330 118V108"/><path d="M372 118l14-30h44l-14 30zM388 118l12-30M412 118l12-30M379 103h44M402 118V108"/>
<path d="M486 118V46M572 118V30"/>
<g class="rot" style="transform-origin:486px 42px"><path d="M486 42V8M486 42l-30 17M486 42l30 17"/></g>
<g class="rot rot2" style="transform-origin:572px 26px"><path d="M572 26V-8M572 26l-30 17M572 26l30 17"/></g>
</g></svg>`;

const about = (c: Content) => { const a = c.about; const feats: any[] = Array.isArray(a.features) ? a.features : []; return `<section class="zh zh-about" id="about-zakion">${ABOUT_DEFS}
<div class="zh-about-clouds" aria-hidden="true"><i></i><i></i><i></i></div>
<div class="zh-wrap zh-about-grid">
<div class="zh-about-txt">
 <span class="zh-rule zr zr-l"></span>
 <h2 class="zh-h2 zr zr-l">${rt(a.title)}</h2>
 <p class="zh-tag zr zr-l">${rt(a.tagline)}</p>
 <p class="zh-lead zr zr-l">${rt(a.body)}</p>
 ${feats.length ? `<ul class="zh-afeats">${feats.map((f) => `<li class="zr"><span class="zh-afi">${ic(ICONS.includes(f.icon) ? f.icon : "leaf")}</span><span class="zh-aft">${rt(f.text)}</span></li>`).join("")}</ul>` : ""}
 <div class="zh-acert zr zr-z"><div class="zh-acert-h">${ic("award")}<h3>${rt(a.certTitle)}</h3><i></i></div>${img(a.certImage, "Approvals and certifications: KSEB, PM Surya Ghar Muft Bijli Yojana and MNRE", 698, 146)}</div>
</div>
<figure class="zh-about-img zr zr-r">${img(a.image, "Zakion engineers in hard hats installing solar panels", 699, 662, "zh-about-photo")}</figure>
</div>
${ABOUT_WAVE}${ABOUT_ART}${ABOUT_LEAVES}</section>`; };

// Vision and Mission: two cards built the same way (badge, title, rule, text) so the type is the same size in both; only the colours differ.
const VM_EYE = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3.2"/></svg>`;
const VM_TARGET = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/></svg>`;
const vision = (c: Content) => { const v = c.vision;
  const card = (cls: string, icon: string, title: unknown, text: unknown, n: string) =>
    `<article class="zh-vcard ${cls} zr"><span class="zh-vico">${icon}</span><h2>${rt(title)}</h2><span class="zh-vrule"></span><p>${rt(text)}</p><span class="zh-vnum" aria-hidden="true">${n}</span></article>`;
  return `<section class="zh zh-vm" id="vision-mission">
<div class="zh-vm-bg" data-zh-par=".05">${img(v.bg, "", 1924, 337)}</div>
<div class="zh-wrap zh-vm-cards">
 ${card("zh-vcard--v", VM_EYE, v.visionTitle, v.visionText, "01")}
 ${card("zh-vcard--m", VM_TARGET, v.missionTitle, v.missionText, "02")}
</div>
<div class="zh-city zr zr-z">${img(v.city, "Illustration of a city powered by solar, wind and electric vehicles", 1924, 167)}</div>
</section>`; };

const story = (c: Content) => { const s = c.story; return `<section class="zh zh-story" id="our-story"><div class="zh-wrap">
${head(s.eyebrow, s.title, "", "zh-head--light")}
<div class="zh-story-row">${s.items.map((i: any) => `<article class="zh-scard zr ${i.present ? "is-now" : ""}">${i.present ? `<span class="zh-now">${esc(s.presentLabel)}</span>` : ""}${img(i.image, `${i.year}: ${i.title}`, 353, 320)}<div class="zh-scard-b"><b>${esc(i.year)}</b><i>${esc(i.title)}</i><p>${rt(i.text)}</p></div><span class="zh-bars"></span></article>`).join("")}</div>
</div></section>`; };

// Icon for a "Why choose" card: the one picked in the admin, else one that suits the title, else the next one in the list.
const WHY_ICONS = ["hardhat", "award", "rupee", "gear", "bolt", "headset", "shield", "sun", "leaf", "users", "clock", "wrench"];
const WHY_WORDS: [RegExp, string][] = [
  [/engineer|expert|team|staff|professional/i, "hardhat"], [/premium|component|brand|quality|certified (equip|product)|warranty/i, "award"],
  [/subsid|incentive|saving|price|cost|afford|emi|finance/i, "rupee"], [/epc|complete|turnkey|end.to.end|solution/i, "gear"],
  [/fast|quick|speed|install|timely/i, "bolt"], [/support|service|maintenance|help|care/i, "headset"],
  [/safe|secure|reliab|trust/i, "shield"], [/green|eco|clean|sustain|renewable/i, "leaf"],
];
const whyIcon = (i: any, n: number) => {
  const set = new Set(ICONS);
  if (i.icon && i.icon !== "auto" && set.has(i.icon)) return String(i.icon);
  const hit = WHY_WORDS.find(([re]) => re.test(String(i.title ?? "")));
  return hit ? hit[1] : WHY_ICONS[n % WHY_ICONS.length];
};

const why = (c: Content) => { const w = c.why; return `<section class="zh zh-why" id="why-choose">
${w.image ? `<figure class="zh-why-img zr zr-r">${img(w.image, "Smiling Zakion engineer in a hard hat", 385, 365)}</figure>` : ""}
<div class="zh-wrap">
${head("", w.title)}
<div class="zh-why-grid">${w.items.map((i: any, n: number) => `<article class="zh-wcard zr"><div><div class="zh-wh"><span class="zh-wic">${ic(whyIcon(i, n))}</span><h3>${rt(i.title)}</h3></div><p>${rt(i.text)}</p></div></article>`).join("")}</div>
</div></section>`; };

const renewable = (c: Content) => { const r = c.renewable; return `<section class="zh zh-ren" id="why-renewable"><div class="zh-wrap">
${head("", r.title)}
<div class="zh-ren-grid">${r.items.map((i: any) => `<article class="zh-rcard zr"><div class="zh-rcard-t">${ic("check", "zh-rchk")}<h3>${rt(i.title)}</h3></div><div class="zh-rcard-b"><span class="zh-go zh-go--w">${ic("chev")}</span><p>${rt(i.text)}</p></div></article>`).join("")}</div>
</div></section>`; };

// Benefit card icon: the one picked in the admin, else one that suits the title, else the next one in the list.
const SYS_ICONS = ["trend", "bolt", "sun", "shield", "leaf", "swap", "battery", "ban"];
const SYS_WORDS: [RegExp, string][] = [
  [/meter|credit|export|swap/i, "swap"], [/fuel|free|zero/i, "ban"], [/eco|green|carbon|sustain/i, "leaf"],
  [/bill|saving|cost|tariff|cheap/i, "trend"], [/uninterrupt|backup|power cut|outage|reliab/i, "bolt"], [/solar usage|maximi|sun/i, "sun"],
  [/store|storage|battery/i, "battery"], [/independ|secure|safe|control/i, "shield"],
];
const sysIcon = (f: any, n: number) => {
  if (f.icon && f.icon !== "auto" && ICONS.includes(f.icon)) return String(f.icon);
  const hit = SYS_WORDS.find(([re]) => re.test(String(f.title ?? "")));
  return hit ? hit[1] : SYS_ICONS[n % SYS_ICONS.length];
};

// Benefit cards: icon tile, title, text. Every card is its own scroll-reveal element, so they rise one after another.
const feats = (items: any[]) => `<div class="zh-fgrid">${items.map((f, n) => { const i = sysIcon(f, n); return `<article class="zh-fc zr"><span class="zh-fi zh-fi--${i}">${ic(i)}</span><h3>${rt(f.title)}</h3><p>${rt(f.text)}</p></article>`; }).join("")}</div>`;

// One system section: tinted band, label pill, heading, text, benefit cards, and the diagram(s) on a white stage card with
// energy ripples behind it. `mod` picks the tint and which side the diagram sits on.
const system = (id: string, mod: string, k: Content[string], media: string) => `<section class="zh zh-sys ${mod}" id="${id}"><div class="zh-wrap zh-sys-grid">
<div class="zh-sys-txt">
 ${k.badge ? `<span class="zh-pill zr zr-l">${esc(k.badge)}</span>` : ""}
 <h2 class="zh-h2 zh-h2--sys zr zr-l">${rt(k.title)}</h2>
 <p class="zh-lead zr zr-l">${rt(k.text)}</p>
 ${feats(k.features ?? [])}
</div>
<div class="zh-sys-media zr zr-r"><div class="zh-stage">${media}</div></div>
</div></section>`;

const onGrid = (c: Content) => system("on-grid", "zh-sys--grid", c.onGrid, img(c.onGrid.image, "On grid solar system: solar panels, grid tie inverter, net meter, grid and your home", 710, 1037, "zh-simg"));
const hybrid = (c: Content) => system("hybrid", "zh-sys--hybrid zh-sys--rev", c.hybrid, img(c.hybrid.image, "Hybrid solar system: solar panels, hybrid inverter, battery storage, net meter and grid", 886, 1037, "zh-simg"));
const bess = (c: Content) => { const b = c.bess; return system("bess", "zh-sys--bess", b,
  img(b.image, "Home with solar panels, battery storage and grid connection", 776, 543, "zh-simg") +
  (b.image2 ? `<span class="zh-stage-rule" aria-hidden="true"></span>` + img(b.image2, "Solar farm with battery storage containers supplying a city", 665, 299, "zh-simg zh-simg--b") : "")); };

const solarHome = (c: Content) => {
  const s = c.solarHome; const [p1, p2] = s.plans;
  // Each row reads: a small label, the figure in bold accent colour, and the rest of the sentence.
  const col = (p: any, cls: string) => `<div class="zh-kw-col ${cls}"><span class="zh-badge">${esc(p.label)}</span><ul>
   <li class="zr">${ic("bag", "zh-kwi")}<span><i>Save up to</i><b>${esc(p.saving)}</b><i>on Bi-monthly Electricity Bills</i></span></li>
   <li class="zr">${ic("bolt", "zh-kwi")}<span><i>Produce an Average of</i><b>${esc(p.units)}</b> <i class="in">Daily</i></span></li>
   <li class="zr">${ic("panel", "zh-kwi")}<span><i>Need Only</i><b>${esc(p.area)}</b> <i class="in">of Shade-Free Area</i></span></li></ul></div>`;
  // The house: the chosen picture with the neon overlay (when it is the standard photo), or the drawn neon house when no picture is set.
  const pic = safeUrl(s.photo);
  const house = pic
    ? `<figure class="zh-home-photo zh-home-photo--pic zr zr-r">${img(pic, "Home with a rooftop solar system, shown by day and by night", 1280, 721, "zh-hp-img")}${/^\/zk\/solarhome-photo\./.test(pic) ? PHOTO_FX : ""}</figure>`
    : `<figure class="zh-nh zr zr-r">${NEON_HOUSE}</figure>`;
  return `<section class="zh zh-home" id="solar-home"><div class="zh-wrap">
<div class="zh-home-top">
 <div class="zh-home-l">
  ${head("", s.title, s.subtitle, "zh-head--light")}
  <div class="zh-kw">${p1 ? col(p1, "") : ""}<div class="zh-kw-mid zr zr-z">${ic("sunhouse")}</div>${p2 ? col(p2, "zh-kw-col--5") : ""}</div>
 </div>
 ${house}
</div>
<div class="zh-power zr">
 <h3>${rt(s.powerTitle)}</h3>
 <div class="zh-tbl-wrap"><table class="zh-tbl"><thead><tr><th></th>${s.appliances.map((a: any) => `<th scope="col">${ic(a.icon)}<span>${esc(a.name)}</span></th>`).join("")}</tr></thead>
 <tbody>${p1 ? `<tr><th scope="row"><span class="zh-badge">${esc(p1.label)}</span></th>${s.appliances.map((a: any) => `<td>${esc(a.v1)}</td>`).join("")}</tr>` : ""}
 ${p2 ? `<tr><th scope="row"><span class="zh-badge zh-badge--a">${esc(p2.label)}</span></th>${s.appliances.map((a: any) => `<td>${esc(a.v2)}</td>`).join("")}</tr>` : ""}</tbody></table></div>
</div>
<ul class="zh-perks">${s.perks.map((p: any) => `<li class="zr">${ic(p.icon)}<span>${esc(p.text)}</span></li>`).join("")}</ul>
</div></section>`;
};

const components = (c: Content) => { const k = c.components; return `<section class="zh zh-comp" id="components"><div class="zh-wrap">
${head("", k.title)}
<div class="zh-comp-grid">${k.items.map((i: any) => { const amber = i.color === "amber"; return `<article class="zh-ccard zr${amber ? " is-amber" : ""}" style="--bgc:${amber ? "var(--zc-fec142,#fec142)" : "var(--zc-05367c,#05367c)"};--cut:${Math.max(0, Math.min(100, Number(i.cut) || 0))}%"><div class="zh-ccard-img">${img(i.image, i.title, 260, 300, "zh-float")}</div><h3>${rt(i.title)}</h3><ul>${lines(i.bullets).map((x) => `<li>${ic("chev")}${esc(x)}</li>`).join("")}</ul></article>`; }).join("")}</div>
</div></section>`; };

const aesthetics = (c: Content) => {
  const a = c.aesthetics; const item = (i: any) => `<article class="zh-aitem zr">${img(i.image, i.title, 360, 227)}<div><h3>${rt(i.title)}</h3><p>${rt(i.text)}</p></div></article>`;
  const half = Math.ceil(a.items.length / 2);
  return `<section class="zh zh-aes" id="solar-aesthetics"><div class="zh-wrap">
<header class="zh-head zr"><h2 class="zh-upper">${rt(a.title)}</h2><p class="zh-sub zh-sub--b">${rt(a.subtitle)}</p></header>
<div class="zh-aes-grid"><div class="zh-apanel zr zr-l">${a.items.slice(0, half).map(item).join("")}</div>${a.items.length > half ? `<div class="zh-apanel zh-apanel--b zr zr-r">${a.items.slice(half).map(item).join("")}</div>` : ""}</div>
</div></section>`;
};

const roi = (c: Content) => { const r = c.roi; return `<section class="zh zh-roi" id="roi"><div class="zh-roi-hero">${img(r.image, "Home with rooftop solar panels at sunset", 1193, 299).replace("<img ", '<img data-zh-par=".04" ')}<div class="zh-wrap"><h2 class="zh-roi-t zr">${rt(r.title)}</h2></div></div>
<div class="zh-wrap">
 <div class="zh-roi-top">
  <article class="zh-rbox zh-rbox--n zr">${ic("rupee", "zh-rbi")}<div><h3>${rt(r.beforeTitle)}</h3><ul>${lines(r.beforePoints).map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div></article>
  <span class="zh-roi-arrow" aria-hidden="true">${ic("arrow-r")}</span>
  <article class="zh-rbox zh-rbox--a zr">${ic("panel", "zh-rbi")}<div><h3>${rt(r.afterTitle)}</h3><ul>${lines(r.afterPoints).map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div></article>
  <article class="zh-rbox zh-rbox--n zr">${ic("bulb", "zh-rbi")}<div><h3>${rt(r.conceptTitle)}</h3><p>${rt(r.conceptText)}</p></div></article>
 </div>
 ${r.note ? `<p class="zh-note zr"><b>Note:</b> ${esc(r.note)}</p>` : ""}
 <div class="zh-roi-cards">${r.cards.map((i: any) => `<article class="zh-rc zr"><span class="zh-rc-i">${ic(i.icon)}</span><h3>${rt(i.title)}</h3><span class="zh-uline"></span><p>${rt(i.text)}</p></article>`).join("")}</div>
</div></section>`; };

// Step icon: the one picked in the admin, else one that suits the step name, else the next one in the list.
const PROC_ICONS = ["search", "chat", "ruler", "truck", "wrench", "gauge", "power", "cycle"];
const PROC_WORDS: [RegExp, string][] = [
  [/audit|survey|assess|site visit/i, "search"], [/consult|advice|discuss/i, "chat"], [/design|architect|plan|draft/i, "ruler"],
  [/supply|material|procure|deliver|logist/i, "truck"], [/install|erect|mount/i, "wrench"], [/test|quality|check/i, "gauge"],
  [/commission|hand ?over|go.?live/i, "power"], [/amc|maintenance|service|support|care/i, "cycle"],
];
const procIcon = (s: any, n: number) => {
  if (s.icon && s.icon !== "auto" && ICONS.includes(s.icon)) return String(s.icon);
  const hit = PROC_WORDS.find(([re]) => re.test(String(s.title ?? "")));
  return hit ? hit[1] : PROC_ICONS[n % PROC_ICONS.length];
};

const process_ = (c: Content) => { const p = c.process; return `<section class="zh zh-proc" id="work-process"><div class="zh-proc-ring" aria-hidden="true"></div><div class="zh-wrap">
${head("", p.title, p.subtitle)}
<ol class="zh-flow">${p.steps.map((s: any, i: number) => { const k = procIcon(s, i); return `<li class="zh-ps zr"><span class="zh-pi zh-pi--${k}">${ic(k)}</span><span class="zh-pn" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span><h3 class="zh-pt">${esc(s.title)}</h3><span class="zh-pbar" aria-hidden="true"><i></i></span></li>`; }).join("")}</ol>
</div></section>`; };

const stat = (s: any) => {
  const m = /^(\d+)(.*)$/.exec(String(s.value).trim());
  const val = m ? `<b data-zh-count="${parseInt(m[1], 10)}"${m[1].startsWith("0") && m[1].length > 1 ? ` data-zh-pad="${m[1].length}"` : ""}${m[2] ? ` data-zh-suffix="${esc(m[2])}"` : ""}>${esc(s.value)}</b>` : `<b>${esc(s.value)}</b>`;
  return `<div class="zh-stat zr">${val}<strong>${esc(s.label)}</strong><span>${esc(s.sub)}</span></div>`;
};
const track = (c: Content) => { const t = c.track; return `<section class="zh zh-track" id="track-record"><div class="zh-wrap">
${head("", t.title, t.subtitle)}
<div class="zh-track-panel zr zr-z">${t.image ? img(t.image, "", 348, 754, "zh-track-bg") : ""}
 <div class="zh-stats">${t.stats.map(stat).join("")}</div>
</div>
<svg class="zh-chevs" viewBox="0 0 120 400" aria-hidden="true"><path d="M110 20 60 70l50 50M110 90 60 140l50 50" /><path d="M110 220 60 270l50 50M110 290 60 340l50 50" /></svg>
</div></section>`; };

// Logo carousel: rows scroll in opposite directions; each row holds two identical halves so the loop has no seam.
const partners = (c: Content) => {
  const p = c.partners; const logos = p.logos.filter((l: any) => safeUrl(l.image));
  const rows = Math.max(1, Math.min(3, Math.round(Number(p.rows)) || 1));
  const buckets: any[][] = Array.from({ length: rows }, () => []);
  logos.forEach((l: any, i: number) => buckets[i % rows].push(l));
  const mode = p.hoverEffect === "Grayscale, colour on hover" ? "gray-idle" : p.hoverEffect === "Always colour (no effect)" ? "plain" : "gray-hover";
  const one = (l: any) => { const body = img(l.image, l.name); const u = safeUrl(l.url); return u ? `<a class="zh-mlogo" href="${esc(u)}" aria-label="${esc(l.name)}" rel="noopener">${body}</a>` : `<div class="zh-mlogo">${body}</div>`; };
  const track_ = (set: any[], idx: number) => {
    const reps = Math.max(1, Math.ceil(10 / set.length)); const half = (hidden: boolean) => `<div class="zh-mhalf"${hidden ? ' aria-hidden="true"' : ""}>${Array.from({ length: reps }, () => set.map(one).join("")).join("")}</div>`;
    const rev = (idx % 2 === 1) !== (p.direction === "right");
    return `<div class="zh-mrow"><div class="zh-mtrack" style="animation-direction:${rev ? "reverse" : "normal"}">${half(false)}${half(true)}</div></div>`;
  };
  return `<section class="zh zh-part" id="technology-partners"><div class="zh-wrap">
${head("", p.title, p.subtitle, "c")}
</div>
<div class="zh-marq zr" data-mode="${mode}" data-pause="${p.pauseOnHover ? 1 : 0}" style="--speed:${Math.max(8, Math.min(200, Number(p.speed) || 34))}s">${buckets.filter((b) => b.length).map(track_).join("")}</div>
</section>`;
};

const projects = (c: Content) => { const p = c.projects; return `<section class="zh zh-proj" id="projects-delivered"><div class="zh-wrap zh-proj-grid">
<div class="zh-proj-l"><h2 class="zh-h2 zr zr-l">${rt(p.title)}</h2><span class="zh-rule zr zr-l"></span>
 <div class="zh-proj-n zr zr-l">${(() => { const m = /^(\d+)(.*)$/.exec(String(p.count).trim()); return m ? `<b data-zh-count="${parseInt(m[1], 10)}"${m[2] ? ` data-zh-suffix="${esc(m[2])}"` : ""}>${esc(p.count)}</b>` : `<b>${esc(p.count)}</b>`; })()}<p>${rt(p.caption)}</p></div></div>
<div class="zh-proj-photos">${p.photos.map((f: any, n: number) => { const u = safeUrl(f.url); const tag = u ? "a" : "div"; return `<${tag} class="zh-ph zr zr-z"${u ? ` href="${esc(u)}" aria-label="View our projects (photo ${n + 1})"` : ""}>${img(f.image, f.alt, 468, 255)}</${tag}>`; }).join("")}</div>
</div></section>`; };

// ---- Projects page: filter tabs and cards, and the project page. The projects come from the "projects" table (Admin > Projects). ----
const SVG = (d: string, cls = "") => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"${cls ? ` class="${cls}"` : ""}>${d}</svg>`;
const PF_ICON: Record<string, string> = {
  Residential: SVG('<path d="m3 11 9-8 9 8M5 10v10h14V10M10 20v-6h4v6"/>'),
  Commercial: SVG('<path d="M4 21V4h10v17M14 9h6v12M8 8h2M8 12h2M8 16h2M17 13h1M17 17h1M3 21h18"/>'),
  Industrial: SVG('<path d="M3 21V9l6 3V9l6 3V5h3v16zM7 17h2M12 17h2"/>'),
};
const PIN = SVG('<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.4"/>', "zh-pin");
const ARROW_R = SVG('<path d="M4 12h16M14 6l6 6-6 6"/>');
const ARROW_L = SVG('<path d="M20 12H4M10 6l-6 6 6 6"/>');
const projectUrl = (p: Pick<Project, "slug">) => `/projects/${esc(p.slug)}/`;

const stageChip = (p: Pick<Project, "stage">, cls = "zh-pc-stage") => `<span class="${cls} ${p.stage === "ongoing" ? "is-ongoing" : "is-done"}">${p.stage === "ongoing" ? "Ongoing" : "Completed"}</span>`;
const projectCard = (p: Project, readMore: string) =>
  `<article class="zh-pc" data-cat="${esc(p.category)}"><a class="zh-pc-img" href="${projectUrl(p)}" tabindex="-1" aria-hidden="true">${p.image ? img(p.image, "", 640, 400) : ""}${stageChip(p)}</a>` +
  `<div class="zh-pc-b"><h3><a href="${projectUrl(p)}">${esc(p.title)}</a></h3>${p.location ? `<p class="zh-pc-loc">${PIN}<span>${esc(p.location)}</span></p>` : ""}` +
  `<a class="zh-pc-btn" href="${projectUrl(p)}" aria-label="${esc(readMore)}: ${esc(p.title)}">${esc(readMore)}${ARROW_R}</a></div></article>`;

// The tabs only filter what is already on the page (no reload); without JavaScript every project simply stays visible.
const PF_JS = `<script>(function(){var s=document.getElementById('our-projects');if(!s)return;var tabs=[].slice.call(s.querySelectorAll('.zh-pf-tab')),cards=[].slice.call(s.querySelectorAll('.zh-pc')),none=s.querySelector('.zh-pf-none');
function show(c){var n=0;tabs.forEach(function(t){t.setAttribute('aria-pressed',t.getAttribute('data-c')===c?'true':'false')});cards.forEach(function(k){var on=c==='all'||k.getAttribute('data-cat')===c;k.hidden=!on;if(on)n++});if(none)none.hidden=n>0}
tabs.forEach(function(t){t.addEventListener('click',function(){show(t.getAttribute('data-c'))})})})();</script>`;

const portfolio = (c: Content) => {
  const p = c.portfolio, list: Project[] = c._projects ?? [];
  const readMore = String(p.readMore || "Read More");
  const tabs = [["all", String(p.allLabel || "All"), ""], ...CATEGORIES.map((k) => [k, k, PF_ICON[k]])]
    .map(([v, label, icon], i) => `<button type="button" class="zh-pf-tab" data-c="${esc(v)}" aria-pressed="${i === 0 ? "true" : "false"}">${icon}<span>${esc(label)}</span></button>`).join("");
  const intro = p.title || p.eyebrow || p.subtitle ? head(p.eyebrow, p.title, p.subtitle) : "";
  return `<section class="zh zh-pf" id="our-projects"><div class="zh-wrap">${intro}
${list.length ? `<div class="zh-pf-tabs" role="group" aria-label="Filter projects by category">${tabs}</div>
<div class="zh-pf-grid">${list.map((x) => projectCard(x, readMore)).join("")}</div>
<p class="zh-pf-none" hidden>No projects in this category yet.</p>${PF_JS}` : `<p class="zh-pf-none">${esc(p.empty)}</p>`}
</div></section>`;
};

// The project page: a back link, the main picture beside the name, description and details, the gallery (opens larger), and related projects.
const PD_JS = `<script>(function(){var d=document.querySelector('.zh-lb');if(!d)return;var img=d.querySelector('img'),th=[].slice.call(document.querySelectorAll('.zh-pd-th')),i=0;
function open(k){i=(k+th.length)%th.length;img.src=th[i].getAttribute('data-full');img.alt=th[i].getAttribute('data-alt')||'';if(!d.open)d.showModal()}
th.forEach(function(b,k){b.addEventListener('click',function(){open(k)})});
d.querySelector('.zh-lb-x').addEventListener('click',function(){d.close()});d.querySelector('.zh-lb-p').addEventListener('click',function(){open(i-1)});d.querySelector('.zh-lb-n').addEventListener('click',function(){open(i+1)});
d.addEventListener('click',function(e){if(e.target===d)d.close()});d.addEventListener('keydown',function(e){if(e.key==='ArrowLeft')open(i-1);if(e.key==='ArrowRight')open(i+1)});
var car=document.querySelector('.zh-pd-car');if(!car)return;var tr=car.querySelector('.zh-pd-track'),hold=false;
function step(){var a=th[0],b=th[1];return b?b.offsetLeft-a.offsetLeft:a.offsetWidth}
function more(){return tr.scrollWidth>tr.clientWidth+4}
function go(n){var max=tr.scrollWidth-tr.clientWidth,x=tr.scrollLeft+n*step();if(n>0&&tr.scrollLeft>=max-4)x=0;else if(n<0&&tr.scrollLeft<=4)x=max;tr.scrollTo({left:x,behavior:'smooth'})}
function ui(){car.classList.toggle('static',!more())}
car.querySelector('.zh-pd-gp').addEventListener('click',function(){go(-1)});car.querySelector('.zh-pd-gn').addEventListener('click',function(){go(1)});
['mouseenter','focusin','touchstart'].forEach(function(n){car.addEventListener(n,function(){hold=true},{passive:true})});['mouseleave','focusout'].forEach(function(n){car.addEventListener(n,function(){hold=false})});
car.addEventListener('touchend',function(){setTimeout(function(){hold=false},6000)},{passive:true});
addEventListener('resize',ui);ui();
if(!matchMedia('(prefers-reduced-motion: reduce)').matches)setInterval(function(){if(hold||document.hidden||!more()||d.open)return;go(1)},3500)})();</script>`;

const projectDetail = (c: Content) => {
  const p: Project = c._project, all: Project[] = c._projects ?? [], readMore = String(c.portfolio?.readMore || "Read More");
  const gallery = parseGallery(p.gallery);
  const related = [...all.filter((x) => x.id !== p.id && x.category === p.category), ...all.filter((x) => x.id !== p.id && x.category !== p.category)].slice(0, 3);
  const kw = parseFloat(p.capacity), capacity = p.capacity ? (Number.isFinite(kw) ? `${kw} KW` : p.capacity) : ""; // a number is kilowatts; older text such as "10 KW" is shown as written
  // the details, in this order; a line with no value is left out
  const row = (label: string, value: string) => (String(value ?? "").trim() ? `<div class="zh-pd-row"><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>` : "");
  const specs = row("System Type", p.system_type) + row("Category", p.category) + row("Capacity", capacity) + row("PV Details", p.pv_details) + row("PCU Details", p.pcu_details) +
    row("Completion Date", p.completion) + row("Average Annual Unit Generation", p.generation) + row("Annual Energy Bill Savings", p.savings) + row("Payback Period", p.payback);
  // the client's testimonial: a video (opens in the player of the Testimonials block, TC_JS) and/or a picture
  const tmVideo = safeUrl(p.testimonial_video), tmImage = safeUrl(p.testimonial_image);
  const testimonial = tmVideo || tmImage
    ? `<h2 class="zh-pd-h">Client Testimonial</h2><figure class="zh-pd-tm">${tmVideo
        ? `<button type="button" class="zh-pd-tmv" data-tc-video="${url(tmVideo)}" data-tc-name="${esc(p.title)}" aria-label="Play the video testimonial from ${esc(p.title)}">${tmImage ? img(tmImage, "", 960, 540) : `<video src="${url(tmVideo)}#t=0.1" muted playsinline preload="metadata" tabindex="-1" aria-hidden="true"></video>`}<span class="zh-pd-play">${PLAY_MARK}</span></button>`
        : img(tmImage, `Testimonial from ${p.title}`, 960, 640)}<figcaption>${esc(p.title)}</figcaption></figure>${tmVideo ? TC_JS : ""}`
    : "";
  // environmental benefits: numbers entered per project, shown as they are (no counting animation)
  const env = (icon: string, label: string, value: string, unit: string, w: number, h: number) =>
    parseFloat(value) > 0 ? `<div class="zh-env-i"><img src="/zk/env-${icon}.png" alt="" width="${w}" height="${h}" loading="lazy" decoding="async"><div><span>${label}</span><b>${esc(String(parseFloat(value)))}${unit}</b></div></div>` : "";
  const benefits = env("co2", "CO<sub>2</sub> Saved", p.co2, "t", 172, 115) + env("trees", "Tree Equivalence", p.trees, " Trees", 139, 120) + env("coal", "Coal Saved", p.coal, "t", 126, 104);
  return `<section class="zh zh-pd" id="project"><div class="zh-wrap">
<a class="zh-pd-back" href="/projects/">${ARROW_L}<span>Back to Projects</span></a>
<div class="zh-pd-hero">
 <figure class="zh-pd-main">${p.image ? img(p.image, p.title, 960, 640) : ""}</figure>
 <div class="zh-pd-info"><h1>${esc(p.title)}</h1><div class="zh-pd-meta">${p.location ? `<p class="zh-pc-loc">${PIN}<span>${esc(p.location)}</span></p>` : ""}${stageChip(p, "zh-pd-stage")}</div>
  ${specs ? `<dl class="zh-pd-specs">${specs}</dl>` : ""}</div>
</div>
${p.summary ? `<h2 class="zh-pd-h">About the Project</h2><div class="zh-pd-about zh-prose">${richOrText(p.summary)}</div>` : ""}
${testimonial}
${gallery.length ? `<h2 class="zh-pd-h">Project Gallery</h2>
<div class="zh-pd-car"><div class="zh-pd-track" tabindex="0" role="region" aria-label="Project gallery">${gallery.map((g, i) => `<button type="button" class="zh-pd-th" data-full="${url(g)}" data-alt="${esc(p.title)} picture ${i + 1}" aria-label="Open picture ${i + 1} of ${gallery.length}"><img src="${url(g)}" alt="" loading="lazy" decoding="async"></button>`).join("")}</div>
<button type="button" class="zh-pd-gp" aria-label="Previous pictures">${ARROW_L}</button><button type="button" class="zh-pd-gn" aria-label="Next pictures">${ARROW_R}</button></div>
<dialog class="zh-lb" aria-label="Project picture"><button type="button" class="zh-lb-x" aria-label="Close">×</button><button type="button" class="zh-lb-p" aria-label="Previous picture">${ARROW_L}</button><img alt=""><button type="button" class="zh-lb-n" aria-label="Next picture">${ARROW_R}</button></dialog>${PD_JS}` : ""}
${benefits ? `<div class="zh-env"><h2 class="zh-env-h">Environmental Benefits</h2><div class="zh-env-grid">${benefits}</div></div>` : ""}
${related.length ? `<div class="zh-pd-rh"><h2 class="zh-pd-h">Related Projects</h2><a class="zh-pd-all" href="/projects/">View All Projects${ARROW_R}</a></div>
<div class="zh-pf-grid">${related.map((x) => projectCard(x, readMore)).join("")}</div>` : ""}
</div></section>`;
};

// ---- the Solutions page: one card per system type (picture, name, Read More), and each system's own page (/services/<slug>/) ----

const systemUrl = (x: Pick<System, "slug">) => `/services/${esc(x.slug)}/`;
// Two colours in a name: every word but the last in white, the last word in the accent colour (a one-word name stays white).
const twoTone = (t: string) => {
  const w = String(t).trim().split(/\s+/);
  return w.length < 2 ? esc(t) : `${esc(w.slice(0, -1).join(" "))} <em>${esc(w[w.length - 1])}</em>`;
};
// A system card: the picture, the name (bold, two colours, centred) and a Read More button, inside an animated neon border.
// The ring is a large conic gradient that turns slowly behind the card; the card's dark body covers all but its edge (styles: .zh-sc in public/zk-home.css).
const systemCard = (x: System, readMore: string) => {
  const u = systemUrl(x), pic = x.thumb || x.image;
  return `<article class="zh-sc"><span class="zh-sc-ring" aria-hidden="true"></span><div class="zh-sc-in">` +
    `<a class="zh-sc-img" href="${u}" tabindex="-1" aria-hidden="true">${pic ? img(pic, "", 640, 400) : ""}</a>` +
    `<div class="zh-sc-b"><h3 class="zh-sc-t"><a href="${u}">${twoTone(x.title)}</a></h3>` +
    `<a class="zh-pc-btn" href="${u}" aria-label="${esc(readMore)}: ${esc(x.title)}">${esc(readMore)}${ARROW_R}</a></div></div></article>`;
};

const systems = (c: Content) => {
  const p = c.systems, list: System[] = c._systems ?? [];
  const intro = p.title || p.eyebrow || p.subtitle ? head(p.eyebrow, p.title, p.subtitle, "c zh-head--light") : "";
  return `<section class="zh zh-pf zh-sc-sec" id="our-systems"><div class="zh-wrap">${intro}
${list.length ? `<div class="zh-pf-grid">${list.map((x) => systemCard(x, String(p.readMore || "Read More"))).join("")}</div>` : `<p class="zh-pf-none">${esc(p.empty)}</p>`}
</div></section>`;
};

// A system's page: the same look as the system blocks on the Home page (label, heading, text, benefit cards, picture), with a back link,
// optional extra details, a quote button, and the other systems as cards underneath.
const systemDetail = (c: Content) => {
  const x: System = c._system, all: System[] = c._systems ?? [], p = c.systems ?? {};
  const features = parseFeatures(x.features);
  const others = all.filter((o) => o.id !== x.id).slice(0, 3);
  const media = (x.image ? img(x.image, x.title, undefined, undefined, "zh-simg") : "") +
    (x.image2 ? (x.image ? `<span class="zh-stage-rule" aria-hidden="true"></span>` : "") + img(x.image2, x.title, undefined, undefined, "zh-simg zh-simg--b") : "");
  return `<section class="zh zh-sys zh-sys--grid zh-sd" id="system"><div class="zh-wrap">
<a class="zh-pd-back" href="/services/">${ARROW_L}<span>Back to Solutions</span></a>
<div class="zh-sys-grid">
 <div class="zh-sys-txt">
  ${x.badge ? `<span class="zh-pill">${esc(x.badge)}</span>` : ""}
  <h1 class="zh-h2 zh-h2--sys">${rt(x.heading || x.title)}</h1>
  ${x.text ? `<p class="zh-lead">${rt(x.text)}</p>` : ""}
  ${features.length ? feats(features) : ""}
 </div>
 ${media ? `<div class="zh-sys-media"><div class="zh-stage">${media}</div></div>` : ""}
</div>
${x.details ? `<div class="zh-sd-more zh-prose">${richOrText(x.details)}</div>` : ""}
${p.quoteText ? `<div class="zh-sd-cta"><a class="zh-pc-btn" href="/contact/">${esc(p.quoteText)}${ARROW_R}</a></div>` : ""}
</div></section>
${others.length ? `<section class="zh zh-pf zh-sd-other"><div class="zh-wrap">
<div class="zh-pd-rh"><h2 class="zh-pd-h">Other Solutions</h2><a class="zh-pd-all" href="/services/">View All Solutions${ARROW_R}</a></div>
<div class="zh-pf-grid">${others.map((o) => systemCard(o, String(p.readMore || "Read More"))).join("")}</div>
</div></section>` : ""}`;
};

// ---- Testimonials: blue quote blocks in a looping carousel on the Home page (the latest few) and all of them on the Testimonials page ----
// A testimonial is a written quote, a video, or both. A video shows its cover (or first frame) with a play button inside the block and opens in
// a larger player. The testimonials come from the "testimonials" table (Admin > Testimonials), newest first.
const PLAY_MARK = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 5.5v13l11-6.5z"/></svg>`;
const initials = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const testimonialCard = (t: Testimonial) => {
  const video = safeUrl(t.video), poster = safeUrl(t.poster), quote = String(t.quote ?? "").trim();
  const media = video
    ? `<button type="button" class="zh-q-media" data-tc-video="${url(video)}" data-tc-name="${esc(t.name)}" aria-label="Play the video testimonial from ${esc(t.name)}">${poster ? img(poster, "", 640, 360) : `<video src="${url(video)}#t=0.1" muted playsinline preload="metadata" tabindex="-1" aria-hidden="true"></video>`}<span class="zh-q-play">${PLAY_MARK}</span></button>`
    : "";
  const long = `${t.role}${t.company}`.length > 40; // a long job title and company wrap onto more lines: the block gets a little more room on top
  return `<figure class="zh-q${video ? " zh-q--vid" : ""}${long ? " zh-q--long" : ""}" id="testimonial-${t.id}"><div class="zh-q-in">${media}${quote ? `<blockquote>${rt(quote)}</blockquote>` : ""}</div><span class="zh-q-tail" aria-hidden="true"></span>` +
    `<figcaption class="zh-q-who">${safeUrl(t.avatar) ? img(t.avatar, t.name, 150, 145) : `<div class="zh-q-init" aria-hidden="true">${esc(initials(t.name))}</div>`}` +
    `<span><b>${esc(t.name)}</b><strong>${esc(t.role)}</strong><em>${esc(t.company)}</em></span></figcaption></figure>`;
};

// The carousel slides one card at a time, by itself, and loops without a jump: when there are more testimonials than fit on screen, a second copy
// follows the cards and the position is moved back by one whole set as soon as it has scrolled into the copy. It stops while the pointer or the
// keyboard is on it, while a video is open, while it is off screen, and for visitors who prefer reduced motion (the arrows and dots still work).
const TC_JS = `<script>(function(){var d=document;
function dlg(){var x=d.getElementById('zh-tc-dlg');if(x)return x;x=d.createElement('dialog');x.id='zh-tc-dlg';x.className='zh-vlb';x.innerHTML='<button type="button" class="zh-vlb-x" aria-label="Close">&times;</button><video controls playsinline></video>';d.body.appendChild(x);var v=x.querySelector('video');x.querySelector('.zh-vlb-x').onclick=function(){x.close()};x.addEventListener('click',function(e){if(e.target===x)x.close()});x.addEventListener('close',function(){v.pause();v.removeAttribute('src');v.load()});return x}
if(!d.__zhTc){d.__zhTc=1;d.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-tc-video]');if(!b)return;var x=dlg(),v=x.querySelector('video');v.src=b.getAttribute('data-tc-video');x.setAttribute('aria-label','Video testimonial from '+(b.getAttribute('data-tc-name')||''));x.showModal();var p=v.play();if(p&&p.catch)p.catch(function(){})})}
[].forEach.call(d.querySelectorAll('.zh-tcar:not([data-ready])'),function(car){
 car.setAttribute('data-ready','1');
 var tr=car.querySelector('.zh-ttrack'),orig=[].slice.call(tr.children),n=orig.length,prev=car.querySelector('.zh-tprev'),next=car.querySelector('.zh-tnext'),dots=car.querySelector('.zh-tdots'),clones=[];
 function per(){return parseInt(getComputedStyle(tr).getPropertyValue('--per'),10)||1}
 function step(){var s=tr.children[0],cs=getComputedStyle(tr);return s.getBoundingClientRect().width+(parseFloat(cs.columnGap)||parseFloat(cs.gap)||0)}
 function loops(){return n>per()}
 function idx(){return Math.round(tr.scrollLeft/step())}
 function jump(x){tr.style.scrollSnapType='none';tr.scrollLeft=x;requestAnimationFrame(function(){tr.style.scrollSnapType=''})}
 function go(i){tr.scrollTo({left:i*step(),behavior:'smooth'})}
 function norm(){if(!loops())return;var w=n*step();if(tr.scrollLeft>=w-2)jump(tr.scrollLeft-w)}
 function mark(){var i=idx()%n;[].forEach.call(dots.children,function(b,j){b.className=j===i?'on':''})}
 function build(){clones.forEach(function(c){c.remove()});clones=[];tr.scrollLeft=0;
  if(loops())orig.forEach(function(s){var c=s.cloneNode(true);c.removeAttribute('id');c.setAttribute('aria-hidden','true');c.setAttribute('inert','');tr.appendChild(c);clones.push(c)});
  car.classList.toggle('single',!loops());dots.innerHTML='';
  if(loops())for(var i=0;i<n;i++){(function(i){var b=d.createElement('button');b.type='button';b.setAttribute('aria-label','Show testimonial '+(i+1));b.onclick=function(){norm();go(i)};dots.appendChild(b)})(i)}
  mark()}
 prev.onclick=function(){norm();if(tr.scrollLeft<2)jump(n*step());go(idx()-1)};
 next.onclick=function(){norm();go(idx()+1)};
 tr.addEventListener('scroll',function(){clearTimeout(tr._t);tr._t=setTimeout(function(){norm();mark()},90)},{passive:true});
 tr.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){next.onclick();e.preventDefault()}if(e.key==='ArrowLeft'){prev.onclick();e.preventDefault()}});
 addEventListener('resize',function(){clearTimeout(car._r);car._r=setTimeout(build,150)});build();
 var hold=false,vis=true,ms=(parseFloat(car.getAttribute('data-interval'))||5)*1000;
 if('IntersectionObserver' in window)new IntersectionObserver(function(e){vis=e[e.length-1].isIntersecting}).observe(car);
 ['mouseenter','focusin','touchstart'].forEach(function(k){car.addEventListener(k,function(){hold=true},{passive:true})});
 ['mouseleave','focusout'].forEach(function(k){car.addEventListener(k,function(){hold=false})});
 car.addEventListener('touchend',function(){setTimeout(function(){hold=false},6000)},{passive:true});
 if(car.getAttribute('data-auto')==='1'&&!matchMedia('(prefers-reduced-motion: reduce)').matches)setInterval(function(){if(!loops()||hold||!vis||d.hidden||d.querySelector('#zh-tc-dlg[open]'))return;norm();go(idx()+1)},ms);
});})();</script>`;

const testimonials = (c: Content) => {
  const t = c.testimonials, how = Math.min(12, Math.max(1, Math.round(Number(t.count)) || 6));
  const list: Testimonial[] = (c._testimonials ?? []).slice(0, how); // newest first
  if (!list.length) return "";
  const more = String(t.moreText ?? "").trim() ? `<div class="zh-tc-more"><a class="zh-btn" href="/testimonials/">${esc(t.moreText)}</a></div>` : "";
  return `<section class="zh zh-test" id="client-feedback"><div class="zh-wrap zh-test-grid">
<header class="zh-head zr zr-l zh-test-h"><h2>${rt(t.title)}</h2><p class="zh-sub">${rt(t.subtitle)}</p><span class="zh-rule"></span></header>
<div class="zh-tcol zr zr-r">
 <div class="zh-tcar" data-auto="${t.autoplay ? 1 : 0}" data-interval="${Math.max(2, Number(t.interval) || 5)}">
  <div class="zh-ttrack" tabindex="0" role="region" aria-label="Customer testimonials">${list.map(testimonialCard).join("")}</div>
  <div class="zh-tnav"><button type="button" class="zh-tprev" aria-label="Previous testimonial">${ic("chev")}</button><span class="zh-tdots"></span><button type="button" class="zh-tnext" aria-label="Next testimonial">${ic("chev")}</button></div>
 </div>${more}
</div></div></section>${TC_JS}`;
};

const testimonialsAll = (c: Content) => {
  const t = c.testimonialsAll, list: Testimonial[] = c._testimonials ?? [];
  const intro = t.title || t.eyebrow || t.subtitle ? head(t.eyebrow, t.title, t.subtitle, "c") : "";
  return `<section class="zh zh-test zh-test--all" id="all-testimonials"><div class="zh-wrap">${intro}
${list.length ? `<div class="zh-q-grid">${list.map(testimonialCard).join("")}</div>` : `<p class="zh-pf-none">${esc(t.empty)}</p>`}
</div></section>${TC_JS}`;
};

// AMC plan icons (the plan's "icon" choice in Studio): drawn as 24 x 24 line icons in a round white frame.
const PLAN_ICON_SVG: Record<string, string> = {
  Calendar: SVG('<rect x="4" y="5.5" width="16" height="14.5" rx="1.8"/><path d="M4 10h16M8 3.5v4M16 3.5v4M9 15l2.2 2.2L15.6 13"/>'),
  Clock: SVG('<circle cx="12" cy="12" r="8.2"/><path fill="currentColor" d="M12 12V3.8A8.2 8.2 0 0 1 20.2 12z"/>'),
  Gauge: SVG('<path d="M4.2 17a8.2 8.2 0 1 1 15.6 0"/><path d="M12 16.6l4-5.4"/><circle cx="12" cy="16.6" r="1.5"/><path d="M12 6.4v1.6M6.6 9l1.2 1M17.4 9l-1.2 1"/>'),
  "365 days": SVG('<rect x="4" y="5" width="16" height="15.5" rx="1.8"/><path d="M4 9.2h16M8 3v4M16 3v4"/><text x="12" y="17.6" text-anchor="middle" font-size="6.4" font-weight="700" fill="currentColor" stroke="none" font-family="Rajdhani,sans-serif">365</text>'),
};
// "Half-Yearly Plan": everything but the last word is bold, the last word light
const planName = (n: unknown) => { const w = String(n ?? "").trim().split(/\s+/); return w.length < 2 ? `<b>${esc(n)}</b>` : `<b>${esc(w.slice(0, -1).join(" "))}</b> ${esc(w[w.length - 1])}`; };

// AMC (Annual Maintenance Contract): the AMC services (picture, name, points), the subscription plans and the Enquire button. Edited in Studio (section "amc").
const amc = (c: Content) => {
  const a = c.amc;
  const services: any[] = Array.isArray(a.services) ? a.services : [], plans: any[] = Array.isArray(a.plans) ? a.plans : [];
  const enquire = String(a.btnText ?? "").trim() && safeUrl(a.btnLink) ? `<div class="zh-ams-cta zr"><a class="zh-btn" href="${url(a.btnLink)}">${esc(a.btnText)}</a></div>` : ""; // both label and link, or no button
  if (!services.length && !plans.length) return "";
  return `<section class="zh zh-amc" id="amc"><div class="zh-wrap"><div class="zh-ams">
 ${a.servicesTitle ? `<header class="zh-head zr"><h2>${rt(a.servicesTitle)}</h2></header>` : ""}
 ${services.length ? `<div class="zh-ams-grid">${services.map((f, i) => `<div class="zh-ams-col zr"><figure class="zh-ams-card">${safeUrl(f.image) ? img(f.image, f.title, 315, 206) : ""}<figcaption><h3>${rt(f.title)}</h3><span class="zh-ams-n" aria-hidden="true">${i + 1}</span></figcaption></figure>${lines(f.points).length ? `<ul class="zh-ams-list">${lines(f.points).map((t) => `<li>${rt(t)}</li>`).join("")}</ul>` : ""}</div>`).join("")}</div>` : ""}
 ${plans.length ? `<aside class="zh-ams-plans zr" aria-label="Subscription plans">${a.plansTitle ? `<h3 class="zh-ams-ph">${rt(a.plansTitle)}</h3>` : ""}<ul>${plans.map((p) => `<li><span class="zh-ams-pn">${planName(p.name)}</span><span class="zh-ams-pi" aria-hidden="true">${PLAN_ICON_SVG[p.icon] ?? PLAN_ICON_SVG.Calendar}</span></li>`).join("")}</ul></aside>` : ""}
 ${enquire}
</div></div></section>`;
};

const cta = (c: Content) => { const a = c.cta; return `<section class="zh zh-cta" id="power-your-future"><div class="zh-wrap zh-cta-grid">
<div class="zh-cta-txt">
 <h2 class="zh-h2 zr zr-l">${rt(a.title)}</h2>
 <p class="zh-sub2 zr zr-l">${rt(a.sub)}</p>
 <blockquote class="zh-quote zr zr-l">${rt(a.quote)}</blockquote>
 <svg class="zh-wave zr" viewBox="0 0 330 60" aria-hidden="true"><path d="M3 18c14-18 28-18 42 0s28 18 42 0 28-18 42 0 28 18 42 0 28-18 42 0 28 18 42 0 28-18 42 0M3 46c14-18 28-18 42 0s28 18 42 0 28-18 42 0 28 18 42 0 28-18 42 0 28 18 42 0 28-18 42 0"/></svg>
 <div class="zh-btns zr">${a.btn1Text ? `<a class="zh-btn" href="${url(a.btn1Link)}">${esc(a.btn1Text)} ${ic("arrow-r")}</a>` : ""}${a.btn2Text ? `<a class="zh-btn zh-btn--line" href="${url(a.btn2Link)}">${esc(a.btn2Text)}</a>` : ""}</div>
</div>
<figure class="zh-cta-img zr zr-r">${img(a.image, "Zakion team members giving a thumbs up beside a solar panel", 532, 1040).replace("<img ", '<img data-zh-par="-.04" ')}</figure>
</div></section>`; };

// Contact: a navy details panel (call, email, web, visit, QR and social) next to the enquiry form card, and the map on the Contact page.
// No photo. The form fields keep their names (FullName, Phone, Email, Subject, Write) because /api/contact reads them.
// Arriving with ?interest=AMC (the Enquire about AMC button) picks the matching option of "I am interested in": an exact match, else an option that contains the word.
const INTEREST_JS = `<script>(function(){var q=(new URLSearchParams(location.search).get('interest')||'').toLowerCase();if(!q)return;var r=[].slice.call(document.querySelectorAll('.zh-chips input[name=Subject]')),m=r.filter(function(i){return i.value.toLowerCase()===q})[0]||r.filter(function(i){return i.value.toLowerCase().indexOf(q)>-1})[0];if(m)m.checked=true})();</script>`;

const contact = (c: Content, o: { map?: boolean } = {}) => {
  const k = c.contact; const phones = lines(k.phones); const addr = lines(k.addresses);
  const social = [["facebook", "Facebook", "fb"], ["instagram", "Instagram", "ig"], ["linkedin", "LinkedIn", "in"], ["whatsapp", "WhatsApp", "wa"]].filter(([key]) => safeUrl(k[key]));
  const tel = (p: string) => "tel:" + p.replace(/[^+\d]/g, "");
  const web = safeUrl(k.website) || ("https://" + String(k.website).replace(/^https?:\/\//, ""));
  const item = (icon: string, label: string, body: string) => `<li class="zh-ci zr"><span class="zh-ci-ic">${ic(icon)}</span><div><small>${label}</small>${body}</div></li>`;
  const interests = lines(k.interests);
  return `<section class="zh zh-contact" id="contact"><div class="zh-ct-bg" aria-hidden="true"><i></i><i></i></div><div class="zh-wrap">
<header class="zh-ct-head">${k.eyebrow ? `<span class="zh-ct-eye zr">${esc(k.eyebrow)}</span>` : ""}<h2 class="zh-ct-h zr">${rt(k.heading)}</h2><span class="zh-amberbar zr"></span></header>
<div class="zh-ct-grid">
 <aside class="zh-ct-info zr zr-l">
  <ul class="zh-cis">
   ${phones.length ? item("phone", "Call us", phones.map((p) => `<a href="${esc(tel(p))}">${esc(p)}</a>`).join("")) : ""}
   ${k.email ? item("mail", "Email us", `<a href="mailto:${esc(k.email)}">${esc(k.email)}</a>`) : ""}
   ${k.website ? item("globe", "Website", `<a href="${esc(/^https?:/i.test(web) ? web : "https://" + web)}" rel="noopener">${esc(k.website)}</a>`) : ""}
   ${addr.length ? item("pin", "Visit us", addr.map((a) => `<span class="v">${esc(a)}</span>`).join("")) : ""}
  </ul>
  <div class="zh-ct-qr">${k.qr ? img(k.qr, "QR code to visit the Zakion Energy website", 149, 148) : ""}<div><h3>${rt(k.scanTitle)}</h3><p>${rt(k.scanText)}</p>
   <span class="zh-ct-soc">${social.map(([key, label, icon]) => `<a href="${url(k[key])}" aria-label="${label}" rel="noopener">${ic(icon)}</a>`).join("")}</span></div></div>
 </aside>
 <form class="wpcf7-form zh-form zh-ct-form zr zr-r" method="post" action="/api/contact" novalidate>
  <h3>${rt(k.scheduleTitle)}</h3><p class="zh-ct-sub">${rt(k.scheduleText)}</p>
  <div class="zh-fg"><input name="FullName" placeholder="Full name" aria-label="Full name" required autocomplete="name"><input name="Phone" type="tel" placeholder="Phone" aria-label="Phone" required autocomplete="tel"><input class="wide" name="Email" type="email" placeholder="Email" aria-label="Email" required autocomplete="email"></div>
  ${interests.length ? `<fieldset class="zh-chips"><legend>I am interested in</legend><div>${interests.map((x, i) => `<label><input type="radio" name="Subject" value="${esc(x)}"${i === 0 ? " checked" : ""}><span>${esc(x)}</span></label>`).join("")}</div></fieldset>` : ""}
  <textarea name="Write" rows="3" placeholder="Location and average monthly electricity bill (optional)" aria-label="Message"></textarea>
  <button class="zh-btn" type="submit">${esc(k.button)} ${ic("arrow-r")}</button>
  <div class="wpcf7-response-output" role="status" style="display:none"></div>
 </form>
</div>
${o.map && safeUrl(k.map) ? `<div class="zh-ct-map zr zr-z"><iframe src="${url(k.map)}" title="Zakion Energy office location" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>` : ""}
</div></section>${INTEREST_JS}`;
};

export const BUILD: Record<string, (c: Content, o?: { map?: boolean }) => string> = {
  about, vision, story, why, renewable, onGrid, hybrid, bess, solarHome, components, aesthetics, roi, process: process_, track, partners, testimonials, projects, cta, contact, portfolio, projectDetail, amc, systems, systemDetail, testimonialsAll,
};

/** The deck sections for a page, in order, with the icon sprite and the animation script. */
// Per-section settings from the admin: tighter or roomier spacing, and animation switched off.
const SPACE_CLASS: Record<string, string> = { compact: "zh--tight", roomy: "zh--roomy" };
function withSettings(html: string, st?: { spacing?: string; anim?: string }) {
  if (!st || !html.startsWith('<section class="zh ')) return html;
  const cls = SPACE_CLASS[st.spacing ?? ""];
  return html.replace('<section class="zh ', `<section${st.anim === "off" ? ' data-anim="off"' : ""} class="zh ${cls ? cls + " " : ""}`);
}

export function renderSections(keys: string[], c: Content, o: { map?: boolean } = {}) {
  const settings = c._layout?.settings ?? {};
  return SCRIPT_EARLY + SPRITE + keys.map((k) => withSettings(BUILD[k]?.(c, o) ?? "", settings[k])).join("") + SCRIPT_MAIN;
}

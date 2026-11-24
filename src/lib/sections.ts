// HTML builders for the page sections. Each one renders from the editable content in lib/content.ts (defaults + admin edits).
import { CATEGORIES, Content, ICONS, parseGallery, type Project, safeUrl, SYSTEM_NOTES } from "./content";
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
function carousels(){
 [].forEach.call(d.querySelectorAll('.zh-tcar'),function(car){
  var tr=car.querySelector('.zh-ttrack'),slides=[].slice.call(tr.children),prev=car.querySelector('.zh-tprev'),next=car.querySelector('.zh-tnext'),dots=car.querySelector('.zh-tdots');
  function per(){return innerWidth>900?2:1}
  function step(){var s=slides[0];if(!s)return 1;var cs=getComputedStyle(tr);return s.getBoundingClientRect().width+(parseFloat(cs.columnGap)||parseFloat(cs.gap)||0)}
  function pages(){return Math.max(1,slides.length-per()+1)}
  function idx(){return Math.round(tr.scrollLeft/step())}
  function go(i){tr.scrollTo({left:Math.max(0,Math.min(i,pages()-1))*step(),behavior:'smooth'})}
  function mark(){var i=idx();[].forEach.call(dots.children,function(b,j){b.className=j===i?'on':''});prev.disabled=i<=0;next.disabled=i>=pages()-1}
  function build(){dots.innerHTML='';var n=pages();car.classList.toggle('single',n<=1);for(var i=0;i<n;i++){(function(i){var b=d.createElement('button');b.type='button';b.setAttribute('aria-label','Show testimonials from '+(i+1));b.onclick=function(){go(i)};dots.appendChild(b)})(i)}mark()}
  prev.onclick=function(){go(idx()-1)};next.onclick=function(){go(idx()+1)};
  tr.addEventListener('scroll',function(){clearTimeout(tr._t);tr._t=setTimeout(mark,70)},{passive:true});
  tr.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){go(idx()+1);e.preventDefault()}if(e.key==='ArrowLeft'){go(idx()-1);e.preventDefault()}});
  addEventListener('resize',build);build();
  car.addEventListener('play',function(e){[].forEach.call(car.querySelectorAll('video'),function(v){if(v!==e.target)v.pause()})},true);
  function playing(){return [].some.call(car.querySelectorAll('video'),function(v){return !v.paused&&!v.ended})}
  var hold=false,ms=(parseFloat(car.getAttribute('data-interval'))||7)*1000;
  ['mouseenter','focusin','touchstart'].forEach(function(n){car.addEventListener(n,function(){hold=true},{passive:true})});
  ['mouseleave','focusout'].forEach(function(n){car.addEventListener(n,function(){hold=false})});
  if(car.getAttribute('data-auto')==='1'&&!matchMedia('(prefers-reduced-motion: reduce)').matches)setInterval(function(){if(hold||d.hidden||pages()<=1||playing())return;var i=idx();go(i>=pages()-1?0:i+1)},ms);
 });
}
function run(){
 carousels();
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

const testimonials = (c: Content) => {
  const t = c.testimonials;
  // a testimonial is a quote, a video, or both; the video plays in the card (the first frame shows until then: #t=0.1)
  const body = (i: any) => {
    const video = safeUrl(i.video), poster = safeUrl(i.poster), quote = String(i.quote ?? "").trim();
    return (video ? `<video class="zh-q-vid" src="${esc(video)}#t=0.1" controls playsinline preload="metadata"${poster ? ` poster="${esc(poster)}"` : ""} aria-label="Video testimonial from ${esc(i.name)}"></video>` : "") + (quote ? `<blockquote>${rt(i.quote)}</blockquote>` : "");
  };
  const card = (i: any) => `<figure class="zh-q${safeUrl(i.video) ? " zh-q--vid" : ""}"><div class="zh-q-in">${body(i)}</div><span class="zh-q-tail" aria-hidden="true"></span><figcaption class="zh-q-who">${i.avatar ? img(i.avatar, i.name, 150, 145) : ""}<span><b>${esc(i.name)}</b><strong>${esc(i.role)}</strong><em>${esc(i.company)}</em></span></figcaption></figure>`;
  return `<section class="zh zh-test" id="client-feedback"><div class="zh-wrap zh-test-grid">
<header class="zh-head zr zr-l zh-test-h"><h2>${rt(t.title)}</h2><p class="zh-sub">${rt(t.subtitle)}</p><span class="zh-rule"></span></header>
<div class="zh-tcar zr zr-r" data-auto="${t.autoplay ? 1 : 0}" data-interval="${Math.max(2, Number(t.interval) || 7)}">
 <div class="zh-ttrack" tabindex="0" role="region" aria-label="Customer testimonials">${t.items.map(card).join("")}</div>
 <div class="zh-tnav"><button type="button" class="zh-tprev" aria-label="Previous testimonial">${ic("chev")}</button><span class="zh-tdots"></span><button type="button" class="zh-tnext" aria-label="Next testimonial">${ic("chev")}</button></div>
</div></div></section>`;
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
  const box = (icon: string, label: string, value: string) => (value ? `<div class="zh-pd-box"><span class="zh-pd-ico">${icon}</span><span><b>${esc(value)}</b><i>${esc(label)}</i></span></div>` : "");
  const note = p.system_note || SYSTEM_NOTES[p.system_type] || "";
  const system = p.system_type ? `<div class="zh-pd-sys"><span class="zh-pd-ico">${SVG('<path d="m3 16 3-11h15l-3 11zM5.5 10.5h15M11.5 5l-1.5 11M16.5 5 15 16M9 20h9M13.5 16v4"/>')}</span><span><i>System Type</i><b>${esc(p.system_type)}</b>${note ? `<em>${esc(note)}</em>` : ""}</span></div>` : "";
  const kw = parseFloat(p.capacity), capacity = p.capacity ? (Number.isFinite(kw) ? `${kw} KW` : p.capacity) : ""; // a number is kilowatts; older text such as "10 KW" is shown as written
  const stats = box(SVG('<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>'), "Project Capacity", capacity) + box(PF_ICON[p.category] ?? PF_ICON.Residential, "Category", p.category);
  return `<section class="zh zh-pd" id="project"><div class="zh-wrap">
<a class="zh-pd-back" href="/projects/">${ARROW_L}<span>Back to Projects</span></a>
<div class="zh-pd-hero">
 <figure class="zh-pd-main">${p.image ? img(p.image, p.title, 960, 640) : ""}</figure>
 <div class="zh-pd-info"><h1>${esc(p.title)}</h1><div class="zh-pd-meta">${p.location ? `<p class="zh-pc-loc">${PIN}<span>${esc(p.location)}</span></p>` : ""}${stageChip(p, "zh-pd-stage")}</div>${p.summary ? `<div class="zh-pd-sum zh-prose">${richOrText(p.summary)}</div>` : ""}
  ${stats ? `<div class="zh-pd-stats">${stats}</div>` : ""}${system}</div>
</div>
${gallery.length ? `<h2 class="zh-pd-h">Project Gallery</h2>
<div class="zh-pd-car"><div class="zh-pd-track" tabindex="0" role="region" aria-label="Project gallery">${gallery.map((g, i) => `<button type="button" class="zh-pd-th" data-full="${url(g)}" data-alt="${esc(p.title)} picture ${i + 1}" aria-label="Open picture ${i + 1} of ${gallery.length}"><img src="${url(g)}" alt="" loading="lazy" decoding="async"></button>`).join("")}</div>
<button type="button" class="zh-pd-gp" aria-label="Previous pictures">${ARROW_L}</button><button type="button" class="zh-pd-gn" aria-label="Next pictures">${ARROW_R}</button></div>
<dialog class="zh-lb" aria-label="Project picture"><button type="button" class="zh-lb-x" aria-label="Close">×</button><button type="button" class="zh-lb-p" aria-label="Previous picture">${ARROW_L}</button><img alt=""><button type="button" class="zh-lb-n" aria-label="Next picture">${ARROW_R}</button></dialog>${PD_JS}` : ""}
${related.length ? `<div class="zh-pd-rh"><h2 class="zh-pd-h">Related Projects</h2><a class="zh-pd-all" href="/projects/">View All Projects${ARROW_R}</a></div>
<div class="zh-pf-grid">${related.map((x) => projectCard(x, readMore)).join("")}</div>` : ""}
</div></section>`;
};

// AMC (Annual Maintenance Contract): text, a picture, what is included, and a row of service cards. Edited in Studio (section "amc").
const amc = (c: Content) => {
  const a = c.amc;
  const included = lines(a.included);
  const feats: any[] = Array.isArray(a.features) ? a.features : [];
  const button = (text: unknown, link: unknown, cls: string) => (String(text ?? "").trim() && safeUrl(link) ? `<a class="zh-btn ${cls}" href="${url(link)}">${esc(text)}</a>` : ""); // both label and link, or no button
  const buttons = button(a.btn1Text, a.btn1Link, "") + button(a.btn2Text, a.btn2Link, "zh-btn--line");
  return `<section class="zh zh-amc" id="amc"><div class="zh-wrap">
<div class="zh-amc-top">
 <div class="zh-amc-txt">
  ${a.eyebrow ? `<span class="zh-eye zr zr-l">${rt(a.eyebrow)}</span>` : ""}
  <h2 class="zh-h2 zr zr-l">${rt(a.title)}</h2><span class="zh-rule zr zr-l"></span>
  ${a.intro ? `<p class="zh-lead zr zr-l">${rt(a.intro)}</p>` : ""}
  ${included.length ? `<ul class="zh-amc-list">${included.map((t) => `<li class="zr">${ic("check")}<span>${rt(t)}</span></li>`).join("")}</ul>` : ""}
  ${buttons ? `<div class="zh-amc-btns zr">${buttons}</div>` : ""}
 </div>
 ${safeUrl(a.image) ? `<figure class="zh-amc-img zr zr-r">${img(a.image, "Technician cleaning and checking solar panels", 800, 600)}</figure>` : ""}
</div>
${feats.length ? `<div class="zh-amc-grid">${feats.map((f) => `<article class="zh-amc-card zr"><span class="zh-amc-ic">${ic(ICONS.includes(f.icon) ? f.icon : "wrench")}</span><h3>${rt(f.title)}</h3><p>${rt(f.text)}</p></article>`).join("")}</div>` : ""}
</div></section>`;
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
</div></section>`;
};

export const BUILD: Record<string, (c: Content, o?: { map?: boolean }) => string> = {
  about, vision, story, why, renewable, onGrid, hybrid, bess, solarHome, components, aesthetics, roi, process: process_, track, partners, testimonials, projects, cta, contact, portfolio, projectDetail, amc,
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

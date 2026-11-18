// Page assembly for the redesigned pages (from "ZaKion Energy.pdf").
// Each stored page keeps its header, banner and footer. The sections between the banner and the footer come from code
// (lib/sections.ts) and read their text and images from the editable content (lib/content.ts), so they can be changed in the admin.
// If a stored page no longer has the markers this looks for (e.g. it was rewritten in the Pages editor), it is left untouched.
import { Content, HOME_KEYS, PAGE_DEFAULTS, safeUrl } from "./content";
import { esc, rt, renderSections } from "./sections";

// Which sections each page shows by default, in order (content.ts). Pages listed here are assembled from sections; the admin can
// change what each one shows and in which order (Site settings > Section order), see pageKeys().
export const PAGE_PLAN = PAGE_DEFAULTS;

/** The home page sections to draw: the admin's order, minus the ones it has hidden. */
export const homeKeys = (c: Content) => { const hide = new Set<string>(c._layout?.hidden ?? []); return (c._layout?.order ?? HOME_KEYS).filter((k: string) => !hide.has(k)); };

/** The sections to draw on a page: what the admin chose for it, else the default plan. */
export const pageKeys = (c: Content, path: string): string[] => (path === "/" ? homeKeys(c) : c._layout?.pages?.[path] ?? PAGE_PLAN[path] ?? []);

/** Element id of each section on the page (used by the admin preview to jump to it). */
export const ANCHORS: Record<string, string> = {
  hero: "", about: "about-zakion", vision: "vision-mission", story: "our-story", why: "why-choose", renewable: "why-renewable", onGrid: "on-grid", hybrid: "hybrid", bess: "bess", solarHome: "solar-home",
  components: "components", aesthetics: "solar-aesthetics", roi: "roi", process: "work-process", track: "track-record", partners: "technology-partners", testimonials: "client-feedback",
  projects: "projects-delivered", cta: "power-your-future", contact: "contact", header: "", footer: "site-footer",
};

export const HOME_HEAD =
  '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,500&display=swap">' +
  '<link rel="stylesheet" href="/zk-home.css?v=28">';

const FOOTER_MARK = "ekit-template-content-footer";
const footerStart = (body: string) => { const i = body.indexOf(FOOTER_MARK); return i < 0 ? -1 : body.lastIndexOf("<div", i); };

// ---------------------------------------------------------------- banner (home)

// tools/deck/apply.mjs once wrote a literal "$1" into the banner buttons, which swallowed their class and label
// (<a href="/services/"$1</span>). Rebuild them as designed; harmless when the markup is intact.
const HERO_BUTTONS: Record<string, string> = { "/services/": "Our Services", "/contact/": "Contact Now" };
function fixHeroButtons(html: string) {
  return html.replace(
    /<a href="(\/services\/|\/contact\/)"\$1<\/span>/g,
    (_, href: string) => `<a href="${href}" class="ekit_creative_button ekit_slide_bg ekit_slide_text_left ekit_slide_icon" id="" data-text=""><span class="ekit_creative_button_text">${HERO_BUTTONS[href]}</span>`,
  );
}

// Seamless YouTube loop. The embedded player stalls every time a 10 second clip ends and restarts, so two players take
// turns: the standby one is started just before the visible one ends and the two are cross-faded.
const YT_LOOP = `<script>(function(){var box=document.querySelector('.zh-vid[data-yt]');if(!box)return;var id=box.getAttribute('data-yt'),wrap=[].slice.call(box.querySelectorAll('.zh-vp')),P=[],cur=0,busy=false,ready=0,started=false,vis=true;
function boot(){wrap.forEach(function(w,i){P[i]=new YT.Player(w.firstChild,{videoId:id,playerVars:{autoplay:i===0?1:0,mute:1,controls:0,rel:0,playsinline:1,modestbranding:1,iv_load_policy:3,disablekb:1,fs:0,cc_load_policy:0,origin:location.origin},events:{onReady:function(e){e.target.mute();if(i===0)e.target.playVideo();ready++},onStateChange:function(e){if(i===0&&e.data===1&&!started){started=true;wrap[0].classList.add('show')}}}})});setInterval(tick,80);if('IntersectionObserver' in window)new IntersectionObserver(function(es){vis=es[0].isIntersecting;P.forEach(function(p,i){try{if(vis){if(i===cur)p.playVideo()}else p.pauseVideo()}catch(e){}})}).observe(box)}
function tick(){if(ready<2||busy||!vis)return;var p=P[cur],q=P[1-cur];if(!p.getDuration)return;var dur=p.getDuration(),t=p.getCurrentTime();if(!dur||p.getPlayerState()!==1||dur-t>1.4)return;busy=true;q.seekTo(0,true);q.playVideo();var n=0,w=setInterval(function(){var qt=q.getCurrentTime();n++;if((qt>.15&&qt<2&&q.getPlayerState()===1)||n>60){clearInterval(w);wrap[1-cur].classList.add('show');wrap[cur].classList.remove('show');setTimeout(function(){p.pauseVideo();p.seekTo(0,true);cur=1-cur;busy=false},900)}},30)}
if(window.YT&&YT.Player)boot();else{var prev=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=function(){prev&&prev();boot()};var s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';document.head.appendChild(s)}})();</script>`;

function videoMarkup(h: Content["hero"]) {
  const mp4 = safeUrl(h.videoUrl);
  if (mp4) return `<div class="elementor-background-video-container zh-vid"><video class="zh-vv" src="${esc(mp4)}" autoplay muted loop playsinline preload="auto" aria-hidden="true"></video></div><script>(function(){var v=document.querySelector('.zh-vv');if(v&&'IntersectionObserver' in window)new IntersectionObserver(function(e){if(e[0].isIntersecting)v.play().catch(function(){});else v.pause()}).observe(v)})();</script>`;
  const id = /(?:v=|youtu\.be\/|embed\/)([\w-]{11})/.exec(String(h.youtube))?.[1];
  if (!id) return "";
  return `<div class="elementor-background-video-container zh-vid" data-yt="${id}" style="background-image:url(https://i.ytimg.com/vi/${id}/maxresdefault.jpg)"><div class="zh-vp"><div></div></div><div class="zh-vp"><div></div></div>${YT_LOOP}</div>`;
}

// Banner images. One image is a still banner. Two to four make a slider: cross-fading images with arrows, dots, a pause button, swipe on touch
// screens and an automatic change every few seconds (it stops while the banner is off screen, when the pointer is on the controls and
// for visitors who prefer reduced motion). The images fill the banner like the video does (object-fit: cover). Styles: public/zk-home.css (.zh-hs*, .zh-hc*).
const ARROW = (d: string) => `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SLIDER_JS = (sec: number) => `<script>(function(){function init(){var root=document.querySelector('.zh-hs-wrap'),bar=document.querySelector('.zh-hc');if(!root||!bar)return;
var slides=[].slice.call(root.querySelectorAll('.zh-hs')),dots=[].slice.call(bar.querySelectorAll('.zh-hc-dot')),n=slides.length,i=0,t=0,paused=false,over=false,vis=true,ms=${sec * 1000},pb=bar.querySelector('.zh-hc-pause'),still=matchMedia('(prefers-reduced-motion: reduce)').matches;
function show(k){i=(k+n)%n;slides.forEach(function(s,j){s.classList.toggle('on',j===i);s.setAttribute('aria-hidden',j===i?'false':'true')});dots.forEach(function(d,j){d.classList.toggle('on',j===i);if(j===i)d.setAttribute('aria-current','true');else d.removeAttribute('aria-current')})}
function run(){clearTimeout(t);if(still||paused||over||!vis||document.hidden)return;t=setTimeout(function(){show(i+1);run()},ms)}
function go(k){show(k);run()}
bar.querySelector('.zh-hc-prev').addEventListener('click',function(){go(i-1)});
bar.querySelector('.zh-hc-next').addEventListener('click',function(){go(i+1)});
dots.forEach(function(d,j){d.addEventListener('click',function(){go(j)})});
pb.addEventListener('click',function(){paused=!paused;bar.classList.toggle('is-paused',paused);pb.setAttribute('aria-label',paused?'Play slideshow':'Pause slideshow');run()});
bar.addEventListener('mouseenter',function(){over=true;run()});bar.addEventListener('mouseleave',function(){over=false;run()});
bar.addEventListener('focusin',function(){over=true;run()});bar.addEventListener('focusout',function(){over=false;run()});
var hero=bar.parentNode,x0=null;hero.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});
hero.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>50)go(i+(dx<0?1:-1))},{passive:true});
document.addEventListener('visibilitychange',run);
if('IntersectionObserver' in window)new IntersectionObserver(function(e){vis=e[0].isIntersecting;run()}).observe(hero);
if(still)pb.hidden=true;bar.classList.add('ready');run()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init()})();</script>`;

/** The banner images from the admin (at most 4, blank ones skipped). */
const bannerImages = (h: Content["hero"]): { src: string; alt: string }[] =>
  (Array.isArray(h.images) ? h.images : []).map((it: any) => ({ src: safeUrl(it?.image), alt: String(it?.alt ?? "").trim() })).filter((p: { src: string }) => p.src).slice(0, 4);

function imagesMarkup(h: Content["hero"]) {
  const pics = bannerImages(h);
  if (!pics.length) return null;
  const n = pics.length;
  const layer = `<div class="elementor-background-video-container zh-vid zh-hs-wrap" data-n="${n}"${n > 1 ? ' role="group" aria-roledescription="carousel" aria-label="Banner images"' : ""}>` +
    pics.map((p, i) => `<div class="zh-hs${i === 0 ? " on" : ""}"${n > 1 ? ` role="group" aria-roledescription="slide" aria-label="${i + 1} of ${n}"${i ? ' aria-hidden="true"' : ""}` : ""}>` +
      `<img src="${esc(p.src)}" alt="${esc(p.alt)}" decoding="async"${i === 0 ? ' fetchpriority="high"' : ' loading="lazy"'}></div>`).join("") + `</div>`;
  if (n < 2) return { layer, controls: "" };
  const sec = Math.min(20, Math.max(3, Number(h.slideSeconds) || 6));
  const controls = `<div class="zh-hc" role="group" aria-label="Banner slide controls">` +
    `<button type="button" class="zh-hc-btn zh-hc-prev" aria-label="Previous slide">${ARROW("M14.5 5.5 8 12l6.5 6.5")}</button>` +
    `<span class="zh-hc-dots">${pics.map((_, i) => `<button type="button" class="zh-hc-dot${i === 0 ? " on" : ""}" aria-label="Show slide ${i + 1}"${i === 0 ? ' aria-current="true"' : ""}></button>`).join("")}</span>` +
    `<button type="button" class="zh-hc-btn zh-hc-next" aria-label="Next slide">${ARROW("M9.5 5.5 16 12l-6.5 6.5")}</button>` +
    `<button type="button" class="zh-hc-btn zh-hc-pause" aria-label="Pause slideshow"><svg class="i-pause" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M8 5v14M16 5v14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg><svg class="i-play" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg></button>` +
    `</div>${SLIDER_JS(sec)}`;
  return { layer, controls };
}

// Sunlight over the banner video: a glowing sun just off the top-right corner, two slowly turning sets of rays, a light shaft
// that sweeps across, lens-flare discs and drifting dust motes. Pure CSS (rules at the end of public/zk-home.css), no extra requests.
const MOTES = [[8, 12, 9], [17, 40, 13], [26, 22, 8], [34, 64, 11], [43, 8, 14], [52, 50, 10], [61, 30, 12], [69, 72, 9], [77, 18, 13], [84, 56, 8], [91, 36, 11], [96, 80, 10]]
  .map(([x, d, t], i) => `<i style="--x:${x}%;--d:-${d / 4}s;--t:${t}s;--s:${(i % 3) + 2}px"></i>`).join("");
const SUN = `<div class="zk-sun" aria-hidden="true"><span class="zk-sun-halo"></span><span class="zk-sun-rays"></span><span class="zk-sun-rays zk-sun-rays--b"></span><span class="zk-sun-core"></span><span class="zk-sun-beam"></span><span class="zk-flare zk-flare--1"></span><span class="zk-flare zk-flare--2"></span><span class="zk-flare zk-flare--3"></span><span class="zk-motes">${MOTES}</span></div>`;

function patchHero(prefix: string, h: Content["hero"]) {
  const at = prefix.indexOf("elementor-element-7eb3ae6");
  if (at < 0) return prefix;
  let pre = prefix.slice(0, at), hero = prefix.slice(at);
  hero = hero.replace(/(<h3 class="elementor-heading-title elementor-size-default">)[^<]*(<\/h3>)/, (_, a, b) => a + esc(h.eyebrow) + b);
  hero = hero.replace(/(<h1 class="elementor-heading-title elementor-size-default">)[\s\S]*?(<\/h1>)/, (_, a, b) => a + rt(h.title, "span") + b);
  hero = hero.replace(/(elementor-widget-text-editor[\s\S]*?<p>)[\s\S]*?(<\/p>)/, (_, a, b) => a + esc(h.subtitle) + b);
  const button = (id: string, text: string, link: string) => {
    const i = hero.indexOf("elementor-element-" + id);
    if (i < 0) return;
    hero = hero.slice(0, i) + hero.slice(i).replace(/(<a href=")[^"]*(" class="ekit_creative_button[^>]*>\s*<span class="ekit_creative_button_text">)[^<]*(<\/span>)/, (_, a, b, d) => a + esc(safeUrl(link) || "#") + b + esc(text) + d);
  };
  button("75368f4", h.btn1Text, h.btn1Link);
  button("7c1ec2c", h.btn2Text, h.btn2Link);
  // take the video away from Elementor's own player (the key is renamed so it is ignored) and use ours
  hero = hero.replace("&quot;background_video_link&quot;", "&quot;zh_video_link&quot;");
  // the banner's picture: the admin's images (one still image, or a slider) when there are any, otherwise the video
  const pics = imagesMarkup(h);
  hero = hero.replace(/<div class="elementor-background-video-container">\s*<div class="elementor-background-video-embed" role="presentation"><\/div>\s*<\/div>/, () => (pics ? pics.layer : videoMarkup(h)));
  hero = hero.replace('<div class="e-con-inner">', () => SUN + (pics ? pics.controls : "") + '<div class="e-con-inner">'); // sunlight sits between the picture and the text, the slider controls above the text
  return pre + hero;
}

// ---------------------------------------------------------------- page assembly

const BANNER_NEXT = /<div class="elementor-element elementor-element-f176d98[ "]/;

function applyHome(body: string, c: Content): string {
  const m = BANNER_NEXT.exec(body);
  const footer = footerStart(body);
  if (!m || footer < 0) return body;
  const start = m.index;
  if (footer < start) return body;
  // the main content ends at the first </div> that has no opening <div> inside the slice (it closes the page wrapper)
  const seg = body.slice(start, footer);
  const re = /<(\/?)div\b/g;
  let depth = 0, end = -1, t: RegExpExecArray | null;
  while ((t = re.exec(seg))) { if (t[1]) { if (--depth < 0) { end = t.index; break; } } else depth++; }
  if (end < 0) return body;
  return patchHero(fixHeroButtons(body.slice(0, start)), c.hero) + renderSections(homeKeys(c), c) + body.slice(start + end);
}

/** Inner pages: keep the first block of the Elementor page (the title banner), replace the rest. */
function applyInner(body: string, keys: string[], c: Content, map: boolean): string {
  const a = body.indexOf('data-elementor-type="wp-page"');
  if (a < 0) return body;
  const wrapper = body.lastIndexOf("<div", a);
  const re = /<(\/?)div\b[^>]*>/g;
  re.lastIndex = wrapper;
  let depth = 0, bannerEnd = -1, wrapEnd = -1, m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    if (m[1]) {
      depth--;
      if (depth === 1 && bannerEnd < 0) bannerEnd = m.index + m[0].length; // end of the first child = the banner
      if (depth === 0) { wrapEnd = m.index; break; }
    } else depth++;
  }
  if (bannerEnd < 0 || wrapEnd < 0 || wrapEnd < bannerEnd) return body;
  return body.slice(0, bannerEnd) + renderSections(keys, c, { map }) + body.slice(wrapEnd);
}

export function applyPage(path: string, body: string, c: Content): string {
  if (!PAGE_PLAN[path]) return body;
  const keys = pageKeys(c, path);
  if (path === "/") return applyHome(body, c);
  if (path === "/blog/") { const f = footerStart(body); return f < 0 ? body : body.slice(0, f) + renderSections(keys, c) + body.slice(f); }
  return applyInner(body, keys, c, path === "/contact/");
}

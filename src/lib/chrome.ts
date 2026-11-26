// Parts that appear on every public page: the heading font, the scroll-motion switch, the "back to top" button and the Solar Calculator tab.

// Rajdhani is the logo's font; headings and the menu use it everywhere (rules in public/zk-wide.css).
export const FONT_HEAD = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&display=swap">';

// Turns on the scroll animations (public/zk-motion.css hides sections, the footer and images until MOTION_JS below reveals them).
// Runs in <head> so nothing flashes. If MOTION_JS has not started after 5 seconds the switch is removed and everything shows.
export const MOTION_EARLY =
  `<script>(function(){var d=document.documentElement;if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.classList.add('zk-m');setTimeout(function(){window.__zkm||d.classList.remove('zk-m')},5000)})()</script>`;

// Reveals what zk-motion.css hides, as it scrolls into view: sections, the footer and blog cards fade up once (the "lazy load" effect),
// and images sharpen in when they have actually loaded. Inline and placed right after the page content, so it starts before the
// theme's heavy scripts do. Without JS, with reduced motion, or if this never runs, html.zk-m is absent/removed and all is visible.
export const MOTION_JS =
  `<script>(function(){window.__zkm=1;var d=document;if(!d.documentElement.classList.contains('zk-m'))return;` +
  `var t=[].slice.call(d.querySelectorAll('section.zh,.zf,.page-header-box,.blog-item'));` +
  `t.forEach(function(el){if(!el.classList.contains('blog-item'))return;var c=el.parentElement,r=c&&c.parentElement;el.style.setProperty('--n',r?[].indexOf.call(r.children,c)%3:0)});` +
  `var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;e.target.classList.add('zs-in');io.unobserve(e.target)})},{rootMargin:'0px 0px -8% 0px',threshold:0});` +
  `t.forEach(function(el){io.observe(el)});` +
  `[].forEach.call(d.querySelectorAll('.zh img,.zf img,.blog-item img,.post-featured-image img'),function(i){function s(){i.classList.add('is-loaded')}if(i.complete&&i.naturalWidth){s();return}i.addEventListener('load',s,{once:true});i.addEventListener('error',s,{once:true})});` +
  // endless animations only run for blocks that are on (or about to be on) screen; the rest are paused
  `var vis=new IntersectionObserver(function(es){es.forEach(function(e){e.target.classList.toggle('zv-off',!e.isIntersecting)})},{rootMargin:'160px 0px'});` +
  `[].forEach.call(d.querySelectorAll('section.zh,.zf'),function(el){vis.observe(el)})})();</script>`;

// Moving light over images. One fixed overlay is laid over whichever image the mouse enters (same box, same rounded corners or
// clip shape): a bright band sweeps across it once and a soft spotlight follows the pointer. The overlay tracks the image every
// frame, so it also works on floating or scrolling images. Mouse only; skipped on touch screens and with reduced motion.
export const LIGHT_JS =
  `<script>(function(){if(!matchMedia('(hover:hover) and (pointer:fine)').matches||matchMedia('(prefers-reduced-motion: reduce)').matches)return;` +
  `var d=document,L=d.createElement('div'),cur=null,mx=0,my=0,run=0;L.className='zk-light';L.setAttribute('aria-hidden','true');L.innerHTML='<i class="zk-light-spot"></i><i class="zk-light-sweep"></i>';d.body.appendChild(L);` +
  `var OK='.zh img,.blog-item img,.post-featured-image img,.elementor-widget-image img,.zf-logo img',NO='.zh-vm-bg img,.zh-roi-hero img,.zh-track-bg,.zh-city img,.zh-home-photo img';` +
  `function stop(){cur=null;L.classList.remove('on','sweep');cancelAnimationFrame(run)}` +
  `function frame(){if(!cur||!cur.isConnected||!cur.matches(':hover')){stop();return}var r=cur.getBoundingClientRect(),s=L.style,c=getComputedStyle(cur);` +
  `s.left=r.left+'px';s.top=r.top+'px';s.width=r.width+'px';s.height=r.height+'px';s.borderRadius=c.borderRadius;s.clipPath=c.clipPath!=='none'?c.clipPath:'';` +
  `s.setProperty('--x',(mx-r.left)+'px');s.setProperty('--y',(my-r.top)+'px');run=requestAnimationFrame(frame)}` +
  `d.addEventListener('pointermove',function(e){mx=e.clientX;my=e.clientY},{passive:true});` +
  `d.addEventListener('pointerover',function(e){var t=e.target;if(!t||t.tagName!=='IMG'||t===cur||!t.matches(OK)||t.matches(NO))return;var r=t.getBoundingClientRect();if(r.width<48||r.height<32)return;` +
  `cur=t;mx=e.clientX;my=e.clientY;L.classList.remove('sweep');void L.offsetWidth;L.classList.add('on','sweep');cancelAnimationFrame(run);frame()});` +
  `d.addEventListener('pointerout',function(e){if(e.target===cur)stop()})})();</script>`;

// Shows on the right once the page is scrolled down. A sun-yellow button: the ring fills with scroll progress, the arrow
// bobs, and on hover sun rays spin up around it, the arrow flies up and a "Back to top" tip slides in.
const ARROW = `<svg class="zk-top-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19.5V5.5M5.5 11.500 12 5l6.500 6.500"/></svg>`;
export const BACK_TO_TOP =
  `<button type="button" class="zk-top" aria-label="Back to top" tabindex="-1">` +
  `<span class="zk-top-rays" aria-hidden="true"></span>` +
  `<svg class="zk-top-ring" viewBox="0 0 64 64" aria-hidden="true"><circle class="bg" cx="32" cy="32" r="29"/><circle class="pg" cx="32" cy="32" r="29" pathLength="100"/></svg>` +
  `<span class="zk-top-core" aria-hidden="true">${ARROW}${ARROW}</span>` +
  `<span class="zk-top-tip" aria-hidden="true">Back to top</span></button>` +
  `<script>(function(){var b=document.querySelector('.zk-top');if(!b)return;var pg=b.querySelector('.pg'),busy=false,h=0,last=-1,on=false;` +
  `function size(){h=document.documentElement.scrollHeight-innerHeight}` +
  `function upd(){busy=false;var y=scrollY,v=y>420,o=Math.round((100-(h>0?Math.min(100,y/h*100):0))*2)/2;if(v!==on){on=v;b.classList.toggle('show',v);b.tabIndex=v?0:-1}if(o!==last){last=o;pg.style.strokeDashoffset=o}}` +
  `addEventListener('scroll',function(){if(!busy){busy=true;requestAnimationFrame(upd)}},{passive:true});` +
  `if('ResizeObserver' in window)new ResizeObserver(function(){size();upd()}).observe(document.body);addEventListener('resize',function(){size();upd()});size();upd();` +
  `b.addEventListener('click',function(){scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})})})();</script>`;

// A tab on the left edge that opens the Solar Calculator: just the icon until the mouse (or keyboard focus) reaches it, then the label slides out.
// Styles: .zk-calc in public/zk-wide.css. Switched on or off in Site settings > Layout; not shown on the calculator page itself.
export const CALC_FLOAT =
  `<a class="zk-calc" href="/solar-calculator/" aria-label="Solar Calculator">` +
  `<span class="zk-calc-ico" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 18h.01M12 18h.01M16 18h.01"/></svg></span>` +
  `<span class="zk-calc-txt" aria-hidden="true">Solar Calculator</span></a>`;

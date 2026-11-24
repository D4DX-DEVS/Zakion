// The AMC block's built-in animation: a cleaning bar sweeps across a row of dusty solar panels, leaves them clean and shining, then the dust
// slowly comes back and it starts again. It is one inline SVG (no file to load); a video added in Studio replaces it. One cycle lasts CYCLE
// seconds and every moving part uses the same timeline (SMIL), so they stay in step. Styles for the droplets, sparkles and clouds: ".zh-amc-art" in
// public/zk-home.css. The page script (SCRIPT in sections.ts) freezes it on a clean frame for visitors who prefer reduced motion.
const CYCLE = 9;
export const AMC_ART_FREEZE = 7; // a second inside the cycle where the panels are clean and sparkling

// the panels: 3 across, 2 down, drawn flat and then tilted together with the roof
const PW = 210, PH = 122, GAP = 12, X0 = 73, Y0 = 316;
const panels = [0, 1].flatMap((r) => [0, 1, 2].map((c) => ({ x: X0 + c * (PW + GAP), y: Y0 + r * (PH + GAP) })));
const R = (n: number) => Math.round(n * 10) / 10;

const panel = (p: { x: number; y: number }) =>
  `<rect x="${p.x + 5}" y="${p.y + 6}" width="${PW}" height="${PH}" rx="3" fill="#000" opacity=".2"/>` +
  `<rect x="${p.x}" y="${p.y}" width="${PW}" height="${PH}" rx="3" fill="url(#amcaPanel)" stroke="#d5dde9" stroke-width="3"/>` +
  `<rect x="${p.x}" y="${p.y}" width="${PW}" height="${PH}" rx="3" fill="url(#amcaCells)"/>` +
  `<rect x="${p.x}" y="${p.y}" width="${PW}" height="${PH}" rx="3" fill="url(#amcaGloss)"/>`;

const clip = panels.map((p) => `<rect x="${p.x}" y="${p.y}" width="${PW}" height="${PH}"/>`).join("");

// sparkles on the clean panels (positions are inside the tilted group)
const stars = [[130, 352, 0], [318, 372, 0.5], [540, 340, 0.9], [210, 480, 0.3], [430, 492, 0.7], [640, 468, 1.1], [352, 440, 1.4]]
  .map(([x, y, d]) => `<g transform="translate(${x} ${y})"><path class="sp" style="animation-delay:${d}s" d="M0-12 3-3 12 0 3 3 0 12-3 3-12 0-3-3Z" fill="#fff"/></g>`).join("");

// water drops falling off the cleaning bar
const drops = [330, 372, 414, 456, 498, 540].map((y, i) => `<circle class="dp" style="animation-delay:-${R(i * 0.19)}s" cx="${i % 2 ? 22 : 8}" cy="${y}" r="3.2"/>`).join("");

// a keyed animation: the same cycle and the same key times drive every part
const anim = (attr: string, values: string, keyTimes: string, extra = "") =>
  `<animate attributeName="${attr}" values="${values}" keyTimes="${keyTimes}" dur="${CYCLE}s" repeatCount="indefinite"${extra}/>`;

export const AMC_ART = `<svg class="zh-amc-art" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Animation: a cleaning bar sweeps dust off a row of solar panels and leaves them clean and shining" preserveAspectRatio="xMidYMid slice">
<defs>
 <linearGradient id="amcaSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7ab8f5"/><stop offset=".55" stop-color="#cfe7ff"/><stop offset="1" stop-color="#fff1d2"/></linearGradient>
 <radialGradient id="amcaSun"><stop offset="0" stop-color="#fff2b8" stop-opacity=".95"/><stop offset=".35" stop-color="#ffd36a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd36a" stop-opacity="0"/></radialGradient>
 <linearGradient id="amcaPanel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a63c9"/><stop offset=".55" stop-color="#143f8d"/><stop offset="1" stop-color="#0a2a66"/></linearGradient>
 <pattern id="amcaCells" width="35" height="30.5" patternUnits="userSpaceOnUse"><path d="M0 0H35M0 0V30.5" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width=".9"/></pattern>
 <linearGradient id="amcaGloss" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
 <pattern id="amcaTile" width="52" height="24" patternUnits="userSpaceOnUse"><rect width="52" height="24" fill="#bf6c3f"/><path d="M0 12H52M26 0V12M0 12V24M52 12V24" fill="none" stroke="#8a4424" stroke-opacity=".5" stroke-width="1.4"/><path d="M0 .7H52" stroke="#eba878" stroke-opacity=".55"/></pattern>
 <linearGradient id="amcaFoam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".85"/></linearGradient>
 <linearGradient id="amcaBar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffd36a"/><stop offset="1" stop-color="#e28f00"/></linearGradient>
 <linearGradient id="amcaGlare" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
 <filter id="amcaDust" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency=".035 .09" numOctaves="3" seed="4" result="n"/>
  <feColorMatrix in="n" type="matrix" values="0 0 0 0 .52  0 0 0 0 .4  0 0 0 0 .24  0 0 0 2.4 -.72" result="a"/>
  <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="1" seed="9" result="m"/>
  <feColorMatrix in="m" type="matrix" values="0 0 0 0 .38  0 0 0 0 .3  0 0 0 0 .18  0 0 0 3 -1.45" result="b"/>
  <feMerge><feMergeNode in="a"/><feMergeNode in="b"/></feMerge>
 </filter>
 <clipPath id="amcaPanels">${clip}</clipPath>
 <mask id="amcaWipe" maskUnits="userSpaceOnUse" x="0" y="0" width="800" height="720">
  <rect width="800" height="720" fill="#fff"/>
  <rect y="0" width="60" height="720" fill="#000">${anim("width", "60;740;740;740", "0;.52;.86;1")}${anim("opacity", "1;1;1;0", "0;.52;.86;1")}</rect>
 </mask>
</defs>
<rect width="800" height="600" fill="url(#amcaSky)"/>
<circle cx="650" cy="96" r="150" fill="url(#amcaSun)"><animate attributeName="r" values="140;160;140" dur="6s" repeatCount="indefinite"/></circle>
<circle cx="650" cy="96" r="34" fill="#fff6cf"/>
<g fill="#fff" opacity=".85"><g><ellipse cx="170" cy="92" rx="70" ry="17"/><ellipse cx="215" cy="80" rx="46" ry="16"/><ellipse cx="130" cy="82" rx="34" ry="12"/><animateTransform attributeName="transform" type="translate" values="0 0;46 0;0 0" dur="26s" repeatCount="indefinite"/></g>
 <g><ellipse cx="470" cy="150" rx="58" ry="13"/><ellipse cx="505" cy="140" rx="34" ry="12"/><animateTransform attributeName="transform" type="translate" values="0 0;-40 0;0 0" dur="22s" repeatCount="indefinite"/></g></g>
<g transform="skewY(-7.5)">
 <rect x="-20" y="296" width="840" height="460" fill="url(#amcaTile)"/>
 <rect x="-20" y="296" width="840" height="12" fill="#7a3a1d"/>
 ${panels.map(panel).join("")}
 <g clip-path="url(#amcaPanels)">
  <g mask="url(#amcaWipe)"><rect x="0" y="290" width="800" height="330" fill="#b79f72" opacity=".3"/><rect x="0" y="290" width="800" height="330" filter="url(#amcaDust)"/></g>
  <rect y="290" width="110" height="330" fill="url(#amcaGlare)" opacity="0"><animate attributeName="x" values="-120;-120;800;800" keyTimes="0;.53;.74;1" dur="${CYCLE}s" repeatCount="indefinite"/>${anim("opacity", "0;0;1;1;0;0", "0;.53;.54;.73;.74;1")}</rect>
  <g opacity="0">${stars}${anim("opacity", "0;0;1;1;0;0", "0;.56;.62;.84;.9;1")}</g>
 </g>
 <g opacity="0">
  <animateTransform attributeName="transform" type="translate" values="60 0;740 0;740 0;740 0" keyTimes="0;.52;.99;1" dur="${CYCLE}s" repeatCount="indefinite"/>${anim("opacity", "0;1;1;0;0", "0;.03;.52;.58;1")}
  <rect x="-52" y="300" width="52" height="276" fill="url(#amcaFoam)"/>
  <rect x="-3" y="296" width="17" height="292" rx="8" fill="url(#amcaBar)" stroke="#fff" stroke-opacity=".8" stroke-width="1.5"/>
  <rect x="-1" y="312" width="5" height="260" rx="2.5" fill="#fff" opacity=".45"/>
  <circle cx="5.5" cy="296" r="11" fill="#0d3d7b" stroke="#fff" stroke-width="2.5"/><circle cx="5.5" cy="588" r="11" fill="#0d3d7b" stroke="#fff" stroke-width="2.5"/>
  ${drops}
 </g>
</g>
<g transform="translate(26 24)">
 <rect width="236" height="70" rx="18" fill="#071a3d" opacity=".82"/>
 <text x="18" y="26" fill="#cfe2ff" font-family="Rajdhani,Rubik,sans-serif" font-size="14" font-weight="600" letter-spacing="1.6">PANEL OUTPUT</text>
 <rect x="18" y="40" width="150" height="10" rx="5" fill="#fff" opacity=".18"/>
 <rect x="18" y="40" width="123" height="10" rx="5" fill="#ffc83d">${anim("width", "123;150;150;123", "0;.52;.86;1")}</rect>
 <text x="182" y="52" fill="#ffc83d" font-family="Rajdhani,Rubik,sans-serif" font-size="25" font-weight="700">82%${anim("opacity", "1;1;0;0;1;1", "0;.48;.52;.88;.92;1")}</text>
 <text x="182" y="52" fill="#fff" font-family="Rajdhani,Rubik,sans-serif" font-size="25" font-weight="700" opacity="0">100%${anim("opacity", "0;0;1;1;0;0", "0;.48;.52;.88;.92;1")}</text>
</g>
</svg>`;

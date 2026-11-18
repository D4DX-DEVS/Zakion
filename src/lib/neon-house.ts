// The animated neon house shown in the Solar Home block (when no picture is chosen in Studio).
//
// It is drawn as an isometric SVG: every corner below is a point in 3D (x to the right, y toward the viewer, z up) that P() projects to the
// screen, so walls, roofs, windows and solar panels all stay on their planes. No colours are set here: every shape has a class and the
// colours and animations are in public/zk-home.css (".nh-*"), which is also what lets the site theme recolour it. The shapes are drawn back
// to front (painter's order), so a nearer wall simply paints over what is behind it.
//
// Animation hooks: .nh-neon (the glowing outline tubes: flicker like a neon sign), .nh-win (window lights: switch on and off, each on its
// own timing), .nh-pv (solar panels: slow shimmer), .nh-rip (rings that spread out of the ground), .nh-floor (breathing floor glow).

type V = [number, number, number];

const K = 34, C = 0.866 * K, S = 0.5 * K, OX = 350, OY = 290; // size of one unit on screen, and where the origin sits
const P = ([x, y, z]: V) => `${(OX + (x - y) * C).toFixed(1)},${(OY + (x + y) * S - z * K).toFixed(1)}`;
const pts = (v: V[]) => v.map(P).join(" ");
const poly = (cls: string, v: V[], at = "") => `<polygon class="${cls}"${at} points="${pts(v)}"/>`;
const tube = (v: V[]) => `<polyline class="nh-tube" points="${pts(v)}"/>`;

// a rectangle on the wall x = c (spanning y and z) or y = c (spanning x and z)
const qx = (x: number, y0: number, y1: number, z0: number, z1: number): V[] => [[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]];
const qy = (y: number, x0: number, x1: number, z0: number, z1: number): V[] => [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]];

// a window: a dark pane that always shows, and the warm light on top of it that blinks (t = seconds per cycle, d = start offset)
const win = (quad: V[], mullion: V[], t: number, d: number) =>
  poly("nh-pane", quad) + `<g class="nh-win" style="--t:${t}s;--d:${d}s">${poly("nh-glass", quad)}<polyline class="nh-mul" points="${pts(mullion)}"/></g>`;

// solar panels laid out on a sloping roof plane: pos(u, v) is a point on the plane, u along the roof, v up the slope (both 0 to 1)
function panels(pos: (u: number, v: number) => V, cols: number, rows: number, u0: number, u1: number, v0: number, v1: number) {
  let out = "";
  const gu = 0.018, gv = 0.045; // gaps between panels
  const du = (u1 - u0) / cols, dv = (v1 - v0) / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const a = u0 + c * du + gu, b = u0 + (c + 1) * du - gu, e = v0 + r * dv + gv, f = v0 + (r + 1) * dv - gv;
      const n = r * cols + c;
      out += poly("nh-pv", [pos(a, e), pos(b, e), pos(b, f), pos(a, f)], ` style="--d:${((n * 0.83) % 4.6).toFixed(2)}s"`);
      const m = [pos((a + b) / 2, e), pos((a + b) / 2, f), pos(a, (e + f) / 2), pos(b, (e + f) / 2)].map(P); // a cross: the cell lines of the panel
      out += `<path class="nh-cell" d="M${m[0]}L${m[1]}M${m[2]}L${m[3]}"/>`;
    }
  }
  return out;
}

// ground: a platform with rings. The centre of the footprint is (3, 3.5, 0); a circle of radius r units is an ellipse of rx = 1.2247 r K, ry = 0.7071 r K
const [CX, CY] = P([3, 3.5, 0]).split(",").map(Number);
const ring = (cls: string, r: number, at = "") => `<ellipse class="${cls}"${at} cx="${CX}" cy="${CY}" rx="${(1.2247 * r * K).toFixed(1)}" ry="${(0.7071 * r * K).toFixed(1)}"/>`;

const ground =
  ring("nh-floor", 6.4) + ring("nh-slab", 5.3) +
  `<g filter="url(#nhGlow)">${ring("nh-ring", 5.3)}${ring("nh-ring nh-ring--2", 4.4)}</g>` +
  ring("nh-rip", 5.3, ' style="--d:0s"') + ring("nh-rip", 5.3, ' style="--d:-1.8s"') + ring("nh-rip", 5.3, ' style="--d:-3.6s"');

// ---- main house: two storeys, ridge along x (the roof slope that faces the viewer carries the panels)
const A_ROOF = (u: number, v: number): V => [u * 6, 4 - 2 * v, 4 + 1.6 * v];
const houseA =
  poly("nh-roofb", [[0, 2, 5.6], [0, 0, 4], [6, 0, 4], [6, 2, 5.6]]) + // far roof slope, seen at a slant
  poly("nh-wr", [[6, 0, 0], [6, 4, 0], [6, 4, 4], [6, 2, 5.6], [6, 0, 4]]) + // right wall with its gable
  poly("nh-wl", [[0, 4, 0], [6, 4, 0], [6, 4, 4], [0, 4, 4]]) + // front wall
  poly("nh-roof", [[0, 4, 4], [6, 4, 4], [6, 2, 5.6], [0, 2, 5.6]]) + // roof slope facing the viewer
  panels(A_ROOF, 5, 2, 0.07, 0.93, 0.08, 0.9) +
  win(qx(6, 0.6, 1.8, 2.2, 3.5), [[6, 1.2, 2.2], [6, 1.2, 3.5]], 4.6, 0) +
  win(qx(6, 2.2, 3.4, 2.2, 3.5), [[6, 2.8, 2.2], [6, 2.8, 3.5]], 5.4, -1.9) +
  win(qx(6, 0.6, 1.8, 0.5, 1.9), [[6, 1.2, 0.5], [6, 1.2, 1.9]], 6.1, -3.2) +
  win(qx(6, 2.2, 3.4, 0.5, 1.9), [[6, 2.8, 0.5], [6, 2.8, 1.9]], 4.1, -0.7) +
  win(qx(6, 1.5, 2.5, 4.2, 5.0), [[6, 2, 4.2], [6, 2, 5.0]], 3.7, -2.4) +
  win(qy(4, 4.8, 5.6, 2.2, 3.5), [[5.2, 4, 2.2], [5.2, 4, 3.5]], 5.0, -1.1) +
  win(qy(4, 4.8, 5.6, 0.5, 1.9), [[5.2, 4, 0.5], [5.2, 4, 1.9]], 6.6, -4.1) +
  `<g class="nh-neon" filter="url(#nhGlow)">` +
  tube([[6, 0, 0], [6, 4, 0], [6, 4, 4], [6, 2, 5.6], [6, 0, 4], [6, 0, 0]]) +
  tube([[0, 4, 0], [6, 4, 0]]) + tube([[0, 4, 0], [0, 4, 4], [6, 4, 4]]) +
  tube([[0, 4, 4], [6, 4, 4], [6, 2, 5.6], [0, 2, 5.6], [0, 4, 4]]) + tube([[0, 2, 5.6], [0, 0, 4], [6, 0, 4], [6, 2, 5.6]]) +
  `</g>`;

// ---- annex: one storey with its own gable, in front of the main house (drawn after it, so it covers part of it)
const B_ROOF = (u: number, v: number): V => [4.5 - 1.5 * v, 4 + 3 * u, 2.2 + 1.2 * v];
const houseB =
  poly("nh-roofb", [[1.5, 7, 2.2], [1.5, 4, 2.2], [3, 4, 3.4], [3, 7, 3.4]]) +
  poly("nh-wr", [[4.5, 7, 0], [4.5, 4, 0], [4.5, 4, 2.2], [4.5, 7, 2.2]]) +
  poly("nh-wl", [[1.5, 7, 0], [4.5, 7, 0], [4.5, 7, 2.2], [3, 7, 3.4], [1.5, 7, 2.2]]) +
  poly("nh-roof", [[4.5, 4, 2.2], [4.5, 7, 2.2], [3, 7, 3.4], [3, 4, 3.4]]) +
  panels(B_ROOF, 3, 1, 0.08, 0.92, 0.12, 0.88) +
  win(qy(7, 1.95, 2.75, 0, 1.7), [[2.35, 7, 0], [2.35, 7, 1.7]], 5.8, -2.6) +
  win(qy(7, 3.2, 4.1, 0.6, 1.7), [[3.65, 7, 0.6], [3.65, 7, 1.7]], 4.4, -1.4) +
  win(qy(7, 2.6, 3.4, 2.4, 3.0), [[3, 7, 2.4], [3, 7, 3.0]], 3.9, -0.4) +
  win(qx(4.5, 4.6, 6.4, 0.6, 1.7), [[4.5, 5.5, 0.6], [4.5, 5.5, 1.7]], 5.2, -3.4) +
  `<g class="nh-neon nh-neon--b" filter="url(#nhGlow)">` +
  tube([[1.5, 7, 0], [4.5, 7, 0], [4.5, 7, 2.2], [3, 7, 3.4], [1.5, 7, 2.2], [1.5, 7, 0]]) +
  tube([[4.5, 7, 0], [4.5, 4, 0], [4.5, 4, 2.2], [4.5, 7, 2.2]]) +
  tube([[4.5, 4, 2.2], [4.5, 7, 2.2], [3, 7, 3.4], [3, 4, 3.4], [4.5, 4, 2.2]]) +
  tube([[1.5, 7, 2.2], [1.5, 4, 2.2], [3, 4, 3.4]]) +
  `</g>`;

const defs = `<defs>
<filter id="nhGlow" x="-15%" y="-15%" width="130%" height="130%"><feGaussianBlur in="SourceGraphic" stdDeviation="3.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<radialGradient id="nhFloor" cx="50%" cy="50%" r="50%"><stop class="nh-f0" offset="0"/><stop class="nh-f1" offset="1"/></radialGradient>
<linearGradient id="nhGlass" x1="0" y1="0" x2="0" y2="1"><stop class="nh-g0" offset="0"/><stop class="nh-g1" offset="1"/></linearGradient>
<linearGradient id="nhPanel" x1="0" y1="0" x2="1" y2="1"><stop class="nh-p0" offset="0"/><stop class="nh-p1" offset="1"/></linearGradient>
</defs>`;

export const NEON_HOUSE =
  `<svg class="nh" viewBox="40 90 600 480" role="img" aria-label="Illustration of a home with solar panels, glowing with neon light" focusable="false">${defs}` +
  `<g class="nh-ground">${ground}</g><g class="nh-house">${houseA}${houseB}</g></svg>`;

// ---------------------------------------------------------------------------------------------------------------------------------
// A day-and-night loop laid over the real photo of the house (public/zk/solarhome-photo.jpg, a 16:9 picture of 1671 x 941 units here):
// a transparent SVG on top of the picture. The numbers below are positions in that photo. The overlay uses "slice" scaling, which crops
// exactly like the photo's object-fit: cover, so the sun, the panels and the windows stay in place however the picture is cropped.
//
// One cycle (--cyc in public/zk-home.css, 12 seconds) runs: day (a small sun in the sky, light shafts landing on the top edge of the solar
// panels, a glint sweeping along that edge; the photo itself, with the house's own lit windows) -> dusk (the sun fades and a night version of the photo fades in) ->
// night (twinkling stars over the night sky, then the lit windows come on and blink, each on its own timing) -> dawn.
//
// The night is not drawn over the windows: it is a second photo of the same house (tools/solar-home-photos.py lines it up with the day
// photo). "night" is that photo with the light behind every window glass dimmed, "night-lit" is the photo as it is. Outside the glass they
// are the same, so each window just fades the lit copy in and out through a clip that follows its glass. The light therefore stays behind
// the frames, with the dividers, railings and plants in front of it. Every layer has a class and its keyframes are in public/zk-home.css (".hp-*").
const GLASS: [number, number][][] = [ // the glass of each window, traced on the photo (keep in step with tools/solar-home-photos.py)
  [[492, 354], [600, 341], [600, 482], [492, 485]],
  [[741, 336], [998, 309], [998, 459], [741, 467]],
  [[1186, 301], [1218, 307], [1218, 396], [1186, 396]],
  [[1276, 329], [1331, 338], [1331, 412], [1276, 408]],
  [[461, 582], [764, 577], [764, 794], [461, 791]],
  [[925, 573], [1030, 572], [1030, 800], [925, 800]],
  [[1294, 575], [1352, 574], [1352, 806], [1294, 806]],
  [[1425, 588], [1470, 592], [1470, 803], [1425, 806]],
];
const BLINK: [number, number][] = [[1.9, 0], [2.3, -0.8], [1.6, -0.3], [2.1, -1.1], [2.6, -1.4], [1.7, -0.3], [2.4, -0.6], [1.8, -1.5]]; // seconds per blink, start offset
/** The clip for a window: its glass, grown by 3px so the soft edge of the lit copy is not cut. */
const clipOf = (poly: [number, number][]) => {
  const cx = poly.reduce((n, p) => n + p[0], 0) / poly.length, cy = poly.reduce((n, p) => n + p[1], 0) / poly.length;
  return poly.map(([x, y]) => { const d = Math.hypot(x - cx, y - cy) || 1; return `${(x + (x - cx) / d * 3).toFixed(1)},${(y + (y - cy) / d * 3).toFixed(1)}`; }).join(" ");
};
// the solar panels on the roof (top edge left to right, then the bottom edge right to left)
const PANELS = "542,182 652,162 750,146 835,132 922,116 1015,97 1110,80 1220,60 1088,200 978,213 878,228 780,243 680,258 580,271 480,285 388,300";
const SUN: [number, number] = [560, 62]; // the sun: small, in the sky just above the left end of the panels

// the roof line (the top of the roof against the sky), used to keep the stars in the sky
const roofY = (x: number) => (x < 540 ? 343 - (x - 300) * 0.68 : x <= 1300 ? 182 - (x - 540) * 0.184 : 42 + (x - 1300) * 2.02);
// stars: a fixed scatter over the sky above the house, so the markup is the same on every request (the night photo has a moon and a few stars of its own)
let seed = 20260;
const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const STARS: string[] = [];
while (STARS.length < 30) {
  const x = 380 + rnd() * 1090, y = 14 + rnd() * 300;
  if (y > roofY(x) - 30) continue;
  const r = 2.2 + rnd() * 2.2;
  STARS.push(`<circle class="hp-star" style="--t:${(1.2 + rnd() * 1.4).toFixed(1)}s;--d:-${(rnd() * 2).toFixed(1)}s" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}"/>`);
}

// the sun's rays (thin wedges that turn slowly) and the light shafts that run from the sun to the panels
const RAYS = Array.from({ length: 20 }, (_, i) => {
  const a = (i * 18 + (i % 2 ? 3 : 0)) * Math.PI / 180, w = (i % 2 ? 1.2 : 2.1) * Math.PI / 180, R = 290;
  const p = (t: number) => `${(SUN[0] + Math.cos(t) * R).toFixed(0)},${(SUN[1] + Math.sin(t) * R).toFixed(0)}`;
  return `<polygon points="${SUN[0]},${SUN[1]} ${p(a - w)} ${p(a + w)}"/>`;
}).join("");
// The sunlight reaches only the top edge of the panels. Their top edge runs from (542,182) to (1220,60); EDGE is that line as a start point,
// a length and an angle, so a strip along it can be drawn straight and tilted into place.
const EDGE = { x: 542, y: 182, len: 689, deg: -10.2, depth: 60 };
const onEdge = (t: number): [number, number] => [542 + (1220 - 542) * t, 182 + (60 - 182) * t];
const SHAFTS = ([[0, 0.12, 0], [0.2, 0.34, 1], [0.42, 0.58, 2]] as const).map(([t0, t1, i]) => {
  const [ax, ay] = onEdge(t0), [bx, by] = onEdge(t1);
  return `<polygon class="hp-shaft" style="--d:-${i * 1}s" points="${SUN[0] - 8},${SUN[1] - 3} ${SUN[0] + 10},${SUN[1] + 5} ${(bx + 4).toFixed(0)},${(by + 30).toFixed(0)} ${(ax - 4).toFixed(0)},${(ay + 30).toFixed(0)}"/>`;
}).join("");
// sparkles on the strip (x along the edge, then down a little)
const SPARKS = ([[70, 0], [210, 0.6], [350, 1.2], [490, 0.3], [620, 0.9]] as const)
  .map(([x, d]) => `<g transform="translate(${x} 24)"><path class="hp-spark" style="--d:-${d}s" d="M0-15 3-3 15 0 3 3 0 15-3 3-15 0-3-3Z"/></g>`).join("");

// Colours are set here rather than in the stylesheet on purpose: the sunlight is not a brand colour, so the site theme must not recolour it.
const stop = (offset: number, color: string, opacity = 1) => `<stop offset="${offset}" stop-color="${color}" stop-opacity="${opacity}"/>`;
const lin = (id: string, o: string, stops: string, units = "") => `<linearGradient id="${id}" ${o}${units ? ` gradientUnits="${units}"` : ""}>${stops}</linearGradient>`;
const rad = (id: string, o: string, stops: string, units = "") => `<radialGradient id="${id}" ${o}${units ? ` gradientUnits="${units}"` : ""}>${stops}</radialGradient>`;
const sunAt = `cx="${SUN[0]}" cy="${SUN[1]}"`;

export const PHOTO_FX =
  `<svg class="zh-hp-fx" viewBox="0 0 1671 941" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs>` +
  rad("hpHalo", `${sunAt} r="210"`, stop(0, "#fffbe6", 0.85) + stop(0.16, "#ffe9a0", 0.5) + stop(0.42, "#ffd060", 0.18) + stop(1, "#ffd060", 0), "userSpaceOnUse") +
  rad("hpCore", "", stop(0, "#fffef2") + stop(0.35, "#fff3b8", 0.95) + stop(1, "#ffd86e", 0)) +
  rad("hpRay", `${sunAt} r="290"`, stop(0, "#fff4c4", 0.5) + stop(1, "#fff4c4", 0), "userSpaceOnUse") +
  lin("hpShaft", `x1="${SUN[0]}" y1="${SUN[1]}" x2="760" y2="160"`, stop(0, "#fff6cc", 0.55) + stop(0.55, "#ffe9a0", 0.26) + stop(1, "#ffe38a", 0.14), "userSpaceOnUse") +
  lin("hpSheen", 'x1="0" y1="0" x2="0" y2="1"', stop(0, "#ffffff", 0.62) + stop(0.5, "#eef6ff", 0.22) + stop(1, "#e4f2ff", 0)) +
  lin("hpGlint", 'x1="0" y1="0" x2="1" y2="0"', stop(0, "#fff", 0) + stop(0.5, "#fff", 0.85) + stop(1, "#fff", 0)) +
  `<clipPath id="hpPanels"><polygon points="${PANELS}"/></clipPath>` +
  GLASS.map((p, i) => `<clipPath id="hpW${i}"><polygon points="${clipOf(p)}"/></clipPath>`).join("") + `</defs>` +
  // night: the night photo (lights off), then the lit copy through the glass of each window
  `<image class="hp-nimg" data-src="/zk/solarhome-night.jpg" width="1671" height="941" preserveAspectRatio="none"/>` +
  `<g class="hp-lit-g">${GLASS.map((_, i) => `<g clip-path="url(#hpW${i})"><image class="hp-nlit" style="--t:${BLINK[i][0]}s;--d:${BLINK[i][1]}s" data-src="/zk/solarhome-night-lit.jpg" width="1671" height="941" preserveAspectRatio="none"/></g>`).join("")}</g>` +
  // stars
  `<g class="hp-stars">${STARS.join("")}</g>` +
  // day: a small sun with short rays, light shafts to the top edge of the panels, and along that edge a soft sheen, a glint and sparkles
  `<g class="hp-day"><circle ${sunAt} r="210" fill="url(#hpHalo)"/>` +
  `<g class="hp-rays" style="transform-origin:${SUN[0]}px ${SUN[1]}px" fill="url(#hpRay)">${RAYS}</g>` +
  `<g class="hp-shafts" fill="url(#hpShaft)">${SHAFTS}</g>` +
  `<circle class="hp-core" ${sunAt} r="30" fill="url(#hpCore)"/>` +
  `<g clip-path="url(#hpPanels)"><g transform="translate(${EDGE.x} ${EDGE.y}) rotate(${EDGE.deg})">` +
  `<rect class="hp-sheen" x="-4" y="-2" width="${EDGE.len + 8}" height="${EDGE.depth}" fill="url(#hpSheen)"/>` +
  `<polygon class="hp-glint" fill="url(#hpGlint)" points="0,-2 90,-2 56,${EDGE.depth} -34,${EDGE.depth}"/>` +
  SPARKS + `</g></g></g></svg>` +
  // the night photos are only fetched when the picture is about to come into view (and not at all for visitors who prefer reduced motion)
  `<script>(function(){var f=document.currentScript.parentNode,im=f.querySelectorAll('image[data-src]');if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;` +
  `function go(){[].forEach.call(im,function(i){i.setAttribute('href',i.getAttribute('data-src'))})}` +
  `if('IntersectionObserver' in window){var io=new IntersectionObserver(function(e){if(e[0].isIntersecting){go();io.disconnect()}},{rootMargin:'900px 0px'});io.observe(f)}else go()})();</script>`;

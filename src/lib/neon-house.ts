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
// The same neon idea on the real photo (public/zk/solarhome-photo.jpg, 687 x 580): a transparent SVG laid over it. The numbers below are
// positions in that photo. The overlay uses "slice" scaling, which crops exactly like the photo's object-fit: cover, so the windows stay
// under their lights however the picture is cropped. Outside: neon tubes trace the roof and the gable and flicker. Inside: every lit window
// switches off and on (a warm glow that fades and a dark tint that takes its place), and the wall lamps blink.
const WINDOWS: [number, number, number, number, number, number][] = [ // x, y, width, height, seconds per cycle, start offset
  [141, 329, 37, 66, 4.6, 0], [230, 320, 108, 66, 5.4, -1.9], [424, 304, 17, 46, 3.9, -0.8], [461, 314, 30, 39, 5.0, -2.7],
  [167, 437, 63, 85, 6.1, -3.2], [301, 434, 43, 82, 4.1, -0.7], [472, 431, 24, 89, 5.8, -1.4], [532, 435, 23, 87, 4.4, -3.6],
];
const LAMPS: [number, number, number, number][] = [[193, 336, 3.3, 0], [420, 322, 4.1, -1.2], [456, 326, 3.6, -2.2], [240, 455, 4.7, -0.5], [351, 452, 3.9, -3.0], [462, 450, 4.4, -1.8], [522, 454, 3.5, -2.6]];
const TUBES = ["60,329 160,241 492,166 385,292 60,329", "492,166 565,325"]; // roof outline, and the right edge of the gable

export const PHOTO_FX =
  `<svg class="zh-hp-fx" viewBox="0 0 687 580" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs>` +
  `<filter id="hpGlow" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` +
  `<radialGradient id="hpBloom"><stop class="hp-b0" offset="0"/><stop class="hp-b1" offset="1"/></radialGradient></defs>` +
  WINDOWS.map(([x, y, w, h, t, d]) => {
    const at = ` style="--t:${t}s;--d:${d}s"`;
    return `<rect class="hp-lit"${at} x="${x - 12}" y="${y - 12}" width="${w + 24}" height="${h + 24}" rx="10"/><rect class="hp-dim"${at} x="${x}" y="${y}" width="${w}" height="${h}" rx="2"/>`;
  }).join("") +
  LAMPS.map(([x, y, t, d]) => `<circle class="hp-lit hp-lamp" style="--t:${t}s;--d:${d}s" cx="${x}" cy="${y}" r="11"/>`).join("") +
  `<g class="nh-neon" filter="url(#hpGlow)">${TUBES.map((p) => `<polyline class="nh-tube" points="${p}"/>`).join("")}</g></svg>`;

// Course geometry, shared by the server (Node) and the client (browser).
// The river runs from the bottom (start) to the top (finish): negative y = upstream.
(function (root) {
  'use strict';

  // [x, y, half-width, downstream current speed in px/s]
  const CONTROL = [
    [0, 300, 280, 0],
    [0, -300, 260, 30],
    [120, -900, 240, 35],
    [380, -1450, 210, 55],
    [330, -2000, 230, 40],
    [0, -2450, 250, 35],
    [-380, -2900, 220, 50],
    [-420, -3500, 185, 75],
    [-150, -4000, 210, 45],
    [250, -4400, 240, 35],
    [520, -4950, 250, 40],
    [420, -5550, 200, 60],
    [60, -6000, 190, 65],
    [-250, -6500, 230, 40],
    [-300, -7150, 250, 35],
    [0, -7700, 220, 50],
    [300, -8200, 200, 70],
    [200, -8800, 240, 40],
    [0, -9300, 280, 25],
    [0, -9800, 300, 0],
  ];
  const SUB = 12;

  function cr(p0, p1, p2, p3, t) {
    const t2 = t * t, t3 = t2 * t;
    return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
  }

  function build() {
    const raw = [];
    const n = CONTROL.length;
    for (let i = 0; i < n - 1; i++) {
      const p0 = CONTROL[Math.max(0, i - 1)], p1 = CONTROL[i], p2 = CONTROL[i + 1], p3 = CONTROL[Math.min(n - 1, i + 2)];
      for (let k = 0; k < SUB; k++) {
        const t = k / SUB;
        raw.push([0, 1, 2, 3].map((j) => cr(p0[j], p1[j], p2[j], p3[j], t)));
      }
    }
    raw.push(CONTROL[n - 1].slice());
    const P = raw.map((p) => ({ x: p[0], y: p[1], hw: p[2], flow: p[3], s: 0, tx: 0, ty: -1 }));
    for (let i = 1; i < P.length; i++) {
      const dx = P[i].x - P[i - 1].x, dy = P[i].y - P[i - 1].y;
      const len = Math.hypot(dx, dy) || 1;
      P[i].s = P[i - 1].s + len;
      P[i - 1].tx = dx / len;
      P[i - 1].ty = dy / len;
    }
    P[P.length - 1].tx = P[P.length - 2].tx;
    P[P.length - 1].ty = P[P.length - 2].ty;
    return P;
  }

  const PTS = build();
  const LENGTH = PTS[PTS.length - 1].s;

  // Point on the centre line at distance s. Normal (nx, ny) = right-hand side.
  function pointAt(s) {
    s = Math.max(0, Math.min(LENGTH, s));
    let lo = 0, hi = PTS.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (PTS[mid].s <= s) lo = mid; else hi = mid;
    }
    const a = PTS[lo], b = PTS[hi];
    const f = b.s > a.s ? (s - a.s) / (b.s - a.s) : 0;
    const tx = a.tx, ty = a.ty;
    return {
      s,
      x: a.x + (b.x - a.x) * f,
      y: a.y + (b.y - a.y) * f,
      hw: a.hw + (b.hw - a.hw) * f,
      flow: a.flow + (b.flow - a.flow) * f,
      tx, ty, nx: -ty, ny: tx,
    };
  }

  // Centre-line point nearest to (x, y).
  function closest(x, y) {
    let best = null, bestD = Infinity;
    for (let i = 0; i < PTS.length - 1; i++) {
      const a = PTS[i], b = PTS[i + 1];
      const dx = b.x - a.x, dy = b.y - a.y;
      const l2 = dx * dx + dy * dy || 1;
      let f = ((x - a.x) * dx + (y - a.y) * dy) / l2;
      f = Math.max(0, Math.min(1, f));
      const cx = a.x + dx * f, cy = a.y + dy * f;
      const d = (x - cx) * (x - cx) + (y - cy) * (y - cy);
      if (d < bestD) {
        bestD = d;
        best = { i, f, cx, cy };
      }
    }
    const a = PTS[best.i], b = PTS[best.i + 1];
    return {
      s: a.s + (b.s - a.s) * best.f,
      cx: best.cx, cy: best.cy,
      hw: a.hw + (b.hw - a.hw) * best.f,
      flow: a.flow + (b.flow - a.flow) * best.f,
      tx: a.tx, ty: a.ty,
      dist: Math.sqrt(bestD),
    };
  }

  // Obstacles: u = fraction of the course, off = fraction of the half-width (+ = right)
  const ROCK_DEF = [
    [0.07, -0.45, 38], [0.1, 0.5, 44], [0.155, -0.3, 42], [0.26, -0.42, 40], [0.285, 0.45, 36],
    [0.355, 0.35, 38], [0.47, 0.5, 40], [0.5, -0.5, 40], [0.615, 0.35, 40], [0.705, -0.46, 36],
    [0.725, 0.46, 36], [0.855, -0.3, 42], [0.9, -0.5, 38],
  ];
  // drifting barrels: [u, amplitude, period s, radius, phase]
  const BARREL_DEF = [
    [0.125, 0.6, 4.0, 30, 0], [0.33, 0.55, 3.5, 32, 1.0], [0.55, 0.6, 3.0, 30, 2.0], [0.785, 0.6, 3.2, 30, 0.5],
  ];
  // whirlpools: [u, off, radius, strength]
  const VORTEX_DEF = [
    [0.215, 0.3, 150, 160], [0.575, -0.35, 140, 170], [0.83, 0.35, 150, 180],
  ];
  // crocodiles: [u, amplitude, period s, radius, phase]
  const CROC_DEF = [
    [0.42, 0.55, 5.0, 34, 0], [0.67, 0.6, 4.5, 34, 1.5], [0.94, 0.5, 4.0, 34, 3.0],
  ];

  function place(u, off) {
    const p = pointAt(u * LENGTH);
    return { x: p.x + p.nx * off * p.hw, y: p.y + p.ny * off * p.hw, p };
  }

  const ROCKS = ROCK_DEF.map(([u, off, r]) => {
    const q = place(u, off);
    return { x: q.x, y: q.y, r };
  });
  const VORTICES = VORTEX_DEF.map(([u, off, r, k]) => {
    const q = place(u, off);
    return { x: q.x, y: q.y, r, k };
  });

  function movers(defs, t) {
    return defs.map(([u, amp, period, r, phase]) => {
      const w = (2 * Math.PI) / period;
      const off = amp * Math.sin(w * t + phase);
      const q = place(u, off);
      // direction of travel (so crocodiles are drawn facing the right way)
      const dir = Math.cos(w * t + phase) >= 0 ? 1 : -1;
      return { x: q.x, y: q.y, r, dir, nx: q.p.nx, ny: q.p.ny };
    });
  }

  const api = {
    PTS,
    LENGTH,
    pointAt,
    closest,
    ROCKS,
    VORTICES,
    barrelsAt: (t) => movers(BARREL_DEF, t),
    crocsAt: (t) => movers(CROC_DEF, t),
    START_S: 220,
    CHECKPOINTS: [0.2, 0.4, 0.6, 0.8].map((u) => u * LENGTH),
    FINISH_S: LENGTH - 380,
    RAFT_SIZE: 120,
    RAFT_R: 72,
    // hippo seats on the raft (local coordinates, -y = bow)
    SEATS: [[-36, -36], [36, -36], [-36, 36], [36, 36]],
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Track = api;
})(typeof self !== 'undefined' ? self : this);

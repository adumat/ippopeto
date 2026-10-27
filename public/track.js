// Course engine, shared by the server (Node) and the client (browser).
// A course is built from a map module in public/maps/ and, for generated maps, a seed.
// Courses run from the bottom (start) to the top (finish): negative y = upstream.
(function (root) {
  'use strict';

  // Maps in the order the selector lists them. A map is listed only once it is playable.
  const ORDER = ['fiume'];
  const isNode = typeof module !== 'undefined' && module.exports;
  const extra = {};
  const defOf = (id) => extra[id] || (isNode ? require(`./maps/${id}.js`) : (root.IppoMaps || {})[id]);
  // for tests: adds a map module without a file
  function register(def) {
    extra[def.id] = def;
    if (!ORDER.includes(def.id)) ORDER.push(def.id);
  }

  const SUB = 12;

  // mulberry32: generated maps must never use Math.random, or client and server disagree
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function cr(p0, p1, p2, p3, t) {
    const t2 = t * t, t3 = t2 * t;
    return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
  }

  function centreLine(control) {
    const raw = [];
    const n = control.length;
    for (let i = 0; i < n - 1; i++) {
      const p0 = control[Math.max(0, i - 1)], p1 = control[i], p2 = control[i + 1], p3 = control[Math.min(n - 1, i + 2)];
      for (let k = 0; k < SUB; k++) {
        const t = k / SUB;
        raw.push([0, 1, 2, 3].map((j) => cr(p0[j], p1[j], p2[j], p3[j], t)));
      }
    }
    raw.push(control[n - 1].slice());
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

  function build(def, seed = 0) {
    const layout = def.generated ? def.generate(rng(seed)) : def;
    const PTS = centreLine(layout.control);
    const LENGTH = PTS[PTS.length - 1].s;
    const obs = layout.obstacles || {};

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

    function place(u, off) {
      const p = pointAt(u * LENGTH);
      return { x: p.x + p.nx * off * p.hw, y: p.y + p.ny * off * p.hw, p };
    }

    // Moving obstacles are pure functions of room time, so client and server agree.
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

    // [[u0, u1, kind]]: stretches not listed are water
    const surfaces = (layout.surfaces || []).map(([u0, u1, kind]) => [u0 * LENGTH, u1 * LENGTH, kind]);
    function surfaceAt(s) {
      for (const [s0, s1, kind] of surfaces) if (s >= s0 && s < s1) return kind;
      return 'water';
    }

    const barrels = obs.barrels || [], crocs = obs.crocs || [];
    return {
      id: def.id,
      seed: def.generated ? seed : 0,
      def,
      layout,
      PTS,
      LENGTH,
      pointAt,
      closest,
      place,
      movers,
      surfaceAt,
      ROCKS: (obs.rocks || []).map(([u, off, r]) => {
        const { x, y } = place(u, off);
        return { x, y, r };
      }),
      VORTICES: (obs.vortices || []).map(([u, off, r, k]) => {
        const { x, y } = place(u, off);
        return { x, y, r, k };
      }),
      barrelsAt: (t) => movers(barrels, t),
      crocsAt: (t) => movers(crocs, t),
      START_S: 220,
      CHECKPOINTS: [0.2, 0.4, 0.6, 0.8].map((u) => u * LENGTH),
      FINISH_S: LENGTH - 380,
    };
  }

  const cache = new Map();
  function course(id, seed = 0) {
    const def = defOf(id);
    const key = `${id}:${def.generated ? seed : 0}`;
    if (!cache.has(key)) {
      if (cache.size > 16) cache.clear();
      cache.set(key, build(def, seed));
    }
    return cache.get(key);
  }

  const maps = () => ORDER.map((id) => {
    const d = defOf(id);
    return { id: d.id, name: d.name, generated: !!d.generated };
  });

  // n hippo seats evenly spaced around the raft, symmetric about the bow axis
  // (local coordinates, -y = bow). n = 4 gives the corners, n = 2 the two sides.
  const SEAT_RADIUS = 51;
  const seatCache = new Map();
  function seatPositions(n) {
    if (!seatCache.has(n)) {
      const pts = [];
      for (let k = 0; k < n; k++) {
        const a = -Math.PI / 2 + Math.PI / n + (2 * Math.PI * k) / n;
        pts.push([SEAT_RADIUS * Math.cos(a), SEAT_RADIUS * Math.sin(a)]);
      }
      seatCache.set(n, pts);
    }
    return seatCache.get(n);
  }

  const api = {
    MAP_IDS: ORDER,
    DEFAULT_MAP: 'fiume',
    maps,
    course,
    build,
    register,
    rng,
    RAFT_SIZE: 120,
    RAFT_R: 72,
    MIN_SEATS: 2,
    MAX_SEATS: 6,
    seatPositions,
  };

  if (isNode) module.exports = api;
  else root.Track = api;
})(typeof self !== 'undefined' ? self : this);

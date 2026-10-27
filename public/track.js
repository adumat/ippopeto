// Course engine, shared by the server (Node) and the client (browser).
// A course is built from a map module in public/maps/ and, for generated maps, a seed.
// Courses run from the bottom (start) to the top (finish): negative y = upstream.
(function (root) {
  'use strict';

  // Maps in the order the selector lists them. A map is listed only once it is playable.
  const ORDER = ['fiume', 'fogne', 'fiordo', 'lava', 'grotta', 'stelle'];
  const isNode = typeof module !== 'undefined' && module.exports;
  const extra = {};
  const defOf = (id) => extra[id] || (isNode ? require(`./maps/${id}.js`) : (root.IppoMaps || {})[id]);
  // for tests: adds a map module without a file
  function register(def) {
    extra[def.id] = def;
    if (!ORDER.includes(def.id)) ORDER.push(def.id);
  }

  const SUB = 12;
  const BEAR_WARN = 1, BEAR_SPEED = 900;
  const GEYSER_BUILD = 0.6, GEYSER_ERUPT = 1, BOMB_WARN = 1.5;
  const RAMP_LEN = 110;

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

  // Smallest gap, in px, between the banks of two stretches that are not neighbours along
  // the course. Negative means the river touches itself.
  function clearance(P) {
    let worst = Infinity;
    for (let i = 0; i < P.length; i += 2) {
      for (let j = i + 2; j < P.length; j += 2) {
        const a = P[i], b = P[j];
        if (b.s - a.s < 2 * (a.hw + b.hw)) continue;
        worst = Math.min(worst, Math.hypot(a.x - b.x, a.y - b.y) - a.hw - b.hw);
      }
    }
    return worst;
  }
  const MIN_CLEARANCE = 100;

  function build(def, seed = 0) {
    let layout = def, PTS;
    if (def.generated) {
      // a layout whose stretches come too close is redrawn from the same random stream
      const r = rng(seed);
      for (let tries = 0; tries < 20; tries++) {
        layout = def.generate(r);
        PTS = centreLine(layout.control);
        if (clearance(PTS) >= MIN_CLEARANCE) break;
      }
    } else PTS = centreLine(layout.control);
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

    // A point on a wall: side +1 is the right bank. (nx, ny) points into the course.
    function wall(u, side) {
      const p = pointAt(u * LENGTH);
      return { x: p.x + p.nx * side * p.hw, y: p.y + p.ny * side * p.hw, nx: -p.nx * side, ny: -p.ny * side, tx: p.tx, ty: p.ty, s: p.s, hw: p.hw };
    }
    // Pipes cycle drip (1 s), fire (1 s), rest; the phase is a pure function of room time.
    const JETS = (obs.jets || []).map(([u, side, period, phase]) => ({ ...wall(u, side), side, period, phase }));
    const jetState = (j, t) => {
      const q = (((t + j.phase) % j.period) + j.period) % j.period;
      return { stage: q < 1 ? 'drip' : q < 2 ? 'fire' : 'rest', q, n: Math.floor((t + j.phase) / j.period) };
    };
    const INTAKES = (obs.intakes || []).map(([u, side, r, k]) => ({ ...wall(u, side), side, r, k }));
    const METHANE = (obs.methane || []).map(([u, off, r]) => {
      const { x, y } = place(u, off);
      return { x, y, r };
    });

    // Tilted stretches. (ax, ay) is the slope's pull at the stretch's start, along the course.
    const SLOPE_DIRS = { back: [-1, 0], forward: [1, 0], left: [0, -1], right: [0, 1] };
    const SLOPES = (obs.slopes || []).map(([u0, u1, dir, acc]) => ({ s0: u0 * LENGTH, s1: u1 * LENGTH, dir, acc, along: SLOPE_DIRS[dir][0], across: SLOPE_DIRS[dir][1] }));
    // Thin ice: tiles of about 100 px along the course, three across.
    const TILE_LEN = 100;
    const TILES = [];
    for (const [u0, u1] of obs.thin || []) {
      for (let s = u0 * LENGTH + TILE_LEN / 2; s < u1 * LENGTH; s += TILE_LEN) {
        const p = pointAt(s);
        for (const k of [-1, 0, 1]) {
          const lat = (k * 2 * p.hw) / 3;
          TILES.push({ s, lat, x: p.x + p.nx * lat, y: p.y + p.ny * lat, w: (2 * p.hw) / 3, len: TILE_LEN, a: Math.atan2(p.ty, p.tx) });
        }
      }
    }
    // Polar bears sit on the snow beside the course.
    const BEARS = (obs.bears || []).map(([u, side]) => {
      const p = pointAt(u * LENGTH);
      const d = p.hw + 90;
      return { s: p.s, side, x: p.x + p.nx * side * d, y: p.y + p.ny * side * d, hw: p.hw };
    });
    // A bear charges in a straight line through a target point, out to the far side. It shows that line for BEAR_WARN s, then runs at BEAR_SPEED px/s and is gone
    // (null) at the end of it.
    function bearLine(b, tx, ty) {
      const dx = tx - b.x, dy = ty - b.y;
      const d = Math.hypot(dx, dy) || 1;
      const len = d + b.hw + 200;
      return { ex: b.x + (dx / d) * len, ey: b.y + (dy / d) * len, len };
    }
    function bearAt(b, line, t) {
      if (t < BEAR_WARN) return { x: b.x, y: b.y, warn: true };
      const d = (t - BEAR_WARN) * BEAR_SPEED;
      if (d > line.len) return null;
      return { x: b.x + ((line.ex - b.x) * d) / line.len, y: b.y + ((line.ey - b.y) * d) / line.len, warn: false };
    }

    // Vents: glowing pools on the lava that set a pushing hippo's fart alight.
    const VENTS = (obs.vents || []).map(([u, off, r]) => {
      const { x, y } = place(u, off);
      return { x, y, r };
    });
    // Geysers build up for GEYSER_BUILD s, then erupt for GEYSER_ERUPT s, each to its own period.
    const GEYSERS = (obs.geysers || []).map(([u, off, r, period, phase]) => {
      const { x, y, p } = place(u, off);
      return { x, y, r, period, phase, nx: p.nx, ny: p.ny, side: Math.sign(off) || 1 };
    });
    const geyserState = (g, t) => {
      const q = (((t + g.phase) % g.period) + g.period) % g.period;
      const n = Math.floor((t + g.phase) / g.period);
      const build = g.period - GEYSER_ERUPT - GEYSER_BUILD;
      return { stage: q < build ? 'rest' : q < build + GEYSER_BUILD ? 'build' : 'erupt', q, n };
    };
    // Lava bombs land every `period` s; the shadow shows for BOMB_WARN s before each impact.
    const BOMBS = (obs.bombs || []).map(([u, off, period, phase]) => {
      const { x, y } = place(u, off);
      return { x, y, period, phase };
    });
    // time to the next impact, and that impact's number
    const bombState = (b, t) => {
      const k = Math.ceil((t - b.phase) / b.period);
      const impact = b.phase + k * b.period;
      return { left: impact - t, n: k };
    };

    // Stretches with rails; elsewhere a map with `banks: 'void'` has open edges.
    const RAILS = (obs.rails || []).map(([u0, u1]) => [u0 * LENGTH, u1 * LENGTH]);
    const railedAt = (s) => RAILS.some(([s0, s1]) => s >= s0 && s < s1);
    // Holes across the whole track, each with a ramp of RAMP_LEN px in front of it.
    const HOLES = (obs.holes || []).map(([u0, u1]) => ({ r0: u0 * LENGTH - RAMP_LEN, s0: u0 * LENGTH, s1: u1 * LENGTH }));
    const holeAt = (s) => HOLES.some((h) => s >= h.s0 && s < h.s1);
    const TURBOS = (obs.turbos || []).map(([u, off]) => {
      const { x, y, p } = place(u, off);
      return { x, y, tx: p.tx, ty: p.ty };
    });
    const PLANETS = (obs.planets || []).map(([u, side, dist, r, reach, pull]) => {
      const p = pointAt(u * LENGTH);
      const d = p.hw + dist;
      return { x: p.x + p.nx * side * d, y: p.y + p.ny * side * d, r, reach, pull };
    });

    const barrels = obs.barrels || [], crocs = obs.crocs || [], bats = obs.bats || [], comets = obs.comets || [];
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
      VENTS,
      GEYSERS,
      geyserState,
      BOMBS,
      bombState,
      BOMB_WARN,
      SLOPES,
      TILES,
      BEARS,
      bearLine,
      bearAt,
      JETS,
      jetState,
      INTAKES,
      METHANE,
      barrelsAt: (t) => movers(barrels, t),
      crocsAt: (t) => movers(crocs, t),
      batsAt: (t) => movers(bats, t),
      cometsAt: (t) => movers(comets, t),
      RAILS,
      railedAt,
      HOLES,
      holeAt,
      TURBOS,
      PLANETS,
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
    clearance,
    MIN_CLEARANCE,
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

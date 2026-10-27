// Painter for the map "Strada delle stelle": a violet ribbon of light in space, yellow rails
// where the edges bounce, holes with ramps, turbo pads, ringed planets and comets.
(function (root) {
  'use strict';
  const INK = '#1f2b2e', GAS = '#c6dc5a', PAPER = '#fff8e1';
  const SPACE = '#0b0d2a', TRACK = '#7b5cff', RAIL = '#ffd23f';
  const TAU = Math.PI * 2;

  function paint(ctx, fill, lw = 3) {
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = lw;
    ctx.stroke();
  }
  function dot(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
  }
  const ph = (t, period, off = 0) => (((t / period + off) % 1) + 1) % 1;

  // the strip of track between s0 and s1, as a closed path
  function strip(T, s0, s1, widen = 0) {
    const path = new Path2D();
    const left = [], right = [];
    for (let s = s0; s <= s1 + 0.1; s += Math.min(20, s1 - s0 || 1)) {
      const p = T.pointAt(Math.min(s, s1));
      left.push([p.x - p.nx * (p.hw + widen), p.y - p.ny * (p.hw + widen)]);
      right.push([p.x + p.nx * (p.hw + widen), p.y + p.ny * (p.hw + widen)]);
      if (s >= s1) break;
    }
    left.forEach(([x, y], i) => (i ? path.lineTo(x, y) : path.moveTo(x, y)));
    for (let i = right.length - 1; i >= 0; i--) path.lineTo(right[i][0], right[i][1]);
    path.closePath();
    return path;
  }
  function edge(T, s0, s1, side) {
    const path = new Path2D();
    for (let s = s0, i = 0; s <= s1 + 0.1; s += 20, i++) {
      const p = T.pointAt(Math.min(s, s1));
      const x = p.x + p.nx * side * p.hw, y = p.y + p.ny * side * p.hw;
      if (i) path.lineTo(x, y);
      else path.moveTo(x, y);
    }
    return path;
  }

  function build(T) {
    const track = strip(T, 0, T.LENGTH);
    const rails = T.RAILS.flatMap(([s0, s1]) => [edge(T, s0, s1, -1), edge(T, s0, s1, 1)]);
    const holes = T.HOLES.map((h) => ({ ...h, path: strip(T, h.s0, h.s1, 2), ramp: strip(T, h.r0, h.s0) }));
    let seed = 23;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const stars = [];
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of T.PTS) {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }
    for (let i = 0; i < 1400; i++) stars.push({ x: minX - 900 + rnd() * (maxX - minX + 1800), y: minY - 900 + rnd() * (maxY - minY + 1800), r: rnd() < 0.2 ? 2.4 : 1.3, k: rnd() * 6 });
    const dashes = [];
    for (let s = 0; s < T.LENGTH; s += 50) dashes.push(s);
    return { track, rails, holes, stars, dashes };
  }

  function ground(ctx, w, { course: T, rg, inView, cam, vw, vh }) {
    ctx.fillStyle = SPACE;
    ctx.fillRect(cam.x - vw, cam.y - vh, 2 * vw, 2 * vh);
    ctx.fillStyle = PAPER;
    for (const st of w.stars) {
      if (!inView(st.x, st.y)) continue;
      ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(rg * 1.3 + st.k));
      dot(ctx, st.x, st.y, st.r);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // a soft glow under the open edges, then the ribbon itself
    ctx.strokeStyle = 'rgba(123,92,255,0.35)';
    ctx.lineWidth = 30;
    ctx.lineJoin = 'round';
    ctx.stroke(w.track);
    ctx.fillStyle = TRACK;
    ctx.fill(w.track);
    ctx.strokeStyle = RAIL;
    ctx.lineWidth = 12;
    ctx.lineCap = 'butt';
    for (const r of w.rails) ctx.stroke(r);
    // the centre line streams forward
    ctx.strokeStyle = 'rgba(255,248,225,0.55)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    const shift = (rg * 90) % 50;
    for (const s0 of w.dashes) {
      const s = s0 + shift;
      const p = T.pointAt(s);
      if (!inView(p.x, p.y)) continue;
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.tx * 22, p.y + p.ty * 22);
    }
    ctx.stroke();
    // holes and their ramps
    for (const h of w.holes) {
      const p = T.pointAt(h.s0);
      if (!inView(p.x, p.y)) continue;
      ctx.fillStyle = SPACE;
      ctx.fill(h.path);
      ctx.fillStyle = PAPER;
      for (let i = 0; i < 8; i++) {
        const q = T.pointAt(h.s0 + ((i * 37) % 100) / 100 * (h.s1 - h.s0));
        dot(ctx, q.x + q.nx * (((i * 61) % 100) / 50 - 1) * q.hw * 0.9, q.y + q.ny * (((i * 61) % 100) / 50 - 1) * q.hw * 0.9, 1.5);
        ctx.fill();
      }
      ctx.fillStyle = RAIL;
      ctx.fill(h.ramp);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.stroke(h.ramp);
      ctx.lineWidth = 5;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let k = -0.7; k <= 0.71; k += 0.35) {
        const a = T.pointAt(h.r0 + 20), m = T.pointAt(h.s0 - 25);
        ctx.moveTo(a.x + a.nx * (k * a.hw - 25), a.y + a.ny * (k * a.hw - 25));
        ctx.lineTo(m.x + m.nx * k * m.hw, m.y + m.ny * k * m.hw);
        ctx.lineTo(a.x + a.nx * (k * a.hw + 25), a.y + a.ny * (k * a.hw + 25));
      }
      ctx.stroke();
    }
  }

  function drawTurbo(ctx, pad, t) {
    ctx.save();
    ctx.translate(pad.x, pad.y);
    ctx.rotate(Math.atan2(pad.ty, pad.tx));
    ctx.beginPath();
    ctx.roundRect(-54, -42, 108, 84, 14);
    paint(ctx, '#23285e', 4);
    const lit = Math.floor(ph(t, 0.6) * 3);
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 0; i < 3; i++) {
      const x = -21 + i * 21;
      ctx.strokeStyle = i === lit ? GAS : '#4a5196';
      ctx.beginPath();
      ctx.moveTo(x - 9, -21);
      ctx.lineTo(x + 9, 0);
      ctx.lineTo(x - 9, 21);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPlanet(ctx, p, t) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.setLineDash([10, 12]);
    ctx.strokeStyle = PAPER;
    ctx.lineWidth = 3;
    for (let j = 0; j < 3; j++) {
      const q = ph(t, 2.4, j / 3);
      ctx.globalAlpha = q * 0.45;
      dot(ctx, 0, 0, p.r + 12 + (1 - q) * (p.reach - p.r));
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    const g = ctx.createRadialGradient(-p.r * 0.3, -p.r * 0.3, p.r * 0.1, 0, 0, p.r);
    g.addColorStop(0, '#ffd08a');
    g.addColorStop(1, '#e2632a');
    dot(ctx, 0, 0, p.r);
    paint(ctx, g, 4);
    ctx.strokeStyle = PAPER;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.r * 1.6, p.r * 0.35, -0.35, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  function drawComet(ctx, c) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(Math.atan2(c.ny * c.dir, c.nx * c.dir));
    const len = 150;
    const g = ctx.createLinearGradient(-len, 0, 0, 0);
    g.addColorStop(0, 'rgba(255,248,225,0)');
    g.addColorStop(1, 'rgba(255,248,225,0.9)');
    ctx.strokeStyle = g;
    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-len, 0);
    ctx.lineTo(0, 0);
    ctx.stroke();
    dot(ctx, 0, 0, c.r);
    paint(ctx, RAIL, 4);
    ctx.fillStyle = '#fff';
    dot(ctx, -c.r * 0.3, -c.r * 0.3, c.r * 0.35);
    ctx.fill();
    ctx.restore();
  }

  function obstacles(ctx, w, { course: T, rg, inView }) {
    for (const p of T.PLANETS) if (inView(p.x, p.y)) drawPlanet(ctx, p, rg);
    for (const pad of T.TURBOS) if (inView(pad.x, pad.y)) drawTurbo(ctx, pad, rg);
    for (const c of T.cometsAt(rg)) if (inView(c.x, c.y)) drawComet(ctx, c);
  }

  (root.IppoDraw = root.IppoDraw || {}).stelle = { background: SPACE, build, ground, obstacles };
})(typeof self !== 'undefined' ? self : this);

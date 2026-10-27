// Painter for the map "Fiordo ghiacciato": snow banks, the frozen river, slope chevrons,
// thin-ice tiles, ice blocks, sliding penguins and charging polar bears.
(function (root) {
  'use strict';
  const INK = '#1f2b2e';
  const SNOW = '#f4f8fb', DRIFT = '#e3edf4', ICE = '#bfe3f2', ICE_EDGE = '#dbeef7', THIN = '#e6f6fd', HOLE = '#2f6f8f';
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

  function build(T) {
    const ice = new Path2D();
    const leftEdge = new Path2D(), rightEdge = new Path2D();
    T.PTS.forEach((p, i) => {
      const x = p.x + p.ty * p.hw, y = p.y - p.tx * p.hw;
      if (i === 0) { ice.moveTo(x, y); leftEdge.moveTo(x, y); }
      else { ice.lineTo(x, y); leftEdge.lineTo(x, y); }
    });
    for (let i = T.PTS.length - 1; i >= 0; i--) {
      const p = T.PTS[i];
      const x = p.x - p.ty * p.hw, y = p.y + p.tx * p.hw;
      ice.lineTo(x, y);
      if (i === T.PTS.length - 1) rightEdge.moveTo(x, y); else rightEdge.lineTo(x, y);
    }
    ice.closePath();
    let seed = 5;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const drifts = [];
    for (let s = 0; s < T.LENGTH; s += 90) {
      for (const side of [-1, 1]) {
        if (rnd() < 0.4) continue;
        const p = T.pointAt(s + rnd() * 60);
        const d = p.hw + 60 + rnd() * 340;
        drifts.push({ x: p.x + p.nx * d * side, y: p.y + p.ny * d * side, rx: 40 + rnd() * 50, ry: 12 + rnd() * 8 });
      }
    }
    const glints = [];
    for (let i = 0; i < 260; i++) glints.push({ s: rnd() * T.LENGTH, off: rnd() * 1.6 - 0.8, len: 14 + rnd() * 26 });
    return { ice, leftEdge, rightEdge, drifts, glints };
  }

  // a chevron at the origin pointing along +x
  function chevron(ctx, x, y, a, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(-size * 0.5, -size);
    ctx.lineTo(size * 0.5, 0);
    ctx.lineTo(-size * 0.5, size);
    ctx.stroke();
    ctx.restore();
  }

  function ground(ctx, w, { course: T, rg, inView, cam, vw, vh, snap }) {
    ctx.fillStyle = SNOW;
    ctx.fillRect(cam.x - vw, cam.y - vh, 2 * vw, 2 * vh);
    ctx.fillStyle = DRIFT;
    for (const d of w.drifts) {
      if (!inView(d.x, d.y)) continue;
      ctx.beginPath();
      ctx.ellipse(d.x, d.y, d.rx, d.ry, 0, 0, TAU);
      ctx.fill();
    }
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = ICE_EDGE;
    ctx.lineWidth = 40;
    ctx.stroke(w.leftEdge);
    ctx.stroke(w.rightEdge);
    ctx.fillStyle = ICE;
    ctx.fill(w.ice);
    ctx.strokeStyle = 'rgba(95,157,183,0.5)';
    ctx.lineWidth = 4;
    ctx.stroke(w.leftEdge);
    ctx.stroke(w.rightEdge);

    // glints on the ice
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (const g of w.glints) {
      const p = T.pointAt(g.s);
      const x = p.x + p.nx * g.off * p.hw, y = p.y + p.ny * g.off * p.hw;
      if (!inView(x, y)) continue;
      ctx.moveTo(x, y);
      ctx.lineTo(x + p.tx * g.len, y + p.ty * g.len);
    }
    ctx.stroke();

    // slopes: chevrons drifting the way the ice pulls; faint ones for the overall climb
    const drawSlope = (s0, s1, along, across, strong) => {
      ctx.strokeStyle = strong ? 'rgba(95,157,183,0.75)' : 'rgba(95,157,183,0.3)';
      ctx.lineWidth = strong ? 6 : 4;
      const gap = strong ? 90 : 320;
      const shift = (((rg * 40) % gap) + gap) % gap;
      for (let s = s0 + shift * (along || 1); s < s1; s += gap) {
        const p = T.pointAt(s);
        if (!inView(p.x, p.y)) continue;
        const dx = p.tx * along + p.nx * across, dy = p.ty * along + p.ny * across;
        const a = Math.atan2(dy, dx);
        for (const k of strong ? [-0.5, 0, 0.5] : [0]) chevron(ctx, p.x + p.nx * k * p.hw, p.y + p.ny * k * p.hw, a, strong ? 14 : 10);
      }
    };
    if (T.def.uphill) drawSlope(0, T.LENGTH, -1, 0, false);
    for (const sl of T.SLOPES) drawSlope(sl.s0, sl.s1, sl.along, sl.across, true);

    // thin ice: intact, cracked (1) or broken (2)
    const state = new Map((snap && snap.ic) || []);
    T.TILES.forEach((t, i) => {
      if (!inView(t.x, t.y)) return;
      const st = state.get(i) || 0;
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.rotate(t.a);
      const hw = t.len / 2 - 2, hh = t.w / 2 - 2;
      if (st === 2) {
        ctx.fillStyle = HOLE;
        ctx.fillRect(-hw, -hh, 2 * hw, 2 * hh);
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 3;
        dot(ctx, 0, 0, Math.min(hw, hh) * 0.5);
        ctx.stroke();
      } else {
        ctx.fillStyle = THIN;
        ctx.fillRect(-hw, -hh, 2 * hw, 2 * hh);
        ctx.setLineDash([8, 6]);
        ctx.strokeStyle = '#7fb8cf';
        ctx.lineWidth = 3;
        ctx.strokeRect(-hw, -hh, 2 * hw, 2 * hh);
        ctx.setLineDash([]);
        ctx.strokeStyle = '#5f9db7';
        ctx.lineWidth = st ? 4 : 2;
        ctx.beginPath();
        const m = st ? 1 : 0.45;
        for (let k = 0; k < 6; k++) {
          const a = (k * TAU) / 6 + 0.3 + i;
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * hw * m, Math.sin(a) * hh * m);
        }
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  function drawBlock(ctx, r) {
    const p = new Path2D();
    [[-1, -0.7], [0.2, -1], [1, -0.4], [0.8, 0.7], [-0.2, 1], [-1, 0.4]].forEach(([x, y], i) => (i ? p.lineTo(x * r, y * r) : p.moveTo(x * r, y * r)));
    p.closePath();
    ctx.save();
    ctx.translate(6, 8);
    ctx.fillStyle = 'rgba(31,43,46,0.15)';
    ctx.fill(p);
    ctx.restore();
    ctx.fillStyle = '#eaf7fd';
    ctx.fill(p);
    ctx.lineWidth = 4;
    ctx.strokeStyle = INK;
    ctx.stroke(p);
    ctx.strokeStyle = '#9fcfe3';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-0.5 * r, -0.5 * r);
    ctx.lineTo(0.1 * r, -0.1 * r);
    ctx.lineTo(0.6 * r, -0.3 * r);
    ctx.moveTo(0.1 * r, -0.1 * r);
    ctx.lineTo(-0.1 * r, 0.6 * r);
    ctx.stroke();
  }

  function drawPenguin(ctx, t) {
    const flap = Math.sin(t * 8) * 0.25;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(-2, s * 18, 13, 5, s * (0.3 + flap), 0, TAU);
      paint(ctx, '#26303a');
    }
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(-28, s * 6, 6, 4, 0, 0, TAU);
      paint(ctx, '#ff9f1c', 2.5);
    }
    ctx.beginPath();
    ctx.ellipse(0, 0, 26, 15, 0, 0, TAU);
    paint(ctx, '#26303a');
    ctx.beginPath();
    ctx.ellipse(-4, 0, 16, 8, 0, 0, TAU);
    ctx.fillStyle = '#3a4652';
    ctx.fill();
    dot(ctx, 24, 0, 11);
    paint(ctx, '#26303a');
    for (const s of [-1, 1]) {
      dot(ctx, 27, s * 5, 3.5);
      ctx.fillStyle = '#fff';
      ctx.fill();
      dot(ctx, 28.5, s * 5, 1.6);
      ctx.fillStyle = INK;
      ctx.fill();
    }
    ctx.beginPath();
    ctx.moveTo(33, -4);
    ctx.lineTo(43, 0);
    ctx.lineTo(33, 4);
    ctx.closePath();
    paint(ctx, '#ff9f1c', 2);
  }

  // a polar bear seen from above, facing +x; open mouth while charging
  function drawBear(ctx, t, run) {
    const step = run ? Math.sin(t * 18) * 5 : 0;
    for (const [x, s, k] of [[18, -1, 1], [18, 1, -1], [-18, -1, -1], [-18, 1, 1]]) {
      ctx.beginPath();
      ctx.ellipse(x + step * k, s * 20, 8, 6, 0, 0, TAU);
      paint(ctx, '#eef3f6', 2.5);
    }
    ctx.beginPath();
    ctx.ellipse(-4, 0, 30, 20, 0, 0, TAU);
    paint(ctx, '#f7fafc');
    for (const s of [-1, 1]) {
      dot(ctx, 26, s * 10, 5);
      paint(ctx, '#f7fafc', 2.5);
    }
    ctx.beginPath();
    ctx.ellipse(32, 0, 15, 12, 0, 0, TAU);
    paint(ctx, '#f7fafc');
    dot(ctx, 46, 0, 3.5);
    ctx.fillStyle = INK;
    ctx.fill();
    for (const s of [-1, 1]) {
      dot(ctx, 37, s * 5, 1.8);
      ctx.fillStyle = INK;
      ctx.fill();
    }
    if (run) {
      ctx.beginPath();
      ctx.ellipse(42, 0, 3, 5, 0, 0, TAU);
      ctx.fillStyle = '#c0392b';
      ctx.fill();
    }
  }

  function obstacles(ctx, w, { course: T, rg, inView, snap, cam, vw, vh }) {
    for (const r of T.ROCKS) {
      if (!inView(r.x, r.y)) continue;
      ctx.save();
      ctx.translate(r.x, r.y);
      ctx.rotate(r.x * 0.01);
      drawBlock(ctx, r.r * 1.1);
      ctx.restore();
    }
    for (const p of T.barrelsAt(rg)) {
      if (!inView(p.x, p.y)) continue;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(Math.atan2(p.ny * p.dir, p.nx * p.dir));
      drawPenguin(ctx, rg);
      ctx.restore();
    }
    const woke = new Map(((snap && snap.br) || []).map(([i, t0, tx, ty]) => [i, { t0, tx, ty }]));
    T.BEARS.forEach((b, i) => {
      const w = woke.get(i);
      if (!w) {
        if (!inView(b.x, b.y)) return;
        // sitting, facing the course
        const c = T.pointAt(b.s);
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(Math.atan2(c.y - b.y, c.x - b.x));
        drawBear(ctx, rg, false);
        ctx.restore();
        return;
      }
      const line = T.bearLine(b, w.tx, w.ty);
      const p = T.bearAt(b, line, rg - w.t0);
      if (!p) return;
      const a = Math.atan2(line.ey - b.y, line.ex - b.x);
      if (p.warn) {
        ctx.save();
        ctx.setLineDash([18, 14]);
        ctx.strokeStyle = 'rgba(192,57,43,0.75)';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(line.ex, line.ey);
        ctx.stroke();
        ctx.restore();
        // the warning stays on screen even when the bear is not: pinned to the nearest edge
        const mx = vw - 170, my = vh - 170;
        const ix = Math.max(cam.x - mx, Math.min(cam.x + mx, b.x));
        const iy = Math.max(cam.y - my, Math.min(cam.y + my, b.y - 46));
        ctx.font = '400 54px "Bagel Fat One", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.lineWidth = 6;
        ctx.strokeStyle = INK;
        ctx.fillStyle = '#c0392b';
        ctx.strokeText('!', ix, iy);
        ctx.fillText('!', ix, iy);
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(a);
      drawBear(ctx, rg, !p.warn);
      ctx.restore();
    });
  }

  (root.IppoDraw = root.IppoDraw || {}).fiordo = { background: SNOW, build, ground, obstacles };
})(typeof self !== 'undefined' ? self : this);

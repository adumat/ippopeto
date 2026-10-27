// Painter for the map "Fiume": grass, sandy banks, water with current streaks,
// whirlpools, rocks, barrels and crocodiles.
(function (root) {
  'use strict';
  const INK = '#1f2b2e', WATER = '#3fa7b8', BUSH = '#5f8a35', SAND = '#efdda8';
  const WOOD = '#9c6b3d', WOOD_DARK = '#83572f';

  // Banks and water as paths, bushes and current streaks: computed once per course.
  function build(T) {
    const riverPath = new Path2D();
    const leftBank = new Path2D(), rightBank = new Path2D();
    T.PTS.forEach((p, i) => {
      const nx = -p.ty, ny = p.tx;
      const lx = p.x - nx * p.hw, ly = p.y - ny * p.hw;
      if (i === 0) { riverPath.moveTo(lx, ly); leftBank.moveTo(lx, ly); }
      else { riverPath.lineTo(lx, ly); leftBank.lineTo(lx, ly); }
    });
    for (let i = T.PTS.length - 1; i >= 0; i--) {
      const p = T.PTS[i];
      const x = p.x + -p.ty * p.hw, y = p.y + p.tx * p.hw;
      riverPath.lineTo(x, y);
      if (i === T.PTS.length - 1) rightBank.moveTo(x, y); else rightBank.lineTo(x, y);
    }
    riverPath.closePath();

    // bushes on the banks, to convey motion
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const bushes = [];
    for (let s = 0; s < T.LENGTH; s += 70) {
      for (const side of [-1, 1]) {
        if (rnd() < 0.35) continue;
        const p = T.pointAt(s + rnd() * 60);
        const d = p.hw + 70 + rnd() * 320;
        bushes.push({ x: p.x + p.nx * d * side, y: p.y + p.ny * d * side, r: 18 + rnd() * 26 });
      }
    }
    const streaks = [];
    for (let i = 0; i < 420; i++) streaks.push({ s0: rnd() * T.LENGTH, off: rnd() * 1.7 - 0.85, len: 18 + rnd() * 30 });
    return { riverPath, leftBank, rightBank, bushes, streaks };
  }

  function ground(ctx, w, { course: T, rg, inView }) {
    ctx.fillStyle = BUSH;
    for (const b of w.bushes) {
      if (!inView(b.x, b.y)) continue;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = SAND;
    ctx.lineWidth = 70;
    ctx.stroke(w.leftBank);
    ctx.stroke(w.rightBank);
    ctx.fillStyle = WATER;
    ctx.fill(w.riverPath);
    ctx.strokeStyle = 'rgba(31,43,46,0.25)';
    ctx.lineWidth = 6;
    ctx.stroke(w.leftBank);
    ctx.stroke(w.rightBank);

    // current
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (const s of w.streaks) {
      const ss = (((s.s0 - rg * 55) % T.LENGTH) + T.LENGTH) % T.LENGTH;
      const p = T.pointAt(ss);
      const x = p.x + p.nx * s.off * p.hw, y = p.y + p.ny * s.off * p.hw;
      if (!inView(x, y)) continue;
      ctx.moveTo(x, y);
      ctx.lineTo(x - p.tx * s.len, y - p.ty * s.len);
    }
    ctx.stroke();
  }

  function obstacles(ctx, w, { course: T, rg, inView }) {
    // whirlpools
    for (const v of T.VORTICES) {
      if (!inView(v.x, v.y)) continue;
      ctx.fillStyle = 'rgba(31,43,46,0.12)';
      ctx.beginPath();
      ctx.arc(v.x, v.y, v.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 6;
      for (let i = 0; i < 3; i++) {
        const a0 = rg * 2.2 + i * 2.1;
        ctx.beginPath();
        ctx.arc(v.x, v.y, v.r * (0.3 + i * 0.22), a0, a0 + Math.PI * 1.1);
        ctx.stroke();
      }
    }
    // rocks
    for (const r of T.ROCKS) {
      if (!inView(r.x, r.y)) continue;
      ctx.fillStyle = '#8d979b';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#b3bcbf';
      ctx.beginPath();
      ctx.arc(r.x - r.r * 0.3, r.y - r.r * 0.3, r.r * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
    // barrels
    for (const b of T.barrelsAt(rg)) {
      if (!inView(b.x, b.y)) continue;
      ctx.fillStyle = WOOD;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#5a6366';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * 0.62, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = WOOD_DARK;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    // crocodiles
    for (const c of T.crocsAt(rg)) {
      if (!inView(c.x, c.y)) continue;
      drawCroc(ctx, c.x, c.y, c.r, Math.atan2(c.ny * c.dir, c.nx * c.dir), rg);
    }
  }

  function drawCroc(ctx, x, y, r, ang, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    const wag = Math.sin(t * 6) * 0.25;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.5;
    ctx.fillStyle = '#4f7d3c';
    // tail
    ctx.save();
    ctx.translate(-r * 0.9, 0);
    ctx.rotate(wag);
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.35);
    ctx.lineTo(-r * 1.4, 0);
    ctx.lineTo(0, r * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    // body
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.1, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // snout
    ctx.beginPath();
    ctx.roundRect(r * 0.6, -r * 0.32, r * 1.2, r * 0.64, r * 0.3);
    ctx.fill();
    ctx.stroke();
    // teeth
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 4; i++) {
      const px = r * 0.85 + i * r * 0.22;
      for (const sgn of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(px, sgn * r * 0.32);
        ctx.lineTo(px + 4, sgn * (r * 0.32 + 6));
        ctx.lineTo(px + 8, sgn * r * 0.32);
        ctx.fill();
      }
    }
    // eyes
    for (const sgn of [-1, 1]) {
      ctx.fillStyle = '#ffd23f';
      ctx.beginPath();
      ctx.arc(r * 0.45, sgn * r * 0.38, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.fillRect(r * 0.45 - 1, sgn * r * 0.38 - 4, 2, 8);
    }
    ctx.restore();
  }

  (root.IppoDraw = root.IppoDraw || {}).fiume = { background: '#7fa347', build, ground, obstacles };
})(typeof self !== 'undefined' ? self : this);

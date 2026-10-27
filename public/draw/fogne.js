// Painter for the map "Fogne della città": brick walls, greenish water, light from the street
// grates, pipes that drip and fire, intakes, methane clouds, rubber ducks and giant rats.
(function (root) {
  'use strict';
  const INK = '#1f2b2e', GAS = '#c6dc5a';
  const BRICK = '#4a3b33', STONE = '#7d776b', SEWAGE = '#5e6b3a', PIPE = '#6d7266';
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

  let brickPattern = null;
  function bricks(ctx) {
    if (!brickPattern) {
      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 32;
      const g = c.getContext('2d');
      g.fillStyle = BRICK;
      g.fillRect(0, 0, 64, 32);
      g.strokeStyle = 'rgba(0,0,0,0.28)';
      g.lineWidth = 2;
      g.beginPath();
      for (const y of [0, 16]) { g.moveTo(0, y); g.lineTo(64, y); }
      for (const x of [0, 32]) { g.moveTo(x, 0); g.lineTo(x, 16); }
      for (const x of [16, 48]) { g.moveTo(x, 16); g.lineTo(x, 32); }
      g.stroke();
      brickPattern = ctx.createPattern(c, 'repeat');
    }
    return brickPattern;
  }

  function build(T) {
    const canal = new Path2D();
    const leftWall = new Path2D(), rightWall = new Path2D();
    T.PTS.forEach((p, i) => {
      const x = p.x + p.ty * p.hw, y = p.y - p.tx * p.hw;
      if (i === 0) { canal.moveTo(x, y); leftWall.moveTo(x, y); }
      else { canal.lineTo(x, y); leftWall.lineTo(x, y); }
    });
    for (let i = T.PTS.length - 1; i >= 0; i--) {
      const p = T.PTS[i];
      const x = p.x - p.ty * p.hw, y = p.y + p.tx * p.hw;
      canal.lineTo(x, y);
      if (i === T.PTS.length - 1) rightWall.moveTo(x, y); else rightWall.lineTo(x, y);
    }
    canal.closePath();
    let seed = 11;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const grates = [];
    for (let s = 500; s < T.LENGTH; s += 900) grates.push(T.pointAt(s));
    const streaks = [];
    for (let i = 0; i < 420; i++) streaks.push({ s0: rnd() * T.LENGTH, off: rnd() * 1.7 - 0.85, len: 18 + rnd() * 30 });
    return { canal, leftWall, rightWall, grates, streaks };
  }

  function ground(ctx, w, { course: T, rg, inView, cam, vw, vh }) {
    ctx.fillStyle = bricks(ctx);
    ctx.fillRect(cam.x - vw, cam.y - vh, 2 * vw, 2 * vh);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = STONE;
    ctx.lineWidth = 36;
    ctx.stroke(w.leftWall);
    ctx.stroke(w.rightWall);
    ctx.fillStyle = SEWAGE;
    ctx.fill(w.canal);
    ctx.strokeStyle = 'rgba(31,43,46,0.45)';
    ctx.lineWidth = 6;
    ctx.stroke(w.leftWall);
    ctx.stroke(w.rightWall);

    // light from the street grates
    for (const p of w.grates) {
      if (!inView(p.x, p.y)) continue;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(Math.atan2(p.ty, p.tx));
      ctx.fillStyle = 'rgba(255,224,138,0.16)';
      ctx.fillRect(-70, -p.hw, 140, 2 * p.hw);
      ctx.strokeStyle = 'rgba(31,43,46,0.25)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      for (let x = -56; x <= 56; x += 28) { ctx.moveTo(x, -p.hw); ctx.lineTo(x, p.hw); }
      ctx.stroke();
      ctx.restore();
    }

    // current
    ctx.strokeStyle = 'rgba(230,240,200,0.25)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (const s of w.streaks) {
      const ss = (((s.s0 - rg * 45) % T.LENGTH) + T.LENGTH) % T.LENGTH;
      const p = T.pointAt(ss);
      const x = p.x + p.nx * s.off * p.hw, y = p.y + p.ny * s.off * p.hw;
      if (!inView(x, y)) continue;
      ctx.moveTo(x, y);
      ctx.lineTo(x - p.tx * s.len, y - p.ty * s.len);
    }
    ctx.stroke();
  }

  // drawn at a wall point, rotated so +y points into the canal
  function atWall(ctx, m, fn) {
    ctx.save();
    ctx.translate(m.x, m.y);
    ctx.rotate(Math.atan2(m.ny, m.nx) - Math.PI / 2);
    fn();
    ctx.restore();
  }

  function drawPipe(ctx, st, t, reach) {
    if (st.stage === 'drip') {
      ctx.fillStyle = '#9fd0e6';
      for (let j = 0; j < 2; j++) {
        dot(ctx, 0, 14 + ((t * 2 + j / 2) % 1) * 40, 5);
        ctx.fill();
      }
    } else if (st.stage === 'fire') {
      const len = reach * Math.min(1, (st.q - 1) * 6);
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#9fd0e6';
      ctx.lineWidth = 44;
      ctx.beginPath();
      ctx.moveTo(0, 10);
      ctx.lineTo(Math.sin(t * 20) * 4, len);
      ctx.stroke();
      ctx.strokeStyle = '#e8f6fb';
      ctx.lineWidth = 14;
      ctx.stroke();
      ctx.fillStyle = 'rgba(232,246,251,0.85)';
      for (let j = 0; j < 8; j++) {
        const a = (j * TAU) / 8 + t * 4;
        dot(ctx, Math.cos(a) * 34, len + Math.sin(a) * 16, 9);
        ctx.fill();
      }
    }
    ctx.beginPath();
    ctx.roundRect(-30, -34, 60, 46, 8);
    paint(ctx, PIPE, 4);
    ctx.beginPath();
    ctx.ellipse(0, 10, 22, 9, 0, 0, TAU);
    paint(ctx, '#1a1c17', 4);
  }

  function drawIntake(ctx, t, R) {
    ctx.save();
    ctx.setLineDash([14, 16]);
    ctx.lineDashOffset = -t * 60;
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
      const a = Math.PI * (0.12 + (0.76 * i) / 4);
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * R, Math.sin(a) * R);
      ctx.quadraticCurveTo(Math.cos(a + 0.5) * R * 0.5, Math.sin(a + 0.5) * R * 0.5, 0, 14);
      ctx.stroke();
    }
    ctx.restore();
    ctx.beginPath();
    ctx.ellipse(0, 0, 46, 30, 0, 0, Math.PI);
    ctx.closePath();
    paint(ctx, '#0e0f0c', 4);
    ctx.strokeStyle = PIPE;
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (const x of [-27, -9, 9, 27]) {
      ctx.moveTo(x, 2);
      ctx.lineTo(x, Math.sqrt(Math.max(0, 1 - (x / 46) ** 2)) * 30 - 3);
    }
    ctx.stroke();
  }

  function drawMethane(ctx, c, t) {
    for (let j = 0; j < 7; j++) {
      const a = j * 1.3 + t * 0.15, k = 0.35 + 0.45 * ((j * 0.37) % 1);
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = j % 2 ? GAS : '#a9bd47';
      dot(ctx, c.x + Math.cos(a) * c.r * 0.45, c.y + Math.sin(a) * c.r * 0.35, c.r * k * (1 + 0.08 * Math.sin(t * 2 + j)));
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawDuck(ctx, t) {
    ctx.translate(0, Math.sin(t * 3) * 1.5);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    dot(ctx, 0, 0, 24 + Math.sin(t * 3) * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-12, -6);
    ctx.lineTo(-22, 0);
    ctx.lineTo(-12, 6);
    ctx.closePath();
    paint(ctx, '#ffd23f');
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 12, 0, 0, TAU);
    paint(ctx, '#ffd23f');
    dot(ctx, 12, 0, 9);
    paint(ctx, '#ffd23f');
    ctx.beginPath();
    ctx.ellipse(23, 0, 6, 4, 0, 0, TAU);
    paint(ctx, '#ff9f1c', 2.5);
    ctx.fillStyle = INK;
    for (const y of [-4, 4]) {
      dot(ctx, 14, y, 1.8);
      ctx.fill();
    }
  }

  function drawRat(ctx, t) {
    const wag = Math.sin(t * 7) * 0.5;
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(4, 0, 40, 24, 0, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = '#e8a0a8';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-26, 0);
    ctx.quadraticCurveTo(-44, wag * 24, -62, -wag * 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 0, 30, 17, 0, 0, TAU);
    paint(ctx, '#7d8186');
    for (const y of [-12, 12]) {
      dot(ctx, 22, y, 8);
      paint(ctx, '#c9a3a9');
    }
    ctx.beginPath();
    ctx.ellipse(30, 0, 15, 11, 0, 0, TAU);
    paint(ctx, '#7d8186');
    dot(ctx, 45, 0, 4);
    paint(ctx, '#e8a0a8', 2);
    ctx.fillStyle = '#ef4b3f';
    for (const y of [-5, 5]) {
      dot(ctx, 34, y, 2.4);
      ctx.fill();
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (const s of [-1, 1]) {
      ctx.moveTo(42, s * 3);
      ctx.lineTo(54, s * 10);
      ctx.moveTo(42, s * 3);
      ctx.lineTo(55, s * 4);
    }
    ctx.stroke();
  }

  function obstacles(ctx, w, { course: T, rg, inView }) {
    for (const c of T.METHANE) if (inView(c.x, c.y)) drawMethane(ctx, c, rg);
    for (const m of T.INTAKES) if (inView(m.x, m.y)) atWall(ctx, m, () => drawIntake(ctx, rg, m.r * 0.8));
    for (const j of T.JETS) if (inView(j.x, j.y)) atWall(ctx, j, () => drawPipe(ctx, T.jetState(j, rg), rg, 2 * j.hw));
    for (const b of T.barrelsAt(rg)) {
      if (!inView(b.x, b.y)) continue;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(Math.atan2(b.ny * b.dir, b.nx * b.dir));
      drawDuck(ctx, rg + b.x);
      ctx.restore();
    }
    for (const r of T.crocsAt(rg)) {
      if (!inView(r.x, r.y)) continue;
      ctx.save();
      ctx.translate(r.x, r.y);
      ctx.rotate(Math.atan2(r.ny * r.dir, r.nx * r.dir));
      drawRat(ctx, rg);
      ctx.restore();
    }
  }

  (root.IppoDraw = root.IppoDraw || {}).fogne = { background: BRICK, build, ground, obstacles };
})(typeof self !== 'undefined' ? self : this);

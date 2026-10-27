// Painter for the map "Grotta buia": a cave river in the dark. The darkness is a screen-space
// mask with soft holes: around the raft, where gas glows (fading over a few seconds), at the
// mushrooms on the checkpoints and the fireflies on the bends.
(function (root) {
  'use strict';
  const INK = '#1f2b2e';
  const CAVE = '#1d2226', BANK = '#2b3a3f', WATER = '#1d3b47';
  const TAU = Math.PI * 2;
  const GLOW = 180; // radius lit around the raft: a raft and a half
  const GAS_LIGHT = 90, GAS_FADE = 2.5; // a gas cloud lights this far, for this long (s)

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
    const water = new Path2D();
    const leftBank = new Path2D(), rightBank = new Path2D();
    T.PTS.forEach((p, i) => {
      const x = p.x + p.ty * p.hw, y = p.y - p.tx * p.hw;
      if (i === 0) { water.moveTo(x, y); leftBank.moveTo(x, y); }
      else { water.lineTo(x, y); leftBank.lineTo(x, y); }
    });
    for (let i = T.PTS.length - 1; i >= 0; i--) {
      const p = T.PTS[i];
      const x = p.x - p.ty * p.hw, y = p.y + p.tx * p.hw;
      water.lineTo(x, y);
      if (i === T.PTS.length - 1) rightBank.moveTo(x, y); else rightBank.lineTo(x, y);
    }
    water.closePath();
    // mushrooms on both banks of every checkpoint
    const mushrooms = [];
    for (const s of T.CHECKPOINTS) {
      const p = T.pointAt(s);
      for (const side of [-1, 1]) mushrooms.push({ x: p.x + p.nx * side * (p.hw + 30), y: p.y + p.ny * side * (p.hw + 30) });
    }
    // fireflies on the inside of each bend
    const fireflies = [];
    let last = -Infinity;
    for (let s = 300; s < T.LENGTH - 300; s += 100) {
      const a = T.pointAt(s - 250), b = T.pointAt(s + 250);
      const turn = Math.atan2(a.tx * b.ty - a.ty * b.tx, a.tx * b.tx + a.ty * b.ty);
      if (Math.abs(turn) < 0.45 || s - last < 500) continue;
      last = s;
      const p = T.pointAt(s), side = Math.sign(turn);
      for (let k = 0; k < 5; k++) {
        const d = p.hw * (0.55 + 0.1 * k), along = (k - 2) * 60;
        fireflies.push({ x: p.x + p.nx * side * d + p.tx * along, y: p.y + p.ny * side * d + p.ty * along, i: fireflies.length });
      }
    }
    let seed = 17;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const streaks = [];
    for (let i = 0; i < 360; i++) streaks.push({ s0: rnd() * T.LENGTH, off: rnd() * 1.7 - 0.85, len: 18 + rnd() * 30 });
    return { water, leftBank, rightBank, mushrooms, fireflies, streaks, lights: [] };
  }

  function ground(ctx, w, { course: T, rg, inView, cam, vw, vh }) {
    ctx.fillStyle = CAVE;
    ctx.fillRect(cam.x - vw, cam.y - vh, 2 * vw, 2 * vh);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = BANK;
    ctx.lineWidth = 60;
    ctx.stroke(w.leftBank);
    ctx.stroke(w.rightBank);
    ctx.fillStyle = WATER;
    ctx.fill(w.water);
    ctx.strokeStyle = 'rgba(147,163,165,0.35)';
    ctx.lineWidth = 4;
    ctx.stroke(w.leftBank);
    ctx.stroke(w.rightBank);
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    for (const s of w.streaks) {
      const ss = (((s.s0 - rg * 50) % T.LENGTH) + T.LENGTH) % T.LENGTH;
      const p = T.pointAt(ss);
      const x = p.x + p.nx * s.off * p.hw, y = p.y + p.ny * s.off * p.hw;
      if (!inView(x, y)) continue;
      ctx.moveTo(x, y);
      ctx.lineTo(x - p.tx * s.len, y - p.ty * s.len);
    }
    ctx.stroke();
  }

  function drawStalagmite(ctx, x, y, r) {
    dot(ctx, x, y, r);
    paint(ctx, '#4a5b5e', 4);
    ctx.fillStyle = '#6b7d80';
    dot(ctx, x - r * 0.12, y - r * 0.12, r * 0.62);
    ctx.fill();
    ctx.fillStyle = '#93a3a5';
    dot(ctx, x - r * 0.22, y - r * 0.22, r * 0.28);
    ctx.fill();
  }

  function drawBat(ctx, t) {
    const f = 0.35 + 0.65 * Math.abs(Math.sin(t * 14));
    ctx.fillStyle = '#0b0f12';
    ctx.strokeStyle = '#6b7d80';
    ctx.lineWidth = 1.5;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(s * 10, -14 * f, s * 22, -4 * f);
      ctx.quadraticCurveTo(s * 14, 0, s * 18, 6 * f);
      ctx.quadraticCurveTo(s * 8, 2, 0, 4);
      ctx.fill();
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.ellipse(0, 1, 4, 6, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#ffd23f';
    for (const x of [-1.5, 1.5]) {
      dot(ctx, x, -2, 1);
      ctx.fill();
    }
  }
  const hash = (i) => {
    const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  function drawSwarm(ctx, x, y, r, t, n = 12) {
    for (let i = 0; i < n; i++) {
      ctx.save();
      ctx.translate(x + (hash(i) - 0.5) * r * 2 + Math.sin(t * 2 + i) * 8, y + (hash(i + 9) - 0.5) * r * 1.4 + Math.cos(t * 3 + i) * 6);
      ctx.scale(1 + hash(i + 3) * 0.6, 1 + hash(i + 3) * 0.6);
      drawBat(ctx, t + i * 0.1);
      ctx.restore();
    }
  }

  function drawFish(ctx, t) {
    ctx.save();
    ctx.translate(-24, 0);
    ctx.rotate(Math.sin(t * 6) * 0.35);
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.lineTo(-20, -14);
    ctx.lineTo(-16, 0);
    ctx.lineTo(-20, 14);
    ctx.closePath();
    paint(ctx, '#d9d3c7');
    ctx.restore();
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(4, s * 14, 9, 4, s * 0.5, 0, TAU);
      paint(ctx, '#d9d3c7', 2.5);
    }
    ctx.beginPath();
    ctx.ellipse(0, 0, 32, 15, 0, 0, TAU);
    paint(ctx, '#ece6da');
    for (const s of [-1, 1]) {
      dot(ctx, 20, s * 7, 4);
      paint(ctx, '#f7f7f2', 2);
    }
    ctx.fillStyle = '#fff';
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(26, s * 3);
      ctx.lineTo(31, s * 1);
      ctx.lineTo(27, s * 7);
      ctx.fill();
    }
  }

  function drawMushroom(ctx, x, y, t) {
    for (const [dx, dy, r] of [[0, 0, 14], [15, 9, 9], [-13, 11, 8]]) {
      dot(ctx, x + dx, y + dy, r);
      paint(ctx, '#b7f36b', 2.5);
      ctx.fillStyle = '#effcd8';
      dot(ctx, x + dx - r * 0.3, y + dy - r * 0.3, r * 0.28);
      ctx.fill();
    }
  }

  function obstacles(ctx, w, { course: T, rg, inView }) {
    for (const m of w.mushrooms) if (inView(m.x, m.y)) drawMushroom(ctx, m.x, m.y, rg);
    for (const r of T.ROCKS) if (inView(r.x, r.y)) drawStalagmite(ctx, r.x, r.y, r.r);
    for (const c of T.crocsAt(rg)) {
      if (!inView(c.x, c.y)) continue;
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(Math.atan2(c.ny * c.dir, c.nx * c.dir));
      drawFish(ctx, rg);
      ctx.restore();
    }
    for (const b of T.batsAt(rg)) if (inView(b.x, b.y)) drawSwarm(ctx, b.x, b.y, b.r, rg);
  }

  // the darkness, drawn over the world in screen space at half resolution
  let mask = null;
  function overlay(ctx, w, { rg, raft, particles, blind }) {
    const W = ctx.canvas.width, H = ctx.canvas.height, k = 0.5;
    if (!mask) mask = document.createElement('canvas');
    if (mask.width !== Math.ceil(W * k) || mask.height !== Math.ceil(H * k)) {
      mask.width = Math.ceil(W * k);
      mask.height = Math.ceil(H * k);
    }
    const m = ctx.getTransform();
    const scale = Math.hypot(m.a, m.b) * k;
    const now = performance.now() / 1000;
    // every fresh gas puff leaves a light that fades over a few seconds
    for (const p of particles) if (p.age < 0.05) w.lights.push({ x: p.x, y: p.y, t: now });
    while (w.lights.length && now - w.lights[0].t > GAS_FADE) w.lights.shift();
    if (w.lights.length > 400) w.lights.splice(0, w.lights.length - 400);

    const f = mask.getContext('2d');
    f.setTransform(1, 0, 0, 1, 0, 0);
    f.globalCompositeOperation = 'source-over';
    f.clearRect(0, 0, mask.width, mask.height);
    f.fillStyle = 'rgba(4,7,9,0.97)';
    f.fillRect(0, 0, mask.width, mask.height);
    f.globalCompositeOperation = 'destination-out';
    const hole = (x, y, r, a) => {
      const p = m.transformPoint({ x, y });
      const px = p.x * k, py = p.y * k, pr = r * scale;
      if (px < -pr || py < -pr || px > mask.width + pr || py > mask.height + pr) return;
      const g = f.createRadialGradient(px, py, pr * 0.3, px, py, pr);
      g.addColorStop(0, `rgba(0,0,0,${a})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      f.fillStyle = g;
      f.fillRect(px - pr, py - pr, 2 * pr, 2 * pr);
    };
    hole(raft.x, raft.y, GLOW, 1);
    for (const l of w.lights) hole(l.x, l.y, GAS_LIGHT, 0.35 * (1 - (now - l.t) / GAS_FADE));
    for (const mu of w.mushrooms) hole(mu.x, mu.y, 110, 0.75 + 0.15 * Math.sin(rg * 2));
    for (const ff of w.fireflies) hole(ff.x, ff.y, 34, 0.5 + 0.4 * Math.sin(rg * 3 + ff.i * 1.7));
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(mask, 0, 0, W, H);
    // fireflies glow on top of the darkness
    for (const ff of w.fireflies) {
      const p = m.transformPoint({ x: ff.x, y: ff.y });
      const a = 0.5 + 0.5 * Math.sin(rg * 3 + ff.i * 1.7);
      ctx.fillStyle = `rgba(244,255,176,${a})`;
      dot(ctx, p.x, p.y, 3 * (scale / k) + 1);
      ctx.fill();
    }
    // a swarm just hit: bats cover part of every screen for a moment
    if (blind > 0) {
      ctx.globalAlpha = Math.min(1, blind * 2);
      ctx.translate(W / 2, H / 2);
      ctx.scale(W / 260, W / 260);
      drawSwarm(ctx, 0, 0, 120, rg, 26);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  (root.IppoDraw = root.IppoDraw || {}).grotta = { background: CAVE, build, ground, obstacles, overlay };
})(typeof self !== 'undefined' ? self : this);

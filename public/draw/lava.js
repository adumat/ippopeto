// Painter for the map "Fiume di lava": dark rock, rock banks, flowing lava, glowing vents,
// geysers, lava bombs with their growing shadows, volcanic rocks and fire salamanders.
(function (root) {
  'use strict';
  const INK = '#1f2b2e', GAS = '#c6dc5a';
  const ROCK = '#2a1410', BANK = '#4a2a22', LAVA = '#ff6a1a';
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

  function build(T) {
    const lava = new Path2D();
    const leftBank = new Path2D(), rightBank = new Path2D();
    T.PTS.forEach((p, i) => {
      const x = p.x + p.ty * p.hw, y = p.y - p.tx * p.hw;
      if (i === 0) { lava.moveTo(x, y); leftBank.moveTo(x, y); }
      else { lava.lineTo(x, y); leftBank.lineTo(x, y); }
    });
    for (let i = T.PTS.length - 1; i >= 0; i--) {
      const p = T.PTS[i];
      const x = p.x - p.ty * p.hw, y = p.y + p.tx * p.hw;
      lava.lineTo(x, y);
      if (i === T.PTS.length - 1) rightBank.moveTo(x, y); else rightBank.lineTo(x, y);
    }
    lava.closePath();
    let seed = 13;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const cracks = [];
    for (let s = 0; s < T.LENGTH; s += 110) {
      for (const side of [-1, 1]) {
        if (rnd() < 0.5) continue;
        const p = T.pointAt(s + rnd() * 60);
        const d = p.hw + 80 + rnd() * 320;
        cracks.push({ x: p.x + p.nx * d * side, y: p.y + p.ny * d * side, a: rnd() * TAU, k: 0.6 + rnd() * 0.8 });
      }
    }
    const streaks = [];
    for (let i = 0; i < 360; i++) streaks.push({ s0: rnd() * T.LENGTH, off: rnd() * 1.7 - 0.85, len: 20 + rnd() * 30, crust: rnd() < 0.35 });
    return { lava, leftBank, rightBank, cracks, streaks };
  }

  function ground(ctx, w, { course: T, rg, inView, cam, vw, vh }) {
    ctx.fillStyle = ROCK;
    ctx.fillRect(cam.x - vw, cam.y - vh, 2 * vw, 2 * vh);
    ctx.strokeStyle = 'rgba(255,106,26,0.45)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (const c of w.cracks) {
      if (!inView(c.x, c.y)) continue;
      const k = 30 * c.k;
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(c.x + Math.cos(c.a) * k, c.y + Math.sin(c.a) * k);
      ctx.lineTo(c.x + Math.cos(c.a + 0.6) * k * 1.7, c.y + Math.sin(c.a + 0.6) * k * 1.7);
    }
    ctx.stroke();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = BANK;
    ctx.lineWidth = 60;
    ctx.stroke(w.leftBank);
    ctx.stroke(w.rightBank);
    ctx.fillStyle = LAVA;
    ctx.fill(w.lava);
    ctx.strokeStyle = 'rgba(31,43,46,0.5)';
    ctx.lineWidth = 6;
    ctx.stroke(w.leftBank);
    ctx.stroke(w.rightBank);

    // the flow: bright streaks and darker crust drifting downstream
    ctx.lineWidth = 5;
    for (const crust of [false, true]) {
      ctx.strokeStyle = crust ? 'rgba(160,50,10,0.45)' : 'rgba(255,224,138,0.6)';
      ctx.beginPath();
      for (const s of w.streaks) {
        if (s.crust !== crust) continue;
        const ss = (((s.s0 - rg * 30) % T.LENGTH) + T.LENGTH) % T.LENGTH;
        const p = T.pointAt(ss);
        const x = p.x + p.nx * s.off * p.hw, y = p.y + p.ny * s.off * p.hw;
        if (!inView(x, y)) continue;
        ctx.moveTo(x, y);
        ctx.lineTo(x - p.tx * s.len, y - p.ty * s.len);
      }
      ctx.stroke();
    }
  }

  // a glowing pool to drive over: no ink outline, unlike the obstacles
  function drawVent(ctx, v, t) {
    const pulse = 1 + Math.sin(t * 4) * 0.06, R = v.r * 1.1 * pulse;
    const g = ctx.createRadialGradient(v.x, v.y, 2, v.x, v.y, R);
    g.addColorStop(0, '#fff6b0');
    g.addColorStop(0.5, 'rgba(255,210,63,0.85)');
    g.addColorStop(1, 'rgba(255,176,46,0)');
    ctx.fillStyle = g;
    dot(ctx, v.x, v.y, R);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,246,176,0.8)';
    ctx.lineWidth = 3;
    for (let j = 0; j < 6; j++) {
      const q = ph(t, 1.2, j / 6), a = j * 1.9;
      ctx.globalAlpha = 1 - q;
      dot(ctx, v.x + Math.cos(a) * v.r * 0.4, v.y + Math.sin(a) * v.r * 0.3, 3 + q * 9);
      ctx.stroke();
    }
    for (let j = 0; j < 5; j++) {
      const q = ph(t, 1.8, j / 5);
      ctx.globalAlpha = (1 - q) * 0.55;
      ctx.fillStyle = j % 2 ? GAS : '#a9bd47';
      dot(ctx, v.x + Math.sin(j * 2 + t) * 14 * q, v.y - q * 60, 8 + q * 18);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawGeyser(ctx, g, st, t) {
    ctx.save();
    ctx.translate(g.x, g.y);
    ctx.beginPath();
    ctx.ellipse(0, 0, 40, 30, 0, 0, TAU);
    paint(ctx, '#5a3a30', 4);
    ctx.fillStyle = '#ff9f1c';
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 15, 0, 0, TAU);
    ctx.fill();
    if (st.stage === 'build') {
      ctx.fillStyle = '#ffe08a';
      for (let j = 0; j < 6; j++) {
        const b = ph(t, 0.5, j / 6);
        ctx.globalAlpha = 1 - b;
        dot(ctx, Math.cos(j * 1.7) * 14, Math.sin(j * 1.7) * 9, 3 + b * 7);
        ctx.fill();
      }
    } else if (st.stage === 'erupt') {
      const e = Math.sin(((st.q - (g.period - 1)) / 1) * Math.PI), R = 30 + e * g.r * 0.9;
      ctx.globalAlpha = 0.85 * Math.max(0.2, e);
      ctx.fillStyle = '#fff';
      for (let j = 0; j < 10; j++) {
        const a = (j * TAU) / 10 + t;
        dot(ctx, Math.cos(a) * R * 0.5, Math.sin(a) * R * 0.5, R * 0.55);
        ctx.fill();
      }
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawBomb(ctx, b, st, warn, period) {
    ctx.save();
    ctx.translate(b.x, b.y);
    if (st.left < warn) {
      const e = 1 - st.left / warn, r = 14 + e * 46;
      ctx.fillStyle = `rgba(0,0,0,${0.15 + e * 0.4})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * 0.6, 0, 0, TAU);
      ctx.fill();
      // the bomb falls in from above the shadow, growing as it nears
      ctx.translate(0, -(1 - e) * (1 - e) * 220);
      ctx.scale(0.6 + e * 0.8, 0.6 + e * 0.8);
      ctx.strokeStyle = 'rgba(255,159,28,0.7)';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-8, -20);
      ctx.lineTo(-10, -44);
      ctx.moveTo(8, -20);
      ctx.lineTo(10, -40);
      ctx.stroke();
      dot(ctx, 0, 0, 20);
      paint(ctx, '#3a2420', 4);
      ctx.fillStyle = LAVA;
      dot(ctx, -6, -6, 7);
      ctx.fill();
    } else if (period - st.left < 0.4) {
      const e = (period - st.left) / 0.4;
      ctx.globalAlpha = 1 - e;
      ctx.strokeStyle = '#ffe08a';
      ctx.lineWidth = 8;
      dot(ctx, 0, 0, 20 + e * 70);
      ctx.stroke();
      ctx.fillStyle = '#ffb02e';
      for (let j = 0; j < 9; j++) {
        const a = (j * TAU) / 9;
        dot(ctx, Math.cos(a) * (20 + e * 80), Math.sin(a) * (20 + e * 80) * 0.7, 8);
        ctx.fill();
      }
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawRock(ctx, r) {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    paint(ctx, '#2b1a16', 4);
    ctx.fillStyle = '#4a2e27';
    dot(ctx, -r * 0.3, -r * 0.3, r * 0.35);
    ctx.fill();
    ctx.strokeStyle = LAVA;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, r * 0.2);
    ctx.lineTo(0, r * 0.05);
    ctx.lineTo(r * 0.3, r * 0.5);
    ctx.moveTo(0, r * 0.05);
    ctx.lineTo(r * 0.45, -r * 0.3);
    ctx.stroke();
  }

  // a fire salamander seen from above, facing +x
  function drawSalamander(ctx, r, t) {
    const wag = Math.sin(t * 7) * 0.4;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.fillStyle = '#ef4b3f';
    // tail
    ctx.save();
    ctx.translate(-r * 0.9, 0);
    ctx.rotate(wag);
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.25);
    ctx.quadraticCurveTo(-r * 0.9, wag * r * 0.5, -r * 1.5, 0);
    ctx.quadraticCurveTo(-r * 0.9, -wag * r * 0.2, 0, r * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    // legs
    for (const [x, s] of [[r * 0.5, -1], [r * 0.5, 1], [-r * 0.5, -1], [-r * 0.5, 1]]) {
      ctx.beginPath();
      ctx.ellipse(x + Math.sin(t * 9 + x) * 4, s * r * 0.55, r * 0.22, r * 0.12, s * 0.6, 0, TAU);
      paint(ctx, '#ef4b3f', 2.5);
    }
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.05, r * 0.42, 0, 0, TAU);
    paint(ctx, '#ef4b3f');
    ctx.beginPath();
    ctx.ellipse(r * 1.05, 0, r * 0.42, r * 0.34, 0, 0, TAU);
    paint(ctx, '#ef4b3f');
    ctx.fillStyle = '#ffd23f';
    for (const [x, y] of [[-r * 0.5, -0.1], [0, 0.12], [r * 0.45, -0.12]]) {
      dot(ctx, x, y * r, r * 0.13);
      ctx.fill();
    }
    for (const s of [-1, 1]) {
      dot(ctx, r * 1.15, s * r * 0.18, 4);
      paint(ctx, '#ffd23f', 2);
    }
  }

  function obstacles(ctx, w, { course: T, rg, inView }) {
    for (const v of T.VENTS) if (inView(v.x, v.y)) drawVent(ctx, v, rg);
    for (const g of T.GEYSERS) if (inView(g.x, g.y)) drawGeyser(ctx, g, T.geyserState(g, rg), rg);
    for (const r of T.ROCKS) {
      if (!inView(r.x, r.y)) continue;
      ctx.save();
      ctx.translate(r.x, r.y);
      drawRock(ctx, r.r);
      ctx.restore();
    }
    for (const c of T.crocsAt(rg)) {
      if (!inView(c.x, c.y)) continue;
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(Math.atan2(c.ny * c.dir, c.nx * c.dir));
      drawSalamander(ctx, c.r, rg);
      ctx.restore();
    }
    // bombs last: they fall from above everything
    for (const b of T.BOMBS) if (inView(b.x, b.y)) drawBomb(ctx, b, T.bombState(b, rg), T.BOMB_WARN, b.period);
  }

  (root.IppoDraw = root.IppoDraw || {}).lava = { background: ROCK, build, ground, obstacles };
})(typeof self !== 'undefined' ? self : this);

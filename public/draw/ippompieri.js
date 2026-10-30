// The Ippompieri mode's firefighters: chibi hippo-headed figures standing upright on the
// vehicle, seen from the front. Units are "chibi units" with the feet at the origin and the
// tool pointing out to +x; the caller flips the figure so the tool faces the push direction.
(function (root) {
  'use strict';
  const INK = '#1f2b2e', SKIN = '#9a8592', PANTS = '#a08a4a', BOOT = '#2a2023';
  const RED = '#c0392b', RED_DARK = '#8e2a20', GOLD = '#e8b923';
  // tools held at the crotch, pointing out and a little up
  const CROTCH = { x: 3, y: -17, ang: -0.5, k: 1.7 };
  const TOOL_LENGTH = { gun: 40, lance: 38 };
  // one chibi unit on screen, at scale 1
  const UNIT = 0.45;

  function shade(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    const f = (v) => Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k));
    return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map((v) => v.toString(16).padStart(2, '0')).join('');
  }
  function grad(c, col, x, y, r) {
    const g = c.createRadialGradient(x - r * 0.3, y - r * 0.4, r * 0.1, x, y, r);
    g.addColorStop(0, shade(col, 0.3));
    g.addColorStop(1, shade(col, -0.2));
    return g;
  }
  function ell(c, x, y, rx, ry, fill) {
    c.beginPath();
    c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    c.fillStyle = fill;
    c.fill();
    c.stroke();
  }

  // the tool's tip in chibi units, where the jet starts
  function tip(tool) {
    const L = TOOL_LENGTH[tool] * CROTCH.k;
    return [CROTCH.x + Math.cos(CROTCH.ang) * L, CROTCH.y + Math.sin(CROTCH.ang) * L];
  }

  function brassTube(c, x0, x1, w0, w1) {
    const g = c.createLinearGradient(0, -w0, 0, w0);
    g.addColorStop(0, '#fbe38a');
    g.addColorStop(0.5, GOLD);
    g.addColorStop(1, '#9c7410');
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(x0, -w0);
    c.lineTo(x1, -w1);
    c.lineTo(x1, w1);
    c.lineTo(x0, w0);
    c.closePath();
    c.fill();
    c.stroke();
  }

  function drawTool(c, tool, col, pumping, t) {
    const L = TOOL_LENGTH[tool];
    c.save();
    c.translate(CROTCH.x, CROTCH.y);
    c.rotate(CROTCH.ang);
    c.scale(CROTCH.k, CROTCH.k);
    c.lineWidth = 3 / CROTCH.k;
    if (tool === 'lance') {
      // the hose comes out of the fly, then a long brass lance
      c.save();
      c.lineWidth = 9;
      c.beginPath();
      c.moveTo(-4, 1);
      c.quadraticCurveTo(2, 4, 8, 0);
      c.stroke();
      c.strokeStyle = '#7d2b22';
      c.lineWidth = 6;
      c.stroke();
      c.restore();
      brassTube(c, 6, L - 4, 4.5, 3);
      c.fillStyle = BOOT;
      c.beginPath();
      c.roundRect(12, -5.5, 5, 11, 1.5);
      c.fill();
      c.stroke();
      brassTube(c, L - 5, L, 4.2, 4.2);
    } else {
      // a pump-action water gun in the player colour, its clear tank on top
      const pump = pumping ? 3 * Math.sin(t * 14) : 0;
      c.fillStyle = grad(c, col, 14, -2, 20);
      c.beginPath();
      c.roundRect(0, -5, L - 6, 10, 4);
      c.fill();
      c.stroke();
      c.fillStyle = 'rgba(160,220,255,0.85)';
      c.beginPath();
      c.ellipse(16, -11, 10, 7, 0, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.7)';
      c.beginPath();
      c.ellipse(13, -13, 4, 1.8, -0.3, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = shade(col, -0.3);
      c.beginPath();
      c.roundRect(20 + pump, 4, 12, 6, 2);
      c.fill();
      c.stroke();
      c.fillStyle = BOOT;
      c.beginPath();
      c.roundRect(L - 8, -3, 8, 6, 1.5);
      c.fill();
      c.stroke();
      c.beginPath();
      c.roundRect(2, 3, 6, 10, 2);
      c.fill();
      c.stroke();
    }
    c.restore();
  }

  // One firefighter. `o`: { col, tool: 'gun' | 'lance', captain, pumping, stained, t }.
  // Draws in chibi units with the feet at the origin; the caller scales and flips.
  function figure(c, o) {
    const col = o.col, captain = !!o.captain;
    c.lineJoin = 'round';
    c.lineCap = 'round';
    c.strokeStyle = INK;
    c.lineWidth = 4;
    const tw = captain ? 34 : 29, th = 23, ty = -31;
    // legs and boots
    for (const x of [-9, 9]) {
      c.fillStyle = shade(PANTS, -0.15);
      c.beginPath();
      c.roundRect(x - 7, -16, 14, 10, 4);
      c.fill();
      c.stroke();
      c.fillStyle = BOOT;
      c.beginPath();
      c.roundRect(x - 8, -9, 16, 9, 4);
      c.fill();
      c.stroke();
    }
    // a V-shaped bare torso
    c.beginPath();
    c.moveTo(-tw + 4, ty - 18);
    c.quadraticCurveTo(0, ty - 22, tw - 4, ty - 18);
    c.bezierCurveTo(tw + 2, ty - 10, tw - 2, ty + 6, 12, ty + th);
    c.lineTo(-12, ty + th);
    c.bezierCurveTo(-tw + 2, ty + 6, -tw - 2, ty - 10, -tw + 4, ty - 18);
    c.fillStyle = grad(c, SKIN, 0, ty, tw + 4);
    c.fill();
    c.save();
    c.clip();
    // pecs and a six-pack, each a lit shape with a darker rim
    c.strokeStyle = shade(SKIN, -0.4);
    c.lineWidth = 2;
    const pw = tw * 0.36;
    for (const s of [-1, 1]) {
      c.beginPath();
      c.moveTo(s * 1.5, ty - 14);
      c.quadraticCurveTo(s * (pw * 2.2), ty - 16, s * (pw * 2.1), ty - 6);
      c.quadraticCurveTo(s * pw * 1.2, ty + 1, s * 1.5, ty - 2);
      c.closePath();
      c.fillStyle = grad(c, SKIN, s * pw, ty - 9, pw * 1.6);
      c.fill();
      c.stroke();
    }
    for (let r = 0; r < 3; r++) {
      for (const s of [-1, 1]) {
        c.beginPath();
        c.roundRect(s > 0 ? 1 : -9, ty + 2 + r * 6.5, 8, 5.4, 2);
        c.fillStyle = grad(c, SKIN, s * 4, ty + 3 + r * 6.5, 5);
        c.fill();
        c.stroke();
      }
    }
    // a tuft of chest hair and the oiled shine
    c.strokeStyle = '#3b2b2f';
    c.lineWidth = 1.3;
    for (let i = 0; i < 12; i++) {
      const x = ((i * 37) % 6) - 3, y = ty - 14 + ((i * 53) % 10);
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + ((i % 3) - 1) * 1.5, y + 3);
      c.stroke();
    }
    c.fillStyle = 'rgba(255,255,255,0.75)';
    for (const [x, y, rx, ry, rot] of [[-tw * 0.45, ty - 11, 4.5, 1.5, -0.5], [tw * 0.3, ty - 12, 3.5, 1.2, 0.4], [-3, ty + 3, 1.6, 0.8, 0], [4.5, ty + 9, 1.6, 0.8, 0]]) {
      c.beginPath();
      c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
      c.fill();
    }
    // the peto vestito, as foam over the chest
    if (o.stained) {
      c.fillStyle = '#ffffff';
      for (const [x, y, r] of [[-8, ty - 4, 7], [3, ty + 6, 8], [10, ty - 8, 5]]) {
        c.beginPath();
        c.arc(x, y, r, 0, Math.PI * 2);
        c.fill();
      }
    }
    c.restore();
    c.strokeStyle = INK;
    c.lineWidth = 4;
    c.stroke();
    // arms down to the tool, both hands on it
    const u = [Math.cos(CROTCH.ang), Math.sin(CROTCH.ang)];
    const hands = [[CROTCH.x - 2, CROTCH.y + 3], [CROTCH.x + u[0] * 12, CROTCH.y + u[1] * 12 + 3]];
    const limb = (pts) => {
      c.beginPath();
      pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
      c.strokeStyle = INK;
      c.lineWidth = 12;
      c.stroke();
      c.strokeStyle = SKIN;
      c.lineWidth = 8;
      c.stroke();
      c.strokeStyle = INK;
      c.lineWidth = 4;
    };
    limb([[-(tw - 3), ty - 12], [-(tw + 1), ty + 6], hands[0]]);
    limb([[tw - 3, ty - 12], [tw + 4, ty + 4], hands[1]]);
    for (const s of [-1, 1]) ell(c, s * (tw - 3), ty - 13, 8.5, 8, grad(c, SKIN, s * (tw - 3), ty - 13, 9));
    // braces with gold clips: the player colour, red for the captain
    const brace = captain ? RED : col;
    for (const [w, stroke] of [[6, INK], [3.5, brace]]) {
      c.lineWidth = w;
      c.strokeStyle = stroke;
      for (const s of [-1, 1]) {
        c.beginPath();
        c.moveTo(s * 11, ty - th + 2);
        c.lineTo(s * 9, -12);
        c.stroke();
      }
    }
    c.strokeStyle = INK;
    c.lineWidth = 1.5;
    c.fillStyle = GOLD;
    for (const s of [-1, 1]) {
      c.beginPath();
      c.rect(s * 9 - 2.5, -15, 5, 5);
      c.fill();
      c.stroke();
    }
    c.lineWidth = 4;
    drawTool(c, o.tool, col, o.pumping, o.t || 0);
    for (const [x, y] of hands) ell(c, x, y, 5.5, 5, grad(c, SKIN, x, y, 6));
    // the hippo head: wide muzzle, eyes and ears on top
    const hy = ty - th - 22;
    ell(c, 0, hy, 28, 26, grad(c, SKIN, 0, hy, 30));
    ell(c, 0, hy + 12, 24, 15, grad(c, SKIN, 0, hy + 14, 22));
    c.fillStyle = 'rgba(230,150,165,0.55)';
    c.beginPath();
    c.ellipse(0, hy + 14, 17, 9, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = INK;
    for (const s of [-1, 1]) {
      c.beginPath();
      c.ellipse(s * 8, hy + 9, 3, 2, s * 0.4, 0, Math.PI * 2);
      c.fill();
    }
    if (captain) {
      c.fillStyle = '#3b2b2f';
      for (const s of [-1, 1]) {
        c.beginPath();
        c.moveTo(0, hy + 15);
        c.quadraticCurveTo(s * 14, hy + 10, s * 22, hy + 18);
        c.quadraticCurveTo(s * 12, hy + 18, 0, hy + 19);
        c.fill();
        c.stroke();
      }
    } else {
      c.beginPath();
      c.moveTo(-10, hy + 20);
      c.quadraticCurveTo(0, hy + 24, 10, hy + 20);
      c.stroke();
    }
    for (const s of [-1, 1]) {
      ell(c, s * 11, hy - 8, 5, 6, '#fff');
      c.fillStyle = INK;
      c.beginPath();
      if (o.tired) c.rect(s * 11 - 4, hy - 8, 8, 2);
      else c.arc(s * 11 + 1, hy - 7, 2.6, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = SKIN;
      c.beginPath();
      c.ellipse(s * 11, hy - 11, 6, 3.5, 0, Math.PI, Math.PI * 2);
      c.fill();
      c.stroke();
      ell(c, s * 24, hy - 18, 5, 6, shade(SKIN, -0.1));
    }
    // the helmet, with a C on the captain's shield
    c.save();
    c.translate(0, hy - 18);
    c.fillStyle = RED_DARK;
    c.beginPath();
    c.ellipse(0, 0, 31, 7, 0, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    c.fillStyle = grad(c, RED, 0, -12, 22);
    c.beginPath();
    c.moveTo(-22, -2);
    c.quadraticCurveTo(-22, -28, 0, -28);
    c.quadraticCurveTo(22, -28, 22, -2);
    c.closePath();
    c.fill();
    c.stroke();
    c.fillStyle = GOLD;
    c.beginPath();
    c.roundRect(-6, -18, 12, 14, 3);
    c.fill();
    c.stroke();
    if (captain) {
      if (c.getTransform().a < 0) c.scale(-1, 1);
      c.fillStyle = '#fff';
      c.font = '700 9px sans-serif';
      c.textAlign = 'center';
      c.fillText('C', 0, -8);
    }
    c.restore();
  }

  // Draws a firefighter with the feet at (x, y) in the current transform; `jetRight` puts the
  // tool on the right. Returns the tool tip's position in the same coordinates.
  function draw(c, x, y, scale, jetRight, o) {
    const k = scale * UNIT;
    c.save();
    c.translate(x, y);
    c.scale(jetRight ? k : -k, k);
    figure(c, o);
    c.restore();
    return tipAt(x, y, scale, jetRight, o.tool);
  }
  function tipAt(x, y, scale, jetRight, tool) {
    const k = scale * UNIT;
    const [tx, ty] = tip(tool);
    return [x + (jetRight ? tx : -tx) * k, y + ty * k];
  }
  // height above the feet, for name labels
  const height = (scale) => 125 * scale * UNIT;

  root.IppoFirefighters = { draw, tipAt, height };
})(typeof self !== 'undefined' ? self : this);

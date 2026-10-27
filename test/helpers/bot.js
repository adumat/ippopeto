'use strict';
// The reference crew from the original tuning: steers to a point 300 px ahead on the
// centre line and dodges the first obstacle within 550 px. The ~120 s difficulty target
// was calibrated against exactly this logic, so keep it unchanged.
const { Room } = require('../../server/game.js');
const { seeded } = require('./rng.js');

function runCrew({ players, smart = true, maxSeconds = 400, seed = 1, map = 'fiume' }) {
  const room = new Room('bot', { random: seeded(seed) });
  room.useMap(map, seed);
  room.resetRun();
  const events = [];
  room.flush = function flush() {
    for (const e of this.events) if (e.k !== 'bump') events.push({ ...e, at: this.time });
    this.events = [];
  };
  for (let i = 0; i < players; i++) {
    const c = { id: `c${i}`, ws: { readyState: 0 }, seat: null };
    room.addClient(c);
    room.join(c, `bot${i}`);
  }
  room.start();
  const T = room.course;
  let steps = 0;
  let fartOn = true;
  while (room.status !== 'finished' && steps < 60 * maxSeconds) {
    const R = room.raft;
    const c = T.closest(R.x, R.y);
    const tp = T.pointAt(c.s + 300);
    let off = 0;
    const obs = [...T.ROCKS, ...T.barrelsAt(room.gt), ...T.crocsAt(room.gt)];
    for (const o of obs) {
      const oc = T.closest(o.x, o.y);
      if (oc.s > c.s - 50 && oc.s < c.s + 550) {
        const lat = (o.x - oc.cx) * -oc.ty + (o.y - oc.cy) * oc.tx;
        const left = lat - o.r - -oc.hw;
        const right = oc.hw - (lat + o.r);
        off = right > left ? (lat + o.r + oc.hw) / 2 : (lat - o.r - oc.hw) / 2;
        break;
      }
    }
    const tgt = { x: tp.x + tp.nx * off, y: tp.y + tp.ny * off };
    let dx = tgt.x - R.x, dy = tgt.y - R.y;
    const d = Math.hypot(dx, dy);
    dx /= d;
    dy /= d;
    const cos = Math.cos(-R.a), sin = Math.sin(-R.a);
    const lx = dx * cos - dy * sin, ly = dx * sin + dy * cos;
    const minGas = Math.min(...room.seats.filter(Boolean).map((s) => s.gas));
    if (smart) {
      if (minGas < 5) fartOn = false;
      if (minGas > 60) fartOn = true;
    }
    for (const s of room.seats) {
      if (!s) continue;
      s.aim = Math.atan2(-ly, -lx);
      s.fartHeld = smart ? fartOn : true;
    }
    room.step(1 / 60);
    steps++;
  }
  const s = T.closest(room.raft.x, room.raft.y).s;
  return {
    status: room.status,
    time: room.time,
    progress: s / T.LENGTH,
    bites: room.bites,
    sync: room.time > 0 ? room.syncTime / room.time : 0,
    sharts: room.sharts,
    checkpoints: events.filter((e) => e.k === 'cp').map((e) => e.i),
    events,
  };
}

module.exports = { runCrew };

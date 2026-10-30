'use strict';
// The reference crew from the original tuning: steers to a point 300 px ahead on the
// centre line and dodges the first obstacle within 550 px. The ~120 s difficulty target
// was calibrated against exactly this logic, so keep it unchanged.
const { Room } = require('../../server/game.js');
const Track = require('../../public/track.js');
const { seeded } = require('./rng.js');

function runCrew({ players, smart = true, maxSeconds = 400, seed = 1, map = 'fiume', ippo = false }) {
  const room = new Room('bot', { random: seeded(seed) });
  room.useMap(map, seed);
  room.ippo = ippo;
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
    // a map may ask for a longer look-ahead (a sled must set up its bends early)
    const tp = T.pointAt(c.s + ((T.def.bot && T.def.bot.lookAhead) || 300));
    let off = 0;
    // a bomb whose shadow is showing is dodged like any obstacle
    const bombs = (T.BOMBS || []).filter((b) => T.bombState(b, room.gt).left < T.BOMB_WARN).map((b) => ({ x: b.x, y: b.y, r: 60 }));
    const obs = [...T.ROCKS, ...T.barrelsAt(room.gt), ...T.crocsAt(room.gt), ...T.batsAt(room.gt), ...T.cometsAt(room.gt), ...bombs];
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
    // stuck in snow, the crew pushes in strokes: all together, then all letting go
    const stroking = room.snow && room.snow.stuck;
    // Map hints for the Stelle: ease off before a sharp bend with no rails, and push all
    // together on the run-up to a ramp.
    const hint = T.def.bot || {};
    let override = null;
    if (hint.brakeBends) {
      const ahead = T.pointAt(c.s + 450);
      const turn = Math.abs(Math.atan2(c.tx * ahead.ty - c.ty * ahead.tx, c.tx * ahead.tx + c.ty * ahead.ty));
      if (turn > 1 && Math.hypot(R.vx, R.vy) > hint.brakeBends && !T.railedAt(c.s)) override = false;
    }
    if (hint.rampRunUp && T.HOLES.some((h) => c.s > h.r0 - hint.rampRunUp && c.s < h.s0)) override = true;
    // A sled cannot slide sideways, and equal pushes cancel each other's turn: to turn, only
    // the hippos on the outside of the turn push, all straight back.
    const sled = T.def.vehicle === 'sled';
    const err = Math.atan2(lx, -ly);
    const seatPos = Track.seatPositions(room.seats.length);
    room.seats.forEach((s, i) => {
      if (!s) return;
      const pushing = stroking ? steps % 30 < 15 : override !== null ? override : smart ? fartOn : true;
      if (sled && !stroking) {
        s.aim = Math.PI / 2;
        const x = seatPos[i][0];
        s.fartHeld = pushing && (Math.abs(err) < 0.12 || (err > 0 ? x < 0 : x > 0));
      } else {
        s.aim = Math.atan2(-ly, -lx);
        s.fartHeld = pushing;
      }
    });
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

'use strict';
// A turbo pad pushes the saucer forward along the track for 1 s.
const PAD = 60; // reach of a pad from its centre
const BOOST = 450; // px/s^2
const LAST = 1;

module.exports = {
  onRespawn(room) {
    room.boostUntil = 0;
  },
  force(room, dt) {
    if (room.air) return;
    const R = room.raft, C = room.course;
    if (C.TURBOS.some((p) => Math.hypot(p.x - R.x, p.y - R.y) < PAD)) {
      if (!(room.boostUntil > room.gt)) room.events.push({ k: 'turbo' });
      room.boostUntil = room.gt + LAST;
    }
    if (!(room.boostUntil > room.gt)) return;
    const c = C.closest(R.x, R.y);
    R.vx += c.tx * BOOST * dt;
    R.vy += c.ty * BOOST * dt;
  },
};

'use strict';
// A saucer crossing a ramp at jump speed or faster takes off: in the air it keeps its momentum
// and ignores pushes (`room.air`, honoured by game.js) until it lands. Slower, it rolls on
// into the hole in front of the ramp.
const JUMP_SPEED = 260; // px/s along the track
const LAND_PAST = 150; // a jump at jump speed or faster lands at least this far past the hole
const AIRTIME = [0.6, 1.5]; // s

module.exports = {
  JUMP_SPEED,
  onRespawn(room) {
    room.air = null;
  },
  force(room) {
    const R = room.raft, C = room.course;
    if (room.air) {
      if (room.gt - room.air.t0 >= room.air.T) room.air = null;
      return;
    }
    const c = C.closest(R.x, R.y);
    const hole = C.HOLES.find((h) => c.s >= h.r0 && c.s < h.s0);
    if (!hole) return;
    const along = R.vx * c.tx + R.vy * c.ty;
    if (along < JUMP_SPEED) return;
    const T = Math.max(AIRTIME[0], Math.min(AIRTIME[1], (hole.s1 - c.s + LAND_PAST) / along));
    room.air = { t0: room.gt, T };
    room.events.push({ k: 'jump' });
  },
  // the height above the track while airborne: a parabola peaking mid-flight
  snapshot(room) {
    if (!room.air) return {};
    const q = (room.gt - room.air.t0) / room.air.T;
    return { z: Math.round(4 * 120 * room.air.T * q * (1 - q)) };
  },
};

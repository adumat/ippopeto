'use strict';
// Intakes pull the vehicle towards their mouth, harder the closer it gets, without spinning
// it. Touching the mouth sucks it away: it reappears 600 px back down the canal.
const Track = require('../../public/track.js');

const SEND_BACK = 600;
const MOUTH = 30; // reach of the mouth beyond the vehicle's edge

module.exports = {
  force(room, dt) {
    const R = room.raft, C = room.course;
    for (const m of C.INTAKES) {
      const dx = m.x - R.x, dy = m.y - R.y;
      const d = Math.hypot(dx, dy);
      if (d >= m.r || d < 1) continue;
      const a = m.k * (1 - d / m.r) * 2;
      R.vx += (dx / d) * a * dt;
      R.vy += (dy / d) * a * dt;
    }
  },
  collide(room) {
    const R = room.raft, C = room.course;
    for (const m of C.INTAKES) {
      if (Math.hypot(m.x - R.x, m.y - R.y) > Track.RAFT_R + MOUTH) continue;
      room.events.push({ k: 'suck' });
      room.respawn(Math.max(C.START_S, C.closest(R.x, R.y).s - SEND_BACK));
      return;
    }
  },
};

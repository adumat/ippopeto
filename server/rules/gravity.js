'use strict';
// Planets beside the track pull the saucer towards themselves, and so towards the edge.
module.exports = {
  force(room, dt) {
    if (room.air) return;
    const R = room.raft;
    for (const p of room.course.PLANETS) {
      const dx = p.x - R.x, dy = p.y - R.y;
      const d = Math.hypot(dx, dy);
      if (d >= p.reach) continue;
      const a = p.pull * (1 - d / p.reach);
      R.vx += (dx / d) * a * dt;
      R.vy += (dy / d) * a * dt;
    }
  },
};

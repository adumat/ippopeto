'use strict';
// Off an edge with no rail, or over a hole, a saucer that is not flying falls into the void
// and reappears at the last checkpoint.
module.exports = {
  collide(room) {
    if (room.air) return;
    const R = room.raft, C = room.course;
    const c = C.closest(R.x, R.y);
    if (C.holeAt(c.s) || (!C.railedAt(c.s) && c.dist > c.hw)) {
      room.sendBack('void', { k: 'void', x: Math.round(R.x), y: Math.round(R.y), a: Math.round(R.a * 100) / 100 });
    }
  },
};

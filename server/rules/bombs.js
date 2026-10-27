'use strict';
// Lava bombs land on a timetable; a raft under one at impact goes back to the last checkpoint.
const Track = require('../../public/track.js');

const SPLASH = 60; // radius of the impact

module.exports = {
  collide(room) {
    const R = room.raft, C = room.course;
    room.bombSeen = room.bombSeen || new Map();
    for (const b of C.BOMBS) {
      const n = C.bombState(b, room.gt).n;
      const seen = room.bombSeen.get(b);
      room.bombSeen.set(b, n);
      // the impact numbered `seen` happened during this step
      if (seen === undefined || n === seen) continue;
      if (Math.hypot(b.x - R.x, b.y - R.y) < SPLASH + Track.RAFT_R) {
        room.sendBack('bomb', { k: 'bomb' });
        return;
      }
    }
  },
};

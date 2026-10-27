'use strict';
// An erupting geyser throws a raft within its column towards the far bank, once per eruption.
const Track = require('../../public/track.js');

const KICK = 520; // px/s

module.exports = {
  collide(room) {
    const R = room.raft, C = room.course;
    room.geyserHits = room.geyserHits || new Map();
    for (const g of C.GEYSERS) {
      const st = C.geyserState(g, room.gt);
      if (st.stage !== 'erupt' || room.geyserHits.get(g) === st.n) continue;
      if (Math.hypot(g.x - R.x, g.y - R.y) > g.r + Track.RAFT_R * 0.6) continue;
      room.geyserHits.set(g, st.n);
      R.vx -= g.nx * g.side * KICK;
      R.vy -= g.ny * g.side * KICK;
      R.w += g.side * 1.2;
      room.events.push({ k: 'geyser' });
    }
  },
};

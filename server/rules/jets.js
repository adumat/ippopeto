'use strict';
// Pipes in the walls fire across the canal: a vehicle in the jet is thrown away from the
// pipe once per firing, and every screen gets green splashes.
const Track = require('../../public/track.js');

const KICK = 600; // px/s, about three times a typical bank bounce
const HALF_WIDTH = 24; // half the jet's width along the course

module.exports = {
  collide(room) {
    const R = room.raft, C = room.course;
    room.jetHits = room.jetHits || new Map();
    for (const j of C.JETS) {
      const st = C.jetState(j, room.gt);
      if (st.stage !== 'fire' || room.jetHits.get(j) === st.n) continue;
      const along = (R.x - j.x) * j.tx + (R.y - j.y) * j.ty;
      if (Math.abs(along) > HALF_WIDTH + Track.RAFT_R * 0.8) continue;
      room.jetHits.set(j, st.n);
      R.vx += j.nx * KICK;
      R.vy += j.ny * KICK;
      R.w += j.side * 1.5;
      room.events.push({ k: 'jet', x: Math.round(R.x), y: Math.round(R.y) });
    }
  },
};

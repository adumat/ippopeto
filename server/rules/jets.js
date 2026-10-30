'use strict';
// Pipes in the walls fire across the canal: a vehicle in the jet is thrown away from the
// pipe and into a spin, once per firing, and every screen gets green splashes. The canal is
// narrow, so the throw is meant to bounce it off the far wall.
const Track = require('../../public/track.js');

const KICK = 800; // px/s across the canal, away from the pipe
const SPIN = 4; // rad/s, about 90° before the spin dies out
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
      R.w += j.side * SPIN;
      room.events.push({ k: 'jet', x: Math.round(R.x), y: Math.round(R.y) });
    }
  },
};

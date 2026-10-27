'use strict';
// The sled goes where its runners point: velocity across the runners is removed every step.
// (Turning at half the raft's rate is the vehicle's `turn` factor in game.js.)
// Right after hitting something the runners let go for a moment, so a sled glances off an
// obstacle instead of wedging against it.
const GLANCE = 0.4; // s

module.exports = {
  force(room) {
    if (room.snow && room.snow.stuck) return;
    if (room.contactAt !== undefined && room.gt - room.contactAt < GLANCE) return;
    const R = room.raft;
    const hx = Math.sin(R.a), hy = -Math.cos(R.a);
    const along = R.vx * hx + R.vy * hy;
    R.vx = hx * along;
    R.vy = hy * along;
  },
};

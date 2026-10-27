'use strict';
// Tilted stretches push the vehicle with a constant acceleration. A sideways slope also swings
// a sled's nose downhill, since its runners will not let it slide sideways.
const SWING = 0.02; // rad/s^2 of yaw per px/s^2 of slope, when the sled is square to it

module.exports = {
  force(room, dt) {
    if (room.snow && room.snow.stuck) return;
    const R = room.raft, C = room.course;
    const c = C.closest(R.x, R.y);
    // outside the listed stretches the course climbs gently: `uphill` pulls back to the start
    const sl = C.SLOPES.find((x) => c.s >= x.s0 && c.s < x.s1) || (C.def.uphill && { along: -1, across: 0, acc: C.def.uphill });
    if (!sl) return;
    const nx = -c.ty, ny = c.tx;
    const dx = c.tx * sl.along + nx * sl.across, dy = c.ty * sl.along + ny * sl.across;
    R.vx += dx * sl.acc * dt;
    R.vy += dy * sl.acc * dt;
    if (sl.across) {
      const hx = Math.sin(R.a), hy = -Math.cos(R.a);
      R.w += (hx * dy - hy * dx) * sl.acc * SWING * dt;
    }
  },
};

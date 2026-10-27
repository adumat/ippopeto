'use strict';
// Inside a methane cloud gas refills three times faster, and a peto vestito is three times
// more likely.
module.exports = {
  gas(room) {
    const R = room.raft;
    for (const c of room.course.METHANE) if (Math.hypot(c.x - R.x, c.y - R.y) < c.r) return { regen: 3, shart: 3 };
    return {};
  },
};

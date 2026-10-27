'use strict';
// A hippo pushing while the raft is over a vent sets its fart alight: its push doubles for
// 1 s, even after leaving the vent.
const BURN = 1;

module.exports = {
  thrust(room, seat, i) {
    const R = room.raft;
    if (seat.farting && room.course.VENTS.some((v) => Math.hypot(v.x - R.x, v.y - R.y) < v.r)) {
      if (!(seat.fireUntil > room.gt)) room.events.push({ k: 'fire', i });
      seat.fireUntil = room.gt + BURN;
    }
    return seat.fireUntil > room.gt ? 2 : 1;
  },
};

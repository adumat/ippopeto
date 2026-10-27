'use strict';
// Within 80 px of a bank the heat refills gas twice as fast.
const Track = require('../../public/track.js');

const NEAR = 80;

module.exports = {
  gas(room) {
    const R = room.raft;
    const c = room.course.closest(R.x, R.y);
    return c.hw - Track.RAFT_R - c.dist < NEAR ? { regen: 2 } : {};
  },
};

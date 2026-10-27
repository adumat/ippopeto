'use strict';
// How each surface carries the vehicle. `drag` is the linear drag towards the surface's own
// velocity; `current` scales the course's downstream flow. Lava carries a raft as water does.
const SURFACES = {
  water: { drag: 1.1, current: 1 },
  lava: { drag: 1.1, current: 1 },
};

module.exports = { SURFACES };

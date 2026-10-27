'use strict';
// How each surface carries the vehicle. `drag` is the linear drag towards the surface's own
// velocity; `current` scales the course's downstream flow. Above `cruise` px/s, drag grows by
// `over` per px/s of excess speed. Lava carries a raft as water does. Ice has a tenth of the
// water's drag and no current, so a sled coasts a long way, but it cannot run away above its
// cruise speed.
const SURFACES = {
  water: { drag: 1.1, current: 1, cruise: Infinity, over: 0 },
  lava: { drag: 1.1, current: 1, cruise: Infinity, over: 0 },
  ice: { drag: 0.11, current: 0, cruise: 220, over: 0.01 },
};

module.exports = { SURFACES };

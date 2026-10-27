// Map "Fogne della città": a brick canal under the streets, with near right-angle bends.
// Inlet, then the collector with jets from both walls, then the basin with the intakes.
(function (root) {
  'use strict';

  const def = {
    id: 'fogne',
    name: 'Fogne della città',
    vehicle: 'raft',
    generated: false,
    // [x, y, half-width, downstream current speed in px/s]. Corners are cut by one point
    // on each leg, so every bend is close to a right angle but wider than the canal.
    control: [
      [0, 300, 200, 0],
      [0, -300, 190, 35],
      [0, -1000, 185, 40],
      [0, -1350, 180, 40],
      [250, -1600, 180, 40],
      [900, -1600, 190, 40],
      [1250, -1600, 185, 45],
      [1500, -1850, 180, 45],
      [1500, -2500, 205, 45],
      [1500, -3200, 205, 45],
      [1500, -3500, 185, 45],
      [1250, -3750, 180, 45],
      [600, -3750, 190, 45],
      [0, -3750, 190, 45],
      [-250, -4000, 180, 45],
      [-250, -4700, 205, 50],
      [-250, -5300, 205, 50],
      [-250, -5600, 195, 50],
      [0, -5850, 195, 55],
      [700, -5850, 205, 55],
      [1000, -5850, 205, 55],
      [1250, -6100, 205, 55],
      [1250, -6800, 210, 60],
      [1250, -7600, 210, 50],
      [1250, -8000, 210, 25],
      [1250, -8300, 210, 0],
    ],
    obstacles: {
      // rubber ducks, drifting wall to wall: [u, amplitude, period s, radius, phase]
      barrels: [
        [0.2, 0.6, 3.6, 20, 0], [0.47, 0.6, 3.2, 20, 1.2], [0.7, 0.6, 3.8, 20, 2.4],
      ],
      // giant rats, swimming back and forth
      crocs: [
        [0.34, 0.45, 6, 28, 0.7], [0.63, 0.45, 6, 28, 2.1], [0.9, 0.45, 6, 28, 0.3],
      ],
      // pipes in the walls: [u, side (+1 right, -1 left), period s, phase s]
      jets: [
        [0.27, -1, 3.2, 0], [0.31, 1, 3.2, 1.1], [0.36, -1, 3.0, 2.0], [0.4, 1, 3.4, 0.4],
        [0.46, -1, 3.2, 1.5], [0.5, 1, 3.0, 2.6], [0.55, -1, 3.4, 0.8], [0.6, 1, 3.2, 1.9],
      ],
      // intakes in the basin walls: [u, side, radius, strength]
      intakes: [
        [0.74, 1, 240, 100], [0.8, -1, 240, 100], [0.86, 1, 240, 100], [0.94, -1, 240, 100],
      ],
      // methane clouds: [u, off, radius]
      methane: [
        [0.16, -0.35, 120], [0.49, 0.3, 120], [0.77, -0.25, 130],
      ],
    },
    rules: ['jets', 'intakes', 'methane'],
    biter: 'rat',
    causes: { rat: ['morso di ratto', 'morsi di ratto'] },
    hint: 'I tubi gocciolano prima di sparare, le bocchette vi risucchiano indietro e un ratto vi riporta all’ultimo checkpoint.',
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = def;
  else (root.IppoMaps = root.IppoMaps || {}).fogne = def;
})(typeof self !== 'undefined' ? self : this);

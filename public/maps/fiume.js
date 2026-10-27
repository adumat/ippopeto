// Map "Fiume": the original river, travelled upstream against the current.
(function (root) {
  'use strict';

  const def = {
    id: 'fiume',
    name: 'Fiume',
    vehicle: 'raft',
    generated: false,
    // [x, y, half-width, downstream current speed in px/s]; negative y = upstream
    control: [
      [0, 300, 280, 0],
      [0, -300, 260, 30],
      [120, -900, 240, 35],
      [380, -1450, 210, 55],
      [330, -2000, 230, 40],
      [0, -2450, 250, 35],
      [-380, -2900, 220, 50],
      [-420, -3500, 185, 75],
      [-150, -4000, 210, 45],
      [250, -4400, 240, 35],
      [520, -4950, 250, 40],
      [420, -5550, 200, 60],
      [60, -6000, 190, 65],
      [-250, -6500, 230, 40],
      [-300, -7150, 250, 35],
      [0, -7700, 220, 50],
      [300, -8200, 200, 70],
      [200, -8800, 240, 40],
      [0, -9300, 280, 25],
      [0, -9800, 300, 0],
    ],
    // u = fraction of the course, off = fraction of the half-width (+ = right)
    obstacles: {
      // [u, off, radius]
      rocks: [
        [0.07, -0.45, 38], [0.1, 0.5, 44], [0.155, -0.3, 42], [0.26, -0.42, 40], [0.285, 0.45, 36],
        [0.355, 0.35, 38], [0.47, 0.5, 40], [0.5, -0.5, 40], [0.615, 0.35, 40], [0.705, -0.46, 36],
        [0.725, 0.46, 36], [0.855, -0.3, 42], [0.9, -0.5, 38],
      ],
      // drifting side to side: [u, amplitude, period s, radius, phase]
      barrels: [
        [0.125, 0.6, 4.0, 30, 0], [0.33, 0.55, 3.5, 32, 1.0], [0.55, 0.6, 3.0, 30, 2.0], [0.785, 0.6, 3.2, 30, 0.5],
      ],
      // whirlpools: [u, off, radius, strength]
      vortices: [
        [0.215, 0.3, 150, 160], [0.575, -0.35, 140, 170], [0.83, 0.35, 150, 180],
      ],
      // biters, swimming side to side: [u, amplitude, period s, radius, phase]
      crocs: [
        [0.42, 0.55, 5.0, 34, 0], [0.67, 0.6, 4.5, 34, 1.5], [0.94, 0.5, 4.0, 34, 3.0],
      ],
    },
    // what sends the raft back to a checkpoint, as worded in the results: [singular, plural]
    causes: { croc: ['morso di coccodrillo', 'morsi di coccodrillo'] },
    // the lobby's last hint, after the sync tip
    hint: 'Un morso di coccodrillo vi riporta all’ultimo checkpoint. Intanto potete provare: la zattera è già in acqua.',
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = def;
  else (root.IppoMaps = root.IppoMaps || {}).fiume = def;
})(typeof self !== 'undefined' ? self : this);

// Map "Fiordo ghiacciato": a frozen river between snow banks, raced on a sled.
// No current and no bouncing banks: slopes push the sled, and the snow catches it.
(function (root) {
  'use strict';

  const def = {
    id: 'fiordo',
    name: 'Fiordo ghiacciato',
    vehicle: 'sled',
    generated: false,
    banks: 'snow',
    // [x, y, half-width, current]: wide stretches to gain speed, narrows and bridges between
    control: [
      [0, 300, 280, 0],
      [0, -300, 280, 0],
      [-150, -900, 290, 0],
      [-350, -1500, 200, 0],
      [-250, -2100, 190, 0],
      [100, -2600, 280, 0],
      [450, -3100, 300, 0],
      [500, -3700, 210, 0],
      [250, -4250, 190, 0],
      [-150, -4700, 270, 0],
      [-450, -5250, 290, 0],
      [-400, -5850, 200, 0],
      [-100, -6350, 190, 0],
      [300, -6800, 280, 0],
      [550, -7400, 300, 0],
      [400, -8000, 210, 0],
      [100, -8500, 190, 0],
      [0, -9100, 280, 0],
      [0, -9700, 300, 0],
    ],
    // the whole river is frozen
    surfaces: [[0, 1, 'ice']],
    obstacles: {
      // ice blocks, still: [u, off, radius]
      rocks: [
        [0.09, 0.45, 40], [0.27, -0.4, 44], [0.52, 0.42, 40], [0.58, -0.45, 42], [0.78, 0.4, 40],
      ],
      // penguins sliding on their bellies from side to side
      barrels: [
        [0.17, 0.6, 3.8, 26, 0], [0.37, 0.6, 3.4, 26, 1.3], [0.56, 0.6, 3.6, 26, 2.2], [0.75, 0.6, 3.2, 26, 0.6],
      ],
      // tilted stretches: [u0, u1, direction, acceleration px/s^2]; direction is 'back',
      // 'forward', 'left' or 'right' relative to the course
      slopes: [
        [0.02, 0.12, 'back', 12], [0.3, 0.36, 'left', 20], [0.4, 0.45, 'forward', 15],
        [0.5, 0.6, 'back', 14], [0.66, 0.71, 'right', 20], [0.86, 0.94, 'back', 12],
      ],
      // thin-ice bridges, in the narrows: [u0, u1]
      thin: [[0.165, 0.185], [0.44, 0.46], [0.66, 0.68], [0.865, 0.885]],
      // polar bears on the snow: [u, side (+1 right, -1 left)]
      bears: [[0.31, 1], [0.52, -1], [0.72, 1], [0.93, -1]],
    },
    // the whole fjord climbs gently towards the finish, outside the stretches in `slopes`
    uphill: 20,
    bot: { lookAhead: 450 },
    rules: ['sled', 'slopes', 'snow', 'thin-ice', 'bears'],
    causes: { water: ['caduta in acqua', 'cadute in acqua'], bear: ['morso d’orso', 'morsi d’orso'] },
    hint: 'Lo slittino gira piano: le curve si preparano prima. Nella neve ci si incaglia e si esce a colpi, spingendo tutti insieme. Il ghiaccio sottile cede dopo un attimo.',
    ippo: { causes: { bear: ['abbraccio d’orso da dietro', 'abbracci d’orso da dietro'] } },
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = def;
  else (root.IppoMaps = root.IppoMaps || {}).fiordo = def;
})(typeof self !== 'undefined' ? self : this);

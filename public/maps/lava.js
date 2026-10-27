// Map "Fiume di lava": a river of lava inside a volcano, raced on a stone raft.
// Vents set farts alight, geysers throw the raft sideways, bombs fall where their shadow grows.
(function (root) {
  'use strict';

  const def = {
    id: 'lava',
    name: 'Fiume di lava',
    vehicle: 'stone',
    generated: false,
    // [x, y, half-width, downstream current]: as wide as the Fiume, slower
    control: [
      [0, 300, 280, 0],
      [0, -300, 260, 20],
      [-200, -900, 250, 25],
      [-450, -1450, 230, 35],
      [-350, -2050, 240, 30],
      [50, -2500, 260, 25],
      [450, -2950, 230, 35],
      [500, -3550, 200, 45],
      [200, -4050, 220, 35],
      [-200, -4450, 250, 25],
      [-500, -5000, 250, 30],
      [-400, -5600, 210, 40],
      [-50, -6050, 200, 45],
      [300, -6550, 240, 30],
      [350, -7200, 250, 25],
      [50, -7750, 220, 35],
      [-250, -8250, 210, 40],
      [-150, -8850, 250, 25],
      [0, -9350, 280, 15],
      [0, -9850, 300, 0],
    ],
    surfaces: [[0, 1, 'lava']],
    obstacles: {
      // volcanic rocks: [u, off, radius]
      rocks: [
        [0.08, 0.45, 38], [0.15, -0.4, 40], [0.29, 0.42, 38], [0.37, -0.45, 40], [0.52, 0.4, 38],
        [0.62, -0.42, 40], [0.74, 0.45, 38], [0.88, -0.4, 40],
      ],
      // fire salamanders, swimming side to side
      crocs: [
        [0.33, 0.5, 6, 30, 0.4], [0.57, 0.5, 6, 30, 1.8], [0.83, 0.5, 6, 30, 3.1],
      ],
      // vents, pools of burning gas on the lava: [u, off, radius]
      vents: [
        [0.11, 0, 70], [0.19, -0.3, 65], [0.25, 0.3, 65], [0.45, 0, 70], [0.49, -0.35, 65],
        [0.68, 0.3, 65], [0.71, -0.25, 65], [0.92, 0.1, 70],
      ],
      // geysers, each to its own rhythm: [u, off, radius, period s, phase s]
      geysers: [
        [0.22, -0.45, 90, 3.6, 0], [0.4, 0.45, 90, 4.4, 1.3], [0.55, -0.45, 90, 3.2, 2.1],
        [0.65, 0.45, 90, 4.0, 0.6], [0.78, -0.45, 90, 3.8, 2.7], [0.95, 0.45, 90, 4.2, 1.1],
      ],
      // lava bombs on a timetable: [u, off, period s, phase s]
      bombs: [
        [0.14, 0.2, 5.5, 0], [0.31, -0.2, 6.0, 2.0], [0.51, 0.15, 5.0, 3.5], [0.59, -0.15, 6.5, 1.0],
        [0.7, 0.2, 5.5, 4.0], [0.86, -0.2, 6.0, 2.5],
      ],
    },
    rules: ['vents', 'geysers', 'bombs', 'heat'],
    biter: 'salamander',
    causes: {
      salamander: ['morso di salamandra', 'morsi di salamandra'],
      bomb: ['colpo di lava', 'colpi di lava'],
    },
    hint: 'Spingete sopra gli sfiati: il peto prende fuoco e spinge il doppio. Occhio alle ombre: arriva una bomba di lava. Vicino alle sponde il gas si ricarica prima.',
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = def;
  else (root.IppoMaps = root.IppoMaps || {}).lava = def;
})(typeof self !== 'undefined' ? self : this);

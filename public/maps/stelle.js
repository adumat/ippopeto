// Map "Strada delle stelle": a ribbon of light in space, raced on a flying saucer. A nod to
// Mario Kart: open edges over the void, ramps in front of holes, turbo pads, planets, comets.
(function (root) {
  'use strict';

  const def = {
    id: 'stelle',
    name: 'Strada delle stelle',
    vehicle: 'ufo',
    generated: false,
    // edges are open onto the void, except on the `rails` stretches
    banks: 'void',
    // [x, y, half-width, current]: no current in space
    control: [
      [0, 300, 220, 0],
      [0, -400, 200, 0],
      [0, -1300, 200, 0],
      [0, -1700, 190, 0],
      [150, -2050, 180, 0],
      [450, -2180, 180, 0],
      [750, -2050, 180, 0],
      [900, -1700, 190, 0],
      [900, -1200, 200, 0],
      [900, -800, 200, 0],
      [1050, -450, 180, 0],
      [1350, -330, 180, 0],
      [1650, -450, 180, 0],
      [1800, -800, 200, 0],
      [1800, -1500, 210, 0],
      [1800, -2600, 210, 0],
      [1650, -3000, 200, 0],
      [1250, -3250, 200, 0],
      [600, -3300, 210, 0],
      [0, -3300, 210, 0],
      [-400, -3500, 200, 0],
      [-550, -3900, 200, 0],
      [-550, -4600, 210, 0],
      [-550, -5400, 220, 0],
      [-550, -5900, 240, 0],
    ],
    surfaces: [[0, 1, 'space']],
    obstacles: {
      // stretches with rails that bounce: [u0, u1]
      rails: [[0, 0.1], [0.24, 0.33], [0.58, 0.69]],
      // holes across the whole track, each with a ramp in front: [u0, u1]
      holes: [[0.5, 0.515], [0.72, 0.735], [0.935, 0.95]],
      // turbo pads: [u, off]
      turbos: [[0.08, 0], [0.47, 0], [0.62, 0], [0.69, 0], [0.9, 0]],
      // planets beside the track: [u, side, distance from the edge, radius, reach, pull]
      planets: [[0.24, 1, 260, 90, 520, 120], [0.58, -1, 260, 110, 560, 120], [0.86, 1, 240, 90, 520, 130]],
      // comets crossing the track: [u, amplitude, period s, radius, phase]
      comets: [[0.29, 0.7, 3.2, 26, 0], [0.6, 0.7, 3.6, 26, 1.4], [0.66, 0.7, 3.0, 26, 2.2]],
    },
    bot: { brakeBends: 250, rampRunUp: 700 },
    rules: ['jumps', 'void', 'turbo', 'gravity', 'comets'],
    causes: { void: ['caduta nel vuoto', 'cadute nel vuoto'] },
    hint: 'Dove la pista non ha sponde si cade nel vuoto. Sulle rampe bisogna arrivare veloci, tutti insieme, o si finisce nel buco. I pannelli turbo spingono, i pianeti attirano verso il bordo.',
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = def;
  else (root.IppoMaps = root.IppoMaps || {}).stelle = def;
})(typeof self !== 'undefined' ? self : this);

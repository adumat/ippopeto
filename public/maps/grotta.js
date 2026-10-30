// Map "Grotta buia": an underground river in the dark, generated anew at every start.
// Everyone in a room gets the same cave: the server picks the seed, every client rebuilds it.
(function (root) {
  'use strict';

  const DEG = Math.PI / 180;
  const LENGTH = 11000;

  // The river climbs the screen: each step turns by at most 50° and never points more than
  // 60° away from straight up, so the cave cannot fold back onto itself.
  function generate(rng) {
    const between = (a, b) => a + rng() * (b - a);
    const control = [[0, 300, 260, 0], [0, -300, 240, 30]];
    let heading = 0, x = 0, y = -300, len = 600;
    while (len < LENGTH - 600) {
      heading = Math.max(-60 * DEG, Math.min(60 * DEG, heading + between(-50, 50) * DEG));
      const step = between(450, 650);
      x += Math.sin(heading) * step;
      y -= Math.cos(heading) * step;
      len += step;
      control.push([x, y, between(205, 260), between(25, 60)]);
    }
    control.push([x, y - 500, 260, 15], [x, y - 1000, 280, 0]);

    // obstacles at least 0.03 of the course apart, so none of them block the river together
    const slots = [];
    for (let u = 0.07; u < 0.95; u += 0.035) slots.push(u);
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }
    // keep obstacles off the checkpoints and the stretch after them, where a crew reappears
    const free = slots.filter((u) => [0.2, 0.4, 0.6, 0.8].every((c) => u < c - 0.02 || u > c + 0.06));
    const take = (n) => free.splice(0, n);
    // fish are spread out, and none in the first stretch: a bite there means the very start
    const fish = (n) => {
      const out = [];
      for (let i = 0; i < free.length && out.length < n; ) {
        if (free[i] > 0.15 && out.every((u) => Math.abs(u - free[i]) >= 0.12)) out.push(...free.splice(i, 1));
        else i++;
      }
      return out;
    };
    const side = () => (rng() < 0.5 ? -1 : 1);
    return {
      control,
      obstacles: {
        // stalagmites: [u, off, radius]
        rocks: take(9).map((u) => [u, side() * between(0.35, 0.5), between(30, 40)]),
        // blind fish, swimming side to side: [u, amplitude, period, radius, phase]
        crocs: fish(3).map((u) => [u, between(0.35, 0.45), between(6, 7.5), 30, rng() * 6]),
        // bat swarms crossing the river
        bats: take(3).map((u) => [u, 0.65, between(3.5, 5), 36, rng() * 5]),
      },
    };
  }

  const def = {
    id: 'grotta',
    name: 'Grotta buia',
    vehicle: 'raft',
    generated: true,
    generate,
    rules: ['bats'],
    biter: 'fish',
    causes: { fish: ['morso di pesce cieco', 'morsi di pesce cieco'] },
    hint: 'Al buio si vede solo vicino alla zattera e dove c’è gas: per far luce bisogna spingere. I funghi segnano i checkpoint, le lucciole le curve. La grotta cambia a ogni gara.',
    ippo: {
      causes: { fish: ['pesce palpatore', 'pesci palpatori'] },
      hint: 'Al buio si vede solo vicino alla zattera e dove arriva il getto: per far luce bisogna spingere. I funghi segnano i checkpoint, le lucciole le curve. La grotta cambia a ogni gara.',
    },
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = def;
  else (root.IppoMaps = root.IppoMaps || {}).grotta = def;
})(typeof self !== 'undefined' ? self : this);

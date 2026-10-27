'use strict';
// Every course the checks must cover: fixed maps once, generated maps on many seeds.
const Track = require('../../public/track.js');

const SEEDS = 50;

function allCourses() {
  const out = [];
  for (const m of Track.maps()) {
    if (!m.generated) out.push({ label: m.id, map: m.id, seed: 0, course: Track.course(m.id) });
    else for (let seed = 1; seed <= SEEDS; seed++) out.push({ label: `${m.id} seed ${seed}`, map: m.id, seed, course: Track.course(m.id, seed) });
  }
  return out;
}

module.exports = { allCourses };

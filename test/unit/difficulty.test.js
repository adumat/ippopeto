'use strict';
const test = require('node:test');
const assert = require('node:assert');
const Track = require('../../public/track.js');
const { runCrew } = require('../helpers/bot.js');

const fmt = (r) =>
  `status=${r.status} time=${r.time.toFixed(1)}s progress=${(100 * r.progress).toFixed(0)}% ` +
  `bites=${r.bites} sharts=${r.sharts} sync=${(100 * r.sync).toFixed(0)}% checkpoints=[${r.checkpoints}]`;

for (const { id: map } of Track.maps()) {
  for (const players of [2, 4, 6]) {
    test(`${map}: a crew of ${players} reference bots finishes within 300 s`, () => {
      const r = runCrew({ players, map, maxSeconds: 310 });
      console.log(`  ${map}, ${players} bots: ${fmt(r)}`);
      assert.strictEqual(r.status, 'finished', `${map}, ${players} bots: ${fmt(r)}`);
      assert.ok(r.time <= 300, `${map}, ${players} bots: ${fmt(r)}`);
      assert.deepStrictEqual(r.checkpoints, [0, 1, 2, 3], `${map}, ${players} bots: ${fmt(r)}`);
    });
  }

  test(`${map}: a lone bot is reported, not asserted`, () => {
    console.log(`  ${map}, 1 bot: ${fmt(runCrew({ players: 1, map, maxSeconds: 300 }))}`);
  });
}

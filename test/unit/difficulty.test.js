'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { runCrew } = require('../helpers/bot.js');

const fmt = (r) =>
  `status=${r.status} time=${r.time.toFixed(1)}s progress=${(100 * r.progress).toFixed(0)}% ` +
  `bites=${r.bites} sync=${(100 * r.sync).toFixed(0)}% checkpoints=[${r.checkpoints}]`;

test('a crew of four reference bots finishes within 300 s', () => {
  const r = runCrew({ players: 4, maxSeconds: 310 });
  console.log(`  four bots: ${fmt(r)}`);
  assert.strictEqual(r.status, 'finished', fmt(r));
  assert.ok(r.time <= 300, fmt(r));
  assert.deepStrictEqual(r.checkpoints, [0, 1, 2, 3], fmt(r));
});

for (const players of [2, 6]) {
  test(`a crew of ${players} reference bots finishes within 300 s`, () => {
    const r = runCrew({ players, maxSeconds: 310 });
    console.log(`  ${players} bots: ${fmt(r)}`);
    assert.strictEqual(r.status, 'finished', fmt(r));
    assert.ok(r.time <= 300, fmt(r));
  });
}

test('a lone bot is reported, not asserted', () => {
  console.log(`  1 bot: ${fmt(runCrew({ players: 1, maxSeconds: 300 }))}`);
});

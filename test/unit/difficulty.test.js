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

test('smaller crews are reported, not asserted', () => {
  for (const players of [2, 1]) console.log(`  ${players} bot(s): ${fmt(runCrew({ players, maxSeconds: 300 }))}`);
});

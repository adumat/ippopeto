'use strict';
// Maps must not change the Fiume: the reference crews race it exactly as before.
const test = require('node:test');
const assert = require('node:assert');
const { runCrew } = require('../helpers/bot.js');
const golden = require('../fixtures/fiume-golden.json');

for (const [players, want] of Object.entries(golden)) {
  test(`the Fiume is unchanged for ${players} bots`, () => {
    const r = runCrew({ players: Number(players), maxSeconds: 310 });
    const got = { time: +r.time.toFixed(1), bites: r.bites, sharts: r.sharts, checkpoints: r.events.filter((e) => e.k === 'cp').map((e) => +e.at.toFixed(1)) };
    assert.deepStrictEqual(got, want);
  });
}

'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { Room } = require('../../server/game.js');
const { seeded } = require('../helpers/rng.js');

const DT = 1 / 60;

// One hippo pushes from `from` gas until it runs dry, soils itself, or reaches `stopAt`.
function drain(room, from, stopAt = 0) {
  const s = room.seats[0];
  Object.assign(s, { gas: from, exhausted: false, fartHeld: true });
  let shart = false;
  room.flush = function flush() {
    if (this.events.some((e) => e.k === 'shart')) shart = true;
    this.events = [];
  };
  while (!s.exhausted && s.gas > stopAt) room.step(DT);
  s.fartHeld = false;
  return shart;
}

function solo(seed) {
  const room = new Room('s', { random: seeded(seed) });
  const c = { id: 'a', ws: { readyState: 0 }, seat: null };
  room.addClient(c);
  room.join(c, 'tester');
  return room;
}

test('forcing a full drain soils about one time in three', () => {
  const room = solo(7);
  let n = 0;
  for (let i = 0; i < 2000; i++) n += drain(room, 25) ? 1 : 0;
  const rate = n / 2000;
  assert.ok(rate > 0.3 && rate < 0.4, `rate ${rate}`);
});

test('letting go at 15 gas almost never soils', () => {
  const room = solo(11);
  let n = 0;
  for (let i = 0; i < 2000; i++) n += drain(room, 25, 15) ? 1 : 0;
  assert.ok(n / 2000 < 0.05, `rate ${n / 2000}`);
});

test('a peto vestito empties and locks the tank, and counts only in a race', () => {
  const room = solo(3);
  room.random = () => 0; // always unlucky
  drain(room, 20);
  assert.strictEqual(room.seats[0].gas, 0);
  assert.strictEqual(room.seats[0].exhausted, true);
  assert.strictEqual(room.sharts, 0, 'the lobby does not count');
  room.start();
  while (room.status === 'countdown') {
    room.seats[0].fartHeld = true;
    room.seats[0].gas = 10;
    room.seats[0].exhausted = false;
    room.step(DT);
    if (room.status === 'countdown') assert.notStrictEqual(room.seats[0].gas, 0, 'no peto vestito during the countdown');
  }
  assert.strictEqual(room.status, 'running');
  const before = room.sharts;
  drain(room, 20);
  assert.strictEqual(room.sharts, before + 1);
});

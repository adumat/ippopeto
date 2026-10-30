'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { Room } = require('../../server/game.js');
const { seeded } = require('../helpers/rng.js');
const { runCrew } = require('../helpers/bot.js');

let n = 0;
function crew(size) {
  const room = new Room('ip', { random: seeded(3) });
  const clients = [];
  for (let i = 0; i < size; i++) {
    const c = { id: `i${n++}`, ws: { readyState: 0 }, seat: null };
    room.addClient(c);
    room.join(c, `p${i}`);
    clients.push(c);
  }
  return { room, clients };
}

test('a new room starts with the mode off', () => {
  assert.strictEqual(new Room('x').ippo, false);
});

test('any seated player flips the mode between races, a spectator cannot', () => {
  const { room, clients } = crew(2);
  room.setMode(clients[0], true);
  assert.strictEqual(room.ippo, true);
  const spectator = { id: 'spec', ws: { readyState: 0 }, seat: null };
  room.addClient(spectator);
  room.setMode(spectator, false);
  assert.strictEqual(room.ippo, true);
});

test('the mode cannot change during a race', () => {
  const { room, clients } = crew(2);
  room.start();
  room.setMode(clients[0], true);
  assert.strictEqual(room.ippo, false);
});

test('with the mode on, every checkpoint starts the captain\'s spray; with it off, none does', () => {
  for (const ippo of [true, false]) {
    const r = runCrew({ players: 4, map: 'fiume', seed: 1, maxSeconds: 310, ippo });
    const sprays = r.events.filter((e) => e.k === 'spray');
    assert.strictEqual(sprays.length, ippo ? 4 : 0);
    if (ippo) assert.ok(sprays.every((e) => e.d === 3));
  }
});

test('the captain\'s shoves are the same on every run of the same race', () => {
  const a = runCrew({ players: 4, map: 'fiume', seed: 2, maxSeconds: 310, ippo: true });
  const b = runCrew({ players: 4, map: 'fiume', seed: 2, maxSeconds: 310, ippo: true });
  assert.strictEqual(a.time, b.time);
});

test('a 4-bot crew still finishes every map with the mode on', () => {
  const Track = require('../../public/track.js');
  for (const { id: map } of Track.maps()) {
    const r = runCrew({ players: 4, map, seed: 1, maxSeconds: 310, ippo: true });
    assert.strictEqual(r.status, 'finished', map);
    assert.ok(r.time <= 300, map);
  }
});

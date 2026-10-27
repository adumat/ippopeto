'use strict';
const test = require('node:test');
const assert = require('node:assert');
const Track = require('../../public/track.js');
const { Room } = require('../../server/game.js');
const { RULES } = require('../../server/rules/index.js');
const { seeded } = require('../helpers/rng.js');
const fiume = require('../../public/maps/fiume.js');

// A straight water channel, and a generated twin whose bend depends on the seed.
const control = [[0, 300, 260, 30], [0, -1500, 260, 30], [0, -3300, 260, 30]];
Track.register({ id: 'canale', name: 'Canale', control, causes: {} });
Track.register({ id: 'grotta-prova', name: 'Prova', generated: true, causes: {}, generate: (rng) => ({ control: [control[0], [rng() * 400 - 200, -1500, 260, 30], control[2]] }) });

const DT = 1 / 60;
let n = 0;
function crew(size) {
  const room = new Room('m', { random: seeded(3) });
  const events = [];
  room.flush = function flush() {
    events.push(...this.events);
    this.events = [];
  };
  const clients = [];
  for (let i = 0; i < size; i++) {
    const c = { id: `m${n++}`, ws: { readyState: 0 }, seat: null };
    room.addClient(c);
    room.join(c, `p${i}`);
    clients.push(c);
  }
  return { room, clients, events };
}
const run = (room, seconds) => {
  for (let i = 0; i < seconds * 60; i++) room.step(DT);
};

test('a new room starts on the Fiume', () => {
  const { room } = crew(1);
  assert.strictEqual(room.mapId, 'fiume');
  assert.strictEqual(room.seed, 0);
});

test('a seated player changes the map in the lobby and the vehicle moves to its start', () => {
  const { room, clients } = crew(2);
  room.teleport(3000);
  room.setMap(clients[1], 'canale');
  assert.strictEqual(room.mapId, 'canale');
  const start = room.course.pointAt(room.course.START_S);
  assert.ok(Math.hypot(room.raft.x - start.x, room.raft.y - start.y) < 1);
  assert.strictEqual(room.raft.vx, 0);
});

test('spectators, unknown maps and races cannot change the map', () => {
  const { room, clients } = crew(1);
  const spectator = { id: 'spy', ws: { readyState: 0 }, seat: null };
  room.addClient(spectator);
  room.setMap(spectator, 'canale');
  room.setMap(clients[0], 'nowhere');
  assert.strictEqual(room.mapId, 'fiume');
  room.start();
  room.setMap(clients[0], 'canale');
  run(room, 4);
  room.setMap(clients[0], 'canale');
  room.pause(clients[0]);
  room.setMap(clients[0], 'canale');
  assert.strictEqual(room.mapId, 'fiume');
});

test('choosing a map on the results card returns everyone to the lobby', () => {
  const { room, clients } = crew(1);
  room.status = 'finished';
  room.setMap(clients[0], 'canale');
  assert.strictEqual(room.status, 'lobby');
});

test('a generated map gets a new layout at every start, fixed maps keep seed 0', () => {
  const { room, clients } = crew(1);
  room.start();
  assert.strictEqual(room.seed, 0);
  room.status = 'finished';
  room.setMap(clients[0], 'grotta-prova');
  const seeds = new Set([room.seed]);
  for (let i = 0; i < 3; i++) {
    room.status = 'finished';
    room.start();
    seeds.add(room.seed);
  }
  assert.strictEqual(seeds.size, 4);
  assert.ok(room.seed > 0);
});

test('snapshots carry the map and the seed', () => {
  const room = new Room('snap');
  const sent = [];
  room.addClient({ id: 'x', ws: { readyState: 1, bufferedAmount: 0, send: (m) => sent.push(JSON.parse(m)) }, seat: null });
  for (let i = 0; i < 3; i++) room.step(DT);
  assert.strictEqual(sent[0].mp, 'fiume');
  assert.strictEqual(sent[0].sd, 0);
});

test('best times are kept per map', () => {
  const { room, clients, events } = crew(1);
  const finish = () => {
    room.start();
    run(room, 3.1);
    for (const s of [...room.course.CHECKPOINTS, room.course.FINISH_S].map((x) => x + 20)) {
      room.teleport(s);
      room.step(DT);
    }
  };
  finish();
  assert.strictEqual(room.bestOf('fiume').length, 1);
  room.setMap(clients[0], 'canale');
  finish();
  assert.strictEqual(room.bestOf('fiume').length, 1);
  assert.strictEqual(room.bestOf('canale').length, 1);
  const last = events.filter((e) => e.k === 'finish').pop();
  assert.strictEqual(last.map, 'canale');
  assert.strictEqual(last.best.length, 1);
});

test('send-backs are counted by cause during the race only', () => {
  const { room } = crew(1);
  room.sendBack('croc', { k: 'bite' });
  assert.strictEqual(room.bites, 0);
  room.start();
  run(room, 3.1);
  room.sendBack('croc', { k: 'bite' });
  room.sendBack('croc', { k: 'bite' });
  assert.deepStrictEqual(room.backs, { croc: 2 });
  assert.strictEqual(room.bites, 2);
});

test('a water-only map handles like the Fiume', () => {
  // the Fiume's own geometry, as a new map with no rules and no surfaces listed
  Track.register({ ...fiume, id: 'fiume-copia', name: 'Copia' });
  const a = crew(4), b = crew(4);
  b.room.setMap(b.clients[0], 'fiume-copia');
  for (const { room } of [a, b]) {
    for (const s of room.seats) s.fartHeld = true;
    room.start();
    run(room, 20);
  }
  assert.deepStrictEqual(b.room.raft, a.room.raft);
});

test('rule hooks run for the maps that switch them on', () => {
  const calls = [];
  RULES.spy = {
    force: () => calls.push('force'),
    collide: () => calls.push('collide'),
    gas: () => (calls.push('gas'), { regen: 3 }),
    onRespawn: () => calls.push('respawn'),
  };
  Track.register({ id: 'spia', name: 'Spia', control, causes: {}, rules: ['spy'] });
  const { room, clients } = crew(1);
  room.setMap(clients[0], 'spia');
  room.seats[0].gas = 10;
  run(room, 1);
  room.teleport(500);
  assert.ok(room.seats[0].gas > 10 + 16 * 2.5, 'regen multiplier applied');
  assert.ok(calls.includes('force') && calls.includes('collide') && calls.includes('respawn'));
  delete RULES.spy;
});

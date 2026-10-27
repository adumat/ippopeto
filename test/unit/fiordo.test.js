'use strict';
const test = require('node:test');
const assert = require('node:assert');
const Track = require('../../public/track.js');
const { Room } = require('../../server/game.js');
const { seeded } = require('../helpers/rng.js');

const DT = 1 / 60;
function onMap(map, size = 2) {
  const room = new Room('i', { random: seeded(4) });
  const events = [];
  room.flush = function flush() {
    events.push(...this.events);
    this.events = [];
  };
  const clients = [];
  for (let i = 0; i < size; i++) {
    const c = { id: `i${i}`, ws: { readyState: 0 }, seat: null };
    room.addClient(c);
    room.join(c, `p${i}`);
    clients.push(c);
  }
  room.setMap(clients[0], map);
  return { room, events, C: room.course };
}
const steps = (room, n, push) => {
  for (let i = 0; i < n; i++) {
    if (push !== undefined) for (const s of room.seats) if (s) s.fartHeld = typeof push === 'function' ? push(s, i) : push;
    room.step(DT);
  }
};
// a straight, flat, icy test course with no rules but the sled, to isolate handling
const straight = { id: 'pista', name: 'Pista', vehicle: 'sled', control: [[0, 300, 300, 0], [0, -3000, 300, 0], [0, -6300, 300, 0]], surfaces: [[0, 1, 'ice']], rules: ['sled'], causes: {} };
Track.register(straight);
Track.register({ ...straight, id: 'zattera', vehicle: 'raft', surfaces: [], rules: [] });

test('the sled does not slide sideways', () => {
  const { room } = onMap('pista');
  room.raft.vx = 300;
  room.raft.vy = 0;
  steps(room, 1);
  const hx = Math.sin(room.raft.a), hy = -Math.cos(room.raft.a);
  assert.ok(Math.abs(room.raft.vx * -hy + room.raft.vy * hx) < 1e-6);
});

test('the sled turns at half the raft’s rate for the same push', () => {
  const turned = (map) => {
    const { room } = onMap(map);
    // only the left hippo pushes, straight back
    room.seats[0].aim = Math.PI / 2;
    steps(room, 30, (s) => s === room.seats[0]);
    return Math.abs(room.raft.a);
  };
  const ratio = turned('pista') / turned('zattera');
  assert.ok(ratio > 0.4 && ratio < 0.6, `ratio ${ratio.toFixed(2)}`);
});

test('on flat ice the sled coasts a long way', () => {
  const { room } = onMap('pista');
  const y0 = room.raft.y;
  room.raft.vy = -200;
  steps(room, 300, false);
  assert.ok(y0 - room.raft.y > 700, `coasted ${(y0 - room.raft.y).toFixed(0)} px in 5 s`);
});

test('in the snow the sled is stuck until three strokes drag it out', () => {
  const { room, events, C } = onMap('fiordo');
  const p = C.pointAt(1500);
  Object.assign(room.raft, { x: p.x + p.nx * (p.hw - 10), y: p.y + p.ny * (p.hw - 10), vx: 0, vy: 0 });
  steps(room, 2, false);
  assert.ok(room.snow.stuck);
  const at = { ...room.raft };
  steps(room, 60, true);
  assert.ok(Math.hypot(room.raft.x - at.x, room.raft.y - at.y) < 1, 'a continuous push does not move it');
  steps(room, 10, false);
  assert.ok(events.some((e) => e.k === 'stroke' && e.n === 1), 'releasing after the push completes a stroke');
  for (let k = 0; k < 2; k++) {
    steps(room, 15, true);
    steps(room, 15, false);
  }
  assert.ok(events.some((e) => e.k === 'free'));
  assert.ok(!room.snow.stuck);
  assert.ok(C.closest(room.raft.x, room.raft.y).dist < p.hw - 60);
});

test('a stroke needs every present hippo', () => {
  const { room, events, C } = onMap('fiordo');
  const p = C.pointAt(1500);
  Object.assign(room.raft, { x: p.x + p.nx * (p.hw - 10), y: p.y + p.ny * (p.hw - 10), vx: 0, vy: 0 });
  steps(room, 2, false);
  for (let k = 0; k < 3; k++) {
    steps(room, 15, (s) => s === room.seats[0]);
    steps(room, 15, false);
  }
  assert.ok(!events.some((e) => e.k === 'stroke'));
});

test('strokes more than 5 s apart start the count again', () => {
  const { room, events, C } = onMap('fiordo');
  const p = C.pointAt(1500);
  Object.assign(room.raft, { x: p.x + p.nx * (p.hw - 10), y: p.y + p.ny * (p.hw - 10), vx: 0, vy: 0 });
  steps(room, 2, false);
  for (let k = 0; k < 3; k++) {
    steps(room, 15, true);
    steps(room, 15, false);
    steps(room, 60 * 5, false);
  }
  assert.deepStrictEqual(events.filter((e) => e.k === 'stroke').map((e) => e.n), [1, 1, 1]);
});

test('a thin-ice tile breaks 1.5 s after the first touch, and refreezes on a send-back', () => {
  const { room, events, C } = onMap('fiordo');
  const i = C.TILES.findIndex((t) => t.lat === 0);
  const t = C.TILES[i];
  const park = () => Object.assign(room.raft, { x: t.x, y: t.y, vx: 0, vy: 0, w: 0 });
  park();
  steps(room, 1, false);
  assert.ok(room.ice.has(i), 'cracked at first touch');
  for (let k = 0; k < 85; k++) {
    park();
    steps(room, 1, false);
  }
  assert.ok(!events.some((e) => e.k === 'fall'), 'holds for 1.4 s');
  for (let k = 0; k < 10 && !events.some((e) => e.k === 'fall'); k++) {
    park();
    steps(room, 1, false);
  }
  assert.ok(events.some((e) => e.k === 'fall'), 'breaks by 1.6 s');
  assert.strictEqual(room.ice.size, 0, 'refrozen after the send-back');
});

test('a bear warns for 1 s, then a sled on its line is sent back', () => {
  const { room, events, C } = onMap('fiordo');
  room.start();
  while (room.status === 'countdown') room.step(DT);
  const b = C.BEARS[0];
  const cp = C.CHECKPOINTS.filter((s) => s < b.s).length - 1;
  room.lastCp = cp;
  // wake the bear
  const wake = C.pointAt(b.s - 400);
  Object.assign(room.raft, { x: wake.x, y: wake.y, vx: 0, vy: 0 });
  steps(room, 1, false);
  assert.ok(events.some((e) => e.k === 'bear' && e.b === 0));
  // stand in the middle of the course, on its line
  const mid = C.pointAt(b.s);
  const park = () => Object.assign(room.raft, { x: mid.x, y: mid.y, vx: 0, vy: 0, w: 0 });
  for (let k = 0; k < 55; k++) {
    park();
    steps(room, 1, false);
  }
  assert.strictEqual(room.bites, 0, 'still warning');
  for (let k = 0; k < 60 && room.bites === 0; k++) {
    park();
    steps(room, 1, false);
  }
  assert.deepStrictEqual(room.backs, { bear: 1 });
});

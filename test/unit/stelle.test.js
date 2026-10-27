'use strict';
const test = require('node:test');
const assert = require('node:assert');
const Track = require('../../public/track.js');
const { Room } = require('../../server/game.js');
const { JUMP_SPEED } = require('../../server/rules/jumps.js');
const { seeded } = require('../helpers/rng.js');

const DT = 1 / 60;
function onStelle() {
  const room = new Room('st', { random: seeded(8) });
  const events = [];
  room.flush = function flush() {
    events.push(...this.events);
    this.events = [];
  };
  const clients = [];
  for (let i = 0; i < 2; i++) {
    const c = { id: `st${i}`, ws: { readyState: 0 }, seat: null };
    room.addClient(c);
    room.join(c, `p${i}`);
    clients.push(c);
  }
  room.setMap(clients[0], 'stelle');
  room.start();
  while (room.status === 'countdown') room.step(DT);
  return { room, events, C: room.course };
}
// put the saucer at course distance s, `lat` px off the centre, moving along the track
function place(room, C, s, lat = 0, speed = 0) {
  const p = C.pointAt(s);
  Object.assign(room.raft, { x: p.x + p.nx * lat, y: p.y + p.ny * lat, a: Math.atan2(p.tx, -p.ty), vx: p.tx * speed, vy: p.ty * speed, w: 0 });
}
const run = (room, n) => {
  for (let i = 0; i < n; i++) room.step(DT);
};

test('off an edge with no rail the saucer falls into the void', () => {
  const { room, C } = onStelle();
  const s = C.RAILS[0][1] + 300; // past the first railed stretch
  assert.ok(!C.railedAt(s));
  const p = C.pointAt(s);
  place(room, C, s, p.hw + 5);
  run(room, 1);
  assert.deepStrictEqual(room.backs, { void: 1 });
});

test('on a railed stretch the edge bounces instead', () => {
  const { room, C } = onStelle();
  const s = (C.RAILS[0][0] + C.RAILS[0][1]) / 2;
  const p = C.pointAt(s);
  place(room, C, s, p.hw - 60);
  room.raft.vx += p.nx * 300;
  room.raft.vy += p.ny * 300;
  run(room, 30);
  assert.strictEqual(room.bites, 0);
  assert.ok(C.closest(room.raft.x, room.raft.y).dist < p.hw);
});

test('fast over a ramp, the saucer flies over the hole without control and lands past it', () => {
  const { room, events, C } = onStelle();
  const h = C.HOLES[0];
  place(room, C, h.r0 + 10, 0, JUMP_SPEED + 80);
  for (const s of room.seats) s.fartHeld = true;
  run(room, 1);
  assert.ok(room.air, 'took off');
  assert.ok(events.some((e) => e.k === 'jump'));
  const v = { vx: room.raft.vx, vy: room.raft.vy };
  run(room, 10);
  assert.ok(Math.abs(room.raft.vx - v.vx) < 1e-9 && Math.abs(room.raft.vy - v.vy) < 1e-9, 'pushes do nothing in the air');
  run(room, 120);
  assert.ok(!room.air, 'landed');
  assert.strictEqual(room.bites, 0);
  assert.ok(C.closest(room.raft.x, room.raft.y).s > h.s1);
});

test('too slow over a ramp, the saucer drops into the hole', () => {
  const { room, C } = onStelle();
  const h = C.HOLES[0];
  place(room, C, h.r0 + 10, 0, JUMP_SPEED - 80);
  for (const s of room.seats) s.fartHeld = false;
  run(room, 120);
  assert.deepStrictEqual(room.backs, { void: 1 });
});

test('a turbo pad pushes the saucer along the track for 1 s', () => {
  const { room, events, C } = onStelle();
  const pad = C.TURBOS[0];
  const s = C.closest(pad.x, pad.y).s;
  place(room, C, s, 0, 0);
  for (const st of room.seats) st.fartHeld = false;
  run(room, 30);
  const along = room.raft.vx * pad.tx + room.raft.vy * pad.ty;
  assert.ok(events.some((e) => e.k === 'turbo'));
  assert.ok(along > 100, `boosted to ${along.toFixed(0)} px/s`);
});

test('a planet pulls the saucer towards itself', () => {
  const { room, C } = onStelle();
  const pl = C.PLANETS[0];
  const c = C.closest(pl.x, pl.y);
  place(room, C, c.s, 0, 0);
  for (const st of room.seats) st.fartHeld = false;
  const before = Math.hypot(pl.x - room.raft.x, pl.y - room.raft.y);
  run(room, 30);
  assert.ok(Math.hypot(pl.x - room.raft.x, pl.y - room.raft.y) < before);
});

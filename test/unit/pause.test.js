'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { Room } = require('../../server/game.js');
const { seeded } = require('../helpers/rng.js');

const DT = 1 / 60;
let n = 0;
function crew(size) {
  const room = new Room('p', { random: seeded(5) });
  const events = [];
  let snapshots = 0;
  room.flush = function flush() {
    if (this.tick % 3 === 0) snapshots++;
    events.push(...this.events);
    this.events = [];
  };
  const clients = [];
  for (let i = 0; i < size; i++) {
    const c = { id: `c${n++}`, ws: { readyState: 0 }, seat: null };
    room.addClient(c);
    room.join(c, `p${i}`);
    clients.push(c);
  }
  return { room, clients, events, snapshots: () => snapshots };
}
const run = (room, seconds, push = true) => {
  for (let i = 0; i < seconds * 60; i++) {
    for (const s of room.seats) if (s) s.fartHeld = push;
    room.step(DT);
  }
};
function racing(size) {
  const r = crew(size);
  r.room.start();
  run(r.room, 4);
  assert.strictEqual(r.room.status, 'running');
  return r;
}

test('a pause freezes room time, the raft, gas and the race clock, while snapshots keep flowing', () => {
  const { room, clients, events, snapshots } = racing(2);
  room.pause(clients[0]);
  assert.strictEqual(room.status, 'paused');
  room.step(DT);
  assert.deepStrictEqual(events.filter((e) => e.k === 'pause'), [{ k: 'pause', i: 0 }]);
  assert.ok(room.seats.every((x) => !x.farting) && !room.sync, 'nobody sounds like pushing while paused');
  const before = { gt: room.gt, x: room.raft.x, y: room.raft.y, gas: room.seats.map((s) => s.gas), time: room.time };
  const sent = snapshots();
  run(room, 2);
  assert.deepStrictEqual({ gt: room.gt, x: room.raft.x, y: room.raft.y, gas: room.seats.map((s) => s.gas), time: room.time }, before);
  assert.ok(snapshots() - sent >= 39, 'snapshots kept flowing at 20 Hz');
});

test('resume counts down three seconds and continues from the same state', () => {
  const { room, clients } = racing(2);
  room.pause(clients[1]);
  const { x, y } = room.raft, time = room.time;
  room.resume(clients[0]);
  assert.strictEqual(room.status, 'countdown');
  run(room, 2.9);
  assert.strictEqual(room.status, 'countdown');
  assert.deepStrictEqual([room.raft.x, room.raft.y, room.time], [x, y, time]);
  run(room, 0.2);
  assert.strictEqual(room.status, 'running');
});

test('restart begins a new race and stop returns to the lobby with no result', () => {
  const { room, clients } = racing(2);
  room.bites = 3;
  room.pause(clients[0]);
  room.restart(clients[1]);
  assert.strictEqual(room.status, 'countdown');
  assert.strictEqual(room.bites, 0);
  run(room, 4);
  room.pause(clients[0]);
  room.stop(clients[0]);
  assert.strictEqual(room.status, 'lobby');
  assert.strictEqual(room.bestOf(room.mapId).length, 0);
});

test('spectators and wrong states are ignored', () => {
  const { room, clients } = racing(2);
  const spectator = { id: 'spy', ws: { readyState: 0 }, seat: null };
  room.addClient(spectator);
  room.pause(spectator);
  assert.strictEqual(room.status, 'running');
  room.resume(clients[0]);
  room.stop(clients[0]);
  room.restart(clients[0]);
  assert.strictEqual(room.status, 'running');
  assert.strictEqual(room.leave(clients[0]), false, 'cannot stand up mid-race');
});

test('people get on and off during a pause, and the race resumes from the same place', () => {
  const { room, clients } = racing(3);
  room.pause(clients[0]);
  const { x, y } = room.raft;
  const late = { id: 'late', ws: { readyState: 0 }, seat: null };
  room.addClient(late);
  assert.deepStrictEqual(room.join(late, 'late'), { seat: 3 });
  assert.strictEqual(room.leave(clients[1]), true);
  assert.strictEqual(clients[1].seat, null);
  assert.strictEqual(room.seats.length, 3);
  assert.deepStrictEqual(room.seats.map((s) => s.name), ['p0', 'p2', 'late']);
  const { vx, vy } = room.raft;
  room.resume(late);
  while (room.status === 'countdown') {
    assert.deepStrictEqual([room.raft.x, room.raft.y, room.raft.vx, room.raft.vy], [x, y, vx, vy], 'frozen through the countdown');
    run(room, DT);
  }
  assert.strictEqual(room.status, 'running');
});

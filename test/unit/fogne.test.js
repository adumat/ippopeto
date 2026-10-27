'use strict';
const test = require('node:test');
const assert = require('node:assert');
const Track = require('../../public/track.js');
const { Room } = require('../../server/game.js');
const { seeded } = require('../helpers/rng.js');

const DT = 1 / 60;
function onFogne() {
  const room = new Room('f', { random: seeded(2) });
  const events = [];
  room.flush = function flush() {
    events.push(...this.events);
    this.events = [];
  };
  const c = { id: 'a', ws: { readyState: 0 }, seat: null };
  room.addClient(c);
  room.join(c, 'Anna');
  room.setMap(c, 'fogne');
  return { room, events, C: room.course };
}
// park the raft at (x, y), still
const park = (room, x, y) => Object.assign(room.raft, { x, y, vx: 0, vy: 0, w: 0 });

test('a firing jet throws the raft away from its pipe, once per firing', () => {
  const { room, events, C } = onFogne();
  const j = C.JETS[0];
  // the moment the pipe starts firing
  room.gt = j.period * 10 - j.phase + 1.001;
  assert.strictEqual(C.jetState(j, room.gt).stage, 'fire');
  const x = j.x + j.nx * (j.hw - 10), y = j.y + j.ny * (j.hw - 10);
  park(room, x, y);
  room.step(DT);
  const v = room.raft.vx * j.nx + room.raft.vy * j.ny;
  assert.ok(v > 400, `pushed away from the pipe at ${v.toFixed(0)} px/s`);
  assert.strictEqual(events.filter((e) => e.k === 'jet').length, 1);
  for (let i = 0; i < 20; i++) {
    park(room, x, y);
    room.step(DT);
  }
  assert.strictEqual(events.filter((e) => e.k === 'jet').length, 1, 'same firing hits once');
});

test('a dripping pipe does not push', () => {
  const { room, events, C } = onFogne();
  const j = C.JETS[0];
  room.gt = j.period * 10 - j.phase + 0.2;
  park(room, j.x + j.nx * (j.hw - 10), j.y + j.ny * (j.hw - 10));
  room.step(DT);
  assert.strictEqual(events.filter((e) => e.k === 'jet').length, 0);
});

test('an intake pulls the raft in and, at its mouth, sends it 600 px back', () => {
  const { room, events, C } = onFogne();
  const m = C.INTAKES[0];
  const near = { x: m.x + m.nx * 200, y: m.y + m.ny * 200 };
  park(room, near.x, near.y);
  room.step(DT);
  const pull = (room.raft.x - near.x) * -m.nx + (room.raft.y - near.y) * -m.ny;
  assert.ok(pull > 0, 'pulled towards the mouth');

  park(room, m.x + m.nx * (Track.RAFT_R + 5), m.y + m.ny * (Track.RAFT_R + 5));
  const s = C.closest(room.raft.x, room.raft.y).s;
  room.step(DT);
  assert.ok(events.some((e) => e.k === 'suck'));
  const back = C.closest(room.raft.x, room.raft.y).s;
  assert.ok(Math.abs(s - 600 - back) < 40, `sent back from ${s.toFixed(0)} to ${back.toFixed(0)}`);
  assert.strictEqual(room.bites, 0, 'not a bite');
});

test('inside a methane cloud gas refills three times as fast', () => {
  const { room, C } = onFogne();
  const cloud = C.METHANE[0];
  const refill = (x, y) => {
    park(room, x, y);
    room.seats[0].gas = 40;
    room.seats[0].fartHeld = false;
    room.step(DT);
    return room.seats[0].gas - 40;
  };
  const inside = refill(cloud.x, cloud.y);
  const p = C.pointAt(C.START_S);
  const outside = refill(p.x, p.y);
  assert.ok(Math.abs(inside / outside - 3) < 0.01, `ratio ${(inside / outside).toFixed(2)}`);
});

test('a rat bite counts as a rat bite', () => {
  const { room, C } = onFogne();
  room.start();
  while (room.status === 'countdown') room.step(DT);
  const rat = C.crocsAt(room.gt)[0];
  park(room, rat.x, rat.y);
  room.step(DT);
  assert.deepStrictEqual(room.backs, { rat: 1 });
});

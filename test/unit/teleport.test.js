'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { Room } = require('../../server/game.js');
const T = require('../../public/track.js').course('fiume');

test('teleporting through the checkpoints and past the finish ends the race', () => {
  const room = new Room('tp');
  const events = [];
  room.flush = function flush() {
    events.push(...this.events.filter((e) => e.k !== 'bump'));
    this.events = [];
  };
  const c = { id: 'a', ws: { readyState: 0 }, seat: null };
  room.addClient(c);
  room.join(c, 'tester');
  room.start();
  while (room.status === 'countdown') room.step(1 / 60);
  for (const s of [...T.CHECKPOINTS, T.FINISH_S].map((x) => x + 20)) {
    room.teleport(s);
    room.step(1 / 60);
  }
  assert.deepStrictEqual(
    events.filter((e) => e.k === 'cp').map((e) => e.i),
    [0, 1, 2, 3],
  );
  assert.strictEqual(room.status, 'finished');
  assert.ok(events.some((e) => e.k === 'finish'));
});

test('teleport clamps to the course', () => {
  const room = new Room('tp2');
  room.teleport(1e9);
  const end = T.pointAt(T.LENGTH);
  assert.ok(Math.hypot(room.raft.x - end.x, room.raft.y - end.y) < 1);
  room.teleport('nonsense');
  const start = T.pointAt(0);
  assert.ok(Math.hypot(room.raft.x - start.x, room.raft.y - start.y) < 1);
});

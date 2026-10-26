'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { Room } = require('../../server/game.js');

const TOKEN_A = 'a'.repeat(32);
const TOKEN_B = 'b'.repeat(32);
let n = 0;
const client = () => ({ id: `c${n++}`, ws: { readyState: 0 }, seat: null });
const mute = (room) => {
  room.flush = function flush() {
    this.events = [];
  };
  return room;
};
function enter(room, token, name = 'p') {
  const c = client();
  room.addClient(c);
  return { c, res: room.join(c, name, token) };
}
const stepFor = (room, seconds) => {
  for (let i = 0; i < seconds * 60; i++) room.step(1 / 60);
};

test('a disconnected seat is held, marked away, and reclaimed by its token with gas intact', () => {
  const room = mute(new Room('r', { reserveMs: 60000 }));
  const { c } = enter(room, TOKEN_A);
  room.seats[0].gas = 42;
  room.removeClient(c);
  assert.strictEqual(room.seats[0].away, true);
  const back = enter(room, TOKEN_A);
  assert.deepStrictEqual(back.res, { seat: 0 });
  assert.strictEqual(room.seats[0].away, false);
  assert.strictEqual(room.seats[0].gas, 42);
  assert.strictEqual(room.seats[0].id, back.c.id);
});

test('a foreign token cannot take a held seat', () => {
  const room = mute(new Room('r', { reserveMs: 60000 }));
  room.removeClient(enter(room, TOKEN_A).c);
  const other = enter(room, TOKEN_B);
  assert.deepStrictEqual(other.res, { seat: 1 });
  assert.strictEqual(room.seats[0].away, true);
});

test('a held seat is freed after the reserve time', async () => {
  const room = mute(new Room('r', { reserveMs: 50 }));
  room.removeClient(enter(room, TOKEN_A).c);
  enter(room, TOKEN_B); // keeps the room stepping
  await new Promise((r) => setTimeout(r, 80));
  room.step(1 / 60);
  assert.strictEqual(room.seats.filter(Boolean).length, 1);
  assert.ok(room.seats.every((x) => !x || !x.away));
});

test('a seat without a token is freed at once', () => {
  const room = mute(new Room('r'));
  room.removeClient(enter(room, null).c);
  assert.deepStrictEqual(room.seats, [null, null]);
});

test('no new seats during a race, but a held seat can be reclaimed', () => {
  const room = mute(new Room('r', { reserveMs: 60000 }));
  const a = enter(room, TOKEN_A);
  enter(room, TOKEN_B);
  room.start();
  assert.deepStrictEqual(enter(room, 'c'.repeat(32)).res, { seat: null, why: 'racing' });
  stepFor(room, 4);
  assert.strictEqual(room.status, 'running');
  room.removeClient(a.c);
  assert.deepStrictEqual(enter(room, TOKEN_A).res, { seat: 0 });
});

test('the raft grows to six seats, then answers full', () => {
  const room = mute(new Room('r'));
  assert.strictEqual(room.seats.length, 2);
  for (let i = 1; i <= 6; i++) {
    assert.notStrictEqual(enter(room, null).res.seat, null);
    assert.strictEqual(room.seats.length, Math.max(2, i));
  }
  assert.deepStrictEqual(enter(room, null).res, { seat: null, why: 'full' });
  assert.deepStrictEqual(room.seats.map((x) => x.colour), [0, 1, 2, 3, 4, 5]);
});

test('a lone player gets a two-seat raft', () => {
  const room = mute(new Room('r'));
  enter(room, null);
  assert.strictEqual(room.seats.length, 2);
  assert.strictEqual(room.seats[1], null);
});

test('leaving the lobby shrinks the raft and everyone keeps their colour', () => {
  const room = mute(new Room('r'));
  const crew = [0, 1, 2, 3, 4].map(() => enter(room, null));
  room.removeClient(crew[1].c);
  assert.strictEqual(room.seats.length, 4);
  assert.deepStrictEqual(room.seats.map((x) => x.colour), [0, 2, 3, 4]);
  for (const { c } of [crew[0], crew[2], crew[3], crew[4]]) assert.strictEqual(room.seats[c.seat].id, c.id);
  enter(room, null);
  assert.deepStrictEqual(room.seats.map((x) => x.colour).sort(), [0, 1, 2, 3, 4]);
});

test('a seat freed mid-race stays empty until the finish', () => {
  const room = mute(new Room('r'));
  const crew = [0, 1, 2].map(() => enter(room, null));
  room.start();
  stepFor(room, 4);
  room.removeClient(crew[1].c);
  assert.strictEqual(room.seats.length, 3);
  assert.strictEqual(room.seats[1], null);
  room.status = 'finished';
  room.compact();
  assert.strictEqual(room.seats.length, 2);
  assert.strictEqual(crew[2].c.seat, 1);
});

test('a reclaimed seat survives the raft shrinking around it', () => {
  const room = mute(new Room('r', { reserveMs: 60000 }));
  const a = enter(room, null), b = enter(room, TOKEN_B);
  enter(room, null);
  room.removeClient(b.c);
  room.removeClient(a.c);
  const back = enter(room, TOKEN_B);
  assert.strictEqual(room.seats[back.res.seat].id, back.c.id);
  assert.strictEqual(room.seats[back.res.seat].colour, 1);
});

test('joining again only renames', () => {
  const room = mute(new Room('r'));
  const { c } = enter(room, TOKEN_A, 'old');
  assert.deepStrictEqual(room.join(c, 'new', TOKEN_A), { seat: 0 });
  assert.strictEqual(room.seats[0].name, 'new');
});

test('a duplicated tab gets its own seat and does not inherit the token', () => {
  const room = mute(new Room('r', { reserveMs: 60000 }));
  enter(room, TOKEN_A);
  const dup = enter(room, TOKEN_A);
  assert.deepStrictEqual(dup.res, { seat: 1 });
  assert.strictEqual(room.seats[1].token, null);
});

test('away hippos neither push nor block the sync bonus', () => {
  const room = mute(new Room('r', { reserveMs: 60000 }));
  const crew = [TOKEN_A, TOKEN_B, 'c'.repeat(32), 'd'.repeat(32)].map((t) => enter(room, t));
  room.removeClient(crew[3].c);
  for (const s of room.seats) s.fartHeld = true;
  room.step(1 / 60);
  assert.strictEqual(room.seats[3].farting, false);
  assert.strictEqual(room.sync, true);
});

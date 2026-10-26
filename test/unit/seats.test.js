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
  assert.strictEqual(room.seats[0], null);
});

test('a seat without a token is freed at once', () => {
  const room = mute(new Room('r'));
  room.removeClient(enter(room, null).c);
  assert.strictEqual(room.seats[0], null);
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

test('a full raft answers full', () => {
  const room = mute(new Room('r'));
  for (let i = 0; i < 4; i++) enter(room, null);
  assert.deepStrictEqual(enter(room, null).res, { seat: null, why: 'full' });
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

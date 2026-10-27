'use strict';
const test = require('node:test');
const assert = require('node:assert');
const Track = require('../../public/track.js');
const { Room } = require('../../server/game.js');
const { seeded } = require('../helpers/rng.js');

const DT = 1 / 60;
function onLava(size = 2) {
  const room = new Room('l', { random: seeded(6) });
  const events = [];
  room.flush = function flush() {
    events.push(...this.events);
    this.events = [];
  };
  const clients = [];
  for (let i = 0; i < size; i++) {
    const c = { id: `l${i}`, ws: { readyState: 0 }, seat: null };
    room.addClient(c);
    room.join(c, `p${i}`);
    clients.push(c);
  }
  room.setMap(clients[0], 'lava');
  return { room, events, C: room.course };
}
const park = (room, x, y) => Object.assign(room.raft, { x, y, vx: 0, vy: 0, w: 0 });

test('pushing over a vent sets that fart alight for 1 s, doubling its push', () => {
  const { room, events, C } = onLava();
  const v = C.VENTS[0];
  park(room, v.x, v.y);
  room.seats[0].fartHeld = true;
  room.seats[1].fartHeld = false;
  room.step(DT);
  assert.ok(events.some((e) => e.k === 'fire' && e.i === 0));
  assert.ok(room.seats[0].fireUntil > room.gt);
  assert.ok(!(room.seats[1].fireUntil > room.gt), 'a resting hippo does not ignite');
  // still burning away from the vent, out after 1 s
  const p = C.pointAt(C.START_S);
  park(room, p.x, p.y);
  for (let i = 0; i < 50; i++) room.step(DT);
  assert.ok(room.seats[0].fireUntil > room.gt);
  for (let i = 0; i < 15; i++) room.step(DT);
  assert.ok(!(room.seats[0].fireUntil > room.gt));
});

test('a burning fart pushes twice as hard', () => {
  // velocity gained in one step, minus what the current alone gives
  const gain = (push, burning) => {
    const { room, C } = onLava(1);
    const p = C.pointAt(C.START_S);
    park(room, p.x, p.y);
    room.seats[0].fartHeld = push;
    room.seats[0].aim = Math.PI / 2;
    if (burning) room.seats[0].fireUntil = 1e9;
    room.step(DT);
    return { vx: room.raft.vx, vy: room.raft.vy };
  };
  const still = gain(false, false);
  const thrust = (v) => Math.hypot(v.vx - still.vx, v.vy - still.vy);
  const ratio = thrust(gain(true, true)) / thrust(gain(true, false));
  assert.ok(Math.abs(ratio - 2) < 0.05, `ratio ${ratio.toFixed(2)}`);
});

test('geysers erupt to their own rhythm and throw the raft towards the far bank once', () => {
  const { room, events, C } = onLava();
  const [a, b] = C.GEYSERS;
  const erupting = (g, t) => C.geyserState(g, t).stage === 'erupt';
  let differ = false;
  for (let t = 0; t < 20; t += 0.1) if (erupting(a, t) !== erupting(b, t)) differ = true;
  assert.ok(differ);
  // the first moment geyser a erupts
  let t = 0;
  while (!erupting(a, t)) t += 0.01;
  room.gt = t;
  park(room, a.x, a.y);
  room.seats.forEach((s) => (s.fartHeld = false));
  room.step(DT);
  const away = -(room.raft.vx * a.nx + room.raft.vy * a.ny) * a.side;
  assert.ok(away > 300, `thrown at ${away.toFixed(0)} px/s`);
  for (let i = 0; i < 20; i++) {
    park(room, a.x, a.y);
    room.step(DT);
  }
  assert.strictEqual(events.filter((e) => e.k === 'geyser').length, 1);
});

test('a bomb shows its shadow 1.5 s ahead and sends back a raft under it', () => {
  const { room, C } = onLava();
  const b = C.BOMBS[0];
  room.start();
  while (room.status === 'countdown') room.step(DT);
  // just before the next impact
  const st = C.bombState(b, room.gt);
  for (let i = 0; i < Math.floor((st.left - 0.05) / DT); i++) room.step(DT);
  assert.ok(C.bombState(b, room.gt).left < Track.course('lava').BOMB_WARN);
  for (let i = 0; i < 10 && room.bites === 0; i++) {
    park(room, b.x, b.y);
    room.step(DT);
  }
  assert.deepStrictEqual(room.backs, { bomb: 1 });
});

test('near a bank gas refills twice as fast', () => {
  const { room, C } = onLava(1);
  const refill = (x, y) => {
    park(room, x, y);
    room.seats[0].gas = 40;
    room.seats[0].fartHeld = false;
    room.step(DT);
    return room.seats[0].gas - 40;
  };
  const p = C.pointAt(2000);
  const middle = refill(p.x, p.y);
  const edge = p.hw - Track.RAFT_R - 10;
  const bank = refill(p.x + p.nx * edge, p.y + p.ny * edge);
  assert.ok(Math.abs(bank / middle - 2) < 0.01, `ratio ${(bank / middle).toFixed(2)}`);
});

'use strict';
const Track = require('../public/track.js');
const { SURFACES } = require('./rules/surfaces.js');
const { rulesFor } = require('./rules/index.js');

// Physics constants (units: px, s)
const MASS = 4;
const INERTIA = (MASS * (Track.RAFT_SIZE ** 2 * 2)) / 12;
const FART_FORCE = 520;
const ANG_DRAG = 2.4;
const AIM_SPEED = 2.6; // rad/s
const GAS_MAX = 100;
const GAS_DRAIN = 28; // per second while pushing
const GAS_REGEN = 16;
const GAS_RECOVER = 35; // once empty, gas must refill to this before pushing again
const SYNC_MULT = 1.35;
const RESTITUTION = 0.45;
// How each vehicle turns for the same push, relative to the raft
const VEHICLES = { raft: { turn: 1 }, stone: { turn: 1 }, sled: { turn: 0.5 }, ufo: { turn: 1 } };
const COUNTDOWN = 3;
// Peto vestito: pushing below SHART_GAS risks soiling yourself at SHART_RATE per second
// times (1 - gas/SHART_GAS)^2. Forcing a full drain to zero gives ~35 %, stopping at 15 ~3 %.
const SHART_GAS = 25;
const SHART_RATE = 1.45;
const SNAPSHOT_EVERY = 3; // 60 Hz ticks -> 20 Hz snapshots
const RESERVE_MS = Number(process.env.IPPO_RESERVE_MS || 15000);

const r1 = (v) => Math.round(v * 10) / 10;
const r3 = (v) => Math.round(v * 1000) / 1000;

function cleanName(raw) {
  const s = String(raw || '').replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, 16);
  return s || 'Ippo';
}

class Room {
  constructor(id, { reserveMs = RESERVE_MS, random = Math.random } = {}) {
    this.id = id;
    this.reserveMs = reserveMs;
    this.random = random;
    this.clients = new Map(); // id -> { id, ws, seat }
    this.seats = [null, null]; // Track.MIN_SEATS to Track.MAX_SEATS entries
    this.gt = 0; // room game time
    this.tick = 0;
    this.status = 'lobby';
    this.countdown = 0;
    this.best = {}; // map id -> five fastest finishes
    this.events = [];
    this.emptySince = Date.now();
    this.lastBump = 0;
    this.useMap(Track.DEFAULT_MAP, 0);
    this.resetRun();
  }

  useMap(id, seed) {
    this.mapId = id;
    this.course = Track.course(id, seed);
    this.seed = this.course.seed;
    this.rules = rulesFor(this.course.def);
  }

  resetRun() {
    const C = this.course;
    const p = C.pointAt(C.START_S);
    this.raft = { x: p.x, y: p.y, a: Math.atan2(p.tx, -p.ty), vx: 0, vy: 0, w: 0 };
    for (const r of this.rules) if (r.onRespawn) r.onRespawn(this);
    this.lastCp = -1;
    this.bites = 0; // every send-back during the race, whatever its cause
    this.backs = {}; // cause -> count, worded by the map in the results
    this.time = 0;
    this.syncTime = 0;
    this.sharts = 0;
    for (const s of this.seats) {
      if (!s) continue;
      s.gas = GAS_MAX;
      s.exhausted = false;
      s.farting = false;
      s.fireUntil = 0;
      s.aim = Math.PI / 2;
    }
  }

  addClient(client) {
    this.clients.set(client.id, client);
    this.emptySince = null;
  }

  racing() {
    return this.status === 'countdown' || this.status === 'running';
  }

  seatIndexOf(client) {
    return this.seats.findIndex((s) => s && s.id === client.id);
  }

  // Outside a race the seat list is exactly the crew, never shorter than MIN_SEATS.
  // Indices shift, so every client's seat is re-derived from its id.
  compact() {
    if (this.racing()) return;
    const seats = this.seats.filter(Boolean);
    while (seats.length < Track.MIN_SEATS) seats.push(null);
    this.seats = seats;
    for (const c of this.clients.values()) {
      const i = this.seatIndexOf(c);
      c.seat = i === -1 ? null : i;
    }
  }

  removeClient(client) {
    this.clients.delete(client.id);
    const i = this.seatIndexOf(client);
    if (i !== -1) {
      if (this.seats[i].token) {
        // held for the same tab to come back; meanwhile the hippo idles
        Object.assign(this.seats[i], { away: true, awayUntil: Date.now() + this.reserveMs, turn: 0, fartHeld: false });
      } else {
        this.seats[i] = null;
        this.compact();
      }
    }
    if (this.clients.size === 0) this.emptySince = Date.now();
  }

  expireAway() {
    const now = Date.now();
    let freed = false;
    this.seats.forEach((s, i) => {
      if (s && s.away && now >= s.awayUntil) {
        this.seats[i] = null;
        freed = true;
      }
    });
    if (freed) this.compact();
  }

  // Returns { seat } or { seat: null, why: 'full' | 'racing' }.
  join(client, name, token = null) {
    const mine = this.seatIndexOf(client);
    if (mine !== -1) {
      this.seats[mine].name = cleanName(name);
      return { seat: mine };
    }
    this.expireAway();
    if (token) {
      const idx = this.seats.findIndex((s) => s && s.away && s.token === token);
      if (idx !== -1) {
        Object.assign(this.seats[idx], { id: client.id, name: cleanName(name), away: false, awayUntil: 0 });
        client.seat = idx;
        return { seat: idx };
      }
    }
    if (this.racing()) return { seat: null, why: 'racing' };
    const taken = this.seats.filter(Boolean);
    if (taken.length >= Track.MAX_SEATS) return { seat: null, why: 'full' };
    const used = new Set(taken.map((t) => t.colour));
    let colour = 0;
    while (used.has(colour)) colour++;
    // a token already held by a present seat comes from a duplicated tab: that seat keeps it
    const shared = token && taken.some((t) => t.token === token);
    const seat = {
      id: client.id,
      name: cleanName(name),
      colour,
      token: shared ? null : token,
      away: false,
      awayUntil: 0,
      aim: Math.PI / 2,
      turn: 0,
      fartHeld: false,
      farting: false,
      exhausted: false,
      gas: GAS_MAX,
    };
    const free = this.seats.indexOf(null);
    if (free === -1) this.seats.push(seat);
    else this.seats[free] = seat;
    this.compact();
    return { seat: this.seatIndexOf(client) };
  }

  input(client, msg) {
    const s = this.seats.find((x) => x && x.id === client.id);
    if (!s) return;
    const turn = Number(msg.turn);
    s.turn = turn === 1 || turn === -1 ? turn : 0;
    s.fartHeld = !!msg.fart;
  }

  seated(client) {
    return this.seatIndexOf(client) !== -1;
  }

  // Pausing freezes the world; while paused the raft can be reshaped like in the lobby.
  pause(client) {
    if (!this.racing() || !this.seated(client)) return;
    this.status = 'paused';
    // nobody pushes while paused: clear the flags the frozen gas loop would otherwise keep
    for (const seat of this.seats) if (seat) seat.farting = false;
    this.sync = false;
    this.events.push({ k: 'pause', i: this.seatIndexOf(client) });
  }

  resume(client) {
    if (this.status !== 'paused' || !this.seated(client)) return;
    this.status = 'countdown';
    this.countdown = COUNTDOWN;
  }

  restart(client) {
    if (this.status === 'paused' && this.seated(client)) this.start();
  }

  stop(client) {
    if (this.status !== 'paused' || !this.seated(client)) return;
    this.resetRun();
    this.status = 'lobby';
    this.compact();
  }

  leave(client) {
    const i = this.seatIndexOf(client);
    if (this.racing() || i === -1) return false;
    this.seats[i] = null;
    this.compact();
    client.seat = null;
    return true;
  }

  // Any seated player picks the map between races; the vehicle moves to its start.
  setMap(client, id) {
    if ((this.status !== 'lobby' && this.status !== 'finished') || !this.seated(client)) return;
    if (!Track.MAP_IDS.includes(id)) return;
    this.useMap(id, Track.course(id).def.generated ? this.newSeed() : 0);
    this.resetRun();
    this.status = 'lobby';
    this.compact();
  }

  newSeed() {
    return 1 + Math.floor(this.random() * 2147483646);
  }

  start() {
    if (this.status === 'countdown' || this.status === 'running') return;
    if (!this.seats.some(Boolean)) return;
    // a generated map is new at every start, "Un altro giro" included
    if (this.course.def.generated) this.useMap(this.mapId, this.newSeed());
    this.resetRun();
    this.status = 'countdown';
    this.countdown = COUNTDOWN;
  }

  respawn(s) {
    const p = this.course.pointAt(s);
    Object.assign(this.raft, { x: p.x, y: p.y, a: Math.atan2(p.tx, -p.ty), vx: 0, vy: 0, w: 0 });
    for (const r of this.rules) if (r.onRespawn) r.onRespawn(this);
  }

  // Sent back to the last checkpoint by `cause`, one of the map's `causes`.
  sendBack(cause, event) {
    if (this.status === 'running') {
      this.bites++;
      this.backs[cause] = (this.backs[cause] || 0) + 1;
    }
    this.events.push(event);
    this.respawn(this.lastCp >= 0 ? this.course.CHECKPOINTS[this.lastCp] : this.course.START_S);
  }

  // peto vestito: the tank empties and locks exactly as when it runs dry
  shart(seat) {
    seat.gas = 0;
    seat.exhausted = true;
    seat.farting = false;
    this.events.push({ k: 'shart', i: this.seats.indexOf(seat) });
    if (this.status === 'running') this.sharts++;
  }

  teleport(s) {
    this.respawn(Math.max(0, Math.min(this.course.LENGTH, Number(s) || 0)));
  }

  bump(impulse) {
    if (impulse > 120 && this.gt - this.lastBump > 0.25) {
      this.lastBump = this.gt;
      this.events.push({ k: 'bump', m: Math.min(1, impulse / 500) });
    }
  }

  collideCircle(cx, cy, cr) {
    const R = this.raft;
    const dx = R.x - cx, dy = R.y - cy;
    const d = Math.hypot(dx, dy);
    const min = Track.RAFT_R + cr;
    if (d >= min || d === 0) return false;
    const nx = dx / d, ny = dy / d;
    this.contactAt = this.gt;
    R.x += nx * (min - d);
    R.y += ny * (min - d);
    const vn = R.vx * nx + R.vy * ny;
    if (vn < 0) {
      R.vx -= (1 + RESTITUTION) * vn * nx;
      R.vy -= (1 + RESTITUTION) * vn * ny;
      // a glancing hit spins the raft
      const vt = R.vx * -ny + R.vy * nx;
      R.w += vt * 0.004;
      this.bump(-vn);
    }
    return true;
  }

  collideObstacles(C, R) {
    for (const r of C.ROCKS) this.collideCircle(r.x, r.y, r.r);
    for (const b of C.barrelsAt(this.gt)) this.collideCircle(b.x, b.y, b.r);
    for (const cr of C.crocsAt(this.gt)) {
      if (Math.hypot(R.x - cr.x, R.y - cr.y) < Track.RAFT_R + cr.r - 10) {
        this.sendBack(C.def.biter || 'croc', { k: 'bite' });
        return;
      }
    }
  }

  step(dt) {
    this.tick++;
    if (this.status === 'paused') {
      // room time stands still, so moving obstacles freeze with everything else
      this.expireAway();
      this.flush();
      return;
    }
    this.gt += dt;

    if (this.status === 'countdown') {
      this.countdown -= dt;
      if (this.countdown <= 0) {
        this.status = 'running';
        this.events.push({ k: 'go' });
      }
    }
    const frozen = this.status === 'countdown';
    const R = this.raft;
    const C = this.course;

    // gas and aim
    this.expireAway();
    let active = 0, farting = 0;
    for (const s of this.seats) {
      if (!s) continue;
      if (!s.away) active++;
      s.aim += s.turn * AIM_SPEED * dt;
      if (s.aim > Math.PI) s.aim -= 2 * Math.PI;
      if (s.aim < -Math.PI) s.aim += 2 * Math.PI;
      const can = s.fartHeld && !s.away && !s.exhausted && s.gas > 0 && !frozen;
      let regen = 1, risk = 1;
      for (const r of this.rules) {
        if (!r.gas) continue;
        const m = r.gas(this, s);
        regen *= m.regen ?? 1;
        risk *= m.shart ?? 1;
      }
      if (can && s.gas < SHART_GAS && this.random() < 1 - Math.exp(-risk * SHART_RATE * (1 - s.gas / SHART_GAS) ** 2 * dt)) {
        this.shart(s);
      } else if (can) {
        s.gas -= GAS_DRAIN * dt;
        if (s.gas <= 0) {
          s.gas = 0;
          s.exhausted = true;
        }
      } else {
        s.gas = Math.min(GAS_MAX, s.gas + regen * GAS_REGEN * dt);
        if (s.exhausted && s.gas >= GAS_RECOVER) s.exhausted = false;
      }
      s.farting = can && s.gas > 0;
      if (s.farting) farting++;
    }
    this.sync = active >= 2 && farting === active;
    if (this.status === 'running') {
      this.time += dt;
      if (this.sync) this.syncTime += dt;
    }
    if (frozen) {
      this.flush();
      return;
    }

    // thrust; a vehicle in the air (`this.air`, set by a rule) ignores pushes, keeps its
    // momentum and touches nothing until it lands
    const flying = !!this.air;
    const cos = Math.cos(R.a), sin = Math.sin(R.a);
    let fx = 0, fy = 0, torque = 0;
    // total thrust grows with the square root of the crew: 4 hippos push as they always did
    const force = FART_FORCE * Math.sqrt(4 / this.seats.length) * (this.sync ? SYNC_MULT : 1);
    const positions = Track.seatPositions(this.seats.length);
    this.seats.forEach((s, i) => {
      if (!s || !s.farting || flying) return;
      let mult = 1;
      for (const r of this.rules) if (r.thrust) mult *= r.thrust(this, s, i);
      // the rear points along aim, thrust goes the opposite way
      const lfx = -Math.cos(s.aim) * force * mult;
      const lfy = -Math.sin(s.aim) * force * mult;
      const [lx, ly] = positions[i];
      const wfx = lfx * cos - lfy * sin, wfy = lfx * sin + lfy * cos;
      const rx = lx * cos - ly * sin, ry = lx * sin + ly * cos;
      fx += wfx;
      fy += wfy;
      torque += rx * wfy - ry * wfx;
    });

    // the surface: downstream current + whirlpools
    const c = C.closest(R.x, R.y);
    const surface = SURFACES[C.surfaceAt(c.s)];
    let wx = -c.tx * c.flow * surface.current, wy = -c.ty * c.flow * surface.current;
    let spin = 0;
    for (const v of C.VORTICES) {
      const dx = v.x - R.x, dy = v.y - R.y;
      const d = Math.hypot(dx, dy);
      if (d < v.r && d > 1) {
        const k = v.k * (1 - d / v.r);
        wx += (-dy / d) * k + (dx / d) * k * 0.45;
        wy += (dx / d) * k + (dy / d) * k * 0.45;
        spin += 1.6 * (1 - d / v.r);
      }
    }

    const drag = flying ? 0 : surface.drag + surface.over * Math.max(0, Math.hypot(R.vx - wx, R.vy - wy) - surface.cruise);
    R.vx += (fx / MASS - drag * (R.vx - wx)) * dt;
    R.vy += (fy / MASS - drag * (R.vy - wy)) * dt;
    const turn = (VEHICLES[C.def.vehicle] || VEHICLES.raft).turn;
    R.w += ((turn * torque) / INERTIA - ANG_DRAG * R.w + spin) * dt;
    R.x += R.vx * dt;
    R.y += R.vy * dt;
    R.a += R.w * dt;
    if (R.a > Math.PI) R.a -= 2 * Math.PI;
    if (R.a < -Math.PI) R.a += 2 * Math.PI;
    for (const r of this.rules) if (r.force) r.force(this, dt);

    // banks; a map with snow banks lets its own rule catch the vehicle instead, and open
    // edges over the void bounce only where they have rails
    const c2 = C.closest(R.x, R.y);
    const limit = c2.hw - (C.def.banks === 'snow' ? 0 : Track.RAFT_R);
    const solidEdge = !flying && (C.def.banks !== 'void' || C.railedAt(c2.s));
    if (solidEdge && c2.dist > limit && c2.dist > 0) {
      const nx = (R.x - c2.cx) / c2.dist, ny = (R.y - c2.cy) / c2.dist;
      R.x -= nx * (c2.dist - limit);
      R.y -= ny * (c2.dist - limit);
      const vn = R.vx * nx + R.vy * ny;
      if (vn > 0) {
        R.vx -= (1 + RESTITUTION) * vn * nx;
        R.vy -= (1 + RESTITUTION) * vn * ny;
        R.vx *= 0.92;
        R.vy *= 0.92;
        R.w += (R.vx * -ny + R.vy * nx) * 0.003;
        this.bump(vn);
      }
    }

    // obstacles
    if (!flying) this.collideObstacles(C, R);
    for (const r of this.rules) if (r.collide) r.collide(this);

    // checkpoints and finish
    if (this.status === 'running') {
      const s = C.closest(R.x, R.y).s;
      const next = this.lastCp + 1;
      if (next < C.CHECKPOINTS.length && s >= C.CHECKPOINTS[next]) {
        this.lastCp = next;
        this.events.push({ k: 'cp', i: next });
      }
      if (s >= C.FINISH_S && this.lastCp === C.CHECKPOINTS.length - 1) {
        this.status = 'finished';
        const crew = this.seats.filter(Boolean).map((x) => x.name).join(', ');
        const entry = { crew, time: r1(this.time), bites: this.bites, backs: this.backs, sharts: this.sharts, sync: Math.round((100 * this.syncTime) / Math.max(this.time, 0.01)) };
        const best = [...this.bestOf(this.mapId), entry].sort((a, b) => a.time - b.time).slice(0, 5);
        this.best[this.mapId] = best;
        this.events.push({ k: 'finish', map: this.mapId, ...entry, best });
        this.compact();
      }
    }

    this.flush();
  }

  bestOf(id) {
    return this.best[id] || [];
  }

  flush() {
    if (this.tick % SNAPSHOT_EVERY !== 0) return;
    const R = this.raft;
    const extra = {};
    for (const r of this.rules) if (r.snapshot) Object.assign(extra, r.snapshot(this));
    const msg = JSON.stringify({
      t: 's',
      gt: r3(this.gt),
      st: this.status,
      tm: r1(this.status === 'countdown' ? this.countdown : this.time),
      r: [r1(R.x), r1(R.y), r3(R.a), r1(R.vx), r1(R.vy)],
      sy: this.sync ? 1 : 0,
      cp: this.lastCp,
      mp: this.mapId,
      sd: this.seed,
      b: this.bites,
      // a ninth field, 1, only while that hippo's fart is alight
      s: this.seats.map((s) => {
        if (!s) return null;
        const e = [s.id, s.name, r3(s.aim), Math.round(s.gas), s.farting ? 1 : 0, s.exhausted ? 1 : 0, s.away ? 1 : 0, s.colour];
        return s.fireUntil > this.gt ? [...e, 1] : e;
      }),
      ...extra,
      ev: this.events,
    });
    this.events = [];
    for (const c of this.clients.values()) {
      if (c.ws.readyState === 1 && c.ws.bufferedAmount < 256 * 1024) c.ws.send(msg);
    }
  }
}

module.exports = { Room, cleanName };

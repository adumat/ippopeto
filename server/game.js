'use strict';
const Track = require('../public/track.js');

// Physics constants (units: px, s)
const MASS = 4;
const INERTIA = (MASS * (Track.RAFT_SIZE ** 2 * 2)) / 12;
const FART_FORCE = 520;
const LIN_DRAG = 1.1; // drag relative to the water
const ANG_DRAG = 2.4;
const AIM_SPEED = 2.6; // rad/s
const GAS_MAX = 100;
const GAS_DRAIN = 28; // per second while pushing
const GAS_REGEN = 16;
const GAS_RECOVER = 35; // once empty, gas must refill to this before pushing again
const SYNC_MULT = 1.35;
const RESTITUTION = 0.45;
const COUNTDOWN = 3;
const SNAPSHOT_EVERY = 3; // 60 Hz ticks -> 20 Hz snapshots
const RESERVE_MS = Number(process.env.IPPO_RESERVE_MS || 15000);

const r1 = (v) => Math.round(v * 10) / 10;
const r3 = (v) => Math.round(v * 1000) / 1000;

function cleanName(raw) {
  const s = String(raw || '').replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, 16);
  return s || 'Ippo';
}

class Room {
  constructor(id, { reserveMs = RESERVE_MS } = {}) {
    this.id = id;
    this.reserveMs = reserveMs;
    this.clients = new Map(); // id -> { id, ws, seat }
    this.seats = [null, null]; // Track.MIN_SEATS to Track.MAX_SEATS entries
    this.gt = 0; // room game time
    this.tick = 0;
    this.status = 'lobby';
    this.countdown = 0;
    this.best = [];
    this.events = [];
    this.emptySince = Date.now();
    this.lastBump = 0;
    this.resetRun();
  }

  resetRun() {
    const p = Track.pointAt(Track.START_S);
    this.raft = { x: p.x, y: p.y, a: Math.atan2(p.tx, -p.ty), vx: 0, vy: 0, w: 0 };
    this.lastCp = -1;
    this.bites = 0;
    this.time = 0;
    this.syncTime = 0;
    for (const s of this.seats) {
      if (!s) continue;
      s.gas = GAS_MAX;
      s.exhausted = false;
      s.farting = false;
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

  start() {
    if (this.status === 'countdown' || this.status === 'running') return;
    if (!this.seats.some(Boolean)) return;
    this.resetRun();
    this.status = 'countdown';
    this.countdown = COUNTDOWN;
  }

  respawn(s) {
    const p = Track.pointAt(s);
    Object.assign(this.raft, { x: p.x, y: p.y, a: Math.atan2(p.tx, -p.ty), vx: 0, vy: 0, w: 0 });
  }

  teleport(s) {
    this.respawn(Math.max(0, Math.min(Track.LENGTH, Number(s) || 0)));
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

  step(dt) {
    this.gt += dt;
    this.tick++;

    if (this.status === 'countdown') {
      this.countdown -= dt;
      if (this.countdown <= 0) {
        this.status = 'running';
        this.events.push({ k: 'go' });
      }
    }
    const frozen = this.status === 'countdown';
    const R = this.raft;

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
      if (can) {
        s.gas -= GAS_DRAIN * dt;
        if (s.gas <= 0) {
          s.gas = 0;
          s.exhausted = true;
        }
      } else {
        s.gas = Math.min(GAS_MAX, s.gas + GAS_REGEN * dt);
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

    // thrust
    const cos = Math.cos(R.a), sin = Math.sin(R.a);
    let fx = 0, fy = 0, torque = 0;
    // total thrust grows with the square root of the crew: 4 hippos push as they always did
    const force = FART_FORCE * Math.sqrt(4 / this.seats.length) * (this.sync ? SYNC_MULT : 1);
    const positions = Track.seatPositions(this.seats.length);
    this.seats.forEach((s, i) => {
      if (!s || !s.farting) return;
      // the rear points along aim, thrust goes the opposite way
      const lfx = -Math.cos(s.aim) * force;
      const lfy = -Math.sin(s.aim) * force;
      const [lx, ly] = positions[i];
      const wfx = lfx * cos - lfy * sin, wfy = lfx * sin + lfy * cos;
      const rx = lx * cos - ly * sin, ry = lx * sin + ly * cos;
      fx += wfx;
      fy += wfy;
      torque += rx * wfy - ry * wfx;
    });

    // water: downstream current + whirlpools
    const c = Track.closest(R.x, R.y);
    let wx = -c.tx * c.flow, wy = -c.ty * c.flow;
    let spin = 0;
    for (const v of Track.VORTICES) {
      const dx = v.x - R.x, dy = v.y - R.y;
      const d = Math.hypot(dx, dy);
      if (d < v.r && d > 1) {
        const k = v.k * (1 - d / v.r);
        wx += (-dy / d) * k + (dx / d) * k * 0.45;
        wy += (dx / d) * k + (dy / d) * k * 0.45;
        spin += 1.6 * (1 - d / v.r);
      }
    }

    R.vx += (fx / MASS - LIN_DRAG * (R.vx - wx)) * dt;
    R.vy += (fy / MASS - LIN_DRAG * (R.vy - wy)) * dt;
    R.w += (torque / INERTIA - ANG_DRAG * R.w + spin) * dt;
    R.x += R.vx * dt;
    R.y += R.vy * dt;
    R.a += R.w * dt;
    if (R.a > Math.PI) R.a -= 2 * Math.PI;
    if (R.a < -Math.PI) R.a += 2 * Math.PI;

    // banks
    const c2 = Track.closest(R.x, R.y);
    const limit = c2.hw - Track.RAFT_R;
    if (c2.dist > limit && c2.dist > 0) {
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
    for (const r of Track.ROCKS) this.collideCircle(r.x, r.y, r.r);
    for (const b of Track.barrelsAt(this.gt)) this.collideCircle(b.x, b.y, b.r);
    for (const cr of Track.crocsAt(this.gt)) {
      if (Math.hypot(R.x - cr.x, R.y - cr.y) < Track.RAFT_R + cr.r - 10) {
        this.bites += this.status === 'running' ? 1 : 0;
        this.events.push({ k: 'bite' });
        this.respawn(this.lastCp >= 0 ? Track.CHECKPOINTS[this.lastCp] : Track.START_S);
        break;
      }
    }

    // checkpoints and finish
    if (this.status === 'running') {
      const s = Track.closest(R.x, R.y).s;
      const next = this.lastCp + 1;
      if (next < Track.CHECKPOINTS.length && s >= Track.CHECKPOINTS[next]) {
        this.lastCp = next;
        this.events.push({ k: 'cp', i: next });
      }
      if (s >= Track.FINISH_S && this.lastCp === Track.CHECKPOINTS.length - 1) {
        this.status = 'finished';
        const crew = this.seats.filter(Boolean).map((x) => x.name).join(', ');
        const entry = { crew, time: r1(this.time), bites: this.bites, sync: Math.round((100 * this.syncTime) / Math.max(this.time, 0.01)) };
        this.best.push(entry);
        this.best.sort((a, b) => a.time - b.time);
        this.best = this.best.slice(0, 5);
        this.events.push({ k: 'finish', ...entry, best: this.best });
        this.compact();
      }
    }

    this.flush();
  }

  flush() {
    if (this.tick % SNAPSHOT_EVERY !== 0) return;
    const R = this.raft;
    const msg = JSON.stringify({
      t: 's',
      gt: r3(this.gt),
      st: this.status,
      tm: r1(this.status === 'countdown' ? this.countdown : this.time),
      r: [r1(R.x), r1(R.y), r3(R.a), r1(R.vx), r1(R.vy)],
      sy: this.sync ? 1 : 0,
      cp: this.lastCp,
      b: this.bites,
      s: this.seats.map((s) => (s ? [s.id, s.name, r3(s.aim), Math.round(s.gas), s.farting ? 1 : 0, s.exhausted ? 1 : 0, s.away ? 1 : 0, s.colour] : null)),
      ev: this.events,
    });
    this.events = [];
    for (const c of this.clients.values()) {
      if (c.ws.readyState === 1 && c.ws.bufferedAmount < 256 * 1024) c.ws.send(msg);
    }
  }
}

module.exports = { Room, cleanName };

'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { WebSocketServer } = require('ws');
const { Room } = require('./game');

const PORT = Number(process.env.PORT || 8080);
const MAX_ROOMS = Number(process.env.MAX_ROOMS || 50);
const MAX_CLIENTS_PER_ROOM = 12; // 4 on the raft + spectators
const STEP = 1 / 60;

const digest = (v) => crypto.createHash('sha256').update(String(v)).digest();
const ACCESS_DIGEST = process.env.IPPO_ACCESS_CODE ? digest(process.env.IPPO_ACCESS_CODE) : null;
// Comparing fixed-length digests keeps the check constant-time and hides the code's length
function codeMatches(k) {
  return !ACCESS_DIGEST || crypto.timingSafeEqual(digest(k ?? ''), ACCESS_DIGEST);
}
const DENY_CLOSE = { code: 4001, 'room-full': 4002, 'server-full': 4003 };
const DEBUG = process.env.IPPO_DEBUG === '1';

// Static files are loaded into memory at startup (no filesystem access at runtime)
const PUBLIC = path.join(__dirname, '..', 'public');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const files = new Map();
for (const f of fs.readdirSync(PUBLIC)) {
  const ext = path.extname(f);
  if (TYPES[ext]) files.set('/' + f, { body: fs.readFileSync(path.join(PUBLIC, f)), type: TYPES[ext] });
}
for (const f of fs.readdirSync(path.join(PUBLIC, 'sounds'))) {
  if (path.extname(f) === '.mp3') files.set('/sounds/' + f, { body: fs.readFileSync(path.join(PUBLIC, 'sounds', f)), type: 'audio/mpeg' });
}
files.set('/', files.get('/index.html'));

const rooms = new Map();

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/healthz') {
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.end('ok');
    return;
  }
  if (url.pathname === '/stats') {
    let players = 0;
    for (const r of rooms.values()) players += r.clients.size;
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ rooms: rooms.size, players }));
    return;
  }
  const f = files.get(url.pathname);
  if (!f || req.method !== 'GET') {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
    return;
  }
  res.writeHead(200, {
    'content-type': f.type,
    'cache-control': 'no-cache',
    'x-content-type-options': 'nosniff',
  });
  res.end(f.body);
});

const wss = new WebSocketServer({ noServer: true, maxPayload: 2048 });

server.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname !== '/ws') {
    socket.destroy();
    return;
  }
  const roomId = (url.searchParams.get('room') || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 24);
  if (!roomId) {
    socket.destroy();
    return;
  }
  let reason = null;
  let room = rooms.get(roomId);
  if (!codeMatches(url.searchParams.get('k'))) reason = 'code';
  else if (!room && rooms.size >= MAX_ROOMS) reason = 'server-full';
  else if (room && room.clients.size >= MAX_CLIENTS_PER_ROOM) reason = 'room-full';
  if (reason) {
    // A browser cannot read the status of a failed handshake, so refusals go through an open socket
    wss.handleUpgrade(req, socket, head, (ws) => {
      ws.send(JSON.stringify({ t: 'denied', reason }));
      ws.close(DENY_CLOSE[reason], reason);
    });
    return;
  }
  if (!room) {
    room = new Room(roomId);
    rooms.set(roomId, room);
  }
  wss.handleUpgrade(req, socket, head, (ws) => onConnection(ws, room));
});

function onConnection(ws, room) {
  const client = { id: crypto.randomBytes(4).toString('hex'), ws, seat: null };
  ws.isAlive = true;
  room.addClient(client);
  ws.send(JSON.stringify({ t: 'hello', id: client.id, room: room.id, best: room.best }));

  ws.on('pong', () => {
    ws.isAlive = true;
  });
  ws.on('message', (data) => {
    let msg;
    try {
      msg = JSON.parse(data);
    } catch {
      return;
    }
    if (!msg || typeof msg !== 'object') return;
    switch (msg.t) {
      case 'join': {
        const token = /^[0-9a-f]{32}$/.test(msg.token) ? msg.token : null;
        ws.send(JSON.stringify({ t: 'joined', ...room.join(client, msg.name, token) }));
        break;
      }
      case 'in':
        room.input(client, msg);
        break;
      case 'start':
        if (client.seat != null) room.start();
        break;
      case 'debug':
        if (DEBUG && client.seat != null && msg.op === 'teleport') room.teleport(msg.s);
        break;
      case 'ping':
        ws.send(JSON.stringify({ t: 'pong', c: msg.c }));
        break;
      default:
    }
  });
  ws.on('close', () => room.removeClient(client));
  ws.on('error', () => ws.terminate());
}

// Heartbeat: keeps connections alive through proxies and tunnels with idle timeouts
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) {
      ws.terminate();
      continue;
    }
    ws.isAlive = false;
    ws.ping();
  }
}, 20000).unref();

// Fixed-step simulation loop
let last = process.hrtime.bigint();
let acc = 0;
setInterval(() => {
  const now = process.hrtime.bigint();
  acc += Number(now - last) / 1e9;
  last = now;
  if (acc > 0.25) acc = 0.25; // after a long stall, do not catch up forever
  while (acc >= STEP) {
    for (const r of rooms.values()) if (r.clients.size > 0) r.step(STEP);
    acc -= STEP;
  }
}, 1000 / 120);

// Empty room cleanup
setInterval(() => {
  const now = Date.now();
  for (const [id, r] of rooms) if (r.emptySince && now - r.emptySince > 120000) rooms.delete(id);
}, 30000).unref();

server.listen(PORT, () => console.log(`ippopeto in ascolto su :${PORT}`));

function shutdown() {
  for (const ws of wss.clients) ws.close(1001, 'server in riavvio');
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 3000).unref();
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

# protocol

## Purpose

The WebSocket wire protocol between client and server: JSON messages, their fields and validation, the snapshot format and the event list.

## Requirements

### Requirement: Transport

The client SHALL connect to `/ws?room=<id>` over the same origin, using `wss` under HTTPS. Every message SHALL be a JSON object with a `t` type field. The server SHALL ignore unparsable messages and unknown types without closing the socket. Inbound messages SHALL be capped at 2048 bytes.

#### Scenario: Garbage frame
- **WHEN** a client sends invalid JSON
- **THEN** the server drops it and the connection stays open

### Requirement: Join

`{t:'join', name}` SHALL request a seat. The server SHALL reply `{t:'joined', seat}`, with `seat` 0–3, or `null` when the raft is full. A client already seated SHALL only have its name updated.

#### Scenario: Renaming
- **WHEN** a seated client sends `join` again with another name
- **THEN** it keeps its seat under the new name

### Requirement: Input

`{t:'in', turn, fart}` SHALL set the sender's controls: `turn` in {-1, 0, 1}, anything else read as 0; `fart` read as a boolean. Input from spectators SHALL be ignored. Clients SHALL send it only when it changes, plus once on (re)connect.

#### Scenario: Spectator input
- **WHEN** a spectator sends `{t:'in', turn:1, fart:1}`
- **THEN** nothing changes

### Requirement: Start and ping

`{t:'start'}` SHALL be honoured only from a seated client and only when the room is in `lobby` or `finished`. `{t:'ping', c}` SHALL be answered with `{t:'pong', c}`.

#### Scenario: Start mid-race
- **WHEN** a seated client sends `start` while the room is `running`
- **THEN** the race continues unaffected

### Requirement: Hello and snapshot cadence

On connection the server SHALL send `{t:'hello', id, room, best}`, then a snapshot every third simulation tick (20 Hz) for as long as the client is connected.

#### Scenario: Spectator view
- **WHEN** a client connects without joining
- **THEN** it still receives snapshots and can watch

### Requirement: Snapshot format

A snapshot SHALL be `{t:'s', gt, st, tm, r, sy, cp, b, s, ev}`:
- `gt` room time; `st` one of `lobby`, `countdown`, `running`, `finished`;
- `tm` countdown seconds left while counting down, race time otherwise;
- `r` the raft as `[x, y, a, vx, vy]`;
- `sy` 1 while the sync bonus is active; `cp` last checkpoint index, -1 for none; `b` bites;
- `s` four entries, `null` or `[id, name, aim, gas, farting, exhausted]`.

Positions SHALL be rounded to 0.1, angles and `gt` to 0.001.

#### Scenario: Snapshot size
- **WHEN** four hippos are seated and no events fire
- **THEN** a snapshot is a few hundred bytes

### Requirement: Events

Events SHALL ride in the `ev` array of the next snapshot:
- `go`;
- `cp{i}`;
- `bite`;
- `bump{m}`, with `m` from 0 to 1, emitted only above an impulse of 120 and at most every 250 ms;
- `finish{crew, time, bites, sync, best}`.

#### Scenario: Grinding along a bank
- **WHEN** the raft scrapes a bank continuously
- **THEN** clients receive at most four `bump` events per second

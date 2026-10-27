# protocol

## Purpose

The WebSocket wire protocol between client and server: JSON messages, their fields and validation, the snapshot format and the event list.

## Requirements

### Requirement: Transport

The client SHALL connect to `/ws?room=<id>` over the same origin, using `wss` under HTTPS, adding `&k=<code>` when its page URL carries one. Every message SHALL be a JSON object with a `t` type field. The server SHALL ignore unparsable messages and unknown types without closing the socket. Inbound messages SHALL be capped at 2048 bytes.

#### Scenario: Garbage frame
- **WHEN** a client sends invalid JSON
- **THEN** the server drops it and the connection stays open

#### Scenario: Forwarding the code
- **WHEN** the page URL is `/?room=venerdi&k=abc`
- **THEN** the client connects to `/ws?room=venerdi&k=abc`

### Requirement: Join

`{t:'join', name, token}` SHALL request a seat. `token` SHALL be 32 lowercase hex characters, or it is ignored. The server SHALL reply `{t:'joined', seat, why}`, where `seat` is 0–5 or `null` and `why` is present only when `seat` is `null`: `full` or `racing`. A seat index is valid until the next seat-list change: clients SHALL find themselves by id in snapshots.

#### Scenario: Spectator
- **WHEN** a client joins a raft with six aboard
- **THEN** it receives `{t:'joined', seat:null, why:'full'}`

### Requirement: Seat assignment

The server SHALL answer `join` by these rules, in order:
- a client already seated only has its name updated;
- a token matching a reserved seat reclaims it, in any room state;
- during `countdown` or `running`, no new seat is given (`racing`); during `paused` seats are given as in the lobby;
- with fewer than 6 seats taken or reserved, a seat is added with the first free colour; otherwise none (`full`).

#### Scenario: Renaming
- **WHEN** a seated client sends `join` again with another name
- **THEN** it keeps its seat under the new name

#### Scenario: Reclaim mid-race
- **WHEN** a client sends `join` with the token of a seat reserved 4 seconds ago, during a race
- **THEN** it receives that seat

#### Scenario: Token of a connected seat
- **WHEN** a second tab sends `join` with the token of a seat whose owner is still connected
- **THEN** the token is ignored and the normal rules apply

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

### Requirement: Seat list compaction

Outside `countdown` and `running`, the seat list SHALL drop empty seats and keep at least 2 entries after every change.

#### Scenario: Leaving the lobby
- **WHEN** one of three seated players leaves in the lobby
- **THEN** the next snapshot's seat list has two entries

### Requirement: Snapshot format

A snapshot SHALL be `{t:'s', gt, st, tm, r, sy, cp, b, s, ev}`:
- `gt` room time; `st` one of `lobby`, `countdown`, `running`, `paused`, `finished`;
- `tm` countdown seconds left while counting down, race time otherwise;
- `r` the raft as `[x, y, a, vx, vy]`;
- `sy` 1 while the sync bonus is active; `cp` last checkpoint index, -1 for none; `b` bites;
- `s` the seats.

Positions SHALL be rounded to 0.1, angles and `gt` to 0.001.

#### Scenario: Snapshot size
- **WHEN** six hippos are seated and no events fire
- **THEN** a snapshot is a few hundred bytes

### Requirement: Seat entries

The snapshot's `s` SHALL hold 2 to 6 entries, each `null` or `[id, name, aim, gas, farting, exhausted, away, colour]`, where `colour` is 0–5. The seat positions SHALL follow from the entry count, computed identically by server and client.

#### Scenario: Reserved seat
- **WHEN** a seated client disconnects
- **THEN** its seat entry stays in the snapshot with `away` set to 1 until it is reclaimed or freed

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

### Requirement: Denied message

A refused connection SHALL receive exactly one message, `{t:'denied', reason}`, with `reason` one of `code`, `room-full`, `server-full`. The socket SHALL then close with code 4001 for `code`, 4002 for `room-full` and 4003 for `server-full`. No `hello` and no snapshot SHALL precede it.

#### Scenario: Wrong code
- **WHEN** a client connects with a wrong `k`
- **THEN** it receives `{t:'denied', reason:'code'}` and a close with code 4001

### Requirement: Debug teleport

When the server runs with `IPPO_DEBUG=1`, a seated client's `{t:'debug', op:'teleport', s}` SHALL move the raft to course distance `s` (clamped to the course), stopped and aligned with the river. Checkpoints and the finish SHALL then trigger on the next step exactly as if the raft had sailed there. Without `IPPO_DEBUG=1`, or from a spectator, the message SHALL be ignored like any unknown type.

#### Scenario: Production server
- **WHEN** a client sends a teleport to a server without `IPPO_DEBUG=1`
- **THEN** nothing happens

#### Scenario: Skipping to the finish in a test
- **WHEN** during a race a test teleports past each checkpoint in turn, then past the finish
- **THEN** clients receive `cp` events 0 to 3, then `finish`

### Requirement: Pause messages

The server SHALL accept these messages from seated clients only, and ignore them in any other state:
- `{t:'pause'}` in `countdown` or `running`: the room becomes `paused` and emits the event `pause{i}`, with `i` the seat that paused;
- `{t:'resume'}` in `paused`: a 3-second `countdown`, then `running` from the same state;
- `{t:'restart'}` in `paused`: a new race, as `start`;
- `{t:'stop'}` in `paused`: back to `lobby`, raft at the start, no `finish`.

#### Scenario: Pause from a spectator
- **WHEN** a spectator sends `{t:'pause'}` during the race
- **THEN** nothing happens

### Requirement: Leaving a seat

`{t:'leave'}` from a seated client in `lobby`, `finished` or `paused` SHALL free its seat at once and reply `{t:'joined', seat:null}`. During `countdown` or `running` it SHALL be ignored.

#### Scenario: Standing up during a pause
- **WHEN** a seated client sends `{t:'leave'}` while paused
- **THEN** it becomes a spectator and the seat list shrinks

### Requirement: Snapshots while paused

While paused, `gt` SHALL NOT advance, and snapshots SHALL keep flowing at 20 Hz.

#### Scenario: Paused room
- **WHEN** the room is paused
- **THEN** every snapshot carries `st:'paused'` and the same `gt`

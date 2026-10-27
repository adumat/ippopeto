# Spec Delta

## MODIFIED Requirements

### Requirement: Seat assignment

The server SHALL answer `join` by these rules, in order:
- a client already seated only has its name updated;
- a token matching a reserved seat reclaims it, in any room state;
- during `countdown` or `running`, no new seat is given (`racing`); during `paused` seats are given as in the lobby;
- with fewer than 6 seats taken or reserved, a seat is added with the first free colour; otherwise none (`full`).

Outside `countdown` and `running`, the seat list SHALL drop empty seats and keep at least 2 entries after every change.

#### Scenario: Renaming
- **WHEN** a seated client sends `join` again with another name
- **THEN** it keeps its seat under the new name

#### Scenario: Reclaim mid-race
- **WHEN** a client sends `join` with the token of a seat reserved 4 seconds ago, during a race
- **THEN** it receives that seat

#### Scenario: Token of a connected seat
- **WHEN** a second tab sends `join` with the token of a seat whose owner is still connected
- **THEN** the token is ignored and the normal rules apply

### Requirement: Snapshot format

A snapshot SHALL be `{t:'s', gt, st, tm, r, sy, cp, b, s, ev}`:
- `gt` room time, which does not advance while paused; `st` one of `lobby`, `countdown`, `running`, `paused`, `finished`;
- `tm` countdown seconds left while counting down, race time otherwise;
- `r` the raft as `[x, y, a, vx, vy]`;
- `sy` 1 while the sync bonus is active; `cp` last checkpoint index, -1 for none; `b` bites;
- `s` the seats.

Positions SHALL be rounded to 0.1, angles and `gt` to 0.001. Snapshots SHALL keep flowing at 20 Hz while paused.

#### Scenario: Snapshot size
- **WHEN** six hippos are seated and no events fire
- **THEN** a snapshot is a few hundred bytes

#### Scenario: Paused room
- **WHEN** the room is paused
- **THEN** every snapshot carries `st:'paused'` and the same `gt`

## ADDED Requirements

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

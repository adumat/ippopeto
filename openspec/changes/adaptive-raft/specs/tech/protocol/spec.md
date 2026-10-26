# Spec Delta

## MODIFIED Requirements

### Requirement: Join

`{t:'join', name, token}` SHALL request a seat. `token` SHALL be 32 lowercase hex characters, or it is ignored. The server SHALL reply `{t:'joined', seat, why}`, where `seat` is 0–5 or `null` and `why` is present only when `seat` is `null`: `full` or `racing`. A seat index is valid until the next seat-list change: clients SHALL find themselves by id in snapshots.

#### Scenario: Spectator
- **WHEN** a client joins a raft with six aboard
- **THEN** it receives `{t:'joined', seat:null, why:'full'}`

### Requirement: Seat assignment

The server SHALL answer `join` by these rules, in order:
- a client already seated only has its name updated;
- a token matching a reserved seat reclaims it, in any room state;
- during `countdown` or `running`, no new seat is given (`racing`);
- with fewer than 6 seats taken or reserved, a seat is added with the first free colour; otherwise none (`full`).

Outside a race, the seat list SHALL drop empty seats and keep at least 2 entries after every change.

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
- `gt` room time; `st` one of `lobby`, `countdown`, `running`, `finished`;
- `tm` countdown seconds left while counting down, race time otherwise;
- `r` the raft as `[x, y, a, vx, vy]`;
- `sy` 1 while the sync bonus is active; `cp` last checkpoint index, -1 for none; `b` bites;
- `s` the seats, 2 to 6 entries, each `null` or `[id, name, aim, gas, farting, exhausted, away, colour]`, where `colour` is 0–5.

Positions SHALL be rounded to 0.1, angles and `gt` to 0.001. The seat positions SHALL follow from the entry count, computed identically by server and client.

#### Scenario: Snapshot size
- **WHEN** six hippos are seated and no events fire
- **THEN** a snapshot is a few hundred bytes

#### Scenario: Reserved seat
- **WHEN** a seated client disconnects
- **THEN** its seat entry stays in the snapshot with `away` set to 1 until it is reclaimed or freed

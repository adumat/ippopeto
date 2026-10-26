# Spec Delta

## MODIFIED Requirements

### Requirement: Join

`{t:'join', name, token}` SHALL request a seat. `token` SHALL be 32 lowercase hex characters, or it is ignored. The server SHALL reply `{t:'joined', seat, why}`, where `seat` is 0–3 or `null` and `why` is present only when `seat` is `null`: `full` or `racing`. Rules, in order:
- a client already seated only has its name updated;
- a token matching a reserved seat reclaims it, in any room state;
- during `countdown` or `running`, no new seat is given (`racing`);
- otherwise the lowest seat that is neither taken nor reserved is given, or none (`full`).

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
- `s` four entries, `null` or `[id, name, aim, gas, farting, exhausted, away]`.

Positions SHALL be rounded to 0.1, angles and `gt` to 0.001.

#### Scenario: Snapshot size
- **WHEN** four hippos are seated and no events fire
- **THEN** a snapshot is a few hundred bytes

#### Scenario: Reserved seat
- **WHEN** a seated client disconnects
- **THEN** its seat entry stays in the snapshot with `away` set to 1 until it is reclaimed or freed

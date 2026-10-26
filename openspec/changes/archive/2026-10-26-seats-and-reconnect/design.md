# Design

## Context

- `Room.removeClient` nulls the seat at once.
- `join` gives the lowest free seat in any state.
- The client re-sends `join` on every reconnect after boarding, whether it was seated or not.
- Screen visibility is computed in `onSnapshot` from `joined`, `m.st` and a hack: `!$('final-time').textContent` guesses whether results were ever shown.

See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Reconnection that is invisible to teammates beyond a faded hippo.
- One place that decides what the screen shows.

**Non-Goals:**
- Surviving a server restart. State is in memory by design.
- Kicking idle players, a spectator queue, or seat swapping.

## Decisions

**Seat states on the server.** Each seat is `null`, or an object with `away: false|true`, `token`, and `awayUntil` when away. On disconnect a seated client's seat gets `away: true`, `awayUntil = now + RESERVE_MS`, input cleared (`turn 0`, `fartHeld false`). `step()` frees seats past `awayUntil`, using wall-clock time like room cleanup does. A seat with no token (a client that never sent one) is freed immediately, as today.

`RESERVE_MS` defaults to 15000 and reads `IPPO_RESERVE_MS`, so e2e can use about 1500.

**Token in sessionStorage.** sessionStorage is per tab and survives reloads, which is exactly "this tab". localStorage would make two tabs one player.

"Duplicate tab" copies sessionStorage, so two live tabs may share a token. The server ignores a token whose seat is not away, so the duplicate simply becomes a new player.

**Sync and pushing.** `active` counts seats that are present and not away. Away seats skip the push branch and fall into regen, so their gas refills while waiting.

**Join rules move into `Room.join`.** It returns `{seat, why}`. `index.js` only forwards the token, already validated as `/^[0-9a-f]{32}$/`.

**Client screen state.** A single variable `view` ∈ {`splash`, `lobby`, `race`, `results`} and one `render()` that sets every `hidden` from it. Transitions:

| From | Trigger | To |
|---|---|---|
| `splash` | `joined` | `lobby`, or `race` if `st` is `countdown`/`running` |
| any boarded | snapshot `st` enters `countdown`/`running` | `race` |
| `race` | `finish` event | `results` |
| `race` | snapshot `st` = `lobby` | `lobby` (defensive) |

Arriving in `finished` without having seen `finish` stays in `lobby`. That replaces the `final-time` hack. "Siediti", "Si parte" and the solo hint are derived from `mySeat` and the latest seats on every `render()`.

**Spectators no longer auto-join on reconnect.** The client tracks `wasSeated`. Only then does `onopen` resend `join` with the token. This closes the accidental mid-race seating.

**Bandwidth.** One more `0`/`1` per seat: ~8 bytes per snapshot, ~160 B/s per client, against a ~7 KB/s budget.

## Risks / Trade-offs

- [A seat held for 15 s blocks a spectator from sitting] → Intended. "Siediti" appears when the reservation lapses, because the snapshot shows the seat freed.
- [Mid-race arrivals now watch a whole race (~2 min)] → The owner chose this, to keep crews and times consistent.
- [The screen refactor regresses an existing flow] → `race.spec` and `touch.spec` from `reproducible-tests` must stay green, and `reconnect.spec` is added here.

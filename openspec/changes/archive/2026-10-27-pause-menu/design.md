# Design

## Context

- `Room.status` is `lobby | countdown | running | finished`; `racing()` is countdown or running.
- `compact()` and `join` already refuse to reshape the raft while `racing()`.
- Moving obstacles are pure functions of room time `gt`. The client renders at a time `rg` derived from snapshots plus its own clock, clamped only at the start of its buffer.
- The client's timer shows `tm`, which during a countdown holds the seconds left, not race time.

See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- A pause that freezes the world exactly and resumes it exactly.
- Seat changes in a pause that reuse the existing seat model.

**Non-Goals:**
- Voting, a pause owner, or a pause time limit.
- Pausing in the lobby.

## Decisions

**`paused` is its own status, outside `racing()`.** Because `racing()` excludes it, joining and compaction work during a pause with no new code paths. On `step()` while paused, only `tick` and `expireAway()` run, then `flush()`: no `gt`, no physics, no gas. Expired reservations therefore free and compact seats during a pause too.

**Resume reuses the countdown.** `resume` sets `status = 'countdown'` and `countdown = 3` without `resetRun()`. The existing countdown-to-running transition then emits `go`. `restart` is `start()`, which already resets the run and is allowed from any non-racing status. `stop` is `resetRun()` with `status = 'lobby'` and a compaction.

**The pause event names the seat.** `pause{i}` lets clients toast "<name> ha messo in pausa" from the same snapshot's seat list, like `shart{i}`.

**Client world time stops with the server.** When the render time passes the newest snapshot, the interpolation returns that snapshot's `gt` as the world time, so obstacles stop with it instead of drifting on the local clock. This also removes a small drift under network jitter while running.

**The race clock survives the resume countdown.** The client keeps the last race time seen in a `running` or `paused` snapshot and shows it during a countdown. It resets to zero when a countdown starts from the lobby or the results.

**UI.**
- A ⏸ icon button beside the mute button, shown only to seated players during countdown and race.
- `P` or `Esc` pauses; `P` resumes.
- A centred card `#paused` with "In pausa", the three actions, "Siediti"/"Alzati" and the crew list.
- `setView` gains a `paused` view.

## Risks / Trade-offs

- [Anyone can pause, so someone can grief by pausing repeatedly] → Colleagues on a call; the toast names who paused. Revisit only if it happens.
- [A resized raft changes thrust mid-race] → Intended: the crew changed, so the push changes. Times stay comparable enough for a party game.

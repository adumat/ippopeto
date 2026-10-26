# Design

## Context

- `Track.SEATS` holds four fixed corner positions used by both the server (torque) and the client (drawing).
- `Room.seats` is a fixed array of 4. Colours are indexed by seat in the client's `COLORS`.
- Seat reservation (`away`, `token`, `awayUntil`) and "no new seats mid-race" already exist.

See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Any crew from 2 to 6 can play and finish, without changing the course.
- Players keep their identity (colour) as the raft resizes.

**Non-Goals:**
- More than 6 seats.
- Different raft sizes or shapes.
- Retuning obstacles.

## Decisions

**Positions are a pure function of N.** `Track.seatPositions(n)` returns n points at angle `−π/2 + π/n + 2πk/n` on radius 51, in local raft coordinates (−y = bow). That reproduces today's corners for n = 4 (36 ≈ 51·cos 45°) and puts n = 2 on the left and right sides. It lives in `track.js`, so server and client cannot disagree; the snapshot carries only the count.

**The seat list is the seat count.** `Room.seats` becomes a variable-length array. Outside a race, `compact()` runs after every join, leave and expiry: it drops `null` entries, then pads with `null` to at least 2. During `countdown` and `running` nothing compacts: a seat freed mid-race stays `null`, and compaction runs when the race ends. Seat indices can therefore shift in the lobby, so:
- `client.seat` is re-derived after each compaction, by looking up the seat whose `id` is the client's;
- the browser finds itself by its id in snapshots, not by the index from `joined`.

**Colour is stored on the seat.** At creation a seat takes the lowest colour index not used by another seat; it keeps it through reservation, reclaim and compaction. The snapshot sends it as the eighth field.

**Thrust.** `FART_FORCE × sqrt(4 / seats.length)`, where the length is fixed during the race. Mass and inertia stay: the raft is the same raft.

**Difficulty check.** `runCrew` already aims every seat the same way, so it works for any N. The unit test asserts that crews of 2, 4 and 6 finish within 300 s. If the 2-bot crew still cannot finish, because the bot cannot time the crocodiles, that is reported to the owner before any constant changes.

**Client.**
- `COLORS` gains coral and ice blue, indexed by the seat's colour field.
- Seat cards are rebuilt when the count changes.
- Below 640 px, cards for N ≥ 5 shrink to fit six in 390 px.
- Hippos scale from 0.82 to 0.68 when N ≥ 5.
- `mySeat` from `joined` is used only to know "I am seated"; my position comes from finding my id in `s`.

## Risks / Trade-offs

- [Six hippos crowd a 120 px raft] → Smaller sprites at N ≥ 5; owner approves a screenshot.
- [Index shifts confuse the reconnect token] → Reclaim matches on the token, never the index, so it is unaffected; covered by the existing reconnect e2e.
- [Two-player tuning changes the feel] → It is the owner's choice ("via di mezzo"); revisit after a real game.

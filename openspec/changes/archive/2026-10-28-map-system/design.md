# Design

## Context

- `public/track.js` hard-codes the river: control points, obstacle tables, and an `api` object (`pointAt`, `closest`, `ROCKS`, `barrelsAt`, `CHECKPOINTS`…), shared by server and client.
- `server/game.js` reads `Track.*` directly: a single global course.
- The workbook decisions live in the artifact "Mappe di Ippopeto" (db doc `progetto/mappe`); this change covers the "Regole comuni" tab.

See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- One engine, many map modules; the Fiume unchanged byte for byte in behaviour.
- A hook per surface and per rule, so each map change only adds its pieces.

**Non-Goals:**
- Any of the five new maps (their own changes).
- Voting or rotation; persistence of best times.

## Decisions

**`Track.build(def, seed)` returns a course object with today's API.** `pointAt`, `closest`, `CHECKPOINTS`, `FINISH_S`, obstacle lists and `…At(t)` movers keep their names, so `game.js` swaps `Track.x` for `this.course.x` mechanically. Constants that do not depend on the map (`RAFT_SIZE`, `RAFT_R`, seats) stay on `Track`. Courses are cached by `id:seed`.

**A map module is data plus optional rule names.** `{ id, name, vehicle, generated, control | generate(rng), surfaces: [[u0, u1, kind]], obstacles: {...}, rules: ['jets', …] }`. The Fiume module is today's tables moved verbatim. A small seeded PRNG (mulberry32) lives in `track.js` for generated maps.

**Rules are server modules with a fixed hook set.** `server/rules/<name>.js` exports any of `force(room, dt)`, `collide(room)`, `gas(room, seat, dt)`, `onRespawn(room)`. `game.js` calls the hooks of the current map's rules in `step()`. Surfaces are a rule too (`surfaces.js`), returning drag and current per surface kind; water and lava map to today's values. This keeps `game.js` from growing a branch per map.

**Client drawing per map.** `public/draw/<map>.js` registers background, banks, obstacles and vehicle painters on `window.Draw[id]`, plain scripts with no build step. The Fiume painter is today's code moved.

**Seed on start.** `start()` draws a new 31-bit seed for generated maps (server `crypto.randomInt`), fixed maps keep 0. Snapshots carry `mp` and `sd`; clients rebuild when either changes.

**Best times keyed by map id.** `room.best` becomes `{ [id]: [] }`.

**Selector.** A row of thumbnails in the lobby and results cards; thumbnails are pre-rendered PNGs in `public/maps/thumbs/` (no runtime cost, readable on phones).

## Risks / Trade-offs

- [The reference bot cannot read a new map's features (wide bends, ramps)] → A map module may carry bot hints (look-ahead distance, where to push together); the bot's steering on the Fiume stays exactly as it is.
- [Refactor shifts Fiume behaviour subtly] → Golden test: four-bot time and checkpoint timestamps identical before and after, to 0.1 s.
- [Several script tags per map slow first load] → Maps are a few KB each; measured in the delivery bandwidth check.

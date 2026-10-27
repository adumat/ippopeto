# Tasks

## 1. Course engine

- [x] 1.1 Record a golden run: four-bot time and checkpoint times on today's river. Verify the numbers are saved in a test fixture
- [x] 1.2 Turn `public/track.js` into `Track.build(def, seed)` with a seeded PRNG, and move the river into `public/maps/fiume.js`. Verify `npm test` passes and the golden run matches to 0.1 s
- [x] 1.3 Add the rule hook set and `server/rules/surfaces.js`, with water and lava as today. Verify a unit test: a water-only map handles exactly like the Fiume

## 2. Server

- [x] 2.1 Give the room a current map and seed, `{t:'map', id}`, a new seed on every start of a generated map, and `mp`/`sd` in snapshots. Verify unit tests: map change only from seated clients in `lobby`/`finished`, vehicle reset to the start, seed changes on "Un altro giro"
- [x] 2.2 Keep best times per map. Verify a unit test: a finish on one map leaves the other maps' lists unchanged

## 3. Client

- [x] 3.1 Move the Fiume drawing into `public/draw/fiume.js` and rebuild the course on `mp`/`sd` change. Verify the e2e race flow passes unchanged
- [x] 3.2 Add the map name, thumbnail and selector to the lobby and results cards, disabled for spectators. Verify an e2e: the current map is shown and pressed, spectators get disabled buttons (picking a second map across browsers is verified in `map-fogne`, the first change with two maps)
- [ ] 3.3 Send the owner screenshots of the selector on desktop and phone. Verify the owner approves

## 4. Verification

- [x] 4.1 Run course, centre-line and difficulty checks on every registered map, with crews of 2, 4 and 6 and 50 seeds for generated maps. Verify `npm test` names the map in every failure message

## 5. Docs

- [x] 5.1 Document maps in the README and the map module format in AGENTS.md. Verify both mention `public/maps/`

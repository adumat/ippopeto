# Tasks

## 1. Server

- [x] 1.1 Add the `paused` status and freeze `step()` while paused (no `gt`, physics or gas; `expireAway` and `flush` still run). Verify with a unit test: after 2 s paused, `gt`, raft position, gas and race time are unchanged and snapshots kept flowing
- [x] 1.2 Add `pause` (emits `pause{i}`), `resume`, `restart`, `stop` and `leave`, accepted from seated clients in the right states, and wire them in `server/index.js`. Verify with unit tests for each action, including that spectators and wrong states are ignored and that `stop` records no best time
- [x] 1.3 Verify that a spectator can join and a player can leave during a pause, the raft resizes, and resume continues from the same place. Verify with a unit test

## 2. Client

- [x] 2.1 Clamp the render world time to the newest snapshot's `gt`, and keep the last race time across the resume countdown. Verify with an e2e that the timer does not reset to 0:00.0 during the resume countdown
- [x] 2.2 Add the pause button, `P`/`Esc`, the "In pausa" card with Riprendi, Ricomincia, Termina la gara, Siediti/Alzati and the crew, the `paused` view, and the "<name> ha messo in pausa" toast. Verify with an e2e: two browsers and a bot; one pauses, a spectator sits, resume shows a countdown, and stop returns everyone to the lobby
- [ ] 2.3 Send the owner screenshots of the pause card on desktop and phone. Verify the owner approves

## 3. Docs

- [x] 3.1 Document the pause in the README (keys) and AGENTS.md (status machine). Verify both mention `paused`

# Tasks

## 1. Map

- [ ] 1.1 Write the cave generator in `public/maps/grotta.js`. Verify course, centre-line and gap checks pass on 50 seeds, and the same seed builds the same cave in Node and in the browser
- [ ] 1.2 Add bat swarms and blind fish. Verify unit tests: a swarm bounces the raft and emits `bats`, a fish bite sends it back
- [ ] 1.3 Tune until crews of 2, 4 and 6 finish on 50 seeds. Verify `npm test` difficulty output

## 2. Client

- [ ] 2.1 Draw the cave and the darkness mask with glow, gas light, mushrooms and fireflies. Verify an e2e race on the Grotta with no console errors and a frame time under 16 ms on the phone profile
- [ ] 2.2 Tune the darkness with the owner in a field test. Verify the owner approves the radius

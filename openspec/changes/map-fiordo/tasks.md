# Tasks

## 1. Map

- [ ] 1.1 Write `public/maps/fiordo.js`: course, snow edges, slopes, ice blocks, penguins, bear positions, thin-ice bridges. Verify course and centre-line checks pass for the Fiordo
- [ ] 1.2 Add sled handling on ice and the slope force. Verify unit tests: no sideways drift, half turn rate, coasting distance
- [ ] 1.3 Add snow and strokes. Verify unit tests: three synchronised strokes free the sled, an out-of-sync push does not count, the count resets after 5 s
- [ ] 1.4 Add thin ice and bears. Verify unit tests: a tile breaks 1.5 s after first touch, tiles refreeze on respawn, a bear on its line sends the sled back
- [ ] 1.5 Tune until crews of 2, 4 and 6 finish. Verify `npm test` difficulty output

## 2. Client

- [ ] 2.1 Draw the Fiordo: ice, snow, slope arrows, runner grooves, sled, thin ice states, blocks, penguins, bears with warning line. Verify an e2e race on the Fiordo with no console errors
- [ ] 2.2 Send the owner screenshots on desktop and phone. Verify the owner approves

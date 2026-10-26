# Proposal

## Why

The raft has exactly four seats. Two colleagues get a raft that is half empty and, at today's tuning, can barely finish. A fifth and sixth person can only watch. The raft should fit the crew that shows up: from 2 to 6.

## What Changes

- The raft has as many seats as people sitting, at least 2 and at most 6, evenly spaced around its edge and symmetric about the bow. With 4 they sit at the corners, as today. The raft's size and collision shape do not change, so the course's gap rule still holds.
- The seat count follows the crew in the lobby and on the results card, and freezes from "Si parte" until the race ends.
- Total thrust grows with the square root of the crew size: each of N hippos pushes with 520 × √(4/N). With 4 nothing changes; 2 go about 40 % faster than today, and 6 about 22 % faster than 4.
- A colour belongs to a person, not to a seat. Two colours are added for the 5th and 6th hippo: coral red `#ef4b3f` and ice blue `#8fd3ff`. When someone leaves the lobby, the others move around the edge but keep their colour.
- Hippos are drawn smaller with 5–6 aboard, and the seat cards shrink so six fit a 390 px phone.
- **BREAKING (protocol)**: the snapshot's seat list has 2–6 entries, and each entry gains a colour index.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `product/rooms-and-crew`: 2–6 seats that follow the crew; full at 6.
- `product/raft-handling`: thrust per hippo scales with crew size; seats sit around the edge.
- `product/look-and-sound`: six colours that belong to people; smaller hippos at 5–6.
- `product/race-and-results`: the HUD shows one card per seat, fitting six.
- `tech/protocol`: seat range 0–5, a variable-length seat list, and the colour index.

## Impact

- Code:
  - `public/track.js`: seat positions for N replace the fixed `SEATS`;
  - `server/game.js`: seat list, compaction, colours, thrust;
  - `public/client.js` and `public/style.css`: drawing, HUD, colours.
- Tests: the difficulty check runs crews of 2, 4 and 6; unit tests cover seat compaction and colour stability; the e2e suite stays green.
- Bandwidth: about 1 KB/s more per client with six aboard.

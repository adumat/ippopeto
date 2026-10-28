# Proposal

## Why

The third new map: a river of lava inside a volcano. The hazards are timed (geysers, bombs), and the vents reward the crew for pushing together.

## What Changes

- New map "Fiume di lava": as wide as the Fiume, with a slower current, rock banks, and a stone raft (wood would burn).
- Vents are glowing pools of gas: a hippo pushing while the raft is over one sets its fart alight and pushes twice as hard for 1 s.
- Geysers erupt, each to its own rhythm, and throw the raft sideways.
- Lava bombs fall from above. Their shadow warns 1.5 s ahead; a hit sends the raft back to the last checkpoint.
- The heat near the banks refills gas faster.
- Fire salamanders bite like the crocodiles; volcanic rocks block the way.

## Capabilities

### New Capabilities

- `product/map-lava`: the lava course, vents, geysers, bombs, heat and salamanders.

### Modified Capabilities

- `tech/protocol`: events for ignition and bombs.

## Impact

- Code: `public/maps/lava.js`, `public/draw/lava.js`, `server/rules/vents.js`, `server/rules/geysers.js`, `server/rules/bombs.js`, `server/rules/heat.js`.
- Depends on `map-system`.

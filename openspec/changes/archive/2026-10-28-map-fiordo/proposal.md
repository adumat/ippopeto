# Proposal

## Why

The second new map: a frozen fjord. The crew rides a sled, so momentum and the slope matter more than pushing hard.

## What Changes

- New map "Fiordo ghiacciato": a frozen river between snow banks, raced on a sled.
- The ice has very low friction. The sled goes where its runners point and turns slowly, so bends have to be set up early.
- Slopes push the sled back, forward or sideways; there is no current.
- Snow at the edges: the sled gets stuck and comes free only with three pushes of the whole crew in unison.
- Thin ice gives way under the sled after 1.5 s, and the crew falls into the water.
- Ice blocks; penguins sliding across the course; polar bears that charge in a straight line.

## Capabilities

### New Capabilities

- `product/map-fiordo`: the Fiordo course, sled handling, its surfaces and obstacles.

### Modified Capabilities

- `tech/protocol`: events for getting stuck, breaking ice and bears; ice tile state in snapshots.

## Impact

- Code: `public/maps/fiordo.js`, `public/draw/fiordo.js`, `server/rules/ice.js`, `server/rules/snow.js`, `server/rules/thin-ice.js`, `server/rules/bears.js`.
- Depends on `map-system`.

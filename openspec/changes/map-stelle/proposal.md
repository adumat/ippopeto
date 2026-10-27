# Proposal

## Why

The fifth new map, a deliberate nod to Mario Kart: a ribbon of light floating in space, with ramps, jumps and turbo pads, raced on a flying saucer.

## What Changes

- New map "Strada delle stelle": a fixed circuit with fast straights, hairpins without rails and a final jump. The crew flies a flying saucer.
- Some stretches have rails that bounce; others open onto the void. Leaving the track there means falling, and starting again from the last checkpoint.
- Ramps sit in front of holes: with enough speed the saucer jumps and flies uncontrolled until it lands; too slow and it falls into the hole.
- Turbo pads give a forward boost for 1 s.
- There is no current: planets off the track pull the saucer towards the edge. Comets cross the track at intervals.

## Capabilities

### New Capabilities

- `product/map-stelle`: the star road, void, jumps, turbo, planets and comets.

### Modified Capabilities

- `tech/protocol`: flight height in snapshots; fall and turbo events.

## Impact

- Code: `public/maps/stelle.js`, `public/draw/stelle.js`, `server/rules/void.js`, `server/rules/jumps.js`, `server/rules/turbo.js`, `server/rules/gravity.js`.
- Depends on `map-system`.

# Proposal

## Why

In the field the owner found the Fogne jets barely noticeable: a pipe was supposed to throw the raft around, but a hit only nudged it into the far wall, and it settled back within a second.

## What Changes

- A jet's throw grows from about 600 to 800 px/s and adds a strong spin, so the raft is slammed into the far wall and turned by about 90°.
- To keep the map's length, the collector has six pipes instead of eight, and they fire about 1.4 times less often.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `product/map-fogne`: the Jets requirement gets the spin and the new throw.

## Impact

`server/rules/jets.js` and `public/maps/fogne.js`.

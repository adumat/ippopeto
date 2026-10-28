# Proposal

## Why

The fourth new map: an underground river in total darkness, lit only by the hippos' glowing gas. Darkness only stays hard if the course cannot be learned, so the layout changes every race.

## What Changes

- New map "Grotta buia": a generated course, new at every start including "Un altro giro", the same for everyone.
- The screen is black except for a small glow around the raft (about one and a half rafts) and the gas clouds, which light up and fade over a few seconds.
- Glowing mushrooms mark the checkpoints and fireflies mark the bends.
- Stalagmites; bat swarms that hit the raft and cover the view; blind fish that bite.

## Capabilities

### New Capabilities

- `product/map-grotta`: the generated cave, darkness and lights, its obstacles.

### Modified Capabilities

- `tech/protocol`: an event for bat hits. Generation and the seed are part of `map-system`.

## Impact

- Code: `public/maps/grotta.js` (generator), `public/draw/grotta.js` (darkness overlay), `server/rules/bats.js`.
- Client performance: one offscreen darkness mask per frame.
- Depends on `map-system`.

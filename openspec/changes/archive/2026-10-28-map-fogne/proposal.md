# Proposal

## Why

First of the five new maps designed with the owner: the sewers under the city. Danger comes from the walls, through pipes that fire water into the canal and intakes that suck it away.

## What Changes

- New map "Fogne della città": a narrow brick canal with near right-angle bends, in three stretches (inlet, collector, final basin).
- Jets: pipes that drip for 1 s and then fire a jet. A vehicle under the jet is thrown sideways, and everyone's screen gets green splashes.
- Intakes: they pull the raft in, without spinning it. Touching the mouth sucks the raft away and spits it back a fixed distance down the canal.
- Methane clouds: inside one, gas refills three times faster and a peto vestito is three times more likely.
- Rubber ducks drift across the canal; giant rats bite, sending the raft back to the last checkpoint.

## Capabilities

### New Capabilities

- `product/map-fogne`: the Fogne course, its obstacles and their rules.

### Modified Capabilities

- `tech/protocol`: events for jets and intakes.

## Impact

- Code: `public/maps/fogne.js`, `public/draw/fogne.js`, `server/rules/jets.js`, `server/rules/intakes.js`, `server/rules/methane.js`.
- Depends on `map-system`.

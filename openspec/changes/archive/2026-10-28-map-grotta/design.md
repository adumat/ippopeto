# Design

## Context

Builds on `map-system` (seeded generation, `sd` in snapshots). Draft art is in the artifact "Mappe di Ippopeto", Grotta tab.

## Decisions

**The generator walks a heading with bounded turns.** From the seed: control points every 450–650 px, each turning by at most 50° and never pointing more than 60° from straight up, with half-widths 205–260 px (wide enough for a crossing mover to leave the gap). Obstacles take shuffled slots at least 0.035 of the course apart, away from the checkpoints and the stretch after them; fish start after the first 15 % and are spread at least 0.12 apart, because a gauntlet of fish after a checkpoint looped two-hippo crews on bites.

**Stretches must not run side by side.** `Track.clearance` measures the smallest gap between the banks of two non-neighbouring stretches; `build` redraws a generated layout from the same random stream until it is at least 100 px, and `npm test` asserts it for every map. Without it a raft near one bank could be mapped onto the other stretch.

**Darkness is a client-only mask.** An offscreen canvas at half resolution filled black, with `destination-out` radial holes for the raft glow (180 px), a light left by every new gas puff fading over 2.5 s, mushrooms and fireflies. It is the painter's optional `overlay` hook. Nothing new on the wire: gas particles are already client-side effects from seat state.

**Swarm blinding is a client effect** triggered by a `bats` event.

## Risks / Trade-offs

- [Generation rejects too many layouts and stalls `start()`] → Cap at 20 attempts; the 50-seed course test shows none needed more than a few.
- [The mask costs too much on old phones] → Half-resolution mask; measured on the e2e phone profile.

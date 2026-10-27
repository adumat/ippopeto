# Design

## Context

Builds on `map-system` (seeded generation, `sd` in snapshots). Draft art is in the artifact "Mappe di Ippopeto", Grotta tab.

## Decisions

**The generator walks a heading with bounded turns.** From the seed: 18–22 control points, each turning by a random angle within ±60° and stepping 450–650 px, with half-widths 170–260 px; then obstacles are placed by the same seeded stream and re-drawn until the gap check passes. The centre-line consistency check is part of generation: a candidate that fails it is discarded and the next seed offset is tried.

**Darkness is a client-only mask.** An offscreen canvas at half resolution filled black, with `destination-out` radial holes for the raft glow, active gas particles (radius by age), mushrooms and fireflies. Nothing new on the wire: gas particles are already client-side effects from seat state.

**Swarm blinding is a client effect** triggered by a `bats` event.

## Risks / Trade-offs

- [Generation rejects too many seeds and stalls `start()`] → Cap at 20 attempts, measured in the 50-seed test; fall back to the last valid layout.
- [The mask costs too much on old phones] → Half-resolution mask; measured on the e2e phone profile.

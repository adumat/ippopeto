# Design

## Context

Builds on `map-system`: map module, rule hooks, per-map drawing. Draft art for every object is in the artifact "Mappe di Ippopeto", Fogne tab.

## Decisions

**Jets are timed zones.** Each pipe is `{u, side, length, phase}`; its state (drip/fire/rest) is a pure function of `gt`. The `collide` hook applies one impulse per firing to a vehicle overlapping the jet rectangle, tracked by firing index so it hits once.

**Intakes reuse the whirlpool force without the swirl.** Radial pull `k / d`, capped, inside radius; a send-back of 600 px of course distance via the existing `respawn(s)`.

**Methane multiplies two existing numbers.** The `gas` hook scales refill and shart rate by 3 inside a cloud; no new state.

**Green splats reuse the peto vestito overlay** with a colour parameter.

## Risks / Trade-offs

- [A send-back lands the raft in front of a firing pipe repeatedly] → The course check also verifies no pipe covers a send-back landing point.
- [Narrow canal plus right angles too hard for two] → Tuned with the 2-bot check; widen bends before softening jets.

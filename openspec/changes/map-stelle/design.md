# Design

## Context

Builds on `map-system`. Draft art is in the artifact "Mappe di Ippopeto", Stelle tab.

## Decisions

**Height is a separate coordinate.** While airborne the room integrates `z` with a fixed take-off speed proportional to ground speed and constant gravity; thrust, turning and collisions are skipped until `z` returns to 0. Landing tests the surface under the centre.

**Void is a surface with no support.** The `force` hook of `void.js` triggers the fall when the centre is over void and `z = 0`; holes are void stretches.

**Rails are per-stretch flags** on the course: railed stretches bounce with the existing bank code, unrailed ones do not clamp.

**Planet pull is the whirlpool pull without swirl**, from a point outside the track.

## Risks / Trade-offs

- [The bot cannot judge ramps] → A bot hint in the Stelle module makes it push all together from a set distance before every ramp; tuned with the 2-bot check.
- [A fall right after a checkpoint feels harsh] → Accepted by the owner (checkpoint chosen over "just before the fall").

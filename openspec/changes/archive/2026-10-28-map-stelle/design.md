# Design

## Context

Builds on `map-system`. Draft art is in the artifact "Mappe di Ippopeto", Stelle tab.

## Decisions

**Flight is a timed state, not a physics axis.** Crossing a ramp at 260 px/s or more sets `room.air` with an airtime long enough to land 150 px past the hole (0.6–1.5 s); `game.js` skips thrust, drag, edges and obstacles while it is set, so the saucer keeps its momentum. The snapshot's `z` is a parabola over that airtime, for drawing only. Landing is checked by the `void` rule like any other position. A first version derived airtime from speed alone and, at jump speed, landed inside the 190 px hole.

**Void is a surface with no support.** The `force` hook of `void.js` triggers the fall when the centre is over void and `z = 0`; holes are void stretches.

**Rails are per-stretch flags** on the course: railed stretches bounce with the existing bank code, unrailed ones do not clamp.

**Planet pull is the whirlpool pull without swirl**, from a point outside the track.

## Risks / Trade-offs

- [The bot cannot judge ramps or hairpins] → Bot hints in the Stelle module: push all together over the 700 px before a ramp, and stop pushing above 250 px/s before a sharp bend with no rails. Turbo pads sit on the straights leading to the ramps, not before hairpins, and comets on railed stretches: a comet knocking the saucer off an open edge looped crews on falls.
- [With no current, a lone hippo also finishes (about 190 s)] → Accepted for this map: the planets are the only pull, and the field test decides if more is needed.
- [A fall right after a checkpoint feels harsh] → Accepted by the owner (checkpoint chosen over "just before the fall").

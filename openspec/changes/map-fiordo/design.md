# Design

## Context

Builds on `map-system`. Draft art for every object is in the artifact "Mappe di Ippopeto", Fiordo tab.

## Decisions

**Sled handling is a vehicle rule, not a surface.** On ice the velocity is split along and across the runners; the across component is removed each step (strong lateral grip), the along component decays with a tenth of the water drag. Angular response is halved by doubling angular drag for the sled. On snow the sled is pinned until freed.

**Strokes are detected from the seat inputs.** A stroke is a rising edge where every present hippo pushes within 0.25 s of each other, followed by all releasing. Each stroke moves the sled one third of the way to the nearest ice point.

**Thin ice is tile state on the room.** Tiles are cells along the bridge; state `intact | cracked(t) | broken`, reset on respawn and start. Sent in snapshots only while non-intact, so other maps pay nothing.

**Bears are triggered, not timed.** Trigger distance along the course; the charge path is a straight segment, so collision is a point-segment test over the charge time.

## Risks / Trade-offs

- [No lateral slip makes the sled feel on rails] → Keep a small residual slip (5 %) as a tuning knob, default off.
- [Bots cannot plan wide bends] → The Fiordo module gives the bot a longer look-ahead as a bot hint; tune before softening the map.

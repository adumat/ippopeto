# Design

## Context

Builds on `map-system`. Draft art for every object is in the artifact "Mappe di Ippopeto", Fiordo tab.

## Decisions

**Sled handling is a vehicle rule plus the ice surface.** The `sled` rule removes velocity across the runners each step, except for 0.4 s after a collision so the sled glances off obstacles. The ice surface has a tenth of the water drag below a 220 px/s cruise speed and a steep extra drag above it: tuning showed that with linear drag alone the sled reached 1000+ px/s, and a speed-squared drag braked harder than water at ordinary speeds, which killed the coasting feel. The `turn` factor of the sled vehicle halves torque. On snow the sled is pinned until freed.

**The bot steers a sled from one side.** Equal pushes cancel torque, so the reference bot, which aims every hippo the same way, could not turn a sled at all. For sleds only, the bot pushes straight back with the hippos on the outside of the turn; its Fiume steering is unchanged.

**Strokes are detected from the seat inputs.** A stroke is a rising edge where every present hippo pushes within 0.25 s of each other, followed by all releasing. Each stroke moves the sled one third of the way to the nearest ice point.

**Thin ice is tile state on the room.** Tiles are cells along the bridge; state `intact | cracked(t) | broken`, reset on respawn and start. Sent in snapshots only while non-intact, so other maps pay nothing.

**Bears are triggered, not timed.** Trigger distance along the course; the charge path is a straight segment, so collision is a point-segment test over the charge time.

## Risks / Trade-offs

- [Steering from one side is hard for people] → Field test; the turn factor and the cruise speed are the knobs.
- [Bots cannot plan wide bends] → The Fiordo module gives the bot a longer look-ahead (450 px) as a bot hint; tune before softening the map.
- [A send-back lands the sled straight onto a hazard and loops] → Thin-ice bridges and bears sit at least 400 px after a checkpoint, and ice blocks away from bridges.

# Design

## Context

Builds on `map-system`. Draft art for every object is in the artifact "Mappe di Ippopeto", Lava tab.

## Decisions

**Ignition is per seat.** A seat gets `fireUntil = gt + 1` when it pushes over a vent; the thrust multiplier reads it. This keeps the 1 s burn after leaving the vent.

**Geysers and bombs are pure functions of `gt`.** Each has period and phase in the map module; bomb shadows grow from `t_impact − 1.5` to `t_impact`. The server checks a hit only at the impact instant.

**Heat is a gas hook** based on distance to the bank from `closest()`.

**Salamanders reuse the crocodile mover** with a different painter.

## Risks / Trade-offs

- [Ignition makes the course trivially short] → Tune vent count and spacing; the doubling stays.
- [Bombs on a fixed timetable feel unfair when respawning under one] → Respawn points are checked to be clear of any impact within 2 s.

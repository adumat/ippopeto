# Spec Delta

## MODIFIED Requirements

### Requirement: One fixed course

The "Fiume" map SHALL be a single river about 11,200 px long, defined by 20 control points smoothed into a curve, with a per-section half-width (185–300 px) and current speed. The raft SHALL start 220 px in, and the course SHALL be identical for every room and every race. Turning it into a map SHALL NOT change its layout, obstacles or tuning.

#### Scenario: Same race twice
- **WHEN** a crew races the Fiume twice
- **THEN** obstacles are in the same places and moving ones follow the same rhythm relative to room time

#### Scenario: Before and after maps
- **WHEN** the reference bot crew of four races the Fiume after maps are introduced
- **THEN** its time matches the time before the change

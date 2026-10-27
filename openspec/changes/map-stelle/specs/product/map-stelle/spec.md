# Spec Delta

## ADDED Requirements

### Requirement: The star road

"Strada delle stelle" SHALL be a fixed circuit of light in space: fast straights, hairpins without rails and a final jump. Some stretches SHALL have rails that bounce like river banks; the rest SHALL open onto the void. There SHALL be no current. The vehicle SHALL be a flying saucer, handling like the raft with drag relative to still space.

#### Scenario: Letting go
- **WHEN** the crew stops pushing on a straight
- **THEN** the saucer slows down and stops, without drifting back

### Requirement: Falling into the void

A saucer whose centre leaves the track where there is no rail SHALL fall: it shrinks and spins away, then reappears at the last checkpoint. A fall SHALL count in the results as "caduta nel vuoto" ("cadute nel vuoto").

#### Scenario: Hairpin taken too fast
- **WHEN** the saucer overshoots an unrailed hairpin
- **THEN** it falls and reappears at the last checkpoint

### Requirement: Ramps and holes

Ramps SHALL stand in front of holes in the track. A saucer crossing a ramp at or above the jump speed SHALL take off: in the air it SHALL NOT respond to pushes or turns, SHALL keep its momentum, and SHALL land where that carries it, drawn larger with its shadow below. Below the jump speed it SHALL drop into the hole and fall. Landing off the track SHALL be a fall.

#### Scenario: Fast enough
- **WHEN** the crew hits a ramp together at full speed
- **THEN** the saucer flies over the hole and lands on the far side

#### Scenario: Too slow
- **WHEN** the saucer reaches a ramp slowly
- **THEN** it drops into the hole and reappears at the last checkpoint

### Requirement: Turbo pads

Glowing pads on the track SHALL push a saucer that crosses them forward along the track for 1 s.

#### Scenario: Boost
- **WHEN** the saucer crosses a turbo pad
- **THEN** it accelerates along the track for 1 s

### Requirement: Planets and comets

Planets beside the track SHALL pull the saucer towards themselves, and so towards the edge, within their range. Comets SHALL cross the track at intervals and be solid.

#### Scenario: Near a planet
- **WHEN** nobody pushes next to a planet
- **THEN** the saucer drifts towards that edge

### Requirement: Difficulty on the star road

Jump speed and ramp placement SHALL let a crew of two clear every jump when pushing together.

#### Scenario: Two hippos
- **WHEN** the reference crew of two reaches a ramp pushing together
- **THEN** it clears the hole

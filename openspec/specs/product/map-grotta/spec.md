# product/map-grotta Specification

## Purpose
The Grotta map: a generated dark cave lit only around the raft, with bats.

## Requirements

### Requirement: A new cave every race

"Grotta buia" SHALL be a generated map: bends, widths and obstacles SHALL change at every start, "Un altro giro" included, while keeping the gap rule and a length that takes a crew of four about two minutes. The vehicle SHALL be the wooden raft, on water with a current as on the Fiume.

#### Scenario: Two races in a row
- **WHEN** the crew races the Grotta twice
- **THEN** the second cave has different bends and obstacles

### Requirement: Darkness

Every player SHALL see a black screen except a glow around the raft with a radius of about one and a half raft sizes, and the gas clouds, which light their surroundings and fade over a few seconds. The darkness SHALL be tuned by playing so that finding the way is genuinely hard. The progress bar SHALL still show progress and checkpoints.

#### Scenario: Lighting the way
- **WHEN** a hippo pushes
- **THEN** its gas cloud lights the cave around it until it fades

#### Scenario: Saving gas in the dark
- **WHEN** nobody pushes for a few seconds
- **THEN** only the small glow around the raft is visible

### Requirement: Lights that help

Glowing mushrooms SHALL stand on the banks at every checkpoint, and fireflies SHALL hover over the bends. Both SHALL be visible through the darkness and SHALL NOT be obstacles.

#### Scenario: Next bend
- **WHEN** the crew approaches a bend in the dark
- **THEN** fireflies show where it turns

### Requirement: Cave obstacles

The cave SHALL contain:
- stalagmites: fixed and solid, visible only once inside the glow;
- bat swarms crossing the river: solid, and for 2 s after a hit the swarm covers part of every screen;
- blind fish swimming back and forth: touching one sends the raft back to the last checkpoint, counted as "morso di pesce cieco" ("morsi di pesce cieco").

#### Scenario: Bats
- **WHEN** a swarm hits the raft
- **THEN** the raft bounces and the view is partly covered for 2 s

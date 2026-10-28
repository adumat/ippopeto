# product/map-lava Specification

## Purpose
The Lava map: a stone raft on a lava river, with vents, geysers, volcanic bombs and heat.

## Requirements

### Requirement: The lava river

"Fiume di lava" SHALL be a fixed river of lava as wide as the Fiume, with a slower current, rock banks that bounce like river banks, and groups of vents along the way. Lava SHALL carry the vehicle as water does. The vehicle SHALL be a stone raft.

#### Scenario: Drifting on lava
- **WHEN** nobody pushes
- **THEN** the stone raft drifts back, more slowly than on the Fiume

### Requirement: Vents ignite farts

Vents SHALL be glowing, bubbling pools on the lava, drawn as something to drive over, not as obstacles. While the raft's centre is over a vent, each hippo that pushes SHALL ignite: its fart turns to flame and its push is doubled for 1 s, even after leaving the vent. The doubling SHALL stack with "Tutti insieme!".

#### Scenario: Whole crew over a vent
- **WHEN** every hippo pushes while the raft crosses a vent
- **THEN** every fart flares and the raft shoots forward

#### Scenario: Resting over a vent
- **WHEN** a hippo is not pushing while over a vent
- **THEN** it does not ignite

### Requirement: Geysers

Geysers SHALL erupt in cycles, each with its own period and phase, with a short visible build-up. An eruption SHALL push a raft within its column sideways with force.

#### Scenario: Two geysers, two rhythms
- **WHEN** the crew watches two neighbouring geysers
- **THEN** they erupt at different moments

### Requirement: Lava bombs

Bombs SHALL fall at set places and times. Their shadow SHALL appear on the lava 1.5 s before impact and grow until the bomb lands. A raft under the impact SHALL go back to the last checkpoint, counted in the results as "colpo di lava" ("colpi di lava").

#### Scenario: Reading the shadow
- **WHEN** a shadow appears under the raft
- **THEN** the crew has 1.5 s to move away

### Requirement: Heat near the banks

Within 80 px of a bank, every hippo's gas SHALL refill twice as fast.

#### Scenario: Hugging the bank
- **WHEN** a resting hippo's raft runs along a bank
- **THEN** its gas refills twice as fast as mid-river

### Requirement: Salamanders and rocks

Fire salamanders SHALL swim back and forth like crocodiles; touching one SHALL send the raft back to the last checkpoint, counted as "morso di salamandra" ("morsi di salamandra"). Volcanic rocks SHALL stand still and be solid like river rocks.

#### Scenario: Salamander bite
- **WHEN** the raft touches a salamander during the race
- **THEN** it returns to the last checkpoint

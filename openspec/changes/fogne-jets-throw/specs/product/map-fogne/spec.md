## MODIFIED Requirements

### Requirement: Jets

Pipes in the walls SHALL fire a jet across the canal in a cycle: drip for 1 s, fire for 1 s, then rest. A vehicle inside the jet SHALL be thrown away from the pipe at about 800 px/s and spun hard enough to turn about 90°, once per jet, so that it hits the far wall and bounces off. Every player's screen SHALL then get green splashes, sized and fading like the peto vestito splats, but in green.

#### Scenario: Caught by a jet
- **WHEN** the raft is under a pipe while it fires
- **THEN** the raft is slammed into the far wall, spinning, and every screen turns splashed green

#### Scenario: Reading the drip
- **WHEN** a pipe starts dripping
- **THEN** the crew has 1 s to get out of its line

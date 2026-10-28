# product/map-fogne Specification

## Purpose
The Fogne map: a narrow sewer canal on the raft, with jets, intakes, methane clouds, ducks and rats.

## Requirements

### Requirement: The canal

"Fogne della città" SHALL be a fixed brick canal with a half-width of 170–210 px and near right-angle bends. It SHALL run through three stretches: the inlet, the collector with jets on both walls, and the final basin with the intakes. The current SHALL be moderate, and stronger near the intakes. Walls SHALL bounce like river banks. A crew of four SHALL need about two minutes. The vehicle SHALL be the wooden raft.

#### Scenario: Reference crew
- **WHEN** the reference bots race the Fogne with a crew of four
- **THEN** they finish in about 120 s

### Requirement: Jets

Pipes in the walls SHALL fire a jet across the canal in a cycle: drip for 1 s, fire for 1 s, then rest. A vehicle inside the jet SHALL receive an instant sideways push of about three times a bank bounce, away from the pipe, once per jet. Every player's screen SHALL then get green splashes, sized and fading like the peto vestito splats, but in green.

#### Scenario: Caught by a jet
- **WHEN** the raft is under a pipe while it fires
- **THEN** the raft is thrown towards the far wall and every screen turns splashed green

#### Scenario: Reading the drip
- **WHEN** a pipe starts dripping
- **THEN** the crew has 1 s to get out of its line

### Requirement: Intakes

Intakes in the basin walls SHALL pull the vehicle towards their mouth within a radius, harder the closer it gets, without spinning it. A vehicle touching the mouth SHALL be sucked away and reappear 600 px further back along the canal, stopped and aligned with the canal. This SHALL NOT count as a bite.

#### Scenario: Too close
- **WHEN** the raft touches an intake's mouth
- **THEN** it reappears 600 px back down the canal, possibly in front of a pipe

### Requirement: Methane clouds

Green clouds SHALL sit still over parts of the canal. While the vehicle's centre is inside one, every hippo's gas SHALL refill three times faster and the peto vestito risk SHALL be three times higher.

#### Scenario: Refilling in the cloud
- **WHEN** a hippo rests inside a methane cloud
- **THEN** its gas refills three times as fast as outside

### Requirement: Ducks and rats

Rubber ducks SHALL drift from wall to wall and SHALL be solid like barrels. Giant rats SHALL swim back and forth like crocodiles; touching one SHALL send the vehicle back to the last checkpoint, and count in the results as "morso di ratto" ("morsi di ratto").

#### Scenario: Rat bite
- **WHEN** the raft touches a rat during the race
- **THEN** it returns to the last checkpoint and the results later count "1 morso di ratto"

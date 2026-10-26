# river-course

## Purpose

The single course: a winding river travelled upstream, against the current, with banks, rocks, drifting barrels, whirlpools and crocodiles between the start and the finish.

## Requirements

### Requirement: One fixed course

The course SHALL be a single river about 11,200 px long, defined by 20 control points smoothed into a curve, with a per-section half-width (185–300 px) and current speed. The raft SHALL start 220 px in, and the course SHALL be identical for every room and every race.

#### Scenario: Same race twice
- **WHEN** a crew races twice
- **THEN** obstacles are in the same places and moving ones follow the same rhythm relative to room time

### Requirement: The current pushes back

Water SHALL flow downstream along the river at 0–75 px/s depending on the section. The calmest stretches are the start and the finish.

#### Scenario: Doing nothing
- **WHEN** nobody pushes in a fast section
- **THEN** the raft is carried back towards the start

### Requirement: Banks bounce

The raft SHALL stay inside the banks. Hitting a bank SHALL bounce it back with restitution 0.45, lose some speed, and add some spin.

#### Scenario: Scraping a bank
- **WHEN** the raft hits a bank at an angle
- **THEN** it bounces off, turns a little, and the screen shakes

### Requirement: Obstacles

The course SHALL contain:
- 13 rocks: fixed, solid;
- 4 barrels: solid, drifting side to side across the river with periods of 3–4 s;
- 3 whirlpools: not solid, they drag the raft around, pull it inwards and spin it;
- 3 crocodiles: swimming side to side with periods of 4–5 s.

Solid obstacles SHALL bounce the raft like the banks do, with a glancing hit adding spin.

#### Scenario: Whirlpool
- **WHEN** the raft drifts into a whirlpool
- **THEN** it starts circling and rotating, and the crew must push out

### Requirement: Every obstacle can be passed

At any instant, every obstacle SHALL leave a gap of at least 164 px (raft diameter plus 20) on at least one side.

#### Scenario: Course change
- **WHEN** someone edits the course or the obstacles
- **THEN** the gap rule is re-verified before shipping

### Requirement: Crocodiles bite

Touching a crocodile SHALL send the raft back to the last checkpoint passed, or to the start if none, stopped and aligned with the river. A bite during the race SHALL be counted; a bite in the lobby SHALL NOT.

#### Scenario: Bitten after checkpoint 2
- **WHEN** the raft touches a crocodile after checkpoint 2
- **THEN** everyone hears a chomp, sees "Gnam! Si torna all’ultimo checkpoint", and the raft reappears at checkpoint 2

### Requirement: Checkpoints and finish

Four checkpoints SHALL sit at 20, 40, 60 and 80 percent of the course and SHALL be passed in order. The finish line SHALL be 380 px before the end of the river and SHALL count only once the fourth checkpoint is passed.

#### Scenario: Checkpoint passed
- **WHEN** the raft crosses the next checkpoint during the race
- **THEN** everyone sees "Checkpoint N di 4" and the checkpoint turns gas-green

### Requirement: Difficulty target

A perfect crew of four SHALL finish in roughly 120 seconds. A crew of two SHALL be able to finish, but only by timing the crocodiles. A single hippo SHALL NOT realistically make progress.

#### Scenario: Reference bot
- **WHEN** four simulated bots steer to a point 300 px ahead and dodge obstacles within 550 px
- **THEN** they finish in about 120 s

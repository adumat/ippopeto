# raft-handling

## Purpose

The core mechanic: each hippo turns its rear and pushes with gas from its own corner of the raft. Coordination is the game: one hippo alone spins the raft, the crew pushing together goes straight and faster.

## Requirements

### Requirement: Controls

Each seated player SHALL control only their own hippo:
- `A`/`D` or the left/right arrows turn the rear, at 2.6 rad/s;
- `Space`, `W` or the up arrow push while held.

On touch devices (`pointer: coarse`) three on-screen buttons SHALL offer the same controls. Losing window focus SHALL release every control.

#### Scenario: Alt-tab mid-push
- **WHEN** a player switches window while holding Space
- **THEN** their hippo stops pushing

### Requirement: Thrust comes from the corner

A pushing hippo SHALL apply a force of 520 opposite to where its rear points, at its own seat. The force therefore both moves and rotates the raft. Each rear SHALL start pointing backwards (towards the stern).

#### Scenario: Pushing alone
- **WHEN** a single hippo pushes with its rear backwards
- **THEN** the raft moves forward and turns, because the force is off-centre

#### Scenario: Two hippos on the same side
- **WHEN** both stern hippos push backwards together
- **THEN** their torques cancel and the raft goes straight

### Requirement: Gas economy

Each hippo SHALL have a gas tank of 100. Pushing SHALL drain 28 per second; not pushing SHALL refill 16 per second. A tank that hits zero SHALL lock that hippo out until it refills to 35. Gas SHALL neither drain nor push during the countdown.

#### Scenario: Running dry
- **WHEN** a hippo pushes for about 3.6 seconds without pause
- **THEN** it stops, looks exhausted, and cannot push again for about 2.2 seconds

### Requirement: Pushing together pays

When at least two hippos are present (seated and not away) and every present hippo is pushing at the same instant, every push SHALL be multiplied by 1.35 and the HUD SHALL show "Tutti insieme!". Away hippos SHALL NOT push, SHALL keep regenerating gas, and SHALL NOT count towards the bonus.

#### Scenario: One hippo is resting
- **WHEN** three of four seated hippos push
- **THEN** no bonus applies

#### Scenario: Solo play
- **WHEN** only one hippo is seated
- **THEN** the bonus never applies, and the raft mostly spins

#### Scenario: Teammate dropped
- **WHEN** one of four hippos is away and the other three push together
- **THEN** the bonus applies

### Requirement: Raft dynamics

The raft SHALL behave as a heavy body on water: mass 4, linear drag 1.1 relative to the water's velocity, angular drag 2.4. It SHALL collide as a circle of radius 72 (the drawn raft is a 120 px square).

#### Scenario: Letting go
- **WHEN** the whole crew stops pushing
- **THEN** the raft slows down and drifts back with the current

# Spec Delta

## REMOVED Requirements

### Requirement: Four seats, then spectators
**Reason**: The raft now has two to six seats that follow the crew.
**Migration**: Replaced by "Two to six seats, then spectators".

## ADDED Requirements

### Requirement: Two to six seats, then spectators

The raft SHALL have as many seats as people sitting on it, never fewer than 2 nor more than 6. A joining player SHALL get a seat while fewer than 6 are taken or reserved. With 6, or while a race is counting down or running, the player SHALL watch as a spectator. A full raft SHALL say "La zattera è piena: guardi da riva". A race in progress SHALL say "La gara è in corso: guardi da riva fino all’arrivo". A room SHALL hold at most 12 people including spectators.

#### Scenario: Seventh player
- **WHEN** a seventh person boards a raft with six aboard
- **THEN** they see the race but control nothing

#### Scenario: Arriving mid-race
- **WHEN** someone boards while a race is running with fewer than six aboard
- **THEN** they watch until the race ends

#### Scenario: Leaving the lobby shrinks the raft
- **WHEN** one of five seated players closes the tab in the lobby and does not come back within 15 seconds
- **THEN** the raft has four seats and the others keep their colours

#### Scenario: Playing alone
- **WHEN** a single player boards an empty room
- **THEN** the raft has two seats, one of them shown as "Posto libero"

## MODIFIED Requirements

### Requirement: Spectators sit down between races

In the lobby and on the results card, a spectator SHALL see "Siediti" whenever fewer than 6 seats are taken or reserved. Pressing it SHALL seat them, or tell them "La zattera è piena: guardi da riva" if someone was faster. Spectators SHALL NOT be offered a seat during the countdown or the race.

#### Scenario: A seat frees up
- **WHEN** one of six seated players leaves for good while a spectator is in the lobby
- **THEN** the spectator sees "Siediti" and can sit without reloading

#### Scenario: Two spectators, one seat
- **WHEN** two spectators press "Siediti" with five aboard
- **THEN** one sits, the other is told the raft is full

## ADDED Requirements

### Requirement: The raft is fixed for the race

The seat count SHALL change only in the lobby and on the results card. From "Si parte" until the race ends it SHALL stay as it was. A seat whose player leaves mid-race SHALL stay empty until the race ends.

#### Scenario: Someone leaves mid-race
- **WHEN** one of five players leaves for good during the race
- **THEN** the raft keeps five seats, one empty, until the finish

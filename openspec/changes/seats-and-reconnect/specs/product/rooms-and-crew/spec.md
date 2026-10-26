# Spec Delta

## MODIFIED Requirements

### Requirement: Four seats, then spectators

The raft SHALL have four seats at its corners, each with a fixed colour (orange `#ff9f1c`, pink `#e0479e`, yellow `#ffd23f`, violet `#7b5cff`). A joining player SHALL take the lowest free seat. When all four are taken, or a race is counting down or running, the player SHALL watch as a spectator. A full raft SHALL say "La zattera è piena: guardi da riva". A race in progress SHALL say "La gara è in corso: guardi da riva fino all’arrivo". A room SHALL hold at most 12 people including spectators.

#### Scenario: Fifth player
- **WHEN** a fifth person boards a full raft
- **THEN** they see the race but control nothing

#### Scenario: Arriving mid-race
- **WHEN** someone boards while a race is running and a seat is free
- **THEN** they watch, and the seat stays free until the race ends

#### Scenario: Leaving frees the seat
- **WHEN** a seated player closes the tab and does not come back within 15 seconds
- **THEN** their seat shows as "Posto libero" for everyone

## ADDED Requirements

### Requirement: Seats wait for their player

When a seated player's connection drops, their seat SHALL stay theirs for 15 seconds. If the same browser tab reconnects or reloads within that time, it SHALL get the same seat back, with its gas and exhaustion as they were. After 15 seconds the seat SHALL become free. A different tab, even on the same device, SHALL NOT take a reserved seat.

#### Scenario: Wi-Fi blip mid-race
- **WHEN** a seated player loses the connection for 5 seconds during a race
- **THEN** they are back in the same corner, and the race went on without them pushing

#### Scenario: Reload
- **WHEN** a seated player reloads the page and boards again
- **THEN** they get their own seat back

#### Scenario: Gone for good
- **WHEN** a seated player's connection drops and they never return
- **THEN** after 15 seconds the seat shows as "Posto libero"

### Requirement: Spectators sit down between races

In the lobby and on the results card, a spectator SHALL see "Siediti" whenever a seat is free and not reserved. Pressing it SHALL seat them in the lowest such seat, or tell them "La zattera è piena: guardi da riva" if someone was faster. Spectators SHALL NOT be offered a seat during the countdown or the race.

#### Scenario: A seat frees up
- **WHEN** a seated player leaves for good while a spectator is in the lobby
- **THEN** the spectator sees "Siediti" and can take the seat without reloading

#### Scenario: Two spectators, one seat
- **WHEN** two spectators press "Siediti" for the last free seat
- **THEN** one sits, the other is told the raft is full

### Requirement: Solo hint

When exactly one hippo is on board, the lobby SHALL show "Da soli si gira in tondo: invita qualcuno con il link" next to "Copia il link".

#### Scenario: First to arrive
- **WHEN** the first player boards an empty room
- **THEN** the lobby shows the solo hint, and it disappears when a second player sits down

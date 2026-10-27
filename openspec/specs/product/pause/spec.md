# product/pause Specification

## Purpose
Stopping a race in progress: who can pause, what freezes, what the pause menu offers, and how people get on and off the raft while paused.

## Requirements

### Requirement: Anyone seated can pause

During the countdown or the race, any seated player SHALL be able to pause with `P` or `Esc`, or with a pause button shown next to the audio button. Everyone SHALL see who paused: "<name> ha messo in pausa". Spectators SHALL NOT be able to pause.

#### Scenario: Pausing from a phone
- **WHEN** a seated player taps the pause button during the race
- **THEN** every screen shows the pause menu and "<name> ha messo in pausa"

### Requirement: A pause freezes the world

While paused, the raft, the current, every moving obstacle, every hippo's gas and the race clock SHALL stand still for everyone. Nobody SHALL be able to push.

#### Scenario: Crocodile mid-swim
- **WHEN** the game is paused while a crocodile crosses the river
- **THEN** the crocodile stays where it is until the race resumes

### Requirement: The pause menu

While paused, every player SHALL see a card titled "In pausa". Seated players SHALL be able to choose:
- "Riprendi": a 3-second countdown, then the race continues from exactly where it stopped;
- "Ricomincia": a new race from the start, with a countdown and bites and peti vestiti reset;
- "Termina la gara": back to the lobby, recording no result.

Spectators SHALL see the card with the choices disabled.

#### Scenario: Resuming
- **WHEN** a seated player presses "Riprendi"
- **THEN** everyone sees a 3-second countdown and the race goes on from the same place and time

#### Scenario: Giving up
- **WHEN** a seated player presses "Termina la gara"
- **THEN** everyone is back in the lobby and the best times are unchanged

### Requirement: Getting on and off during a pause

While paused, a spectator SHALL see "Siediti" when fewer than 6 seats are taken or reserved, and a seated player SHALL see "Alzati". Sitting down SHALL add a hippo with a full tank. Standing up SHALL make the player a spectator and free the seat at once. The raft SHALL resize immediately, keeping everyone's colour.

#### Scenario: Latecomer joins
- **WHEN** a spectator presses "Siediti" during a pause with four aboard
- **THEN** the raft has five seats, and the new hippo pushes from the next countdown on

#### Scenario: Someone has to go
- **WHEN** a seated player presses "Alzati" during a pause
- **THEN** they become a spectator and the raft loses that seat

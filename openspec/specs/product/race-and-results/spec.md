# race-and-results

## Purpose

What the crew sees while racing and after crossing the line: the timer, progress, the results card and the room's best times.

## Requirements

### Requirement: Race HUD

During the race every player SHALL see:
- the race timer as `m:ss.s`;
- a vertical progress bar with a hippo marker and the four checkpoints, passed ones highlighted;
- one card per seat with the hippo's name, colour and gas level (dimmed when exhausted, marked "libero" when empty);
- the "Tutti insieme!" banner while the sync bonus is active;
- short toasts for "Via!", checkpoints and bites.

#### Scenario: Watching gas
- **WHEN** a teammate runs dry
- **THEN** their seat card shows an empty, dimmed gas bar

### Requirement: Race time

The timer SHALL start at "Via!" and stop at the finish. The countdown SHALL NOT count. The time spent with the sync bonus active SHALL be tracked.

#### Scenario: Time in the results
- **WHEN** the crew finishes after 2 minutes and 5.3 seconds of racing
- **THEN** the results show `2:05.3`

### Requirement: Results card

On finishing, every seated player SHALL see "Arrivati" with:
- the final time;
- the number of crocodile bites, singular or plural ("1 morso di coccodrillo");
- the percentage of the race spent pushing all together;
- the room's best times.

A celebratory arpeggio SHALL play.

#### Scenario: Finish
- **WHEN** the raft crosses the finish line after the fourth checkpoint
- **THEN** every seated player sees the results card

### Requirement: Best times per room

Each room SHALL keep its five fastest finishes, each with time, crew names joined by commas, bites and sync percentage. They SHALL be shown in the results and SHALL be lost when the room is discarded.

#### Scenario: Sixth finish
- **WHEN** a crew finishes slower than all five best times
- **THEN** the list does not change

### Requirement: Another round

"Un altro giro" SHALL start a new race with the same crew, exactly like "Si parte": the results are hidden and the countdown begins.

#### Scenario: Rematch
- **WHEN** any seated player presses "Un altro giro"
- **THEN** everyone's results card closes and the countdown starts

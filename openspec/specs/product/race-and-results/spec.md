# race-and-results

## Purpose

What the crew sees while racing and after crossing the line: the timer, progress, the results card and the room's best times.

## Requirements

### Requirement: Race HUD

During the race every player SHALL see:
- the race timer as `m:ss.s`;
- a vertical progress bar with a hippo marker and the four checkpoints, passed ones highlighted;
- one card per seat, two to six, with the hippo's name, colour and gas level (dimmed when exhausted, marked "libero" when empty), all fitting a 390 px wide screen;
- the "Tutti insieme!" banner while the sync bonus is active;
- short toasts for "Via!", checkpoints and bites.

#### Scenario: Watching gas
- **WHEN** a teammate runs dry
- **THEN** their seat card shows an empty, dimmed gas bar

#### Scenario: Six on a phone
- **WHEN** six hippos race and a player is on a 390 px phone
- **THEN** all six seat cards are visible in one row

### Requirement: Race time

The timer SHALL start at "Via!" and stop at the finish. The countdown, including the one after a pause, SHALL NOT count, nor SHALL the time spent paused. The timer SHALL keep showing the race time during a pause and during the countdown that resumes it. The time spent with the sync bonus active SHALL be tracked.

#### Scenario: Time in the results
- **WHEN** the crew finishes after 2 minutes and 5.3 seconds of racing
- **THEN** the results show `2:05.3`

#### Scenario: A long pause
- **WHEN** the crew pauses for a minute halfway through
- **THEN** the final time does not include that minute

### Requirement: Results card

On finishing, every seated player and every spectator who had boarded SHALL see "Arrivati" with:
- the final time;
- the number of crocodile bites, singular or plural ("1 morso di coccodrillo");
- the percentage of the race spent pushing all together;
- the room's best times.

A celebratory arpeggio SHALL play. Someone who boards after the finish SHALL see the lobby, not the results of a race they did not watch.

#### Scenario: Finish
- **WHEN** the raft crosses the finish line after the fourth checkpoint
- **THEN** every seated player sees the results card

#### Scenario: Late arrival
- **WHEN** someone boards while the room shows a finished race
- **THEN** they see the lobby, with "Si parte" if seated or "Siediti" if a seat is free

### Requirement: Best times per room

Each room SHALL keep, for each map, its five fastest finishes on that map, each with time, crew names joined by commas, bites and sync percentage. A generated map SHALL have one list, whatever the layout. The results card SHALL name the map and show that map's list. All lists SHALL be lost when the room is discarded.

#### Scenario: Sixth finish
- **WHEN** a crew finishes slower than all five best times on that map
- **THEN** the list does not change

#### Scenario: Another map
- **WHEN** a crew finishes the Fogne after three Fiume races
- **THEN** the results card says "Fogne della città" and lists only the Fogne time

### Requirement: Another round

"Un altro giro" SHALL start a new race with the same crew, exactly like "Si parte": the results are hidden and the countdown begins.

#### Scenario: Rematch
- **WHEN** any seated player presses "Un altro giro"
- **THEN** everyone's results card closes and the countdown starts

### Requirement: A race ended from the menu leaves no result

A race ended with "Termina la gara" SHALL NOT add to the best times and SHALL NOT show the results card.

#### Scenario: Ending early
- **WHEN** a crew ends a race from the pause menu
- **THEN** the best times list is unchanged

### Requirement: Peti vestiti in the results

The results card SHALL report the race's peti vestiti, singular or plural ("1 peto vestito", "3 peti vestiti"), alongside bites and sync. Peti vestiti in the lobby SHALL NOT count.

#### Scenario: A messy race
- **WHEN** a crew finishes after two peti vestiti
- **THEN** the results card says "2 peti vestiti"

### Requirement: Send-backs in the results

Instead of a single bite count, the results card SHALL list every cause its map has for being sent back to a checkpoint, with the count for the race, zero included, in the wording the map gives, singular or plural. On the Fiume the only cause SHALL stay "morso di coccodrillo".

#### Scenario: Clean race on the Fiume
- **WHEN** a crew finishes the Fiume after two bites
- **THEN** the results card says "2 morsi di coccodrillo"

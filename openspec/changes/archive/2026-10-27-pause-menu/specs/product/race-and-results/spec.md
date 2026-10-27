# Spec Delta

## MODIFIED Requirements

### Requirement: Race time

The timer SHALL start at "Via!" and stop at the finish. The countdown, including the one after a pause, SHALL NOT count, nor SHALL the time spent paused. The timer SHALL keep showing the race time during a pause and during the countdown that resumes it. The time spent with the sync bonus active SHALL be tracked.

#### Scenario: Time in the results
- **WHEN** the crew finishes after 2 minutes and 5.3 seconds of racing
- **THEN** the results show `2:05.3`

#### Scenario: A long pause
- **WHEN** the crew pauses for a minute halfway through
- **THEN** the final time does not include that minute

## ADDED Requirements

### Requirement: A race ended from the menu leaves no result

A race ended with "Termina la gara" SHALL NOT add to the best times and SHALL NOT show the results card.

#### Scenario: Ending early
- **WHEN** a crew ends a race from the pause menu
- **THEN** the best times list is unchanged

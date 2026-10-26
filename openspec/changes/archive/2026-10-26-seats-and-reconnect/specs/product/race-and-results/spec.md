# Spec Delta

## MODIFIED Requirements

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

# Spec Delta

## MODIFIED Requirements

### Requirement: Best times per room

Each room SHALL keep, for each map, its five fastest finishes on that map, each with time, crew names joined by commas, bites and sync percentage. A generated map SHALL have one list, whatever the layout. The results card SHALL name the map and show that map's list. All lists SHALL be lost when the room is discarded.

#### Scenario: Sixth finish
- **WHEN** a crew finishes slower than all five best times on that map
- **THEN** the list does not change

#### Scenario: Another map
- **WHEN** a crew finishes the Fogne after three Fiume races
- **THEN** the results card says "Fogne della città" and lists only the Fogne time

## ADDED Requirements

### Requirement: Send-backs in the results

Instead of a single bite count, the results card SHALL list each cause of being sent back to a checkpoint during the race, with the wording its map gives, singular or plural, and omit causes that did not happen. On the Fiume the only cause SHALL stay "morso di coccodrillo".

#### Scenario: Clean race on the Fiume
- **WHEN** a crew finishes the Fiume after two bites
- **THEN** the results card says "2 morsi di coccodrillo"

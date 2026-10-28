# product/maps Specification

## Purpose
How a room picks its map and how every map plugs its own course, vehicle, hazards and wording into the shared race.

## Requirements

### Requirement: Map list

The game SHALL offer these maps, in this order: "Fiume", "Fogne della città", "Fiordo ghiacciato", "Fiume di lava", "Grotta buia", "Strada delle stelle". A map SHALL be listed only once it is playable. A new room SHALL start on "Fiume".

#### Scenario: New room
- **WHEN** someone opens a fresh room link
- **THEN** the lobby shows "Fiume" as the current map

### Requirement: Choosing the map

In the lobby and on the results card, every player SHALL see the current map's name and thumbnail. Any seated player SHALL be able to pick another map from a selector showing every map with its name and thumbnail; the last choice SHALL win and everyone SHALL see it at once. Spectators SHALL see the selector but SHALL NOT change it. The map SHALL NOT change during the countdown, the race or a pause.

#### Scenario: Two players pick
- **WHEN** one seated player picks "Fiume di lava" and another then picks "Fogne della città"
- **THEN** everyone's lobby shows "Fogne della città"

#### Scenario: Spectator
- **WHEN** a spectator opens the selector
- **THEN** the maps are shown but cannot be picked

### Requirement: Practice on the chosen map

Choosing a map SHALL move the vehicle to that map's start, stopped, with full gas, so the crew practises on the map they will race.

#### Scenario: Switching while practising
- **WHEN** the crew is halfway down the Fiume in the lobby and someone picks "Fiordo ghiacciato"
- **THEN** the sled appears at the start of the Fiordo

### Requirement: Fixed and generated layouts

A map SHALL be either fixed, with the same layout every race, or generated, with a new layout at every start, "Un altro giro" included. Everyone in a room SHALL see and race the same generated layout. A generated layout SHALL obey the same gap and length rules as a fixed one.

#### Scenario: Rematch on a generated map
- **WHEN** the crew presses "Un altro giro" on a generated map
- **THEN** the course has a different layout, the same on every screen

### Requirement: Common course rules

Every map SHALL have a start, four checkpoints passed in order, and a finish that counts only after the fourth checkpoint, as on the Fiume. Being sent back to a checkpoint (a bite, a fall, a hit) SHALL reset the vehicle exactly as a crocodile bite does. Every solid obstacle SHALL leave the gap required on the Fiume.

#### Scenario: Fall on any map
- **WHEN** the vehicle is sent back after checkpoint 3 on any map
- **THEN** it reappears at checkpoint 3, stopped and aligned with the course

### Requirement: Surfaces

Each stretch of a course SHALL have one surface: water, ice, snow, lava or void. Water and lava SHALL behave like today's river; the other surfaces SHALL behave as their maps specify.

#### Scenario: Map without new surfaces
- **WHEN** a map uses only water
- **THEN** the vehicle handles exactly as on the Fiume

### Requirement: Vehicles

Each map SHALL name the vehicle the crew sits on: the wooden raft (Fiume, Fogne, Grotta), a stone raft (Fiume di lava), a sled (Fiordo ghiacciato), a flying saucer (Strada delle stelle). Every vehicle SHALL have the raft's footprint, seats, collision size and thrust; it SHALL handle like the raft unless its map says otherwise.

#### Scenario: Six hippos on the sled
- **WHEN** six hippos sit on the Fiordo
- **THEN** they sit in the same hexagon as on the raft

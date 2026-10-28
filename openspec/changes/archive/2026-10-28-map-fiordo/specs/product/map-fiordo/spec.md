# Spec Delta

## ADDED Requirements

### Requirement: The fjord

"Fiordo ghiacciato" SHALL be a fixed frozen river with snow on both sides instead of bouncing banks. Wide stretches for gaining speed SHALL alternate with narrows and thin-ice bridges. The vehicle SHALL be a sled.

#### Scenario: Leaving the ice
- **WHEN** the sled crosses the edge of the frozen river
- **THEN** it ends up in the snow instead of bouncing

### Requirement: Sled on ice

On ice, below a cruise speed of 220 px/s, friction SHALL be a tenth of the water drag, so a push keeps the sled moving until someone pushes against it. Above that speed drag SHALL grow steeply, so the sled never runs much faster than a raft.

#### Scenario: Coasting
- **WHEN** the crew stops pushing on flat ice
- **THEN** the sled keeps sliding forward for a long way

### Requirement: The sled follows its runners

The sled SHALL NOT slide sideways: its velocity SHALL follow the direction it points, except for 0.4 s after hitting an obstacle, so it glances off instead of wedging. It SHALL turn at about half the raft's rate for the same push. Equal pushes cancel each other's turn, so the crew turns by pushing from one side, and a tight bend taken fast carries the sled wide.

#### Scenario: Tight bend at speed
- **WHEN** the crew enters a right-angle bend at full speed and turns as hard as it can
- **THEN** the sled swings wide and runs into the snow on the outside

#### Scenario: Turning
- **WHEN** only the hippos on the left side push
- **THEN** the sled turns right

### Requirement: Slopes

The whole fjord SHALL climb gently towards the finish, pulling the sled back at 20 px/s², and some stretches SHALL be tilted more, backwards, forwards or sideways, with their own constant force; a sideways slope swings the sled's nose downhill. There SHALL be no current. Slopes SHALL be drawn so the crew can read their direction.

#### Scenario: Uphill
- **WHEN** nobody pushes on a backward slope
- **THEN** the sled slides back towards the start

### Requirement: Stuck in the snow

A sled entering the snow SHALL stop and SHALL NOT respond to normal pushes. It SHALL come free with three strokes within 5 s: a stroke is every present hippo pushing at once, then all releasing. Each stroke SHALL move the sled a third of the way back onto the ice; after the third it SHALL be on the ice, facing down the course. If the 5 s run out, the count SHALL start again.

#### Scenario: Out in three strokes
- **WHEN** a stuck crew pushes together, releases, three times within 5 s
- **THEN** the sled is back on the ice

#### Scenario: Out of sync
- **WHEN** only three of four present hippos push
- **THEN** the stroke does not count

### Requirement: Thin ice

Thin ice SHALL be lighter, cracked tiles. A tile SHALL crack when the sled first touches it and break 1.5 s later. A sled whose centre is over a broken tile SHALL fall into the water and go back to the last checkpoint; this SHALL count in the results as "caduta in acqua" ("cadute in acqua"). Broken tiles SHALL stay open until the sled is sent back or the race restarts, then refreeze.

#### Scenario: Too slow on the bridge
- **WHEN** the sled is still on a tile 1.5 s after first touching it
- **THEN** the tile breaks and the sled falls through

#### Scenario: Crossing fast
- **WHEN** the sled crosses a thin-ice bridge without stopping
- **THEN** the tiles break behind it

### Requirement: Ice blocks and penguins

Ice blocks SHALL stand still and be solid like rocks. Penguins SHALL slide on their bellies from one side to the other and be solid like barrels.

#### Scenario: Penguin
- **WHEN** a sliding penguin meets the sled
- **THEN** the sled bounces off

### Requirement: Polar bears

Polar bears SHALL sit on the snow beside the course. When the sled comes within range, a bear SHALL show a warning and its charge line for 1 s, then charge in a straight line across the course and disappear. A sled touched by a charging bear SHALL go back to the last checkpoint, counted in the results as "morso d’orso" ("morsi d’orso"). A bear SHALL charge once per pass and reset when the sled is sent back.

#### Scenario: Dodging the bear
- **WHEN** a bear shows its charge line ahead
- **THEN** the crew has 1 s to get the sled off that line

### Requirement: Cold has no effect on gas

Gas SHALL drain and refill as on the Fiume.

#### Scenario: Gas on the ice
- **WHEN** a hippo rests on the Fiordo
- **THEN** its gas refills at 16 per second

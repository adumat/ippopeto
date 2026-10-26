# rooms-and-crew

## Purpose

How people find each other and get on the raft: rooms shared by link, names, the four seats, spectators, and the lobby where the crew practises before starting.

## Requirements

### Requirement: Rooms are shared by link

A room SHALL be identified by the `room` query parameter, normalised to lowercase `[a-z0-9-]`, at most 24 characters. Everyone who opens the same link SHALL be in the same room.

#### Scenario: Link without a room
- **WHEN** a player opens the game without `?room=`
- **THEN** a playful name such as `folata-felice-64` (noun, adjective, two digits) is generated and written into the URL without reloading

#### Scenario: Same link, same raft
- **WHEN** two people open `/?room=venerdi`
- **THEN** they see the same raft and each other's hippos

### Requirement: Rooms live only while used

A room SHALL exist in memory only. It SHALL be discarded about 120 seconds after its last client leaves, taking its best times with it.

#### Scenario: Everyone leaves
- **WHEN** the last player closes the tab and nobody returns within ~2 minutes
- **THEN** reopening the link starts a fresh room with no best times

### Requirement: Joining with a name

Before boarding, a player SHALL enter a name. The name SHALL be stripped of control characters and `<>`, trimmed and cut to 16 characters; an empty result becomes "Ippo". The last name used SHALL be remembered in the browser.

#### Scenario: Returning player
- **WHEN** a player who boarded yesterday opens a new link
- **THEN** the name field is prefilled with yesterday's name

### Requirement: Four seats, then spectators

The raft SHALL have four seats at its corners, each with a fixed colour (orange `#ff9f1c`, pink `#e0479e`, yellow `#ffd23f`, violet `#7b5cff`). A joining player SHALL take the lowest free seat. When all four are taken, the player SHALL watch as a spectator, told "La zattera è piena: guardi da riva". A room SHALL hold at most 12 people including spectators.

#### Scenario: Fifth player
- **WHEN** a fifth person boards a full raft
- **THEN** they see the race but control nothing

#### Scenario: Leaving frees the seat
- **WHEN** a seated player closes the tab
- **THEN** their seat shows as "Posto libero" for everyone

### Requirement: Lobby with free practice

After boarding, a seated player SHALL see the lobby: the crew list with colours and free seats, "Copia il link", "Si parte", and a short key guide. The raft SHALL already be in the water and fully controllable, so the crew can practise. Bites during practice SHALL NOT be counted.

#### Scenario: Practising before the start
- **WHEN** the crew pushes in the lobby
- **THEN** the raft moves on the river, and no timer runs

### Requirement: Any seated player starts the race

"Si parte" SHALL be available to seated players only. Starting SHALL reset the raft to the start line, refill every gas tank, point every hippo's rear backwards, and run a 3-second countdown during which the raft is frozen and nobody can push.

#### Scenario: Spectator cannot start
- **WHEN** a spectator looks at the lobby
- **THEN** "Si parte" is disabled

#### Scenario: Countdown
- **WHEN** a seated player presses "Si parte"
- **THEN** everyone sees a 3-second countdown, then "Via!"

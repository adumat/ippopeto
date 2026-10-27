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

### Requirement: Access code

When the server has an access code configured, only people whose link carries it as `?k=<code>` SHALL be able to watch or play. The code SHALL survive the automatic room-name generation and SHALL be included by "Copia il link". When no code is configured, any link SHALL work.

#### Scenario: Link with the code
- **WHEN** a colleague opens `/?room=venerdi&k=<code>`
- **THEN** they reach the splash and can board

#### Scenario: Link without a room
- **WHEN** someone opens `/?k=<code>`
- **THEN** a room name is generated and the URL becomes `/?k=<code>&room=<name>`

#### Scenario: Local development
- **WHEN** the server runs without an access code
- **THEN** `/?room=prova` works with no `k`

### Requirement: Refusals are explained

When the game refuses a player, it SHALL say why, in a card that replaces the splash, and SHALL NOT keep retrying on its own. The card SHALL offer "Riprova", which reloads the page. The messages SHALL be:
- wrong or missing code: "Il codice nel link non è valido. Chiedi il link a chi ha organizzato.";
- room full: "La stanza è piena. Riprova tra poco.";
- too many rooms: "Ci sono troppe stanze aperte. Riprova tra poco.".

#### Scenario: Wrong code
- **WHEN** someone opens a link with a wrong `k`
- **THEN** they see the wrong-code card, and the page makes no further connection attempts

#### Scenario: Thirteenth person
- **WHEN** a room already holds 12 people and one more opens the link
- **THEN** they see the room-full card

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

In the lobby, on the results card and during a pause, a spectator SHALL see "Siediti" whenever fewer than 6 seats are taken or reserved. Pressing it SHALL seat them, or tell them "La zattera è piena: guardi da riva" if someone was faster. Spectators SHALL NOT be offered a seat during the countdown or the race.

#### Scenario: A seat frees up
- **WHEN** one of six seated players leaves for good while a spectator is in the lobby
- **THEN** the spectator sees "Siediti" and can sit without reloading

#### Scenario: Two spectators, one seat
- **WHEN** two spectators press "Siediti" with five aboard
- **THEN** one sits, the other is told the raft is full

### Requirement: Solo hint

When exactly one hippo is on board, the lobby SHALL show "Da soli si gira in tondo: invita qualcuno con il link" next to "Copia il link".

#### Scenario: First to arrive
- **WHEN** the first player boards an empty room
- **THEN** the lobby shows the solo hint, and it disappears when a second player sits down

### Requirement: Two to six seats, then spectators

The raft SHALL have as many seats as people sitting on it, never fewer than 2 nor more than 6. A joining player SHALL get a seat while fewer than 6 are taken or reserved. With 6, or while a race is counting down or running and not paused, the player SHALL watch as a spectator. A full raft SHALL say "La zattera è piena: guardi da riva". A race in progress SHALL say "La gara è in corso: guardi da riva fino all’arrivo". A room SHALL hold at most 12 people including spectators.

#### Scenario: Seventh player
- **WHEN** a seventh person boards a raft with six aboard
- **THEN** they see the race but control nothing

#### Scenario: Arriving mid-race
- **WHEN** someone boards while a race is running with fewer than six aboard
- **THEN** they watch until the race ends or is paused

#### Scenario: Leaving the lobby shrinks the raft
- **WHEN** one of five seated players closes the tab in the lobby and does not come back within 15 seconds
- **THEN** the raft has four seats and the others keep their colours

#### Scenario: Playing alone
- **WHEN** a single player boards an empty room
- **THEN** the raft has two seats, one of them shown as "Posto libero"

### Requirement: The raft is fixed for the race

The seat count SHALL change only in the lobby, on the results card and during a pause. From "Si parte" until the race ends it SHALL otherwise stay as it was. A seat whose player leaves mid-race SHALL stay empty until the race ends or is paused.

#### Scenario: Someone leaves mid-race
- **WHEN** one of five players leaves for good during the race
- **THEN** the raft keeps five seats, one empty, until the finish or the next pause

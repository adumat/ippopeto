# Spec Delta

## ADDED Requirements

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

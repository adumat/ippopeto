# Spec Delta

## MODIFIED Requirements

### Requirement: Reconnection

On close, the client SHALL retry with exponential backoff (400 ms doubling, capped at 5 s), except after receiving `denied` or a close code from 4001 to 4003, when it SHALL stop retrying. After a first successful connection it SHALL show "Connessione persa, riprovo…" while disconnected. Each tab SHALL hold a random session token for its lifetime, surviving reloads. On reconnect, a client that was seated SHALL repeat `join` with its name and token. A client that was a spectator SHALL NOT send `join` again on its own.

#### Scenario: Wi-Fi blip
- **WHEN** the connection drops for 2 seconds
- **THEN** the player is back on the raft in the same seat

#### Scenario: Denied
- **WHEN** the server answers `denied`
- **THEN** the client makes no further connection attempts until the page is reloaded

#### Scenario: Spectator blip
- **WHEN** a spectator's connection drops while a seat is free
- **THEN** after reconnecting they are still a spectator

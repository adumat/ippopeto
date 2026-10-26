# Spec Delta

## MODIFIED Requirements

### Requirement: Reconnection

On close, the client SHALL retry with exponential backoff (400 ms doubling, capped at 5 s), except after receiving `denied` or a close code from 4001 to 4003, when it SHALL stop retrying. After a first successful connection it SHALL show "Connessione persa, riprovo…" while disconnected. On reconnect it SHALL repeat `join` with the same name, which may land on a different seat.

#### Scenario: Wi-Fi blip
- **WHEN** the connection drops for 2 seconds
- **THEN** the player is back on the raft, possibly in another seat

#### Scenario: Denied
- **WHEN** the server answers `denied`
- **THEN** the client makes no further connection attempts until the page is reloaded

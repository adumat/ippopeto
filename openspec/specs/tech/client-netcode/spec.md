# client-netcode

## Purpose

How the browser turns 20 Hz snapshots into smooth 60 fps motion, sends input, and survives a dropped connection.

## Requirements

### Requirement: Interpolated rendering

The client SHALL render 100 ms in the past, interpolating between buffered snapshots (up to 40 kept). It SHALL estimate the server clock offset as a moving average and reset it on jumps over 1 s. When the raft moves more than 300 px between snapshots, as after a bite, it SHALL be drawn at the new position without interpolating. The client SHALL NOT predict.

#### Scenario: Bite teleport
- **WHEN** a bite moves the raft back to a checkpoint
- **THEN** the raft appears there, without sliding across the map

### Requirement: Input sending

The client SHALL compute `{turn, fart}` from keyboard and touch state, and send it only when it changes. Keys typed in text inputs SHALL NOT drive the game.

#### Scenario: Typing a name with a D
- **WHEN** a player types "Davide" in the name field
- **THEN** no turn input is sent

### Requirement: Reconnection

On close, the client SHALL retry with exponential backoff (400 ms doubling, capped at 5 s). After a first successful connection it SHALL show "Connessione persa, riprovo…" while disconnected. On reconnect it SHALL repeat `join` with the same name, which may land on a different seat.

#### Scenario: Wi-Fi blip
- **WHEN** the connection drops for 2 seconds
- **THEN** the player is back on the raft, possibly in another seat

### Requirement: Relative WebSocket URL

The WebSocket URL SHALL be built relative to the page path (`<base>ws`), while the server accepts only `/ws`. A reverse proxy serving the game under a sub-path SHALL strip the prefix.

#### Scenario: Served at the root
- **WHEN** the game is served at `https://gas.example/`
- **THEN** it connects to `wss://gas.example/ws?room=…`

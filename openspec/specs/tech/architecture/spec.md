# architecture

## Purpose

The shape of the system and the constraints every change must respect: an authoritative Node server, a static vanilla client, a course module shared by both, state held only in memory.

## Requirements

### Requirement: Authoritative server

The server SHALL own all game state and run the simulation. Clients SHALL send only input (turn and push) and requests (join, start). No client SHALL be able to set position, gas, time or score.

#### Scenario: Tampered client
- **WHEN** a modified client sends a fake position
- **THEN** the server ignores it, because no message carries position

### Requirement: Fixed-step simulation

The server SHALL step every room that has at least one client at a fixed 60 Hz. Real elapsed time SHALL drive the steps. After a stall the backlog SHALL be capped at 0.25 s, so the game never fast-forwards.

#### Scenario: Event loop stall
- **WHEN** the process freezes for 2 seconds
- **THEN** it resumes with at most 15 catch-up steps

### Requirement: Shared deterministic course

`public/track.js` SHALL be the single definition of geometry, obstacles and moving-obstacle motion. It SHALL be loaded by the server via `require` and by the browser as `window.Track`, through a minimal UMD wrapper. Moving obstacles SHALL be pure functions of room time `gt`, so client and server agree without sending obstacle positions.

#### Scenario: Barrel on screen
- **WHEN** the client draws a barrel at snapshot time `gt`
- **THEN** it is where the server collided it

### Requirement: Memory-only state, one replica

Rooms, seats and best times SHALL live in process memory, with no database or cache. The deployment SHALL therefore run exactly one replica with a `Recreate` strategy. A restart ends all games in progress. Adding persistence requires an explicit decision.

#### Scenario: Pod restart
- **WHEN** the pod restarts
- **THEN** clients reconnect to empty rooms

### Requirement: Minimal stack

The server SHALL be plain Node 22 with `ws` pinned to an exact version as its only runtime dependency. The client SHALL be vanilla JavaScript on a 2D canvas, served as-is, with no framework and no build step.

#### Scenario: Adding a dependency
- **WHEN** a change needs a new runtime dependency
- **THEN** it is justified in its design and approved first

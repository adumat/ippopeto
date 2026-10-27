# Spec Delta

## ADDED Requirements

### Requirement: Fogne events

The server SHALL emit `jet{x, y}` when a jet hits the vehicle and `suck` when an intake sends it back. Pipe and duck motion SHALL be derived from room time like other moving obstacles and SHALL NOT be sent.

#### Scenario: Splash on every screen
- **WHEN** a jet hits the raft
- **THEN** every client receives `jet` and draws the green splashes

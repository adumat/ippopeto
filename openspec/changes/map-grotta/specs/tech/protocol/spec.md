# Spec Delta

## ADDED Requirements

### Requirement: Grotta events

The server SHALL emit `bats` when a swarm hits the raft. Swarm and fish motion SHALL be derived from room time and the seed and SHALL NOT be sent.

#### Scenario: Blinded together
- **WHEN** a swarm hits the raft
- **THEN** every client receives `bats` and covers its view for 2 s

# Spec Delta

## ADDED Requirements

### Requirement: Debug teleport

When the server runs with `IPPO_DEBUG=1`, a seated client's `{t:'debug', op:'teleport', s}` SHALL move the raft to course distance `s` (clamped to the course), stopped and aligned with the river. Checkpoints and the finish SHALL then trigger on the next step exactly as if the raft had sailed there. Without `IPPO_DEBUG=1`, or from a spectator, the message SHALL be ignored like any unknown type.

#### Scenario: Production server
- **WHEN** a client sends a teleport to a server without `IPPO_DEBUG=1`
- **THEN** nothing happens

#### Scenario: Skipping to the finish in a test
- **WHEN** during a race a test teleports past each checkpoint in turn, then past the finish
- **THEN** clients receive `cp` events 0 to 3, then `finish`

# Spec Delta

## ADDED Requirements

### Requirement: Stelle state and events

On the Stelle, snapshots SHALL carry the saucer's height above the track as `z` while it is in the air, and omit it otherwise. The server SHALL emit `fall` when the saucer falls and `turbo` when it crosses a pad. Comet motion SHALL be derived from room time and SHALL NOT be sent.

#### Scenario: Watching a jump
- **WHEN** the saucer is in the air
- **THEN** every client draws it larger, with the shadow offset by `z`

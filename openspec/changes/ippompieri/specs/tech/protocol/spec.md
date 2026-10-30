## ADDED Requirements

### Requirement: Ippompieri mode

`{t:'mode', on}` SHALL set the room's mode when a seated client sends it while the room is in `lobby` or `finished`; anything else SHALL be ignored. Every snapshot SHALL carry the mode as `ip` (0 or 1). When the raft passes a checkpoint with the mode on, the server SHALL emit `spray{d}`, with `d` the spray duration in seconds. The shoves themselves SHALL travel only through the raft state, never as their own messages.

#### Scenario: Mode during a race
- **WHEN** a seated client sends `{t:'mode', on:true}` during a race
- **THEN** the server ignores it and `ip` stays unchanged

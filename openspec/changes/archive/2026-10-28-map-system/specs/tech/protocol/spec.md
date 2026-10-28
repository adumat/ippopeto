# Spec Delta

## ADDED Requirements

### Requirement: Map choice

`{t:'map', id}` SHALL set the room's map when sent by a seated client while the room is in `lobby` or `finished`, and `id` names a listed map; anything else SHALL be ignored. Every snapshot SHALL carry the current map id as `mp` and the layout seed as `sd` (0 for fixed maps). A client SHALL rebuild its course whenever either changes.

#### Scenario: Map picked mid-race
- **WHEN** a seated client sends `{t:'map', id:'fogne'}` during a race
- **THEN** nothing changes

#### Scenario: New layout
- **WHEN** a race starts on a generated map
- **THEN** the next snapshot carries a new `sd`, and every client rebuilds the same course

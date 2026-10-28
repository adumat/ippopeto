# Spec Delta

## ADDED Requirements

### Requirement: Fiordo events and state

The server SHALL emit `stuck` when the sled enters snow, `stroke{n}` for each counted stroke, `free` when it gets out, `bear{b}` when bear `b` starts its warning, and `fall` when thin ice breaks under the sled. Snapshots on the Fiordo SHALL carry the cracked and broken thin-ice tiles as `ic`, a compact list of tile indexes with their state, only while any tile is not intact.

#### Scenario: Late joiner sees the holes
- **WHEN** a spectator joins after a bridge broke
- **THEN** its first snapshot shows the broken tiles

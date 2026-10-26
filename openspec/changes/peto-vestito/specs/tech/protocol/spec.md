# Spec Delta

## ADDED Requirements

### Requirement: Peto vestito event

A peto vestito SHALL be announced as the event `shart{i}` in the next snapshot's `ev`, with `i` the seat index. The `finish` event SHALL carry `sharts`, the race's count. No per-snapshot field SHALL be added.

#### Scenario: Event
- **WHEN** seat 2 soils itself
- **THEN** every client receives `{k:'shart', i:2}` in the next snapshot

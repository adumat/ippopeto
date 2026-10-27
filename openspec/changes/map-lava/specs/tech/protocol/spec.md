# Spec Delta

## ADDED Requirements

### Requirement: Lava events

The server SHALL emit `fire{i}` when hippo `i` ignites, and `bomb` when a bomb hits the raft. Seat entries SHALL carry a flag while that hippo's fart is alight. Geyser and bomb timing SHALL be derived from room time and SHALL NOT be sent.

#### Scenario: Flames for everyone
- **WHEN** hippo 2 ignites over a vent
- **THEN** every client draws its fart as flame for 1 s

# Spec Delta

## REMOVED Requirements

### Requirement: Thrust comes from the corner
**Reason**: Seats are no longer fixed corners, and thrust per hippo now depends on crew size.
**Migration**: Replaced by "Thrust comes from the seat" and "Seats around the edge".

## ADDED Requirements

### Requirement: Thrust comes from the seat

A pushing hippo SHALL apply a force of 520 × √(4/N), where N is the raft's seat count, opposite to where its rear points, at its own seat. The force therefore both moves and rotates the raft. Each rear SHALL start pointing backwards (towards the stern).

#### Scenario: Pushing alone
- **WHEN** a single hippo pushes with its rear backwards
- **THEN** the raft moves forward and turns, because the force is off-centre

#### Scenario: Two hippos on opposite sides
- **WHEN** both hippos of a two-seat raft push backwards together
- **THEN** their torques cancel and the raft goes straight

#### Scenario: Crew size
- **WHEN** every hippo pushes backwards in sync
- **THEN** a crew of 2 is about 0.7 times, and a crew of 6 about 1.22 times, as fast as a crew of 4

### Requirement: Seats around the edge

The N seats SHALL be evenly spaced on a circle of radius 51 around the raft's centre, symmetric about the bow axis. With 4 seats they SHALL be at the corners, as on the original raft; with 2 on the left and right sides.

#### Scenario: Six aboard
- **WHEN** six hippos are seated
- **THEN** they form a hexagon, three on each side

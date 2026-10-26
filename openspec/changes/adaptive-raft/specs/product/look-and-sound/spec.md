# Spec Delta

## MODIFIED Requirements

### Requirement: Hippos

Each hippo SHALL face its push direction, in its player's colour. The colours SHALL be orange `#ff9f1c`, pink `#e0479e`, yellow `#ffd23f`, violet `#7b5cff`, coral red `#ef4b3f` and ice blue `#8fd3ff`. A player SHALL get the first colour no one aboard has, and keep it while seated even as others come and go. With 5 or 6 aboard, hippos SHALL be drawn smaller. The player's own hippo SHALL have a halo and a dashed arrow showing the push direction. An exhausted hippo SHALL be semi-transparent with slit eyes. A pushing hippo SHALL emit gas particles from its rear, capped at 700 particles on screen.

#### Scenario: Finding yourself
- **WHEN** six hippos are on the raft
- **THEN** each player can tell theirs at a glance

#### Scenario: Keeping your colour
- **WHEN** the orange player leaves the lobby
- **THEN** everyone else keeps their colour, and the next person to sit gets orange

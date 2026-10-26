# Spec Delta

## MODIFIED Requirements

### Requirement: Pushing together pays

When at least two hippos are present (seated and not away) and every present hippo is pushing at the same instant, every push SHALL be multiplied by 1.35 and the HUD SHALL show "Tutti insieme!". Away hippos SHALL NOT push, SHALL keep regenerating gas, and SHALL NOT count towards the bonus.

#### Scenario: One hippo is resting
- **WHEN** three of four seated hippos push
- **THEN** no bonus applies

#### Scenario: Solo play
- **WHEN** only one hippo is seated
- **THEN** the bonus never applies, and the raft mostly spins

#### Scenario: Teammate dropped
- **WHEN** one of four hippos is away and the other three push together
- **THEN** the bonus applies

# Spec Delta

## MODIFIED Requirements

### Requirement: Race HUD

During the race every player SHALL see:
- the race timer as `m:ss.s`;
- a vertical progress bar with a hippo marker and the four checkpoints, passed ones highlighted;
- one card per seat, two to six, with the hippo's name, colour and gas level (dimmed when exhausted, marked "libero" when empty), all fitting a 390 px wide screen;
- the "Tutti insieme!" banner while the sync bonus is active;
- short toasts for "Via!", checkpoints and bites.

#### Scenario: Watching gas
- **WHEN** a teammate runs dry
- **THEN** their seat card shows an empty, dimmed gas bar

#### Scenario: Six on a phone
- **WHEN** six hippos race and a player is on a 390 px phone
- **THEN** all six seat cards are visible in one row

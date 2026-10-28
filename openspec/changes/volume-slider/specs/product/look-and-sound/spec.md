## MODIFIED Requirements

### Requirement: Game sounds

Blips for the countdown, "Via!" and checkpoints, the chomp for bites, the thud scaled by impact for bumps and the finish arpeggio SHALL be synthesized in the browser. The speaker button SHALL open a volume panel with a slider from 0 to 100 % and a mute toggle; the volume SHALL scale every sound, fart voices included, with 100 % being the full game level. The volume SHALL start at 40 %. `M` or the panel's toggle SHALL mute every sound. The browser SHALL remember both the volume and the mute choice.

#### Scenario: Muted player
- **WHEN** a player muted the game last time
- **THEN** it starts muted

#### Scenario: First visit
- **WHEN** a player opens the game for the first time
- **THEN** the volume is 40 %

#### Scenario: Volume remembered
- **WHEN** a player set the volume to 70 % and reloads the page
- **THEN** the volume is 70 %

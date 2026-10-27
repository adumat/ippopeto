# Spec Delta

## REMOVED Requirements

### Requirement: Synthesized sound
**Reason**: Synthesized farts sounded fake by ear, after three different models. Fart voices move to recordings; every other sound stays synthesized.
**Migration**: Replaced by "Game sounds" and "Fart voices" below.

## ADDED Requirements

### Requirement: Game sounds

Blips for the countdown, "Via!" and checkpoints, the chomp for bites, the thud scaled by impact for bumps and the finish arpeggio SHALL be synthesized in the browser. `M` or the speaker button SHALL toggle mute for every sound, fart voices included, and the choice SHALL be remembered in the browser.

#### Scenario: Muted player
- **WHEN** a player muted the game last time
- **THEN** it starts muted

### Requirement: Fart voices

While a hippo pushes, every player SHALL hear a fart recording for it, picked at random from the game's set, with speed and pitch varied on each push around a per-seat offset. While the push is held, further random recordings SHALL follow without gaps. When the push stops, the sound SHALL fade out within about 60 ms.

#### Scenario: Two pushes in a row
- **WHEN** the same hippo pushes twice
- **THEN** the two pushes sound different

#### Scenario: Long push
- **WHEN** a hippo pushes for three seconds
- **THEN** recordings follow one another for the whole push and stop when it ends

### Requirement: Sound on phones

Sound SHALL start working from the player's first completed tap, and SHALL play on an iPhone whose mute switch is on, where the browser allows it.

#### Scenario: iPhone on silent
- **WHEN** a player on an iPhone with the mute switch on boards and pushes
- **THEN** they hear the fart

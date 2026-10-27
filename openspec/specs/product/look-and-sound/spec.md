# look-and-sound

## Purpose

The visual identity, the copy rules and the synthesized sound. The look is settled: changes need the owner's approval.

## Requirements

### Requirement: Visual identity

The game SHALL use:
- colour tokens: ink `#1f2b2e`, water `#3fa7b8`, grass `#7fa347`, sand `#efdda8`, wood `#9c6b3d`, gas `#c6dc5a`, paper `#fff8e1`;
- Bagel Fat One for titles and numbers, Atkinson Hyperlegible for text, both from Google Fonts with fallbacks;
- "sticker" cards: 3 px ink border and a solid offset shadow;
- pill-shaped buttons.

The title with its gas trail SHALL be the only bold element.

#### Scenario: Fonts blocked
- **WHEN** Google Fonts cannot load
- **THEN** the game stays readable with system fallbacks

### Requirement: Copy rules

All visible text SHALL be Italian, in simple sentences, in the active voice, with sentence case. It SHALL NOT use all-caps labels, middle-dot separators or arrows in buttons. Apostrophes SHALL be typographic (’).

#### Scenario: New label
- **WHEN** a new button is added
- **THEN** its label follows these rules, e.g. "Siediti", not "SIEDITI →"

### Requirement: The world on screen

The canvas SHALL draw:
- banks with procedural bushes and an animated, streaked current;
- dashed checkpoints that turn gas-green when passed, and a chequered finish;
- spiral whirlpools, rocks, barrels and tail-wagging crocodiles facing their direction of travel.

The camera SHALL follow the raft with a lead in the direction of motion. Zoom SHALL fit the screen (between 0.42 and 1.15). Bumps and bites SHALL shake the view.

#### Scenario: Phone screen
- **WHEN** the game runs at 390×844
- **THEN** the raft, both banks and upcoming obstacles fit on screen

### Requirement: Hippos

Each hippo SHALL face its push direction, in its player's colour. With 5 or 6 aboard, hippos SHALL be drawn smaller. The player's own hippo SHALL have a halo and a dashed arrow showing the push direction. An exhausted hippo SHALL be semi-transparent with slit eyes. A pushing hippo SHALL emit gas particles from its rear, capped at 700 particles on screen.

#### Scenario: Finding yourself
- **WHEN** six hippos are on the raft
- **THEN** each player can tell theirs at a glance

### Requirement: Player colours

The colours SHALL be orange `#ff9f1c`, pink `#e0479e`, yellow `#ffd23f`, violet `#7b5cff`, coral red `#ef4b3f` and ice blue `#8fd3ff`. A player SHALL get the first colour no one aboard has, and keep it while seated even as others come and go.

#### Scenario: Keeping your colour
- **WHEN** the orange player leaves the lobby
- **THEN** everyone else keeps their colour, and the next person to sit gets orange

### Requirement: Game name

The game SHALL be called "Ippopeto" in the browser tab title and in the splash title. The splash title SHALL keep its gas trail.

#### Scenario: Opening the game
- **WHEN** a player opens the game
- **THEN** the tab reads "Ippopeto" and the splash shows "Ippopeto" with the gas trail

### Requirement: Away hippos

A hippo whose player is away SHALL stay on the raft, drawn faded (more than an exhausted one), with no gas particles. Its seat card SHALL read "torna subito" under the name. A free seat SHALL keep reading "libero".

#### Scenario: Teammate drops
- **WHEN** a teammate's connection drops
- **THEN** everyone sees their hippo fade and "torna subito" on their seat card until they return or the seat frees up

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

### Requirement: Everyone sees the peto vestito

On a peto vestito, every player SHALL see four to six brown splats in two tones covering part of the screen. They SHALL stay for about 4 seconds, then drip down and fade. With reduced motion requested, they SHALL fade without dripping. A toast SHALL say "<name> se l’è fatta addosso".

#### Scenario: Teammate soils itself
- **WHEN** Giulia's hippo has a peto vestito
- **THEN** every screen gets splats and the toast "Giulia se l’è fatta addosso"

### Requirement: The culprit stays marked

The hippo that had a peto vestito SHALL be drawn with a brown stain on its rear for about 10 seconds.

#### Scenario: Finding the culprit
- **WHEN** the splats have dripped away
- **THEN** the culprit's hippo still shows the stain for a few more seconds

### Requirement: Peto vestito sound

A peto vestito SHALL play one of the bundled vestito recordings, varied like the fart voices.

#### Scenario: Hearing it
- **WHEN** a peto vestito happens
- **THEN** every player hears a vestito recording

### Requirement: Brown is reserved for the peto vestito

The palette SHALL gain brown (`#6b4423`, with a lighter tone for depth), used only for the peto vestito splats and stain.

#### Scenario: New element
- **WHEN** someone adds a brown element unrelated to the peto vestito
- **THEN** it violates this requirement

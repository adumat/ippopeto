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

Each hippo SHALL face its push direction, in its seat colour. The player's own hippo SHALL have a halo and a dashed arrow showing the push direction. An exhausted hippo SHALL be semi-transparent with slit eyes. A pushing hippo SHALL emit gas particles from its rear, capped at 700 particles on screen.

#### Scenario: Finding yourself
- **WHEN** four hippos are on the raft
- **THEN** each player can tell theirs at a glance

### Requirement: Synthesized sound

All sound SHALL be synthesized in the browser, with no audio files:
- a fart voice per seat, with a distinct timbre per seat, playing while that hippo pushes;
- blips for countdown, "Via!" and checkpoints;
- a chomp for bites, a filtered thud scaled by impact for bumps, an arpeggio at the finish.

`M` or the speaker button SHALL toggle mute, and the choice SHALL be remembered in the browser.

#### Scenario: Muted player
- **WHEN** a player muted the game last time
- **THEN** it starts muted

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

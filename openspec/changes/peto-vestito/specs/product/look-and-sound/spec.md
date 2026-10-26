# Spec Delta

## ADDED Requirements

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

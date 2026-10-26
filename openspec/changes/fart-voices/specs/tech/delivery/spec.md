# Spec Delta

## ADDED Requirements

### Requirement: Bundled audio

Recordings SHALL ship in `public/sounds/` as mono mp3, loudness-normalized, with all of them together under 500 KB, since every client downloads them once per page load. Every recording SHALL have a licence that allows redistribution in a public repository, and `CREDITS.md` SHALL list its source, author and licence.

#### Scenario: Adding a recording
- **WHEN** someone adds a fart to `public/sounds/`
- **THEN** `CREDITS.md` gains its source, author and licence, and the folder stays under 500 KB

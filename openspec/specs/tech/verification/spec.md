# tech/verification Specification

## Purpose
The automated checks the repository guarantees, what each one proves, and when they run, so behaviour in the product and tech specs is defended against regressions.

## Requirements

### Requirement: Course checks

`npm test` SHALL fail when any solid obstacle (rock, barrel, crocodile) leaves less than 164 px of free water on both of its sides. Moving obstacles SHALL be checked at every 0.05 s of room time over at least 20 s. Obstacles closer than 150 px to each other along the course SHALL be checked together, as one blockage.

#### Scenario: A rock moved to mid-river
- **WHEN** someone edits a rock so that it narrows both sides below 164 px
- **THEN** `npm test` fails and names that rock

### Requirement: Centre-line consistency

`npm test` SHALL fail when the nearest centre-line point to a point on the centre line is more than 1 px of course distance away from it, sampled every 10 px along the whole course.

#### Scenario: Self-crossing curve
- **WHEN** a course edit makes two stretches of river pass close to each other
- **THEN** `npm test` fails at the first ambiguous distance

### Requirement: Difficulty check

`npm test` SHALL run the reference bot crew of four on a room with no network and SHALL fail unless it finishes, passing all four checkpoints in order, within 300 s of race time. It SHALL also print the outcome for crews of two and one, without asserting it.

#### Scenario: Tuning makes the river impossible
- **WHEN** a tuning change stops the four-bot crew from finishing
- **THEN** `npm test` fails and prints time, progress, bites and checkpoints

### Requirement: Browser flows

`npm run e2e` SHALL start the server itself and drive real browsers through:
- boarding, the lobby, the countdown and the race, then the results card with time, stats and best times, and "Un altro giro" back to the countdown, with no console errors;
- the refusal card for a wrong access code, and boarding with the right one;
- on a 390×844 touch device: all three touch buttons change the player's aim or push in the snapshots, and the lobby does not overlap the audio button.

#### Scenario: Results card breaks
- **WHEN** a change stops the results card from appearing at the finish
- **THEN** `npm run e2e` fails

### Requirement: Continuous integration

Both suites SHALL run on every push to any branch and on every pull request. Screenshots and traces SHALL be kept as artifacts when the browser suite fails.

#### Scenario: Red pull request
- **WHEN** a pull request breaks a unit check
- **THEN** its CI run fails before anyone merges the release PR

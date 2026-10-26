# Proposal

## Why

Pushing on an empty tank costs nothing today beyond the 2-second lockout, so the best play is to hold the button until the gas runs out. A risk for forcing it adds a decision ("one more push, or let go?"), and it makes the game funnier: forcing it can end with you soiling yourself in front of the whole call.

## What Changes

- **Peto vestito**: while a hippo pushes below 25 gas, it may soil itself, with a chance that grows towards an empty tank. Forcing it to zero carries roughly a one-in-three chance; letting go at 15 stays almost always clean. The server decides, so every client agrees.
- On a peto vestito:
  - the culprit's tank empties and locks as when it runs dry;
  - every player sees brown splats covering part of the screen for ~4 s, then dripping away, and "<name> se l’è fatta addosso";
  - everyone hears one of the vestito recordings;
  - the culprit's hippo keeps a stain for ~10 s.
- The results card counts peti vestiti.
- A new colour, brown, enters the palette for this effect only. The splats are a deliberate exception to "the title is the only bold element".

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `product/raft-handling`: the peto vestito rule and its cost.
- `product/look-and-sound`: splats, stain, message and sound.
- `product/race-and-results`: the count in the results.
- `tech/protocol`: the `shart` event and the `sharts` field of `finish`.

## Impact

- Code: `server/game.js` (hazard, event, count, injectable random source), `public/client.js` (splat layer, stain, toast, sound), `public/style.css` (brown token).
- Tests: unit tests on the hazard with a seeded random source; the difficulty check must stay green with the bot now exposed to the risk; one e2e that forces a peto vestito.
- Depends on `fart-voices` for the vestito recordings and the sound engine.
- Bandwidth: one small event per peto vestito, nothing per snapshot.

# Proposal

## Why

A race cannot be stopped once it starts. A colleague who has to answer the door drags the crew down. A newcomer has to watch for two minutes. A bad start can only be fixed by finishing the river. The crew needs a pause, and the pause is the natural moment to let people on or off the raft.

## What Changes

- Any seated player can pause during the countdown or the race, with `P`/`Esc` or a pause button. Everything freezes for everyone: the raft, the current, moving obstacles, gas and the race clock.
- A pause menu, shown to all and usable by anyone seated:
  - **Riprendi**: a 3-second countdown, then the race continues exactly where it stopped;
  - **Ricomincia**: a new race from the start;
  - **Termina**: back to the lobby, with no result recorded.
- While paused, spectators can sit down ("Siediti") and seated players can stand up ("Alzati"). The raft resizes at once (2–6 seats), and the thrust follows the new crew on resume.
- Outside a pause, the race rules stay as they are: no new seats, and a dropped player's seat waits 15 s.

## Capabilities

### New Capabilities

- `product/pause`: pausing, what freezes, the pause menu, and seats during a pause.

### Modified Capabilities

- `product/rooms-and-crew`: seats can change during a pause, not only between races.
- `product/race-and-results`: paused time is not race time; a race ended from the menu leaves no result.
- `tech/protocol`: a `paused` room state, new client messages, and seat assignment during a pause.

## Impact

- Code: `server/game.js` (state machine, freeze, actions), `server/index.js` (messages), `public/client.js`, `public/index.html` and `public/style.css` (pause button, card, keys, frozen world time, race clock across the resume countdown).
- Tests: unit tests on freezing and every action; one e2e with two browsers and a bot.
- Bandwidth: unchanged; snapshots keep flowing at 20 Hz while paused so the menu stays live.

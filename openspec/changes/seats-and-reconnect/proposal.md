# Proposal

## Why

Three rough edges show up the first time a real group plays:
- A dropped connection costs a player their seat, and they may come back in another corner, with another colour and another role in the push pattern.
- A spectator cannot take a seat that frees up without reloading the page. Worse, a spectator whose connection blips can land in a seat mid-race by accident.
- Someone playing alone gets a spinning raft and no hint why.

The client's screen logic also relies on a hack, reading the results text to guess whether to show the lobby, which makes the new flows risky to add.

## What Changes

- **Seat reservation.** A seated player who disconnects keeps their seat for 15 s. A tab that reconnects or reloads within that time gets the same seat back, with its gas. Meanwhile the hippo is shown as away, does not push, and does not count towards the sync bonus.
- **Sitting down between races.** In the lobby and on the results card, a spectator sees "Siediti" when a seat is free. New seats are no longer given out during the countdown or the race; arrivals then watch until the race ends.
- **Solo hint.** With a single hippo on board, the lobby says "Da soli si gira in tondo: invita qualcuno con il link".
- **Explicit screens.** The client decides what to show from one screen state (splash, lobby, race, results). Someone arriving while a finished race's results are up sees the lobby.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `product/rooms-and-crew`: seats are reserved on disconnect; spectators can sit between races; new seats are not given out mid-race; solo hint.
- `product/raft-handling`: away hippos neither push nor count for sync.
- `product/race-and-results`: late arrivals at a finished room see the lobby; "Siediti" is offered on the results card.
- `product/look-and-sound`: away hippos are drawn and labelled as away.
- `tech/protocol`: `join` carries a session token; seat entries gain an `away` flag.
- `tech/client-netcode`: reconnection reclaims the same seat; spectators do not auto-sit on reconnect.

## Impact

- Code: `server/game.js` (seat lifecycle, sync, join rules), `server/index.js` (token passing), `public/client.js` (screen state, token, "Siediti", away rendering), `public/index.html` and `public/style.css` (button, hint, away label).
- Bandwidth: one more field per seat, about 160 bytes/s per client (≈2 % of the budget).
- Tests: a new `test/e2e/reconnect.spec.js` and unit tests on `Room`'s seat lifecycle, on top of `reproducible-tests`.
- Depends on `access-code` (its reconnection rule is extended here) and on `reproducible-tests` (the safety net for the screen refactor).

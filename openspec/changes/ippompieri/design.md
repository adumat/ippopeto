# Design

## Context

Copy is spread across three places: `public/index.html` holds the static labels, `public/client.js` holds the toasts and results, and `public/maps/*.js` holds the causes and hints. The room already syncs one lobby-time choice, the map, through `{t:'map'}` and the snapshot field `mp`. The mode copies that path.

## Decisions

- **The mode is room state, like the map.** `room.ippo` lives in `server/game.js`. It is settable only in `lobby`/`finished` by a seated client, and it is sent as `ip` in every snapshot. The guard is shared with `setMap`.
- **One copy table.** Every changing string moves into a `COPY` object in `client.js`, keyed by name, with `{base, ippo}` variants. `t(key, vars)` picks the variant for the current `ip`. Static labels in `index.html` get `data-copy` keys, and they are re-applied whenever `ip` changes. The off-mode text stays byte-identical to today.
- **Map overrides.** A map module may add an `ippo: {causes, hint}` block. The client falls back to the base entries for anything missing.
- **Look.** The painters take a `mode` flag:
  - the helmet is a small red dome drawn on top of each hippo;
  - the jet reuses the particle system with a white palette and a narrower spread;
  - the splats reuse `spawnSplats` with white foam colours.
  The brown-only rule stays true, because brown is simply not used in the mode.
- **Captain.** He is drawn by the client at the raft centre and does not exist in `seats`. On a checkpoint with the mode on, the server starts a 3 s spray. Every 0.25 s it applies a random impulse of 25–35 % of one hippo's push, from a room-seeded RNG. The server emits `spray{d:3}` so clients animate him.
  - To be tuned with the sim on the 2-bot crew: the shoves must never cause a send-back on their own.
- **Notice.** A card overlay in `index.html`, shown once per page load on the first snapshot with `ip:1`. It is client-only.
- **Sounds.**
  - Hose jet: synthesized filtered noise bursts, like the existing `thud`/noise buffer, with no new asset needed.
  - Voice lines ("oh sì" chorus, "ops", the moan, the slap): short recordings under `public/sounds/ippo/`, loaded only when the mode turns on.

## Risks

- **Voice lines need recordings.** CC0 sources for moans and an Italian "oh sì" chorus are unlikely. The fallback is that the owner records them, as with the fart voices.
- **Captain vs. the 2-bot crew.** Random shoves after a checkpoint are exactly the "hazard right after a checkpoint" pattern that causes send-back loops. Keep them below that threshold, verified on 5+ seeds per map.

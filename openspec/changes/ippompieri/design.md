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
- **Captain.** He is drawn by the client at the raft centre and does not exist in `seats`. On a checkpoint with the mode on, the server starts a 3 s spray. Every 0.25 s it turns a held shove of 15 % of one hippo's push to a new direction. The direction comes from a hash of the layout seed, the checkpoint and the step, so it never consumes the room's dice. The server emits `spray{d:3}` so clients animate him.
  - Tuned with the sim over 10 seeds per map. With 4 bots the failures stay at 0 in 60 runs and the send-backs go from 3.2 to 3.5. With 2 bots, failures go from 5 to 7 in 60 runs and send-backs from 4.9 to 5.9. Those 2-bot runs are already chaotic: any perturbation moves a borderline run either way.
- **Notice.** A card overlay in `index.html`, shown once per page load on the first snapshot with `ip:1`. It is client-only.
- **Sounds.**
  - They are recordings from Freesound, picked by the owner in an artifact: CC0, except the two "oops", which are CC BY 4.0 and credited in `CREDITS.md`. They live under `public/sounds/ippo/` and load only once the mode is on.
  - The hose jet replaces the fart clips in the same chained-voice player.
  - The chorus is three "oh sì" clips stacked at different pitches.

## Risks

- **The voices are English** ("oh yeah", "oh!"): no Italian CC0 recordings were found.
- **Captain vs. the 2-bot crew.** Random shoves after a checkpoint are exactly the "hazard right after a checkpoint" pattern that causes send-back loops. Keep them below that threshold, verified on 5+ seeds per map.

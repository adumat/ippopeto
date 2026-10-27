# Proposal

## Why

The synthesized fart, a sawtooth with a regular vibrato through a resonant filter, sounds like a kazoo. Two pulse-based synthesis models were tried and judged "too fake" by ear. The owner listened to 82 real recordings (CC0, from Freesound) in a test page and picked 12 farts and 5 candidates for the peto vestito. Every push should also sound different from the last.

## What Changes

- **BREAKING (product rule)**: fart voices come from bundled recordings instead of being synthesized. Every other sound (blips, chomp, thud, finish arpeggio) stays synthesized.
- Each push plays a random clip from the 12 chosen, at a speed and pitch varied per push and offset per seat, so seats stay distinguishable and no two pushes match. While the push is held, further random clips are chained; release fades out within ~60 ms.
- The 5 "vestito" clips ship too, for the `peto-vestito` change.
- Audio unlocks on the first completed tap (iOS only unlocks on touchend or click) and asks for the playback audio session, so the iPhone mute switch does not silence the game. The audition page showed both problems.
- The server serves `.mp3` files from `public/sounds/`.
- A `CREDITS.md` lists every clip's Freesound id, author and licence (CC0 needs no credit; this keeps the provenance auditable).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `product/look-and-sound`: fart voices are recordings, varied per push and per seat; the "all synthesized" rule is replaced.
- `tech/server-runtime`: static serving includes `public/sounds/*.mp3`.
- `tech/delivery`: bundled audio has a size budget and a provenance rule.

## Impact

- New: `public/sounds/` (17 mp3, ~160 KB), `CREDITS.md`.
- Changed: `server/index.js` (static loader), `public/client.js` (audio), README.
- Each client downloads ~160 KB once per page load.

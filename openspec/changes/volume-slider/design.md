# Design

## Context

All sound goes through one master `GainNode` in `public/client.js`, set to 0.7 or 0 for mute. The speaker button (`#mute`) sits fixed in the top-right corner, next to the pause button.

## Decisions

- **Volume on the master gain.** `master.gain = muted ? 0 : 0.7 * volume`, with `volume` in 0–1. One place, every sound included; 100 % keeps today's level.
- **Panel under the speaker button.** A tap on `#mute` opens a small card below it with the mute toggle, a horizontal `<input type="range">` and the value in percent. A tap outside or `Esc` closes it. A native range input works with touch and keys without extra code.
- **Stored per browser.** `ippo-volume` (0–100) next to `ippo-muted`, through the existing `store` wrapper. A missing or invalid value means 40.
- **The button icon** shows 🔇 when muted or at 0 %, otherwise 🔊.

## Risks

- A linear gain sounds quieter at 40 % than "40 %" suggests. If the owner finds it too low, raise the default rather than add a curve.

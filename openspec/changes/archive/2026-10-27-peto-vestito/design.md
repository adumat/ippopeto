# Design

## Context

Gas is updated per seat in `Room.step()`: pushing drains 28/s, an empty tank sets `exhausted` until gas reaches 35. Events ride in snapshots. The client draws on one canvas and already has a `shake` effect and toasts. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- A risk the player can read and manage.
- A gag everyone in the call sees at the same moment.

**Non-Goals:**
- Persistent stains on the raft or the river, or per-player statistics beyond the race count.

## Decisions

**Hazard as a rate, sampled per step.** Each step, a pushing seat with gas below 25 has probability `1 − exp(−k·(1 − gas/25)²·dt)`, with `k = 1.45/s`. Integrated over a full drain from 25 to 0 (0.89 s), this gives ~35 %; stopping at 15 gives ~2.7 %. A rate rather than a per-push roll keeps the result independent of the 60 Hz step and of how input is chunked.

**Injectable randomness.** `Room` takes `{ random = Math.random }` in its options. The tests and the reference bot pass a seeded generator, so `npm test` stays deterministic. The production server keeps `Math.random`.

**Difficulty stays a check, not a target.** The smart bot releases at gas 5, deep in the risk zone, so it will soil itself now and lose gas. If the four-bot crew no longer finishes within 300 s, the constants are retuned with the owner, not silently. Lowering `k` or the threshold are the knobs.

**Client effect on the canvas.**
- Splats are drawn in screen space after the world: blob shapes made of a few overlapping circles, in two browns, at random positions biased away from the centre so the raft stays partly visible.
- Each splat stays for 4 s, then drips: it stretches downward while its alpha falls over 1.5 s.
- With `prefers-reduced-motion`, only the alpha changes.
- The stain is a small brown ellipse under the hippo's rear for 10 s, timed locally from the event.

None of this is in the snapshot: a late joiner simply sees no splats.

**Sound.** The `shart` event plays a random vestito clip through the `fart-voices` engine on the master bus. It respects mute.

## Risks / Trade-offs

- [The splats hide too much and frustrate] → Coverage is bounded (4–6 splats, centre-biased away) and lasts 4 s. Tune with the owner after the first real game.
- [Two peti vestiti in quick succession stack splats] → Cap at 10 live splats, dropping the oldest first.

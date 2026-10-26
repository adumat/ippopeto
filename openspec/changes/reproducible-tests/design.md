# Design

## Context

`scripts/sim.js` drives `Room` headlessly by replacing `flush` and faking sockets with `{readyState: 0}`. The Python drafts drive Chromium against a server started by hand, and only take screenshots. Checkpoints trigger on course distance (`closest().s`) during `running`. The finish requires `lastCp === 3`. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- One command per suite, green locally and in CI, with no manual server start.
- Reach the finish deterministically and fast.

**Non-Goals:**
- Pixel-diff screenshots: canvas output varies with fonts and timing.
- Reconnection tests. They arrive with `seats-and-reconnect`, which changes that behaviour.
- Audio assertions. Audio is tuned by ear with the owner.

## Decisions

**Node for everything.** `node --test` for units and `@playwright/test` for e2e. One runtime, and the Python drafts become reference only. `@playwright/test` is pinned to an exact version, matching how `ws` is pinned.

**The bot becomes a test helper.** `test/helpers/bot.js` exports `runCrew({players, smart, maxSeconds})`, which returns `{status, time, progress, bites, checkpoints}`. It keeps sim.js's steering logic unchanged, so the calibrated ~120 s target still means the same thing. Events are captured by wrapping `flush`, as the draft does.

**Gap check as interval union.** For each obstacle cluster (within 150 px of course distance), the blocked lateral intervals `[lat − r, lat + r]` are projected onto the river's cross-section at the cluster's centre. The longest free interval must be ≥ 164 px. Moving obstacles are sampled every 0.05 s over 20 s, which covers whole periods of every mover (3–5 s).

If the current course fails, the test reports which obstacle and when, and the course is not retuned silently: course changes need the owner's approval.

**Teleport inside the room, triggered over the wire.** `Room.teleport(s)` reuses `respawn` (position, alignment, zero velocity). The checkpoint logic runs unchanged on the next step, so one teleport per checkpoint walks the progression.

The e2e test sends the messages from its own `ws` client in Node, seated in the same room. Browsers stay untouched, with no global hooks. A seated bot also makes "crew of three" realistic. Snapshots are read in the browser tests through Playwright's `page.on('websocket')` `framereceived` events.

**Server lifecycle by Playwright.** The `webServer` setting runs `node server/index.js` on port 8787 with `IPPO_DEBUG=1` and `IPPO_ACCESS_CODE=test`, waits on `/healthz`, and reuses a running server only outside CI. This also sidesteps the `pkill -f` trap documented in AGENTS.md.

**Layout check by geometry.** The mobile-lobby check compares the bounding boxes of `#lobby` and `#mute`. A screenshot would need a human to read it.

**CI.** A single `ci.yml`:
1. `npm ci` and `npm test`;
2. `npx playwright install --with-deps chromium` and `npm run e2e`;
3. upload `test-results/` on failure.

`release.yml` stays separate. Gating the release on CI is left out: release PRs are merged by hand after seeing CI green.

## Risks / Trade-offs

- [The gap test fails on today's course] → That is a finding, not a test bug. Report it to the owner with the offending obstacle and instant before changing data.
- [Timing flakiness in e2e (countdown, snapshot arrival)] → Wait on snapshot state (`st`, events) rather than sleeping. The countdown is 3 s and is waited out explicitly.
- [Headless Chromium and `pointer: coarse`] → Use a context with `hasTouch: true` and `isMobile: true`. Assert the touch bar is visible before pressing, so a media-query mismatch fails loudly.

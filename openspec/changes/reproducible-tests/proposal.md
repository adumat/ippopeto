# Proposal

## Why

Everything verified so far was checked once, by hand or by throwaway scripts during a chat. Nothing guards the course's passability, the difficulty target, or the browser flows against regressions. Several flows have never run at all: the finish card, the touch buttons, the mobile lobby fix. The next change, `seats-and-reconnect`, refactors the client's screen logic, and it needs this safety net first.

## What Changes

- Unit checks with `node --test`, no new dependencies:
  - the course gap rule for every solid obstacle, moving ones sampled over time;
  - the centre-line round trip of `closest()`;
  - a four-bot crew finishing within 300 s.
- Browser end-to-end tests with `@playwright/test` (dev dependency, Chromium only):
  - a full race to the results card and "Un altro giro";
  - the access-code refusal;
  - touch controls and the mobile lobby layout.
- A debug-only server message that teleports the raft along the course, enabled by `IPPO_DEBUG=1`, so a test can reach the finish in seconds.
- A CI workflow that runs both suites on every push and pull request.
- The draft scripts in `scripts/` are replaced by these tests and deleted.

## Capabilities

### New Capabilities

- `tech/verification`: the automated checks the repository guarantees and when they run.

### Modified Capabilities

- `tech/protocol`: a `debug` message, accepted only when debug mode is on.

## Impact

- New: `test/unit/`, `test/e2e/`, `playwright.config.js`, `.github/workflows/ci.yml`. `package.json` gains `test` and `e2e` scripts and a pinned `@playwright/test` dev dependency.
- Changed: `server/index.js` (debug message), `server/game.js` (a teleport method).
- Removed: `scripts/sim.js`, `scripts/e2e_desktop.py`, `scripts/e2e_mobile.py`.
- The production image is unaffected: dev dependencies are not installed, and debug mode is off unless the variable is set.

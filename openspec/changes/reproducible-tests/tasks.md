# Tasks

## 1. Unit checks

- [ ] 1.1 Extract the sim bot into `test/helpers/bot.js` (`runCrew`) without changing its steering. Verify that four smart bots report a finish time close to the ~120 s from the handover
- [ ] 1.2 Write `test/unit/difficulty.test.js`: assert that four bots finish within 300 s with checkpoints 0–3 in order, and log the two- and one-bot outcomes. Verify `npm test` passes and prints all three lines
- [ ] 1.3 Write `test/unit/track.test.js`: the centre-line round trip every 10 px, and the gap rule as an interval union over clusters, sampling movers every 0.05 s for 20 s. Verify it passes, or report the failing obstacle to the owner before changing course data
- [ ] 1.4 Prove the gap test can fail: temporarily move one rock to `off: 0` and confirm `npm test` names it, then revert
- [ ] 1.5 Add `"test": "node --test test/unit/"` to `package.json` and delete `scripts/sim.js`. Verify `npm test` exits 0

## 2. Debug teleport

- [ ] 2.1 Add `Room.teleport(s)` and handle `{t:'debug', op:'teleport', s}` in `server/index.js` only when `IPPO_DEBUG === '1'` and the sender is seated. Verify with a unit test on `Room`: teleporting past each checkpoint, then the finish, emits `cp` 0–3 and `finish`
- [ ] 2.2 Document `IPPO_DEBUG` in the README as test-only. Verify the README states it must never be set in production

## 3. Browser suite

- [ ] 3.1 Add `@playwright/test` (exact version) and `playwright.config.js`, with webServer on port 8787, `IPPO_DEBUG=1`, `IPPO_ACCESS_CODE=test`, Chromium only and traces on failure. Add `"e2e": "playwright test"`. Verify `npm run e2e` starts and stops the server on its own
- [ ] 3.2 Write `test/helpers/wsbot.js`: a Node `ws` client that joins a room as a seated player and can send `start` and teleports. Verify it is used by `race.spec`
- [ ] 3.3 Write `test/e2e/race.spec.js`: two browsers and the bot go through board, lobby, start, countdown and race, then teleports to the finish. Check the results card (time, bites line, sync line, at least one best time), then "Un altro giro", which hides the results and shows a countdown snapshot. Collect console errors and page errors and assert there are none. Verify it passes three times in a row
- [ ] 3.4 Write `test/e2e/access.spec.js`: a wrong `k` shows the refusal card and opens no second socket within 3 s; the right `k` reaches the splash. Verify it passes
- [ ] 3.5 Write `test/e2e/touch.spec.js` with a 390×844 `hasTouch`/`isMobile` context: the touch bar is visible after boarding; pressing left or right changes the player's own `aim` and holding push sets `farting` in received snapshots; the boxes of `#lobby` and `#mute` do not intersect. Verify it passes
- [ ] 3.6 Delete `scripts/e2e_desktop.py`, `scripts/e2e_mobile.py` and the then-empty `scripts/`, and add `test-results/` and `playwright-report/` to `.gitignore`. Verify `git status` is clean after a run

## 4. CI

- [ ] 4.1 Add `.github/workflows/ci.yml` (push and pull_request; unit, then browser install and e2e; upload `test-results/` on failure). Verify the first run on GitHub is green
- [ ] 4.2 Add the test commands and the e2e approach to AGENTS.md. Verify a fresh reader can run both suites from it alone

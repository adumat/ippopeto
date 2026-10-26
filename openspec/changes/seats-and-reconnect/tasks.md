# Tasks

## 1. Client screen state

- [x] 1.1 Replace the visibility logic in `onSnapshot` and `showResults` with `view` + `render()` per the design's transition table, and remove the `final-time` hack. Verify `race.spec` and `touch.spec` still pass with no behaviour change
- [x] 1.2 Add an e2e case: a browser boards a room whose race has just finished (teleported by the bot) and sees the lobby, not the results. Verify it fails before 1.1 and passes after

## 2. Seat lifecycle on the server

- [x] 2.1 Implement seat reservation in `Room` (away flag, token, `awayUntil`, `IPPO_RESERVE_MS`, input cleared, freed in `step`). Verify with unit tests: disconnect keeps the seat away, the same token reclaims it with gas intact, a foreign token does not, and the seat is freed after the reserve time
- [x] 2.2 Move the join rules into `Room.join` returning `{seat, why}`, with no new seats in `countdown`/`running`. Forward a validated `token` from `index.js` and add `why` to `joined`. Verify with unit tests for `full`, `racing`, the mid-race reclaim and renaming
- [x] 2.3 Exclude away seats from pushing and from sync, and add `away` to the snapshot seat entry. Verify with a unit test: three present hippos pushing with one away get the bonus

## 3. Client features

- [ ] 3.1 Generate the session token in sessionStorage, send it with `join`, and resend `join` on reconnect only if the tab was seated. Show the `racing` and `full` messages from `why`. Verify by hand: reload while seated returns the same seat
- [ ] 3.2 Add "Siediti" to the lobby and results card, shown when the tab is a spectator and a seat is null. It sends `join`. Verify with an e2e: five browsers, one seated player leaves for good, and the fifth sees "Siediti" and sits after the reserve time
- [ ] 3.3 Draw away hippos faded with no particles, and show "torna subito" on their seat card. Verify with a manual screenshot check, approved by the owner, since the look is owner-approved
- [ ] 3.4 Show the solo hint in the lobby when exactly one seat is present. Verify with an e2e assertion: visible with one browser, hidden once a second sits

## 4. Reconnection e2e

- [ ] 4.1 Write `test/e2e/reconnect.spec.js` with `IPPO_RESERVE_MS=1500`. Close a seated browser's socket from `page.evaluate`, and assert it returns to the same seat and that teammates saw `away` = 1 meanwhile. Then close a socket that stays offline (route-blocked) and assert the seat frees after the reserve time. Then confirm a spectator's blip does not seat it. Verify it passes three times in a row

## 5. Docs

- [ ] 5.1 Update AGENTS.md (seat lifecycle, `IPPO_RESERVE_MS`) and the README environment section. Verify every variable the server reads is listed

# Tasks

## 1. Server rule

- [x] 1.1 Add an injectable `random` to `Room` options and make the reference bot and existing unit tests pass a seeded generator. Verify `npm test` is green and gives identical output on two runs
- [x] 1.2 Implement the hazard in `step()`: on a peto vestito, empty and lock the tank, push `{k:'shart', i}`, and count it when `running`; add `sharts` to `finish`. Verify with unit tests: the measured rate over 2000 seeded full drains is 35 % ± 5, stopping at 15 gives under 5 %, and there are none during the countdown
- [x] 1.3 Re-run the difficulty check with the bot exposed to the risk. Verify four bots still finish within 300 s, or stop and retune with the owner

## 2. Client

- [ ] 2.1 Add the brown tokens and a screen-space splat layer (4–6 splats, 4 s, drip, reduced-motion fade, cap 10). Verify with a screenshot approved by the owner
- [ ] 2.2 Add the 10 s stain on the culprit's hippo, the toast "<name> se l’è fatta addosso", and the vestito sound. Verify by hand that the toast names the right player
- [ ] 2.3 Add "N peti vestiti" to the results stats, singular or plural. Verify in `race.spec` that the stats line contains the count

## 3. End to end

- [ ] 3.1 Add a debug op `{t:'debug', op:'shart', seat}` behind `IPPO_DEBUG`, and an e2e that triggers it and asserts the toast, the `shart` event in both browsers' snapshots, and no console errors. Verify it passes three times in a row

## 4. Docs

- [ ] 4.1 Document the rule and its constants in AGENTS.md (tuning section) and the brown exception in the design rules. Verify a reader can find the 25-gas threshold and `k`

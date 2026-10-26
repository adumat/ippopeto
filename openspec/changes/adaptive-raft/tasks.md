# Tasks

## 1. Geometry

- [ ] 1.1 Replace `Track.SEATS` with `Track.seatPositions(n)` (radius 51, symmetric about the bow). Verify with a unit test: n = 4 gives the four corners within 0.5 px, n = 2 gives left and right, and every n from 2 to 6 is symmetric about the bow axis

## 2. Server

- [ ] 2.1 Make `Room.seats` variable-length with `compact()` (drop nulls, pad to 2, never during countdown or running), a colour per seat (lowest free), and `client.seat` re-derived after compaction. Verify with unit tests: joins up to 6 then `full`; leaving the lobby shrinks the list and keeps colours; a mid-race leave leaves a `null` until the finish; a reclaim survives compaction
- [ ] 2.2 Scale thrust by `sqrt(4 / seats.length)` and add the colour index to snapshot seat entries. Verify the existing physics tests pass unchanged for 4
- [ ] 2.3 Extend the difficulty test to crews of 2, 4 and 6. Verify all three finish within 300 s, or stop and report to the owner

## 3. Client

- [ ] 3.1 Draw seats from `seatPositions(s.length)`, colours from the seat's colour field (six colours), hippos at 0.68 scale for N ≥ 5, and find the own seat by id. Verify the race, touch and reconnect e2e specs pass
- [ ] 3.2 Rebuild the seat cards and the lobby crew list for N, and shrink cards below 640 px for N ≥ 5. Verify with an e2e that six seated players see six cards inside a 390 px viewport
- [ ] 3.3 Send the owner screenshots of 2, 4 and 6 aboard. Verify the owner approves the look

## 4. Docs

- [ ] 4.1 Update AGENTS.md (seat model, thrust scaling, six colours) and the README. Verify no text still says four seats

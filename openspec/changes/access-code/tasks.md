# Tasks

## 1. Server admission

- [x] 1.1 Read `IPPO_ACCESS_CODE` at startup, and add a `codeMatches(k)` that compares SHA-256 digests with `crypto.timingSafeEqual` and returns true when no code is set. Verify with a `node -e` check covering an unset code, the right code, a wrong code and a different-length code
- [x] 1.2 Restructure the upgrade handler. Path and room-id failures still `destroy()`. Code, `server-full` and `room-full` refusals go through `handleUpgrade`, send `{t:'denied', reason}` and close with 4001, 4003 or 4002. Create the room only after all checks pass. Verify with `npx wscat` (or a `ws` one-liner): a wrong code gets the frame and close code 4001, and `/stats` shows no new room
- [x] 1.3 Document `IPPO_ACCESS_CODE` and the refusal reasons in the README's environment section. Verify the README lists every variable the server reads

## 2. Client

- [ ] 2.1 Read `k` from the page URL and append `&k=` to the WebSocket URL when present. Verify in devtools that the socket URL carries `k`, and that a URL without `room` keeps `k` after the name is generated
- [ ] 2.2 Handle `denied`: stop the reconnect loop, hide the splash and HUD, and show the denied card with the reason's copy and "Riprova". Also stop on close codes 4001–4003 without a frame. Verify each reason by hand: wrong code, `MAX_ROOMS=0`, and a room filled with 12 tabs. No further sockets may open (devtools Network, WS filter)
- [ ] 2.3 Add the denied card markup and styles, following the existing card style and copy rules. Verify at 390×844 and 1280×800 that the card is centred and readable

## 3. Release

- [ ] 3.1 Commit as `feat: require an access code when IPPO_ACCESS_CODE is set` and merge the resulting release PR. Verify the new image tag exists on GHCR

# Tasks

## 1. Assets

- [x] 1.1 Copy the 12 chosen clips to `public/sounds/fart-01.mp3` … `fart-12.mp3` and the 5 vestito clips to `vestito-01.mp3` … `vestito-05.mp3`, and write `CREDITS.md` with each file's Freesound id, title, author and CC0 licence link. Verify `du -ch public/sounds/*.mp3` stays under 500 KB and every file is listed

## 2. Server

- [x] 2.1 Load `public/sounds/*.mp3` into memory at startup and serve it at `/sounds/<name>` as `audio/mpeg`. Verify with `curl -sI /sounds/fart-01.mp3` shows 200 and `audio/mpeg`, and `/sounds/../server/index.js` is 404

## 3. Client

- [ ] 3.1 Add the unlock (capture listener, audio session, silent loop) and decode all clips into buffers once unlocked. Verify in the browser that after one click `AudioContext.state` is `running` and 17 buffers are decoded
- [ ] 3.2 Replace `startFart`/`stopFart` with chained random clips per seat (`SEAT_RATE` × random variation, 60 ms fade on stop), keeping `updateVoices` as the driver and mute on the master gain. Verify with an e2e that a pushing seat fetches sounds with no console errors, and by hand that two pushes sound different
- [ ] 3.3 Keep every other sound synthesized and unchanged. Verify by ear: countdown, checkpoint, chomp, thud and finish all still play

## 4. Docs and release

- [ ] 4.1 Update the README (sounds, credits) and AGENTS.md (where sounds live, the bundled-audio rule). Verify both mention `CREDITS.md`
- [ ] 4.2 Have the owner play one race on a phone with the mute switch on. Verify that every push is audible

# Design

## Context

- The current voice is `startFart`/`stopFart` in `public/client.js`, driven by `updateVoices(m)` on each snapshot from the seat's `farting` flag.
- The server's static loader reads only top-level `public/` files of three types.
- The test page that settled the choice showed two things:
  - iOS unlocks Web Audio only on `touchend`/`click`;
  - iOS mutes Web Audio behind the mute switch unless the page asks for the playback audio session.

See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Real fart sounds, never the same twice, each seat recognisable.
- Sound that works on phones.

**Non-Goals:**
- Recordings for other sounds.
- Positional audio, or volume tied to gas.

## Decisions

**Clips.** The owner's picks from the test page become the clips below, already cut, faded and normalized (`loudnorm I=-18`, mono, 96 kbps):

| Kind | Files | Count | Durations |
|---|---|---|---|
| Fart | `public/sounds/fart-01.mp3` … `fart-12.mp3` | 12 | 0.21–1.69 s |
| Vestito | `public/sounds/vestito-01.mp3` … `vestito-05.mp3` | 5 | (for `peto-vestito`) |

The mapping to Freesound clips goes into `CREDITS.md`.

**Decode once, play from buffers.** When audio unlocks, the client fetches and decodes all 17 into `AudioBuffer`s. Playing from a buffer can start at an exact time, so chained clips butt together without gaps, which an `<audio>` element cannot do.

**Variation.** Each clip in a push takes `playbackRate = SEAT_RATE[seat] × (0.88 … 1.12)`, which moves pitch and speed together. `SEAT_RATE = [1.0, 1.15, 0.88, 1.3]` keeps the four seats apart, in the same order as the old `FART_BASE` pitches.

**Chaining.** While `farting` is set, the voice schedules the next random clip 30 ms before the current one ends, on a per-seat gain bus. Stop ramps the bus to 0 over 60 ms and stops the scheduled sources. The audition page's "Spingi" used the same logic, and the owner approved how it sounds.

**Unlock.**
- A capture listener on `touchend`, `click` and `keydown` creates or resumes the context and plays a 1-sample silent buffer.
- `navigator.audioSession.type = 'playback'` is set when available (Safari 17+).
- For older iOS, a looping silent WAV in an `<audio>` element, created from a Blob, moves the page into the playback category.

The game's existing `initAudio()` on boarding stays, and boarding is itself a click.

**Server.** The static loader also reads `public/sounds/*.mp3` and serves it at `/sounds/<name>` as `audio/mpeg`. The files stay in memory like the rest, so the read-only root filesystem still holds.

## Risks / Trade-offs

- [Some clips are 0.2 s, so a long push becomes a rapid string of farts] → That is what the owner heard and approved on the test page. Revisit only if it grates in play.
- [iOS behaviour differs between versions] → Two independent mechanisms (audio session and silent-loop element). Verified by the owner on a real phone, since headless browsers cannot emulate the mute switch.
- [Decode on unlock costs a moment] → 17 short clips decode in well under a second. A push before decoding finishes is silent rather than late.

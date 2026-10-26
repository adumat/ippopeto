# AGENTS.md

Guide for agents working on Ippopeto. Read it before changing anything.

## What this is

A cooperative browser party game, built to play with colleagues on a call. 2–6 players push one shared raft upstream by turning their hippo's rear and pushing with gas. The fun is in coordinating.

- Repo `github.com/adumat/ippopeto` (public), image `ghcr.io/adumat/ippopeto`.
- Deployed by the owner from their homelab GitOps repo (`kubernetes/apps/services/ippopeto` there). This repo holds no deployment manifests, and you do not deploy.
- The home uplink is about 8 Mbit/s, so bandwidth is a real constraint.

## Where the truth lives

Behaviour is specified with OpenSpec in [`openspec/`](openspec/). Read [`openspec/config.yaml`](openspec/config.yaml) first.

- `openspec/specs/product/`: what players experience, including rules, game logic and tuning constants. A product requirement is checkable by playing.
- `openspec/specs/tech/`: architecture, wire protocol, runtime limits, netcode, delivery.
- `openspec/changes/`: planned work, each with proposal, design, delta specs and tasks. Implement with the OpenSpec apply workflow, ticking tasks as you go.

When code and spec disagree, find out which one is wrong. Do not silently follow either.

## Hard constraints

- **No framework, no build step.** The client is vanilla JS on a 2D canvas. The server is plain Node 22 with `ws` pinned to an exact version as its only runtime dependency. A new runtime dependency needs the owner's approval.
- **`public/track.js` is shared** by server (`require`) and browser (`window.Track`) through a minimal UMD wrapper. Geometry and moving obstacles must stay deterministic functions of room time, identical on both sides.
- **Authoritative server.** Clients send input only. State lives in memory: one replica, `Recreate`. No Redis or database without asking.
- **Bandwidth.** About 7 KB/s per client. A change to snapshot content or rate states its cost in bytes per second.
- **Course rule.** Every solid obstacle leaves a gap of at least 164 px (raft diameter + 20) on one side. Re-verify after any course edit.

## Seats and screens

- The raft has 2–6 seats: as many as people sitting, never fewer than 2. `Track.seatPositions(n)` places them evenly around the edge, symmetric about the bow, identically on server and client; the snapshot carries only the count. The list compacts outside a race and is frozen during one, so seat indices shift: find a player by id, never by index.
- Thrust per hippo is `520 × √(4/N)`: total thrust grows with the square root of the crew, so 4 behave exactly as the original tuning.
- A seat is free (`null`), taken, or **away**: its tab disconnected and has `IPPO_RESERVE_MS` (15 s) to come back. The seat is matched by a per-tab session token in sessionStorage, so a reload reclaims it too. An away hippo neither pushes nor counts for the sync bonus.
- New seats are never given out during `countdown` or `running`. Spectators sit with "Siediti" between races.
- Only a tab that was seated rejoins on reconnect.
- The client shows exactly one of `splash | lobby | race | results`, switched only by `setView()`. Add new screens there, not with ad-hoc `hidden` toggles.

## Design rules

The look is settled; do not redesign it.

- Tokens: ink `#1f2b2e`, water `#3fa7b8`, grass `#7fa347`, sand `#efdda8`, wood `#9c6b3d`, gas `#c6dc5a`, paper `#fff8e1`.
- Player colours, in the order they are handed out: `#ff9f1c`, `#e0479e`, `#ffd23f`, `#7b5cff`, `#ef4b3f`, `#8fd3ff`. A colour belongs to the person, not to a seat.
- Bagel Fat One for titles and numbers, Atkinson Hyperlegible for text.
- "Sticker" cards (3 px ink border, solid offset shadow) and pill buttons. The gas-trail title is the only bold element.

UI copy is Italian:
- simple sentences in the active voice, sentence case;
- no all-caps labels, no middle-dot separators, no arrows in buttons;
- typographic apostrophe (’).

## Conventions

- Code comments, docs and specs in English. UI copy in Italian.
- Conventional commits in English (`feat:`, `fix:`, `docs:`, `chore:`…): release-please derives versions and the changelog from them. One commit, one semantic change.
- Choices about game tuning, new features or infrastructure go to the owner first.

## Running locally

```sh
npm ci
npm start              # http://localhost:8080/?room=test
```

Several tabs in the same room are several players. `PORT` and `MAX_ROOMS` are read from the environment.

⚠️ When starting the server in the background from a script, save its PID and kill that PID. `pkill -f "server/index.js"` also matches the shell that launched it.

## Testing

```sh
npm test               # unit: course gaps, centre line, 2/4/6-bot difficulty, seats, teleport
npx playwright install chromium   # once
npm run e2e            # browsers: full race to the results card, access code, touch
```

- Unit tests use `node --test` and need no dependencies. `test/helpers/bot.js` is the reference crew the ~120 s difficulty target was tuned against: do not change its steering.
- `npm run e2e` starts its own server on port 8787 with `IPPO_DEBUG=1` and `IPPO_ACCESS_CODE=test`. Stop anything already on that port first.
- To reach the finish, a test seats a Node WebSocket bot (`test/helpers/wsbot.js`) in the room. The bot starts the race and sends debug teleports, so the browser client carries no test hooks. Snapshots are read in the browser with Playwright's `page.on('websocket')`.
- Wait on game state (snapshot `st`, events), never on fixed sleeps, except to prove that something does *not* happen.
- CI (`.github/workflows/ci.yml`) runs both suites on every push and pull request, and keeps traces as artifacts on failure.

## Releasing

Push conventional commits to `main`. release-please keeps a release PR open. Merging it tags `vX.Y.Z` and pushes the image tagged `X.Y.Z` and `latest` for amd64 and arm64. The owner then bumps the tag in the homelab.

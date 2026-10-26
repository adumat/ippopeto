# Ippopeto 🦛💨

A cooperative browser party game for 1–4 players, plus spectators. One raft, four hippos, a river to climb against the current. Each player is a hippo in one corner of the raft: turn your rear and push with gas. Push alone and the raft spins; push together and it goes straight, and with everyone in sync the thrust grows by 35%.

The game is in Italian.

## Playing

- Everyone opens the same link (`/?room=<name>`). Without `room`, a random one is generated.
- `A`/`D` or the arrow keys turn your rear. `Space` (or `W`/`↑`) pushes while you have gas. `M` toggles audio.
- On phones, on-screen buttons appear.
- Rocks and barrels bounce you, whirlpools drag you around, crocodiles send you back to the last checkpoint.
- Four checkpoints; each room keeps its five best times for as long as it exists (in memory).

## Running locally

```sh
npm ci
npm start   # http://localhost:8080/?room=test
```

Several tabs in the same room are several players.

## Configuration

| Variable | Default | Meaning |
|---|---|---|
| `PORT` | `8080` | HTTP and WebSocket port |
| `MAX_ROOMS` | `50` | Concurrent rooms; bounds bandwidth |
| `IPPO_ACCESS_CODE` | unset | When set, links must carry it as `?k=<code>`; unset means open |
| `IPPO_RESERVE_MS` | `15000` | How long a disconnected player's seat waits for the same tab to come back |
| `IPPO_DEBUG` | unset | `1` lets seated clients teleport the raft. **Tests only: never set it in production**, it lets any player skip to the finish |

Endpoints: `/` (game), `/ws?room=…` (WebSocket), `/healthz`, `/stats` (rooms and connected players).

A refused WebSocket receives `{t:'denied', reason}` and a close code: `code` (4001, wrong or missing access code), `room-full` (4002, 12 people already in the room), `server-full` (4003, `MAX_ROOMS` reached). The browser shows the reason and stops retrying.

## Architecture

- `server/`: Node.js and [`ws`](https://github.com/websockets/ws). The server is authoritative: it simulates at 60 Hz and sends snapshots at 20 Hz. Clients send only their controls.
- `public/`: static canvas client, no build step. `track.js` is shared by server and browser, so geometry and moving obstacles match on both sides.
- State lives in memory only: a restart ends running games, so run exactly one replica.

Each client receives about 7 KB/s, so a full raft of four costs about 0.25 Mbit/s of upload.

## Image

`ghcr.io/adumat/ippopeto`, built for amd64 and arm64 on every release. Releases are cut by [release-please](https://github.com/googleapis/release-please) from conventional commits. The container runs as uid 1000 on port 8080 and works with a read-only root filesystem. When it sits behind a proxy or tunnel with an idle timeout, the server's 20 s WebSocket ping keeps connections open.

## Specs

Behaviour is specified with [OpenSpec](https://github.com/Fission-AI/OpenSpec) in [`openspec/`](openspec/): `specs/product/` for what players experience, `specs/tech/` for how it is built, and `changes/` for work in progress.

# Design

## Context

Today `server/index.js` refuses upgrades with `socket.destroy()` before `handleUpgrade`. A browser cannot read the HTTP status of a failed WebSocket handshake: it sees only a close with code 1006, which is also what a network drop looks like. The client then retries forever. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Keep strangers out with one shared secret, with no friction for invited players.
- Make every deliberate refusal visible and final in the browser.

**Non-Goals:**
- Per-person identity, rate limiting by IP, protecting the static page. Without a socket the page is inert, so gating `/ws` is enough.
- Hiding the code from proxy logs. The owner chose the query string over a URL fragment.

## Decisions

**Accept, explain, close.** A refusal performs `handleUpgrade`, sends one `denied` frame and calls `ws.close(400x)`. Close codes in the 4000–4999 range are reserved for applications, so the client can tell them apart from 1006. A rejected socket is never added to a room, and a room is created only after all checks pass. Otherwise a stranger could fill `MAX_ROOMS` with wrong codes.

Alternative: answer HTTP 401/503 on the upgrade. It is cleaner on the wire, but the browser hides the status, so the client could not show a reason.

**Constant-time comparison over hashes.** `crypto.timingSafeEqual` needs equal lengths. Comparing the SHA-256 digests of both strings gives fixed-length inputs and does not leak the code's length.

**The client keeps `k` as a plain query parameter.**
- It reads `k` from `location.search` alongside `room` and appends it to the WebSocket URL.
- Room-name generation already preserves other parameters, because it calls `params.set`.
- "Copia il link" already copies `location.href`.

None of the three needs further changes.

**A denied card instead of the splash.** It is a new `card` section in `index.html`, with the reason text and a "Riprova" button that calls `location.reload()`. Copy follows the project rules. On `denied` the client sets a flag that disables the reconnect timer. The `conn` banner stays hidden.

**Check order: code, then capacity.** Someone without the code learns nothing about how busy the server is.

## Risks / Trade-offs

- [Code leaks with a forwarded link] → Rotate it in Bitwarden. The ExternalSecret refreshes and Reloader restarts the pod. A restart ends running games, which is acceptable for a party game.
- [Code visible in Cloudflare/Envoy logs] → Accepted. The logs are the owner's own.
- [Old clients retrying 1006 forever against a full server] → Not an issue in practice: client and server ship in the same image and the page is served `no-cache`.

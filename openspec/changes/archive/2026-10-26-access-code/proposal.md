# Proposal

## Why

The game is going on the public internet so colleagues can join from home, but the home uplink is about 8 Mbit/s and the colleagues have no accounts in the homelab's identity provider. A shared access code keeps strangers out without asking anyone to log in. Today every refused connection looks like a network error, and the client retries forever. That would make a wrong code indistinguishable from an outage.

## What Changes

- New optional server setting `IPPO_ACCESS_CODE`. When set, a WebSocket connection SHALL carry the matching code. When unset, the game stays open, as today.
- The code travels in the page link as `?k=<code>`. The client forwards it to `/ws`, and "Copia il link" therefore shares it.
- Refused connections are explained instead of silently destroyed: the server completes the upgrade, sends `{t:'denied', reason}` and closes. Reasons: wrong code, room full, too many rooms.
- The client stops retrying on `denied` and shows a card with the reason and a "Riprova" button.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `product/rooms-and-crew`: joining requires the access code when one is configured; refusals are explained to the player.
- `tech/server-runtime`: admission refusals become explicit, and the access code is checked at admission.
- `tech/protocol`: new `denied` message and close codes.
- `tech/client-netcode`: reconnection stops on `denied`.

## Impact

- Code: `server/index.js` (admission), `public/client.js` (code forwarding, denied handling), `public/index.html` and `public/style.css` (denied card).
- Deployment: the homelab change `deploy-ippopeto` provides `IPPO_ACCESS_CODE` from Bitwarden and sets `MAX_ROOMS`.
- Privacy trade-off accepted by the owner: the code appears in the URL, so in Cloudflare and Envoy access logs.

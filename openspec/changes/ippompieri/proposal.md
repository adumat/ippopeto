# Proposal

## Why

The owner wants a room-wide "Ippompieri" mode: a fake family-friendly reboot of the game that mocks Hollywood's politically correct remakes and ends up more vulgar than the original. Farts become firefighters' hoses, and every line becomes a double entendre. The copy was chosen line by line with the owner in the workbook artifact (db docs `progetto/remake`, `remake2`, `remake3`).

## What Changes

- A room-wide switch next to the map selector turns the mode on or off. It follows the same rules as the map: any seated player can flip it between races, and everyone sees the change at once.
- With the mode on, the game is restyled:
  - **Look:** hippos wear firefighter helmets and push with a white hose jet; a "VM18 consensuale" sticker sits in a corner during the race.
  - **Copy:** new title, notice, buttons, toasts, results and send-back causes. The map names stay as they are.
  - **Sounds:** a hose jet instead of the fart recordings, plus a few voice lines.
- A shirtless fire captain in braces stands on the raft. At every checkpoint he sprays wildly for a few seconds and jostles the raft.
- The peto vestito becomes white foam splats instead of brown ones.

## Capabilities

### New Capabilities

- `product/ippompieri`: the switch, the notice, the restyled look, copy and sounds, and the fire captain.

### Modified Capabilities

- `tech/protocol`: a message to set the mode, the mode in the snapshot, and an event for the captain's spray.

## Impact

- **Client:** `public/client.js` and `public/index.html` get a two-variant copy table. The `public/draw/*` painters draw helmets, the jet and the captain. `public/style.css` gets the sticker.
- **Maps:** `public/maps/*.js` gain optional mode-specific causes and hints.
- **Server:** `server/game.js` holds the mode and applies the captain's jostle. `server/index.js` handles the new message.
- **Assets:** new sounds under `public/sounds/`.

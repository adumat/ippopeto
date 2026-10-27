# Proposal

## Why

The game has one river, and after a few evenings the crew knows it by heart. Five new maps are designed: Fogne, Fiordo ghiacciato, Fiume di lava, Grotta buia and Strada delle stelle. They need a common base first: a way to choose a map, course data that is no longer hard-wired, and best times that do not mix different maps.

## What Changes

- A room has a current map. Any seated player picks it in the lobby or on the results card; the last choice wins. New rooms start on "Fiume".
- Today's river becomes the map "Fiume", unchanged.
- Each map is a data file: course shape, widths, a surface type per stretch (water, ice, snow, lava, void), obstacles, and the vehicle the crew sits on. Reusable rules (jets, ice, jumps…) are switched on per map.
- A map can be generated: a new layout from a seed at every start, the same for everyone in the room. Only the Grotta will use this.
- Best times are kept per map.
- The course checks and the bot crews of 2, 4 and 6 run on every map.
- The five maps themselves come in their own changes: `map-fogne`, `map-fiordo`, `map-lava`, `map-grotta`, `map-stelle`.

## Capabilities

### New Capabilities

- `product/maps`: the map list, choosing a map, fixed and generated layouts, surfaces, vehicles.

### Modified Capabilities

- `product/river-course`: the river is the "Fiume" map, one of several.
- `product/race-and-results`: best times per map; the results name the map.
- `product/rooms-and-crew`: the lobby shows the map and its selector.
- `tech/architecture`: course definitions become per-map modules built by a shared engine.
- `tech/protocol`: a map-choice message; snapshots carry the map and the seed.
- `tech/verification`: course and difficulty checks run on every map.
- `tech/server-runtime`: static files are served from subfolders too, and PNG thumbnails.

## Impact

- Code: `public/track.js` becomes a course builder; new `public/maps/`; `server/game.js` (current map, per-map best times, surface hook); `server/index.js` (map message); `public/client.js`, `public/index.html`, `public/style.css` (selector, thumbnails, rebuild on change).
- Tests: existing course and difficulty tests become per-map loops; one e2e for choosing a map.
- Bandwidth: two short fields per snapshot.

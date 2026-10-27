# Spec Delta

## MODIFIED Requirements

### Requirement: HTTP endpoints

The server SHALL listen on `PORT` (default 8080) and serve:
- `/` and every `.html`, `.js`, `.css`, `.mp3` and `.png` file under `public/`, subfolders included (map modules, map painters, thumbnails, sounds), with the matching content type, all loaded into memory at startup, with `cache-control: no-cache` and `nosniff`;
- `/healthz`, answering `ok`;
- `/stats`, answering `{rooms, players}`.

Anything else, and any non-GET for a static file, SHALL be 404. No file SHALL be read from disk after startup, so the root filesystem can be read-only.

#### Scenario: Probe
- **WHEN** Kubernetes probes `/healthz`
- **THEN** it gets 200 `ok`

#### Scenario: A sound
- **WHEN** the client requests `/sounds/fart-01.mp3`
- **THEN** it gets 200 with `content-type: audio/mpeg`

#### Scenario: A map module
- **WHEN** the client requests `/maps/fiume.js` and `/maps/thumbs/fiume.png`
- **THEN** it gets 200 with `text/javascript` and `image/png`

# server-runtime

## Purpose

The Node process around the game: HTTP endpoints, connection admission and limits, keep-alive, cleanup, backpressure and shutdown.

## Requirements

### Requirement: HTTP endpoints

The server SHALL listen on `PORT` (default 8080) and serve:
- `/` and the files in `public/`, loaded into memory at startup, with `cache-control: no-cache` and `nosniff`;
- `/healthz`, answering `ok`;
- `/stats`, answering `{rooms, players}`.

Anything else, and any non-GET for a static file, SHALL be 404. No file SHALL be read from disk after startup, so the root filesystem can be read-only.

#### Scenario: Probe
- **WHEN** Kubernetes probes `/healthz`
- **THEN** it gets 200 `ok`

### Requirement: Admission limits

A WebSocket upgrade with a path other than `/ws`, or with a room id that is empty after normalisation, SHALL be refused by destroying the socket. Every other refusal SHALL complete the upgrade, send a `denied` message and close the socket. A refused connection SHALL NOT create a room and SHALL NOT count as a client.

#### Scenario: Wrong code for a new room
- **WHEN** someone with a wrong code opens a room that does not exist
- **THEN** they receive `denied` with reason `code`, and `/stats` still shows the same number of rooms

### Requirement: Refusal order

Admission SHALL check, in this order, and refuse with the first reason that applies:
- the access code is configured and the `k` parameter does not match it (`code`);
- the room would be new and `MAX_ROOMS` (default 50) already exist (`server-full`);
- the room already has 12 clients (`room-full`).

#### Scenario: Room cap reached
- **WHEN** 50 rooms exist and someone with a valid code opens a 51st
- **THEN** they receive `denied` with reason `server-full`, and no room is created

### Requirement: Keep-alive

The server SHALL ping every socket every 20 s and terminate any socket that did not answer the previous ping. This SHALL keep connections alive through proxies and tunnels that cut idle connections, such as Cloudflare Tunnel at 100 s.

#### Scenario: Dead client
- **WHEN** a laptop sleeps without closing its socket
- **THEN** within 40 s the server drops it and frees its seat

### Requirement: Room cleanup

Every 30 s the server SHALL delete rooms that have been empty for more than 120 s. Empty rooms SHALL NOT be simulated.

#### Scenario: Abandoned room
- **WHEN** a room has been empty for 3 minutes
- **THEN** it no longer counts in `/stats`

### Requirement: Backpressure

A snapshot SHALL be skipped for a client whose socket buffer already holds more than 256 KiB, so one slow client cannot grow server memory.

#### Scenario: Client on a bad link
- **WHEN** a client cannot keep up with 20 Hz
- **THEN** it misses snapshots instead of receiving them late

### Requirement: Graceful shutdown

On SIGTERM or SIGINT the server SHALL close every socket with code 1001 and "server in riavvio", stop listening, and exit within 3 s.

#### Scenario: Rollout
- **WHEN** the pod is replaced
- **THEN** clients see a clean close and start reconnecting

### Requirement: Access code check

The access code SHALL come from the `IPPO_ACCESS_CODE` environment variable. An empty or unset variable SHALL disable the check. The comparison SHALL take the same time whatever the input, and the server SHALL NOT log the configured code or the submitted one.

#### Scenario: Code disabled
- **WHEN** `IPPO_ACCESS_CODE` is unset
- **THEN** connections without `k` are admitted

#### Scenario: Guessing by timing
- **WHEN** an attacker submits codes sharing longer and longer prefixes with the real one
- **THEN** the response time does not depend on the shared prefix

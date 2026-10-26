# delivery

## Purpose

How the game is packaged and shipped: the container image, its build pipeline, and the bandwidth budget that bounds every deployment.

## Requirements

### Requirement: Container image

The image SHALL be built in two stages on `node:22-alpine`, with production dependencies only. It SHALL run as uid 1000 on port 8080 and work with a read-only root filesystem.

#### Scenario: Hardened pod
- **WHEN** the container runs non-root with `readOnlyRootFilesystem: true`
- **THEN** it starts and serves the game

### Requirement: Image pipeline

GitHub Actions SHALL build `ghcr.io/adumat/ippopeto` for amd64 and arm64:
- on every push to `main`, tagged `sha-<short>` and `latest`;
- on every `v*` tag, also tagged with the semver version.

#### Scenario: Release tag
- **WHEN** `v0.2.0` is pushed
- **THEN** `ghcr.io/adumat/ippopeto:0.2.0` exists for both architectures

### Requirement: Bandwidth budget

Each client SHALL receive about 7 KB/s, so a full raft of four costs about 0.25 Mbit/s of upload. Changes to snapshot content or rate SHALL keep this order of magnitude, because the home uplink is about 8 Mbit/s. Deployment limits (`MAX_ROOMS`, clients per room) SHALL keep the worst case under that uplink.

#### Scenario: New snapshot field
- **WHEN** a change adds a per-seat field to the snapshot
- **THEN** its design states the added bytes per second

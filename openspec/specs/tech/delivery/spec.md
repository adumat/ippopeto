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

GitHub Actions SHALL build `ghcr.io/adumat/ippopeto` for amd64 and arm64 only when a release is created. Releases SHALL be managed by release-please from conventional commits on `main`: merging its release PR SHALL create the tag `vX.Y.Z` and push the image tagged `X.Y.Z` and `latest`. Pushes to `main` that do not create a release SHALL NOT push an image.

#### Scenario: Release tag
- **WHEN** the release PR for `0.2.0` is merged
- **THEN** the tag `v0.2.0` exists and `ghcr.io/adumat/ippopeto:0.2.0` exists for both architectures

#### Scenario: Ordinary push
- **WHEN** a `fix:` commit is pushed to `main`
- **THEN** release-please updates its release PR and no image is pushed

### Requirement: Bandwidth budget

Each client SHALL receive about 7 KB/s, so a full raft of four costs about 0.25 Mbit/s of upload. Changes to snapshot content or rate SHALL keep this order of magnitude, because the home uplink is about 8 Mbit/s. Deployment limits (`MAX_ROOMS`, clients per room) SHALL keep the worst case under that uplink.

#### Scenario: New snapshot field
- **WHEN** a change adds a per-seat field to the snapshot
- **THEN** its design states the added bytes per second

### Requirement: Public image

The image SHALL be pullable without credentials, so a cluster needs no pull secret.

#### Scenario: Anonymous pull
- **WHEN** `docker pull ghcr.io/adumat/ippopeto:<version>` runs without login
- **THEN** the pull succeeds

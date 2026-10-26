# Spec Delta

## MODIFIED Requirements

### Requirement: Image pipeline

GitHub Actions SHALL build `ghcr.io/adumat/ippopeto` for amd64 and arm64 only when a release is created. Releases SHALL be managed by release-please from conventional commits on `main`: merging its release PR SHALL create the tag `vX.Y.Z` and push the image tagged `X.Y.Z` and `latest`. Pushes to `main` that do not create a release SHALL NOT push an image.

#### Scenario: Release tag
- **WHEN** the release PR for `0.2.0` is merged
- **THEN** the tag `v0.2.0` exists and `ghcr.io/adumat/ippopeto:0.2.0` exists for both architectures

#### Scenario: Ordinary push
- **WHEN** a `fix:` commit is pushed to `main`
- **THEN** release-please updates its release PR and no image is pushed

## ADDED Requirements

### Requirement: Public image

The image SHALL be pullable without credentials, so a cluster needs no pull secret.

#### Scenario: Anonymous pull
- **WHEN** `docker pull ghcr.io/adumat/ippopeto:<version>` runs without login
- **THEN** the pull succeeds

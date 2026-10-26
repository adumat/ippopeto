# Proposal

## Why

The game exists only as a local repository handed over from a chat, under a name the owner dislikes, with Kubernetes manifests that do not fit the homelab that will run it. It needs a public home, a release flow that produces pinnable image versions, and repo docs an agent can follow, before any feature work starts.

## What Changes

- Rename the project from "Gas Comune" to **Ippopeto** everywhere: package name, page title, splash title, log line, README, localStorage keys (`gc-*` → `ippo-*`).
- Publish `github.com/adumat/ippopeto` as a public repository; make the GHCR package `ghcr.io/adumat/ippopeto` public.
- Replace the push-to-main image workflow with release-please: conventional commits drive a release PR, and merging it tags `vX.Y.Z` and pushes the image tagged `X.Y.Z` and `latest`.
- **BREAKING**: no more `sha-*` image on every push to `main`; images exist only for releases.
- Remove `k8s/`: the homelab repository becomes the single source of deployment manifests.
- Replace `CLAUDE.md` with `AGENTS.md`, updated to the decisions of this planning round; write docs and code comments in English, keep UI copy Italian.
- Add the repository to the homelab as the submodule `services/ippopeto`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `tech/delivery`: the image pipeline becomes release-driven (release-please, semver tags only).
- `product/look-and-sound`: the game's visible name becomes "Ippopeto".

## Impact

- Files: `package.json`, `public/index.html`, `public/client.js` (storage keys), `server/index.js` (log line), `README.md`, `Dockerfile`, `.github/workflows/*`, new `release-please-config.json` and `.release-please-manifest.json`, `AGENTS.md`; `k8s/` deleted.
- GitHub: new public repo, Actions allowed to open PRs, GHCR package visibility set by hand.
- Homelab: one `.gitmodules` entry and its gitlink; later pointer bumps stay uncommitted, as for peekaboo.
- Players: a name and mute choice saved under the old keys are not carried over (nobody has played yet).

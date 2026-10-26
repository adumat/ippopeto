# Tasks

## 1. Local cleanup

- [x] 1.1 Rename to Ippopeto in `package.json` (name, version `0.0.0`, description), `<title>`, splash `<h1>`, the server log line and the README title. Verify with `grep -rni "gas.comune\|gas comune" --exclude-dir=.git --exclude-dir=openspec .` returning nothing outside `k8s/` and `CLAUDE.md`
- [x] 1.2 Rename localStorage keys `gc-name` and `gc-muted` to `ippo-name` and `ippo-muted` in `public/client.js`. Verify by loading the page, boarding, reloading, and seeing the name prefilled
- [x] 1.3 Translate code comments in `server/`, `public/` and `Dockerfile` to English, without touching UI strings. Verify `npm start` still serves `/healthz` and the page loads with no console errors
- [x] 1.4 Delete `k8s/`. Rewrite the README in English: what the game is, how to play, local run, environment variables, image, and a pointer to `openspec/`. Verify the README mentions no deleted path
- [x] 1.5 Replace `CLAUDE.md` with `AGENTS.md` as described in design.md. Verify no `CLAUDE.md` remains and AGENTS.md links to `openspec/config.yaml`

## 2. Release pipeline

- [x] 2.1 Add `release-please-config.json` (`release-type: node`, `include-component-in-tag: false`) and `.release-please-manifest.json` at `0.0.0`. Verify both parse with `jq . <file>`
- [x] 2.2 Replace `.github/workflows/image.yml` with `release.yml`: a release-please job, then a docker job gated on `release_created`, tagging `type=raw` from `version` plus `latest`, amd64 and arm64. Verify with `actionlint` or a YAML parse
- [x] 2.3 Run the `Dockerfile` dependency stage on `--platform=$BUILDPLATFORM`. Verify `docker buildx build --platform linux/amd64,linux/arm64 .` succeeds locally

## 3. Publish

- [ ] 3.1 Create the public repo `adumat/ippopeto` with `gh repo create`, enable "Allow GitHub Actions to create and approve pull requests", and push `main`. Verify `gh repo view adumat/ippopeto --json visibility` reports `PUBLIC`
- [ ] 3.2 Merge the release-please PR for `0.1.0`. Verify the tag `v0.1.0` exists and the release workflow pushed `ghcr.io/adumat/ippopeto:0.1.0`
- [ ] 3.3 Have the owner set the GHCR package public from its settings page. Verify `docker logout ghcr.io; docker pull ghcr.io/adumat/ippopeto:0.1.0` succeeds
- [ ] 3.4 Run the published image with `--read-only --user 1000:1000`. Verify `/healthz` answers `ok` and `/` serves the page

## 4. Homelab

- [ ] 4.1 In the homelab repo, `git submodule add https://github.com/adumat/ippopeto.git services/ippopeto` and commit `.gitmodules` with the gitlink; later pointer bumps stay uncommitted, as for peekaboo. Verify `git submodule status` lists it

## Workflow follow-up

- Sync the delta specs into `openspec/specs/` and archive the change once `0.1.0` is pullable.

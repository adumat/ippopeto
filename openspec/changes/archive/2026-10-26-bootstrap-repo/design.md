# Design

## Context

The repository has two commits, written in Italian, with an image workflow that pushes on every `main` push. `peekaboo` (`github.com/adumat/peekaboo`) is the owner's existing precedent for a public app consumed by the homelab, and its release setup has already paid for two gotchas. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- A public repo whose releases produce an image the homelab can pin by semver.
- Repo docs that let the next agent work without this conversation.

**Non-Goals:**
- Rewriting history: the two existing commits are pushed as they are.
- Any gameplay change beyond the visible name.
- The homelab deployment itself (homelab change `deploy-ippopeto`).

## Decisions

**Release-please mirrors peekaboo.**
- `release-type: node` with `include-component-in-tag: false`; otherwise tags come out as `ippopeto-v0.1.0` and `docker/metadata-action` cannot parse them.
- The docker job tags the image from the release-please `version` output (`type=raw`), not from `tag_name`.
- The repo setting "Allow GitHub Actions to create and approve pull requests" is required, or release-please cannot open its PR.

Alternative: manual `v*` tags with the existing workflow. It needs no setup, but it produces no changelog and is a different flow from peekaboo's.

**The first release is 0.1.0.** The manifest and `package.json` start at `0.0.0`. The `feat:` rename commit then makes release-please propose `0.1.0`.

**Multi-arch without emulation.** The dependency stage runs on `$BUILDPLATFORM`: `ws` is pure JS, so `node_modules` is arch-independent. Only the final stage is per-arch. Same fix that took peekaboo's build from 6 min to under 1.

**English docs, Italian UI.** README, AGENTS.md, specs and code comments are in English, consistent with the owner's other public repos. UI copy stays Italian. Commit messages are conventional and in English.

**`k8s/` is deleted, not kept as an example.** Two sets of manifests drift apart. The homelab's app-template values become the reference. The README points to the Dockerfile and the environment variables.

**AGENTS.md replaces CLAUDE.md.** It is rewritten as a standing guide, not a handover note:
- constraints (stack, determinism of `track.js`, single replica, bandwidth budget);
- the design rules (tokens, copy rules);
- the OpenSpec layout and the product/tech split;
- how to run and test locally;
- the `pkill -f` trap.

The handover's to-do list does not carry over, because the OpenSpec changes now hold it.

## Risks / Trade-offs

- [GHCR package created private by the first push] → Set it public by hand right after the first release. A personal package has no API for visibility.
- [release-please PR never appears] → Check the Actions PR permission first; it is the known cause.
- [Translating comments changes many lines in one commit] → Keep it a separate `docs:`/`chore:` commit from the rename, so each diff stays reviewable.

## Migration Plan

1. Rename, translate, delete `k8s/`, write AGENTS.md and release config locally, in separate commits.
2. Create the public repo, set the Actions permission, push.
3. Merge the release PR, which produces `v0.1.0` and the image. Set the package public. Verify an anonymous pull.
4. Add the homelab submodule.

Rollback: the repo can be deleted and recreated; nothing consumes it until `deploy-ippopeto`.

---
name: gitflow-pipeline
description: "Blueprint to build the Git Flow release esteira (CI + auto-PR + release promote + publish) with GitHub Actions, as implemented in this repository. Use when setting up .github/workflows for a new repo, when asked to 'build the gitflow pipeline', 'replicate the release automation', 'automate PRs', or when a workflow push is not triggering the next workflow. Covers the event chain, semver derivation from conventional commits, idempotent auto-PR, tags, npm publish, and the GITHUB_TOKEN recursive-trigger pitfall."
---

# Git Flow Pipeline — Building the Esteira

## When to Use

- **Bootstrapping** a new repository that needs CI + automated PRs + release/publish.
- Any time the task is *"replicate the gitflow esteira of aiwf"* or *"set up release automation like aiwf"*.
- **Debugging** when a workflow push is not triggering the next workflow (see critical pitfalls).

This is the *build* recipe. For the *usage* rules (branch naming, PR etiquette) see the `git-flow` skill.

## Architecture — the Event Chain

The pipeline is **event-driven**: each workflow is triggered by a push/PR to a specific branch, and the merge moves the flow forward. Nothing runs on a schedule; every step is a side effect of the previous one.

```mermaid
flowchart LR
    subgraph agent
      F[feature/<ctx>] -- push --> fp
    end
    fp[Auto PR feature→develop] -. opens PR .-> dev[develop]
    dev -- push/merge --> ci1[CI develop]
    dev -- push --> prom[promote develop→release]
    prom -- creates rls[release/vX.Y.Z] + tag vX.Y.Z --> r2m[PR release→main]
    r2m -. opens PR .-> main
    main -- merge --> ci2[CI main]
    tag vX.Y.Z -- push --> pub[(npm publish)]
    r2m -. opens PR to main .-> ci2
```

Files (all under `.github/workflows/`):

| File | Trigger (`on`) | Creates |
|---|---|---|
| `ci-develop.yml` | PR + push to `develop` | typecheck/test/build + smoke |
| `ci-main.yml` | PR + push to `main` | typecheck/test/build + smoke |
| `create-pr-feature-to-develop.yml` | push to `feature/**` | auto PR `feature/` → `develop` |
| `promote-develop-to-release.yml` | push to `develop` | `release/vX.Y.Z`, tag `vX.Y.Z`, PR → `main` |
| `create-pr-release-to-main.yml` | push to `release/**` | (re)creates PR `release/` → `main` |
| `publish.yml` | push tag `v*` | npm publish (+ any artifact release) |

## Step-by-Step Build Recipe

### 0. Branch protection (repository settings)

- Protect `develop` and `main` (require PR + one approving review + status checks). Allow repo admins/PRs only.
- Do **not** protect `feature/**` or `release/**` — the pipeline must be able to create/push them.

### 1. CI for `develop` and `main`

Duplicate the same job, one per protected branch. Install deps, then run the repo's gates.

```yaml
on:
  pull_request:
    branches: [develop]
  push:
    branches: [develop]
concurrency:
  group: ci-develop-${{ github.ref }}
  cancel-in-progress: true
jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
      # + a real smoke test of the produced artifact
```

Use `cache: npm` for speed and a `concurrency` group so stale runs cancel.

### 2. Auto PR `feature/` → `develop`

On every push to a feature branch, open (or update) a PR to `develop`. **Idempotent**: if a PR already exists for the head branch, edit it instead of creating duplicates.

```yaml
on:
  push:
    branches: ['feature/**']
jobs:
  create-pr:
    runs-on: ubuntu-latest
    permissions: { pull-requests: write }
    steps:
      - uses: actions/checkout@v4
      - env: { GH_TOKEN: ${{ secrets.GITHUB_TOKEN }} }
        run: |
          BASE="develop"; HEAD="${{ github.ref_name }}"
          gh api repos/${{ github.repository }}/branches/$BASE --jq '.name' &>/dev/null || exit 0
          PR=$(gh pr list --head "$HEAD" --base "$BASE" --state open --json number --jq '.[0].number // empty')
          if [ -n "$PR" ]; then gh pr edit "$PR" --title "feat: ${HEAD#feature/}"
          else gh pr create --base "$BASE" --head "$HEAD" \
            --title "feat: ${HEAD#feature/}" --body "Auto-generated PR"; fi
```

Guard: skip when `develop` doesn't exist yet (fresh repo).

### 3. Promote `develop` → release (version + tag + PR to main)

The heart of the esteira. On push to `develop`:
1. **Derive next semver** from conventional commits since the last tag (`git tag --list 'v*' --sort=-v:refname`).
2. Create `release/vX.Y.Z` **from `main` (not from develop)**, then merge `develop` into it.
3. Bump `package.json` and commit, tag `vX.Y.Z`, push branch **and** tag.
4. **Open the PR `release/` → `main` itself** (see pitfall #1).

```yaml
on:
  push:
    branches: [develop]
concurrency:
  group: promote-develop-to-release
  cancel-in-progress: true
jobs:
  promote:
    runs-on: ubuntu-latest
    permissions: { contents: write, pull-requests: write }
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0, fetch-tags: true }
      # ... version derivation (see below) -> steps.version.outputs.tag ...
      - env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          TAG="${{ steps.version.outputs.tag }}"; RLS="release/$TAG"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git config user.name "github-actions[bot]"
          # guard: skip if main missing or develop not ahead of main
          gh api repos/${{ github.repository }}/branches/main --jq '.name' &>/dev/null || exit 0
          AHEAD=$(gh api repos/${{ github.repository }}/compare/main...develop --jq '.ahead_by' || echo 0)
          [ "$AHEAD" -eq 0 ] && echo "Nothing to release." && exit 0
          git fetch origin main develop
          git checkout -b "$RLS" origin/main
          if git merge origin/develop -m "chore: merge develop into $RLS"; then
            : # clean merge
          else
            git merge --abort
            git reset --hard origin/develop   # adopt develop's tree wholesale
          fi
          npm version "$TAG" --no-git-tag-version --allow-same-version
          git add package.json && git commit -m "chore: bump version to $TAG"
          git tag "$TAG"
          git push origin "$RLS" "$TAG"
          gh pr create --repo ${{ github.repository }} --base main --head "$RLS" \
            --title "Release $TAG" --body "Automated promote: develop → main (tag $TAG)." \
            || gh pr edit $(gh pr list --head "$RLS" --base main --state open --json number -q '.[0].number') \
                 --title "Release $TAG"
```

### 4. PR `release/` → `main` (open or recreate)

Backup/recovery path for when the release branch is pushed out-of-band (not via the promote job, which already opens its own PR). Keep it idempotent — close before recreating.

```yaml
on:
  push:
    branches: ['release/**']
jobs:
  open-pr:
    runs-on: ubuntu-latest
    permissions: { pull-requests: write }
    steps:
      - run: TAG="${GITHUB_REF_NAME#release/}"  # -> echo "tag=v$TAG"
      - env: { GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}, GH_TOKEN: ${{ secrets.GITHUB_TOKEN }} }
        run: |
          HEAD="$GITHUB_REF_NAME"; TAG=v${HEAD#release/}
          AHEAD=$(gh api repos/${{ github.repository }}/compare/main...$HEAD --jq '.ahead_by' || echo 0)
          [ "$AHEAD" -eq 0 ] && exit 0
          PR=$(gh pr list --head "$HEAD" --base main --state open --json number --jq '.[0].number // empty')
          [ -n "$PR" ] && gh pr close "$PR"
          gh pr create --base main --head "$HEAD" --title "chore: release $TAG → main" \
            --body "Release PR: $HEAD → main. Version: $TAG"
```

### 5. Publish on tag

`on: push: tags: ['v*']`. Runs the artifact build and publishes. For npm:

```yaml
on:
  push:
    tags: ['v*']
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, registry-url: https://registry.npmjs.org }
      - run: npm ci && npm run build
      - run: npm publish --access public
        env: { NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }} }
```

## Version Derivation (conventional commits)

Look at commit messages between the latest tag and HEAD; the highest signal wins:

| Commit message contains | Increment |
|---|---|
| `BREAKING CHANGE` or `!:` | major |
| `feat:` / `feat(scope):` | minor |
| anything else | patch |

```bash
LATEST=$(git tag --list 'v*' --sort=-v:refname | head -1)
# no tag -> v0.1.0; else parse MAJOR.MINOR.PATCH, apply increment, echo v$MAJOR.$MINOR.$PATCH
```

Read tags correctly: `git tag --list 'v*' --sort=-v:refname` (semver-aware) — not `git describe`.

## Critical Pitfalls (learned the hard way)

1. **`on: push` does NOT fire for pushes made with `GITHUB_TOKEN`.** A workflow that pushes `release/**` will *not* trigger `create-pr-release-to-main.yml` on that same push. Fix: the promote job **opens its own PR to main** instead of relying on the follower workflow. The `release/**` workflow stays only as an out-of-band recovery path.
2. **Conflict fallback must be `git reset --hard origin/develop`**, not `git checkout origin/develop -- .`. The checkout form only overwrites/adds files that exist — it leaves files *deleted on develop* present in the release branch, producing a dirty, merge-hostile tree.
3. **Always guard `create-branch-from-main` paths**: if `main` doesn't exist yet, or `develop` is not ahead of it (`compare.ahead_by == 0`), skip. Otherwise you create `release/vX.Y.Z` from nothing / with no contents and push empty PRs.
4. **Concurrency + idempotency.** Give the promote job a global `concurrency` group (`cancel-in-progress: true`) so rapid pushes to `develop` don't race two release branches. On PR workflows, `gh pr list --head/--base` → edit (not create) to avoid duplicate PRs.
5. **Least-privilege permissions per workflow.** Only `contents: write`/`pull-requests: write` where needed (promote/publish or PR-openers respectively). CI needs no write perms at all.
6. **Set both `GITHUB_TOKEN` and `GH_TOKEN`** env on any job that uses the `gh` CLI inside a script — `gh` needs `GH_TOKEN`; the API/`git push` paths use `GITHUB_TOKEN`.
7. Use `actions/checkout@v4` with `fetch-depth: 0` (+ `fetch-tags: true`) wherever you need branch history/tags (versioning, merge). Plain shallow checkout breaks both.

## Acceptance Checklist

- [ ] `develop` and `main` protected; `feature/**`/`release/**` writable by the pipeline.
- [ ] Push to `feature/x` opens/updates PR → `develop` (idempotent).
- [ ] Merge to `develop` runs CI and triggers promote → `release/vX.Y.Z` + tag.
- [ ] Promote opens PR `release/` → `main` (not relying on the follower workflow).
- [ ] Tag `v*` push runs publish; artifact/npm released with correct version.
- [ ] `ahead_by`/`main-exists` guards prevent empty releases.
- [ ] Git metadata (fetch-depth, tags) and both tokens set on all `gh`-using jobs.

## Guardrails

- **Reference, don't inline-copy**: this skill is the recipe; the canonical YAML lives in `.github/workflows/` — point new users there.
- **Generic by design**: replace dependency commands (`npm ci`/`npm run build`) with the target repo's equivalents; branch names (`feature/`, `release/vX.Y.Z`) are the contract — keep them.
- Version bumps only via `npm version --no-git-tag-version`; never hand-edit `package.json` version + tag out of sync.
- **Respond in English.** All output must be in English.

## Installation

Install according to your organization's AI assistant CLI and deployment processes.

## Integration

- **Bootstrap** of any new service/app repo: run this recipe to stand up the esteira.
- **Code reviewer** on workflow diffs: verify pitfalls 1–7 are respected.
- Cross-referenced by the `git-flow` skill (usage rules) — this one is the build/reference half.
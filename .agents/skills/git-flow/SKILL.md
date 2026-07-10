---
name: git-flow
description: "Git flow — branching, commits, and PRs. Use when creating branch, committing, or pushing code. Pipeline opens PRs automatically. Direct commit to develop ONLY in scm repositories. Feature branches follow pattern feature/<story-id>-<context>."
---

# Git Flow — Branching, Commits, and PRs

Use this knowledge whenever agent is **creating branch, committing, or pushing code** in any repository during the workflow. Consolidates in one place the flow rules scattered across documents — **adapted to reality**: **pipeline opens PRs automatically**; agent rarely opens PR manually.

---

## 1. Branches

| Branch | Who creates | Rule |
|---|---|---|
| `feature/<story-id>-<context>` | agent (or developer) | working branch; ex.: `feature/STORY-123-observability` |
| `develop` | — | protected; **direct commit ONLY in `scm` repos** — see §2 |
| `release/**` | **pipeline** | created automatically; **don't** create manually |
| `main` | — | **always protected**; **never** push or direct PR |

- Branch name follows **`feature/<story-id>-<context>`**.
- If user says "don't create branch" but asks for push, agent creates branch in pattern above.
- When branch already exists (user created), **push to it** — don't create another.
- **In doubt about destination, ask**: *"Which branch should I push to?"* — don't assume.

## 2. SCM Repositories Exception (workflow)

- **Direct commit to `develop` is allowed ONLY in `scm` type repos** (workflow itself).
- **In all other repos** (service/app, infra, doc): always `feature/<...>` → push → **pipeline opens PR** (feature → develop → release → main). **Never** commit directly to `develop`/`main`.

## 3. Pull Requests — Pipeline Opens, Not Agent

- PRs to **`develop`/`release`/`main`** are opened **automatically by pipeline** when pushing to `feature/`. **Don't** wait for user to ask; **don't** open manually.
- PR can only target **`develop`** or **feature branches** — **never `main`** (protected).
- Items that only depend on **environment promotion** (dev→staging→prod: merge PR, validate/promote monitor after deploy) count as **completed** from story perspective — not blocker.
- Rule "only open PR when explicitly asked" still applies to scenarios **outside** standard flow (ex.: PR between two feature branches).

## 4. Commits

- Message in **English**, format **`type(scope): description`** (ex.: `feat(monitoring): ...`, `fix(test): ...`, `docs(workflow): ...`).
- **Never** commit `.env*` or credentials (repository rule) — `.gitignore` should cover `.env*`.
- **Don't** use `git add .` (avoids uploading unrelated file); add specific paths.
- **Don't** upload tool artifacts: tool directories, `node_modules/`, build artifacts, compiled files.

## 5. Access / Proxy
- Internet/artifacts via **proxy** configuration if required by organization.
- See troubleshooting documentation for proxy setup details.

## Where This is Used in Workflow

- **Implement/closer phases**: create `feature/<...>`, commit in English, push → pipeline opens PR.
- **Code reviewer**: reject `.env*`/tool artifacts in diff and non-standard message format.
- **Prompt builder/kickoff**: resolve target repo and `base-branch` before creating feature.

## Guardrails

- **Respond in English.** All output must be in English.

## Installation

Install according to your organization's AI assistant CLI and deployment processes.
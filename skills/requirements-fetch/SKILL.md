---
name: requirements-fetch
description: "Pre-phase 0 for materializing entry requirements (.sdd/stories/<id>/story.md) automatically from requirements management system, without manual copy-paste. Connects to requirements MCP, does login 1x (cookies + auth token), calls get_story with story number and writes story.md in target repo following workflow template. Trigger with: 'fetch story STORY-...', 'get story from requirements system', 'materialize story.md', 'create story folder from requirements system'."
argument-hint: "Story number (ex: STORY-123) — and, if known, target repo/stack/environment"
---

# Requirements Fetch (materializes story.md from requirements system)

## ⚠️ OPTIONAL Skill

**This skill is OPTIONAL.** Only needed if you want to **automate** creating `story.md` by fetching data from requirements management system via MCP. If you prefer **creating story manually** (copy from requirements system and paste into `story.md`), **skip this skill** and go directly to prompt builder.

## When to Use

**Before phase 0 (prompt builder)**, when story is **not yet materialized** in `.sdd/stories/<id>/story.md` and you want to **automate** this process. It's the step that eliminates the only manual workflow step: instead of copying requirements system content manually, this skill **fetches story from requirements system** via MCP and **generates `story.md`** in expected workflow format.

**Usage flow:**
- **With this skill:** requirements system → MCP → `story.md` (automatic) → prompt builder
- **Without this skill:** requirements system → manual copy/paste → `story.md` → prompt builder

## Principle

Workflow is triggered by **watcher** that detects new `story.md`. This skill is what **produces** that file: reads business source of truth (requirements management system), maps fields to workflow template, and delivers ready entry point. **Doesn't** specify or plan — only materializes entry.

## Prerequisite: Requirements MCP Connected

Skill depends on requirements management system **MCP server**. If not yet connected in agent being used, follow setup guide for your platform.

**Summary:**
1. Configure registry if required
2. Register MCP server with correct command for platform
3. Login with credentials (cookies + auth token)

## Inputs

- **Story number** (`STORY-NNN`) — required.
- (Optional) target repo / stack / environment, if already known — requirements system **doesn't** load target repository.
- Requirements system session: `cookies` + auth token, used **1x** in `login`.

## Output

- `.sdd/stories/<id>/story.md` in **target repo** (`<id>` = story number), filled from template.
- Ready for phase 0 (prompt builder) to detect and start kickoff.

## Mapping Requirements System → story.md

The `get_story` returns `fields` with **friendly names** (label/value/displayValue). Map as follows:

| Requirements System Field | Origin | Goes to `story.md` |
|---|---|---|
| **Name** | `short_description` | header title `# STORY-... — <Name>` |
| **Description** | `html_description` | `## Context` + `## Expected Outcome (business view)` (convert HTML → clean text/markdown) |
| **Acceptance Criteria** | `acceptance_criteria` | criteria block (specify phase consumes) |
| **Story Type / Functional/Non-Functional / Sub-Classification** | metadata fields | `## Notes / links` (metadata) |
| **Portfolio / Tower Classification / Functionality** | classification fields | `## Notes / links` (metadata) |
| **Responsible** | `assigned_to` | `## Notes / links` |

> **`## Target Service(s)` is REQUIRED and requirements system DOESN'T bring repo.** Fill `repo:`/`stack:`/`environments:`/`base-branch:` from story content (if cited), service catalog, or **ask user**. Never guess repository.

## Procedure

1. **Ensure requirements MCP connected** (see prerequisite). If not, instruct platform-specific setup and register in run log (artifact + command + reason).
2. **Login (1x)**: use login method (recommended — detects env vars/saved session) or tool `login` pasting `cookies` + auth token from browser. Session stays in config file (outside git) — **never** commit; if expired, redo login.
3. **Fetch story**: call `get_story` with `storyNumber = STORY-...`.
4. **Map fields** to template (table above); convert HTML Description to clean text/markdown.
5. **Resolve `## Target Service(s)`** (story → catalog → ask). Never guess.
6. **Write** `.sdd/stories/<id>/story.md` in target repo (`<id>` = story number).
7. **Chain phase 0** (prompt builder): "story materialized in `.sdd/stories/<id>/` — start kickoff".

## Guardrails

- **Never** commit credentials: cookies/auth token, config files and any config with secrets stay **outside git** (ensure `.gitignore`).
- **Don't** invent requirement: missing field in requirements system becomes note in `story.md` (or question), never guessed value.
- **Don't** guess target repo — resolve from story/catalog or **ask**.
- Execution uses **current user identity** (branch/commits) — never skill author's identity.
- Default base URL is typically **production**; confirm environment if story is for dev/staging.

- **Respond in English.** All output must be in English.
## Next Phase

Prompt builder (phase 0 — watcher/kickoff from materialized `story.md`).

## Installation

Install according to your organization's AI assistant CLI and deployment processes.


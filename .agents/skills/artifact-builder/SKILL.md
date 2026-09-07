---
name: artifact-builder
description: "Meta-skill: teaches and validates contribution pattern for workflow artifacts (skills, playbooks, knowledge sources). Use when creating/altering an artifact, to not forget any steps from workflow guide: SKILL.md with frontmatter (name+description), documentation in English, mirror in skills folder and registration in catalog. Includes validator that checks catalog integrity. Trigger with: 'create new skill', 'how to contribute artifact', 'validate catalog', 'check workflow catalog'."
argument-hint: "Artifact type (skill|playbook|knowledge_source) and slug in kebab-case"
---

# Artifact Builder (contribution pattern + catalog validator)

## When to Use

- When **creating/altering** a workflow artifact (skill, playbook, or knowledge source).
- To **validate** catalog and mirrors before pushing (resolves the trap that workflow guide lists: "added artifact? update catalog **and** documentation").

## Artifact Anatomy (what workflow guide describes in prose)

| Item | Skill | Playbook | Knowledge source |
|---|---|---|---|
| Canonical folder | `skills/<slug>/` | `playbooks/<slug>/` | `knowledge/<slug>/` |
| Main doc | `SKILL.md` (frontmatter `name`+`description`) | `PLAYBOOK.md` | `KNOWLEDGE_SOURCE.md` |
| Portal doc | `README.md` (English) | `README.md` | `README.md` |
| Mirror | `skills/<slug>/` (full sync) | — | — |
| Registration | entry in catalog | same | same |

## Procedure (create a skill)

1. Create `skills/<slug>/SKILL.md` with **frontmatter YAML**:
   ```yaml
   ---
   name: <slug>
   description: "What it does + when to use + trigger phrases."
   argument-hint: "expected inputs"
   ---
   ```
2. Write body: **When to Use**, **Inputs/Outputs**, **Procedure**, **Guardrails**.
3. Create `skills/<slug>/README.md` in **English** (overview, capabilities, installation, author).
4. **Register** in catalog (`type`, `path`, `docs_path`, `name`, `description`, `version`, `tags`, team authorship). The `version` follows **SemVer** (`MAJOR.MINOR.PATCH`) — see "Versioning" below.
5. **Validate**:
   ```bash
   python3 artifact-builder/assets/validate-catalog.py
   ```
6. Commit with appropriate message.

## Versioning (SemVer) of Artifacts

The `version` field of each artifact in catalog follows **SemVer** (`MAJOR.MINOR.PATCH`). New artifact starts at `1.0.0`. When **altering** existing artifact, **bump version** per impact on consumers:

| Change | Bump | Example |
|---|---|---|
| Contract/usage break (rename slug, remove/rename section consumer depends on, change inputs) | **MAJOR** (`2.0.0`) | change expected input format of skill |
| New compatible content (new section, new case covered, new reference) | **MINOR** (`1.1.0`) | add new knowledge to skill |
| Correction/adjustment without usage change (typo, link, clarity) | **PATCH** (`1.0.1`) | fix incorrect example |

- Don't reuse version: each published change is a new `version`. Annotate change in commit message (`feat`/`fix`/`docs`).

## The Validator (`assets/validate-catalog.py`)

Runs from **repo root** and checks:
- Catalog parses and each artifact has `type`/`path`/`name`/`description`;
- `path` and `docs_path` exist;
- every **skill** has `SKILL.md` with frontmatter (`name`+`description`);
- warns if there are `skills/<slug>/` **outside** catalog.

Exit code `0` = OK; `1` = error (serves as manual gate before push).

## Guardrails

- **No local server/index** — only validation; portal indexes.
- Documentation always **English**; slugs in **kebab-case**.
- **Authorship** = team/community credit (no personal identifiers in public body).
- Keep mirror synchronized with each skill change.
- **Bump version** (SemVer) always when altering artifact — never republish change in same version.

## Installation

Install according to your organization's AI assistant CLI and deployment processes.
- **Respond in English.** All output must be in English.

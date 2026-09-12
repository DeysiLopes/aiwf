---
name: implement
description: "Consolidates the implementation strategy from atomic tasks. In TDD mode, generates implementation that passes the provided tests. In normal mode, guides incremental delivery blocks with regression risk and minimum validation. Trigger with: 'generate implementation', 'implement story', 'code the solution'."
argument-hint: "Tasks artifact path + (optional) tests artifact path"
---

# Implement — Implementation Guide

## When to Use

After tasks are defined (or after tests in TDD mode). This skill produces the implementation guide from the atomic tasks breakdown.

## Inputs

- `tasks`: Atomic tasks artifact
- `tests`: Tests artifact (TDD mode only)
- `tdd`: Boolean flag for TDD mode
- `context`: Domain model (`CONTEXT.md` / `{{context}}`) — name classes, methods, and endpoints with this vocabulary

## Procedure

1. If TDD mode (`true`), generate implementation that PASSES the provided tests.
2. If normal mode (`false`), generate implementation from atomic tasks.
3. Organize in **vertical slices** (one feature end-to-end per slice), not horizontal layers.
4. For each slice, describe:
   - expected changes
   - regression risks
   - minimum validation
5. In TDD mode, drive each slice through the red-green-refactor loop:
   - **Red** — one failing test for the right reason
   - **Green** — minimal change to pass
   - **Refactor** — only OUTSIDE the loop, after the slice is green
6. Use the `context` domain vocabulary in names and endpoints (see `context` skill).
7. Include explicit TDD strategy recommendation (yes/no and why).
8. Include `## Run Log Update` at the end.

## Vertical vs horizontal slices

- **Vertical slice** — one feature end-to-end (UI/API → domain → persistence) per pass. Cost stays constant per feature; tests stay meaningful per feature.
- **Horizontal slice** — one layer across the whole app per pass. Touches all features per pass → a later bug fix in one feature breaks many tests; change amplification.

## Output Structure

1. `# Implementation Guide`
2. `## General Strategy`
3. `## Vertical Slices (one feature end-to-end each)`
4. `## Validation Plan per Slice`
5. `## TDD Decision`
6. `## Technical Risks and Mitigations`
7. `## Run Log Update`

## Guardrails

- Do not generate actual source code — only the implementation guide.
- In TDD mode, the tests are the source of truth; implementation must pass them.
- Do NOT refactor while a test is red — green the slice first, then refactor.
- Register cost data via `ai-cost-manager` MCP (do not estimate tokens manually).
- **Respond in English.** All output must be in English.


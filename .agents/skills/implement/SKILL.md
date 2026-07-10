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

## Procedure

1. If TDD mode (`true`), generate implementation that PASSES the provided tests.
2. If normal mode (`false`), generate implementation from atomic tasks.
3. Organize in incremental delivery blocks.
4. For each block, describe:
   - expected changes
   - regression risks
   - minimum validation
5. Include explicit TDD strategy recommendation (yes/no and why).
6. Include `## Run Log Update` at the end.

## Output Structure

1. `# Implementation Guide`
2. `## General Strategy`
3. `## Incremental Implementation Blocks`
4. `## Validation Plan per Block`
5. `## TDD Decision`
6. `## Technical Risks and Mitigations`
7. `## Run Log Update`

## Guardrails

- Do not generate actual source code — only the implementation guide.
- In TDD mode, the tests are the source of truth; implementation must pass them.
- Register cost data via `ai-cost-manager` MCP (do not estimate tokens manually).
- **Respond in English.** All output must be in English.


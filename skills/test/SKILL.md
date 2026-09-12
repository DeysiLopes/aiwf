---
name: test
description: "Defines and/or generates test strategy aligned with acceptance criteria. In TDD mode generates tests BEFORE implementation from atomic tasks. Covers unit, integration, and acceptance tests with traceability to criteria. Trigger with: 'generate tests', 'define test strategy', 'create test plan'."
argument-hint: "Tasks artifact path + implementation artifact path + (optional) acceptance criteria"
---

# Test — Test Strategy and Generation

## When to Use

After tasks are defined (or before implementation in TDD mode). Produces the test strategy mapped to acceptance criteria.

## Inputs

- `tasks`: Atomic tasks artifact
- `implementation`: Implementation artifact (normal mode)
- `acceptance`: Acceptance criteria (optional)
- `tdd`: Boolean flag for TDD mode
- `context`: Domain model (`CONTEXT.md` / `{{context}}`) — use its vocabulary in test names and assertions

## Procedure

1. If TDD mode (`true`), generate tests BEFORE implementation — use atomic tasks and acceptance criteria as primary input.
2. If normal mode (`false`), generate tests from the planned implementation.
3. Cover unit and integration tests.
4. Map each test case to the corresponding acceptance criterion.
5. Classify each test as mandatory or optional.
6. Use the `context` domain vocabulary (shared language) in test names, fixtures, and assertions.
7. Include `## Run Log Update` at the end.

## TDD loop (red-green-refactor)

When in TDD mode, define the loop the implementation must follow (one vertical slice at a time — see `implement`):

1. **Red**: write ONE test that fails for the right reason (assertion fails because the behavior doesn't exist — not because of a syntax error or a tautological test).
2. **Green**: implement the minimal change to pass it.
3. **Refactor**: done OUTSIDE the red-green loop, after the slice is green — never while the test is red.

## Seams

Design testable seams at the start, and declare them explicitly:

- **Behavior seam** — the seam is the observable behavior (contract), not internals.
- **Simplicity** — seams hide dependencies without exposing what they replace.
- **Good-seam test** — a seam is good when the test can be written purely against it, with broken dependencies kept at the edges (e.g. injected interfaces/ports).

Declared seams go in the output under `## Seams Agreed`.

## Anti-patterns to avoid

| Anti-pattern | Symptom | Why it's wrong |
|---|---|---|
| **Tautological test** | Test passes without the behavior being implemented (e.g. asserting a constant back, testing a mock that just returns what you stubbed) | It exercises the test, not the code — gives false green and false confidence |
| **Coupled to implementation** | Asserting internal calls/fields instead of observable behavior | Red → the implementation can't refactor without rewriting tests; tests become a liability |
| **Horizontal slice** | Testing one layer across the whole app instead of one feature end-to-end | Many layers touched per slice → a bug in one feature breaks many tests; changes amplify |

## Output Structure

1. `# Test Strategy`
2. `## Acceptance Criterion × Test Matrix`
3. `## Unit Test Suite`
4. `## Integration Test Suite`
5. `## Test Prioritization`
6. `## Seams Agreed`
7. `## Run Log Update`

## Guardrails

- Do not generate actual test code — only the strategy and plan.
- In TDD mode, tests define the contract; implementation must pass them.
- Each test must be independently meaningful: no tautological tests, no assertions on internals.
- Register cost data via `ai-cost-manager` MCP (do not estimate tokens manually).
- **Respond in English.** All output must be in English.


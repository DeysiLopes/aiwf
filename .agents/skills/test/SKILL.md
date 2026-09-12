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

## Procedure

1. If TDD mode (`true`), generate tests BEFORE implementation — use atomic tasks and acceptance criteria as primary input.
2. If normal mode (`false`), generate tests from the planned implementation.
3. Cover unit and integration tests.
4. Map each test case to the corresponding acceptance criterion.
5. Classify each test as mandatory or optional.
6. Include `## Run Log Update` at the end.

## Output Structure

1. `# Test Strategy`
2. `## Acceptance Criterion × Test Matrix`
3. `## Unit Test Suite`
4. `## Integration Test Suite`
5. `## Test Prioritization`
6. `## Run Log Update`

## Guardrails

- Do not generate actual test code — only the strategy and plan.
- In TDD mode, tests define the contract; implementation must pass them.
- Register cost data via `ai-cost-manager` MCP (do not estimate tokens manually).
- **Respond in English.** All output must be in English.


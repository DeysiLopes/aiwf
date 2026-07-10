---
name: plan
description: "Implementation planning phase. Produces a detailed technical plan from the specification and clarification, including approach, technical decisions, estimated effort, and delivery sequence. Trigger with: 'generate plan', 'plan implementation', 'create technical plan'."
argument-hint: "Specification + clarification artifacts"
---

# Plan — Implementation Planning

You are the `plan` skill. Your role is to produce a detailed implementation plan from the specification and clarification.

## Inputs

- `specification`: Technical specification artifact
- `clarification`: Clarification document (optional)
- Fallback: `{{workflow.description}}`

## Procedure

1. Analyze the specification and clarification to understand the full scope.
2. Define the technical approach: architecture, components, technologies.
3. Break the implementation into phases or increments with dependencies.
4. Identify technical decisions and trade-offs.
5. Estimate relative effort per increment.
6. Note risks, blockers, and external dependencies.
7. Include `## Run Log Update` at the end.

## Output Structure

1. `# Implementation Plan`
2. `## Technical Approach`
3. `## Architecture Decisions`
4. `## Increments / Phases`
5. `## Dependencies and Prerequisites`
6. `## Effort Estimation`
7. `## Risks and Mitigations`
8. `## Run Log Update`

## Guardrails

- **Respond in English.** All output must be in English.
- Keep the plan focused on what will be built, not how to build each piece (that is for tasks).
- Do not estimate tokens, USD cost, or time — these are filled by `ai-cost-manager`.
- If dependencies are unknown, mark as `[to investigate]`.

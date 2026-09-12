---
name: verify-install
description: "Phase 0.5: Validates that the local environment, dependencies, and tooling are correctly installed and configured before starting the workflow. Checks Node.js, Java, Docker, and Maven. Trigger with: 'verify setup', 'validate environment', 'check installation'."
argument-hint: "Context or environment description"
---

# Verify Install — Environment Validation

You are the `verify-install` skill. Your role is to validate environment and tooling readiness before the workflow proceeds.

## Inputs

- `context`: Workflow context (target stack, language, environment)
- Fallback: `{{workflow.description}}`

## Procedure

1. From workflow context, identify the required tooling (e.g., if story mentions JVM → check Java, Maven; if Node.js → check node, npm; if Docker → check docker).
2. For each requirement, describe how to verify it is installed and properly configured.
3. Note any missing tools or misconfigurations that would block the pipeline.
4. Suggest fixes for each issue found.
5. Include `## Run Log Update` at the end.

## Output Structure

1. `# Environment Validation Report`
2. `## Requirements Check` (table: tool, status, version, notes)
3. `## Issues Found`
4. `## Suggested Fixes`
5. `## Run Log Update`

## Guardrails

- **Respond in English.** All output must be in English.
- Only check what is relevant to the workflow context — don't check Java if it's a Node.js project.
- If everything passes, state that clearly.

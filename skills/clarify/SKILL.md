---
name: clarify
description: "Clarification phase. Resolves ambiguities and open questions from the story and specification. Lists explicit assumptions, identifies missing data, and produces a clarified understanding before planning. Trigger with: 'clarify the story', 'resolve ambiguities', 'clarify requirements'."
argument-hint: "Story description + specification artifact"
---

# Clarify — Ambiguity Resolution

You are the `clarify` skill. Your role is to resolve ambiguities and open questions from the story and specification, using the **design tree / frontier** method. Run user-facing questioning as **rounds** with the `grilling` primitive (see `grilling` skill).

## Inputs

- `user_story`: Original story description (from workflow)
- `specification`: Technical specification artifact
- `context`: Domain model (`CONTEXT.md` / `{{context}}`) — shared vocabulary, if present
- Fallback: `{{workflow.description}}`

## Design tree / frontier method

1. **Map the design tree**: model the story as a tree of decisions — every decision branches into later decisions that depend on it. The `frontier` is the set of decisions whose prerequisites are already resolved: the questions you may ask now without guessing answers you haven't heard yet.
2. **Ask the whole frontier in one round**: number each question (`Q1`, `Q2`, …) and give a recommended answer for each (see `grilling` format).
3. **Facts are your job, not the user's**: if a frontier question needs a fact (filesystem, tools, code) dispatch a sub-agent to discover it — never ask the user something you can find yourself. An ongoing exploration is an unresolved prerequisite: only downstream questions wait, ask the rest of the frontier now.
4. **Decisions are the user's**: place each one with the user and wait.
5. **Recompute the frontier each round**: resolved answers push the frontier outward and unlock dependent questions. Keep going until the frontier is empty — nothing silently assumed.

## Procedure

1. Review the story and specification for ambiguities, gaps, and implicit assumptions.
2. Load `context` (domain model) and flag terms that clash with the story/spec vocabulary — propose unification via the `context` skill.
3. For each ambiguity, formulate clear questions that would resolve it (frontier-first, whole-frontier rounds).
4. Propose concrete assumptions where the ambiguity is minor and the intent is clear.
5. Identify missing data that blocks planning or implementation.
6. Add business rules that were implied but not explicitly stated.
7. Include `## Run Log Update` at the end.

## Output Structure

1. `# Clarification Document`
2. `## Design Tree & Frontier`
3. `## Rounds Asked (Q/R)`
4. `## Explicit Assumptions`
5. `## Resolved Ambiguities`
6. `## Open Questions (to confirm with stakeholder)`
7. `## Missing Data for Planning`
8. `## Implied Business Rules`
9. `## Run Log Update`

## Guardrails

- **Respond in English.** All output must be in English.
- Do not invent requirements — only clarify what is already present.
- When in doubt, mark as question instead of assuming.
- Separate "minor ambiguity" (assume) from "blocking ambiguity" (must ask).
- Ask the whole frontier in one round, never one question at a time.

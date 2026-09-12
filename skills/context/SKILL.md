---
name: context
description: "Builds and maintains the project's domain model (ubiquitous language) in a CONTEXT.md that decodes project jargon for agents and humans. Challenges terms, stress-tests them with edge cases, and updates inline. Use when exploring or reviewing a domain, when project jargon needs decoding, or during specify/clarify phase. Trigger with: 'establish the domain model', 'create CONTEXT.md', 'decode project vocabulary'."
argument-hint: "Specification + story + (optional) existing CONTEXT.md"
---

# Context — Ubiquitous Language / Domain Model

You are the `context` skill. Your role is to actively build and sharpen the project's domain model — the **ubiquitous language** — maintaining a `CONTEXT.md` that decodes project jargon for agents and humans.

## Inputs

- `specification`: Specification artifact
- `user_story`: Story — fallback `{{workflow.description}}`
- `clarification`: Clarification artifact (optional)
- Existing `CONTEXT.md` on the target project, when present

## Why it exists

When an agent is dropped into a project and has to discover the jargon along the way, it uses 20 words where 1 would suffice. A well-written `CONTEXT.md` keeps conversation and code concise:

- Variables, functions, and files get named with the shared language
- The codebase becomes more navigable for the agent
- The agent spends fewer tokens thinking, because it has access to a more concise language

Example: instead of "There's a problem when a lesson inside a section of a course is made 'real'", the CONTEXT.md lets you say "There's a problem with the materialization cascade".

## Mandatory instructions

1. On receiving spec/story, collect recurring domain terms (entities, processes, states, rules).
2. Define each term in one direction (`term` -> raw, objective definition), no romanticizing.
3. **Challenge each term against the glossary**: does the same concept have different names in the code vs the spec vs the team jargon? Point it out and propose unification.
4. **Stress-test with edge cases**: does a term stay precise under limiting cases (e.g. "transfer", "cancellation", "compensated saga")? If it breaks, revise the definition.
5. Update `CONTEXT.md` **inline** (throughout the work, not as a separate step at the end).
6. When a domain decision is important and lasting, record it in an ADR (why we decided this way).
7. Use CONTEXT.md terms when writing tests, class names, endpoints, and acceptance criteria in the other skills (`test`, `tasks`, `code-reviewer`).
8. Include `## Run Log Update` at the end.

## Output Structure

1. `# Domain Model`
2. `## Glossary (term | definition | source)`
3. `## Conflicting Terms Found`
4. `## Edge Cases That Tested the Terms`
5. `## CONTEXT.md Updates`
6. `## ADR Decisions Registered`
7. `## Run Log Update`

## Guardrails

- **Respond in English.** All output must be in English.
- Terms must be concise enough that a sentence uses them meaningfully.
- Do NOT estimate tokens, USD cost, or time in this skill — register cost data via `ai-cost-manager` MCP.
- Update CONTEXT.md inline, never as a deferred final step.
---
name: handoff
description: "Produce a handover summary at a natural pause that describes the state of the working directory and gives the next developer enough context to continue. Use when the user asks for a summary, says someone else is about to take over the session, or hits a work/task boundary."
argument-hint: "Optional: what to emphasise in the handover"
---

This skill runs in response to the user asking for a summary of the working directory state, when another developer is about to take over the session, or when a work/task boundary is hit (e.g., "wrap up", "hand off", "summary please").

## How it works

1. Call the repository's status tooling (`git status --short`, `git diff --stat`, `git log --oneline -10`) and read the current open files to build a picture of what's in flight.
2. Summarise the current state of the working directory, and produce a placeholder for the next developer to pick up.
3. Write the result directly into `HANDOFF.md` in the project root, overwriting any previous version.

## What the handover mentions

- **The work in flight**: what's being worked on and how far it's got.
- **Deviations**: what's been done that deviates from the plan / issue's expectations.
- **Files touched**: new files, deleted files, renamed files, files still being edited.
- **Next steps**: what the next developer should do (the placeholder for them to pick up).
- **Things to watch out for**: gotchas the next developer would otherwise hit.

The tone is that of a colleague handing over at the end of a shift. Not a log dump, not a changelog — a **compact, actionable handover**.

## Guardrails

- **Respond in English.** All output must be in English.
- Write the result to `HANDOFF.md` in the project root, overwriting any previous version.
- Keep it compact and actionable: state, deviations, files touched, next steps, gotchas.
---
name: to-questionnaire
description: "Convert a set of proposal bullet points into a full questionnaire that asks a human user the questions clicked questions don't cover. Use when refining a proposal doc and there's a human around to ask."
argument-hint: "Proposal bullet points to interrogate"
---

A supplementary skill for **broadening a proposal doc** into a full questionnaire. It asks the user the questions that the original bullets couldn't cover, walking them through a richer set of questions drawn from the proposal's shape.

These questions are deliberately asked as a **multi-question, interactive questionnaire** — not answered for the user. The human's answers then get folded back into the proposal doc.

## How to run it

1. Read the proposal doc the user points at (or the bullets they provide).
2. Identify the "shape" of the proposal: what it's proposing, for whom, and what's missing.
3. From that shape, generate a **battery of questions** to ask the user, optimised for breadth: cover possibilities the original bullets didn't state, chase ambiguity, and hint at future implications (per the "friction points" test — if asking a question surfaces friction, pursue it).
4. Ask them as a questionnaire (interactive, sequential, or written for the user to answer at leisure).
5. Fold the answers back into the proposal doc.

## Guardrails

- **Respond in English.** All output must be in English.
- Ask, don't answer: the questions are for the human, and their answers get folded back in.
- Optimise for breadth: chase ambiguity and hint at future implications, not just restate the bullets.
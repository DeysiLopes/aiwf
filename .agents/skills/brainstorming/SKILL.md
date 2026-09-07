---
name: brainstorming
description: "Dialogue technique to transform raw idea into clear direction before specification phases. Use when requirements arrive vague or as an idea (not as a detailed specification). One question at a time, multiple choice when possible, YAGNI without hesitation. Does not replace specification — feeds into it."
---

# Brainstorming / Ideation — from raw idea to clear direction

Use this knowledge **before/at the start of specification phases**, when requirements arrive **vague or as an idea** (not as a detailed specification). It's a **dialogue technique** to transform intention into clear direction — without jumping to implementation and without inventing requirements.

> **When NOT needed.** If the requirement already comes with a detailed specification (scope, acceptance criteria, Gherkin), the agent goes directly to specification/clarification — brainstorming is for when the input is just a paragraph of idea.

---

## 1. Principles (pocket-sized)

- **One question at a time.** Don't dump several questions in a single message.
- **Multiple choice when possible.** Easier to answer than open-ended question (but open-ended is also fine).
- **YAGNI without hesitation.** Cut unnecessary feature from any design — only what serves the requirement.
- **Explore 2-3 approaches** with trade-offs **before** closing — lead with recommended and explain why.
- **Incremental validation.** Present design in **blocks** (200-300 words) and confirm each one.
- **Flexibility.** Go back and re-clarify when something doesn't fit.

## 2. The Process

**a) Understand the idea**
- Look at current state (the requirement, target repo via service catalog, docs/recent commits).
- Ask **one at a time** to refine: **purpose, constraints, success criteria**.

**b) Explore approaches**
- Propose **2-3 paths** with pros/cons; recommend one and explain the reason.

**c) Present the direction**
- In short blocks, covering: architecture, components, data flow, error handling, and testing.
- Confirm each block ("does this make sense so far?").

**d) Handoff to specification workflow**
- When direction is clear, **formalize in specification** (unambiguous spec, Gherkin) — brainstorming **does not replace** specification; it **feeds into** it.

## 3. Workflow Integration (handoff, not new phase)

| Brainstorming output | Becomes what |
|---|---|
| Purpose + constraints + success criteria | base of specification document |
| Ambiguities/edge cases raised | items of clarification phase — go back **into the spec** |
| Chosen approach + trade-offs | input for implementation plan (along with engineering best practices) |

> Don't create new phase or new file just for brainstorming — the result **enters existing artifacts** (spec/plan). Register in run-log that ideation step occurred, if relevant.

## What NOT to bring from original

- The imperative persona ("You MUST…", "You are now a senior…") — we use **agent policy**, not persona.
- Treat brainstorming as **mandatory phase** — here it's **conditional** (only when input is raw idea).
- Invent requirement to "complete" the design — ambiguity becomes **question** or clarification item, never silent assumption.

## References

- Specification phase · Clarification phase · Planning phase · Service catalog (find target)
- Prompt builder (initial kickoff) · Engineering best practices (trade-offs/complexity in design)

## Guardrails

- **Respond in English.** All output must be in English.

## Installation

Install according to your organization's AI assistant CLI and deployment processes.

## Usage Examples

- "I have a vague idea for a feature, can you help me think through it?"
- "Need to explore approaches before writing detailed specs"
- "Help me refine this concept before formal requirements"
- "What are different ways to solve this problem?"
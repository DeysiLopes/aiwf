---
name: writing-for-agents
description: "Go-to guidance for writing documentation, skills, and knowledge files that machine agents will actually read and use. Use whenever producing durable written artifacts (docs, ADRs, skill files, READMEs) meant to steer or inform agent behaviour."
argument-hint: "The doc/skill to write or the existing file to rewrite"
---

A meta-skill: the discipline behind every written artifact that a machine agent (not just a human) will read, consume, and act on. Aimed at anyone writing documentation, skills, or knowledge files for agent workflows. It unpacks what makes something easy for an agent to consume, whether it's a `CONTEXT.md`, a skill file, an architecture doc, or a README.

Agents read from the bottom of what they know, not the top. They don't lazy-load context like a human skimming a chapter; they take what's in the literal text and act. So the craft is **not literary craft**: it's the craft of making meaning that survives being picked up cold, in the middle, out of order.

Core positions:

1. **Agents are the audience, humans are the beneficiaries.** Write every artifact as if a machine will hold it in the context window and act on it. If it reads well to a human too, even better — but the machine's ease is the design constraint.
2. **Clarity over cleverness.** Machine ambiguity tolerance is near zero. Say things plainly, once, in the right place.
3. **Structure is trust.** Layout, headings, and format signal where the truly important instructions live. If a critical instruction is buried mid-paragraph, it will be missed.
4. **Default to monotasking.** One doc, one job. An artifact that does two jobs does both badly.
5. **Version what changes, preserve what's stable.** Instability is the enemy of downstream agents; treat invalidation as a cost.

## The audience

Any file an agent will consume: documentation for a codebase the agent deploys from, architecture notes, onboarding guides, knowledge files loaded into a session, skill files themselves. The skill `SKILL.md` files are the purest form: they are read **by an agent, cold, and executed**. If you can write a good skill file you can write any doc for agents.

An agent needs each of these from an artifact, in order of urgency:

1. **Absolute requirements** (what MUST happen)
2. **Absolute prohibitions** (what MUST NOT)
3. **Conditional requirements** (what happens under specific conditions)
4. **Guidance** (how to think about it, with room for judgement)
5. **Reference** (facts it may need, not strict instructions)

Most artifacts bury a requirement in the middle of "guidance" prose. The corollary: **when you write a requirement, it must be findable by a reading that's looking only for requirements.** Practice for yourself with the test "what does the agent know it must do, from this doc, before it turns to act?"

## Mechanics that survive agents

The companion file [SKILL-MECHANICS.md](SKILL-MECHANICS.md) is the canonical run-book for writing skill files themselves: invocation, frontmatter conventions, the "Respond in English" guardrail, folder layout (`SKILL.md` plus companions), and the discipline that a `SKILL.md` file must be **agent-readable**: unambiguous, seekable, verb-first instructions. Consume it when the artifact is a skill. For any other agent-facing doc, its principles extend unchanged: be explicit, be explicit about defaults, be explicit about when to stop, be explicit about how to know you succeeded.

## Guardrails

- **Respond in English.** All output must be in English.
- Write for the agent reading the file cold, in the middle, out of order: structure, not prose, carries the load.
- State absolute requirements/prohibitions explicitly and make them findable; defaults, stopping conditions and success criteria belong in the text too.
- One doc, one job; monotasking beats a general-purpose blob.
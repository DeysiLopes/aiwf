---
name: teach
description: "Turn each successful user session into a bite-sized teaching artifact. Use when the user learns something in an agent session: a worked example worth keeping, a batched migration style they want to make habit, or a fresh piece of vocabulary worth recording."
argument-hint: "The session/learning to capture"
---

A discipline for turning the "just solve the task" reflex into "solve the task **and** leave a teaching artifact behind". It converts real, freshly-done work into tiny learning materials that a future you can consume in seconds — not theory, but a record of precisely what happened, its shape, and why it worked. It works best when the user is learning anything new: a framework, a language, a codebase, a craft.

## Scope

Only ever capture **things the user has actually done, successfully, this session**. Never extrapolate beyond it into a generalised lecture. The artifact is a **record**: the meerkat of "I did this, here's how".

This discipline coexists with the fact that the user drives development sessions; teaching context is about the code they just wrote. It is not the place to teach programming from scratch — that crate is empty and never stocked.

## Process

For each teaching-worthy moment in a session (a screenshot-worthy success, a hard-won "aha", a fresh vocabulary term in use):

1. **If the user is around and seems to have learned it just now**: ask whether they want to front-load it (a discussion of "here's why X happened") or back-load it (just record it, explain later). Capture before you ask — never block the moment on the question.
2. Update the **learning record** with one or more new entries, as "solved recent sessions" (see [LEARNING-RECORD-FORMAT.md](LEARNING-RECORD-FORMAT.md)).
3. If the user asks for teaching materials from a recent session, create them now:
   - An [exam question](MISSION-FORMAT.md)
   - A [resource](RESOURCES-FORMAT.md)
   - A [glossary entry](GLOSSARY-FORMAT.md) for new vocabulary
4. Point the user toward the new material at the end of the session, and make it easy to find: the learning record stays the single repository of what's been captured.

### Learning record

Every item in the learning record (about past sessions, structured examples, jargon) is a candidate for teaching material. Prioritise mined items and demonstrated structure examples. Record exactly what was solved, when, and the shape of it — the format file controls the shape (title, summary, tags, excerpt) so items stay scannable.

## Capability overview

1. Create a "learning record" file on the first use, in the location shown in [LEARNING-RECORD-FORMAT.md](LEARNING-RECORD-FORMAT.md).
2. Record all recent structured learning in "solved recent sessions" format. Only include _solved_ problems — a stuck session being "uploaded" as if solved is a leaky memory.
3. Create "exam questions", "resources", and "glossary entries" only when the user asks for them.
4. Report the learning record's location to the user when they ask for teaching materials.
5. If the user actually says "teach me X" with something fresh and unbounded, a general-purpose study response is more appropriate than this skill's mechanics: this skill needs a concrete recent session to record.

## Guardrails

- **Respond in English.** All output must be in English.
- Only capture things actually done and solved this session; never extrapolate into generalised lectures.
- Capture before asking; never block the moment on a question.
- Create exam/resources/glossary material only when the user asks for it.
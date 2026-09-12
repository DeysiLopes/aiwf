---
name: cloud-solution-architect
description: "Transversal skill for designing solution architecture proposals with focus on cloud platforms. Helps create component diagrams and sequence diagrams, contrasting current state (existing services via repo inspection) with proposed state (what changes or is created), ready for team refinement discussions. Does not generate implementation specifications or modify code. Use for: new features, new services, new integrations, or organizing ideas before becoming formal requirements. Trigger with: 'design architecture', 'create sequence diagram', 'need diagram for refinement', 'how would this integration work', 'propose architecture for the team'."
argument-hint: "Describe the idea/feature/integration; if known, which services participate in the flow today (names/repos)"
---

# Cloud Solution Architect (architecture + sequence for refinement)

## When to Use

- In **early phases** — ideation/brainstorming, preparation for **refinement** — when someone needs to **visualize and defend an architecture proposal** before (or without) opening a formal requirement.
- New **feature** that spans existing components, new **service**, new **integration** with another team/system.
- Only when **explicitly requested** — this skill is not triggered by any other workflow/skill/playbook.

## When NOT to Use / Confusion Prevention

| If you need... | Use this, not this skill |
|---|---|
| Detail the "how" of an **already specified requirement**, within **one** service, becoming implementation plan | Implementation planning skill |
| **Dialogue technique** to extract a vague idea (questions, one at a time) | Brainstorming skill — combines well **before** this skill |
| Just find **which repository** an existing requirement/service points to | Service catalog skill — this skill **uses** that catalog as input |
| Design the **API contract** of a specific endpoint | API conventions skill |

> In a sentence: brainstorming skill **converses** to find the idea; this skill **designs** the idea (architecture + sequence) for presentation; implementation planning skill **details** the implementation after the requirement is approved.

## Inputs

- The idea/feature/problem to solve (free text — doesn't need to be a formal requirement).
- Services that **today** already participate in the flow, if the user knows (names/repos).
- Repository(ies) already available in the current session, if any (to inspect IaC/config).
- Type of change: evolution of existing service vs. new **greenfield** service.

## Output

A **proposal document** (Markdown + Mermaid), ready to paste in Confluence/slides/refinement notes, with these sections:

1. **Context/objective** — 1 paragraph of the problem and why it matters.
2. **CURRENT state** — Mermaid diagram (`flowchart`) of cloud components/services involved **today**.
3. **PROPOSED state** — Equivalent Mermaid diagram with what changes/enters (highlight the new).
4. **Sequence diagram** — Mermaid `sequenceDiagram` of main flow(s), end-to-end.
5. **Approaches considered** — 2-3 paths with pros/cons; one recommendation and why.
6. **Open points** — questions for the team to decide together in refinement.

**Where it goes:** shown **directly in conversation**, in short blocks (confirming with the user each block — same spirit as brainstorming skill). If the user wants a **versioned copy**, save in `architecture-proposals/<slug>/proposal.md` — **neutral** folder, outside of any specific workflow directory, because this is not a workflow artifact.

## Current State Discovery (from cheapest to most expensive — never force the most expensive)

1. **Service catalog** (if available) — name, type, stack, persistence and environments of each team service. First stop; doesn't require access to any extra repo.
2. **Repo(s) already available** in current session — scan IaC/config to infer real components: Terraform/CloudFormation/SAM (`*.tf`, `template.yaml`), `serverless.yml`, dependency files, configuration files, Dockerfile/task definitions. Use standard cloud vocabulary.
3. **Ask the user** — if a service is not in the catalog nor has available repo, ask for a README snippet/existing diagram instead of trying to access the repo.
4. **Multi-repo opportunistic** — only if the session **already has** other repos cloned locally, or is a session with org access, read directly. **Never** a prerequisite, and this skill **never** suggests opening a new session just for this.

> **Not enough info?** Mark `[to confirm]` in the diagram instead of assuming behavior of an unconfirmed service.

## Procedure

1. **Understand the idea** — one question at a time (purpose, constraints, success criteria), like brainstorming skill, if input is still very vague.
2. **Map current state** — apply the discovery layers above; list existing cloud components.
3. **Explore 2-3 solution approaches** with trade-offs; recommend one (YAGNI — simplest that solves; see engineering best practices skill if installed).
4. **Draw architecture diagram** — Mermaid `flowchart`, current and proposed states (use standard cloud vocabulary).
5. **Draw sequence diagram(s)** — Mermaid `sequenceDiagram` of main flow(s) (e.g., happy path + 1 error/exception path relevant for decision).
6. **Assemble proposal document** and present in **short blocks**, confirming each with the user.
7. **Ask if they want to persist to file** (`architecture-proposals/...`) — only if requested; never save by default without confirmation.

## Guardrails

- **Cost first.** Never depend on a cloud session/org integration just to "see other repos" — prefer service catalog + ask user. Only use multi-repo when **already** available for free in current session.
- **Not the implementation workflow.** Does not create/edit specifications, implementation plans, or task lists. Does not replace implementation planning — which continues to own the "how" of an already approved requirement.
- **Doesn't invent service/data.** Without confirmation (catalog, repo, or user), mark `[to confirm]`.
- **No credentials/PII** in diagrams — table/queue/service names are fine; tokens/secrets/real data never.
- **YAGNI in approaches** — prefer simplest solution that meets the objective, without over-engineering.
- **Always Mermaid** (repo standard) and content in **English** (or team's preferred language).
- **Never save file without asking** — default is to show in conversation; persisting is opt-in.

## Workflow Integration

**None, intentionally.** This skill is **transversal and independent** — doesn't appear in any "on-demand transversals" table, isn't called by any playbook, and doesn't use run logs. It serves the **moment before** the formal workflow (ideation/refinement) or situations outside it (proposal for team, exploring a new front). When the proposal is approved and becomes a requirement, the natural handoff is to specification skill.

## Installation

Install according to your organization's AI assistant CLI and deployment processes. This skill can be installed in any repository/workspace — it doesn't need to be the target service's repo, since the deliverable is not a workflow artifact.

## Cloud Provider Support

This skill is designed to be cloud-agnostic and can work with:
- AWS (Amazon Web Services)
- Azure (Microsoft Azure)
- GCP (Google Cloud Platform)
- Other cloud providers

The specific vocabulary and components will adapt based on the cloud provider used in the project.
- **Respond in English.** All output must be in English.

---
name: observability-patterns
description: "Actionable observability guide for services, respecting real team access restrictions (NO admin in monitoring tools → don't create custom metrics). Use when planning/reviewing observability in workflow (specify/plan/review): unified service tagging, MDC/correlationId in Java, structured logging with tags in Python, native metrics, and 'monitor as code' (dedicated IaC repo, JSON per environment). Trigger with: 'plan observability', 'how to instrument service', 'create monitor', 'logs/MDC/correlationId'."
argument-hint: "Service stack (Java/Spring, Glue/Python, etc.) and what to observe (error, latency, business rule)"
---

# Observability Patterns (within team access restrictions)

## When to Use

- **Plan** phase (Observability section): define what/how to instrument.
- **Review** phase (code reviewer, Observability section): check if instrumentation follows pattern.
- Whenever someone wants to "create metric/alert" — to **not** hit access restrictions.

## Real Restrictions (read before proposing anything)

These restrictions differentiate this guide from generic material: the team **doesn't create custom metrics freely**.

- **No admin in monitoring tools** → **don't** create *custom metrics* via monitoring admin/API.
- **Monitors CAN be created** — incident process uses **Monitoring Monitors**.
- **Custom cloud metrics** have **cost and approval** — **don't** use freely for business metrics.
- **Native metrics already arrive** via cloud provider integration (success/failure, time, CPU/memory, records processed). Use this for operational monitoring, without extra cost.

## Patterns to Follow

### 1. Unified Service Tagging
Standardize environment, service, and version tags in deploy (correlates logs, traces, and metrics).

### 2. Java/Spring — MDC + correlationId
Propagate correlation ID and business data via **MDC** (tag-based) in rule processing context — it's the team's path for business observability without custom metrics.

### 3. Python/Glue — Structured Logging with Tags
Equivalent "MDC" in Python is **structured JSON logging with tags** (requires log forwarder in account; may not exist in all). Operational metrics → use native cloud metrics. Business metrics/quality → resolve in **Java layer (MDC)**, not as custom metrics in Python.

### 4. Monitor as Code (IaC)
Monitors versioned in **dedicated IaC repo**, with **JSON per environment** (dev/staging/prod — each has account ID and worker service). Prefer **separate monitor repo** over embedding in application repo.

> **Dashboards** are usually only **prod** (team creates prod dashboard without admin). **Monitors** need all 3 environments. Don't create dev/staging/prod dashboard presets without explicit request.

## Anti-Patterns (reject in review)

- ❌ Create/depend on **custom metric** in monitoring (without admin) or business metrics without approval.
- ❌ Business metric inside **Python job** as custom cloud metric — goes to Java layer (MDC).
- ❌ Monitor created "manually" in monitoring tool instead of **JSON versioned** in IaC repo.
- ❌ Log with PII/secrets; raw `ex.getMessage()` exposed.

## Checklist (add to plan/review)

- [ ] Unified service tagging configured.
- [ ] correlationId/MDC propagated (Java) **or** structured JSON logging with tags (Python, if forwarder exists).
- [ ] **Operational** observability via **native metrics** — no custom metrics.
- [ ] **Business** metrics handled via MDC in Java layer (not as custom metrics in Python).
- [ ] Monitors (if any) as **JSON per environment** in dedicated IaC repo.
- [ ] No PII/secrets in logs.

## Integration

- Planning → Observability section: choose right path within restrictions.
- Code reviewer → Observability section: validate tagging/MDC and block anti-patterns.

## Guardrails

- **Respond in English.** All output must be in English.

## Installation

Install according to your organization's AI assistant CLI and deployment processes.
---
name: engineering-best-practices
description: "Engineering principles (SOLID, Clean Code, code smells, design patterns, complexity) for use in planning, tasks, and review phases. Common quality vocabulary. Complements concrete architecture patterns (team-specific standards win)."
---

# Engineering Best Practices (SOLID, Clean Code, refactoring)

Use this knowledge in **planning**, **tasks**, and **review** phases — whenever agent designs architecture, decomposes tasks, or evaluates a diff/PR. It's the **common quality vocabulary**: SOLID, Clean Code, code smells, design patterns, object design, and complexity management.

> **Scope.** This contains **generic and timeless** engineering principles. **Concrete team standards** (specific DDD patterns, error handling, naming, build tools) live in architecture-specific skills — this **complements**, doesn't replace. In conflict, team standards win.

---

## 1. SOLID (pocket questions)

| Principle | Question agent asks in review |
|-----------|------------------------------|
| **S**RP — Single Responsibility | "Does this class have **only one** reason to change?" (described with "and" → break it) |
| **O**CP — Open/Closed | "Can we **extend without modifying** what exists?" |
| **L**SP — Liskov | "Does subtype **substitute** base type without surprise?" |
| **I**SP — Interface Segregation | "Is client forced to depend on method it **doesn't use**?" |
| **D**IP — Dependency Inversion | "Does high-level module depend on **abstraction** (port), not implementation?" |

In hexagonal architecture this falls naturally: `core/usecase` depends on **ports** (`core/ports/out`), never on concrete adapter (DIP); each use case has one responsibility (SRP).

## 2. Clean Code (essentials)

- **Names:** consistency > clarity > specificity > brevity. Avoid generic `data`, `info`, `manager`, `util`. Use **domain language** (business terms), not technical jargon.
- **Short methods:** one indentation level per method; **early return** instead of nested `else`.
- **No magic numbers/strings:** extract to constant/enum.
- **Comment is exception:** good name dispenses comment; comment the **why**, never the **what**.
- **Law of Demeter:** "one dot per line" — don't navigate `a.getB().getC().getD()`.

## 3. Code smells → refactoring (review triggers)

| Category | Smell | Symptom | Refactoring |
|---|---|---|---|
| Bloaters | Long Method | method > ~10 lines | Extract Method |
| Bloaters | Large Class | class with multiple responsibilities | Extract Class |
| Bloaters | Long Parameter List | > 3 parameters | Introduce Parameter Object (DTO/record) |
| Bloaters | Primitive Obsession | primitive instead of domain object | Value Object |
| Couplers | Feature Envy | method works more on another class than its own | Move Method |
| Couplers | Message Chains | `a.getB().getC()...` | Hide Delegate (Demeter) |
| Dispensables | Duplicate code | same logic repeated | Extract Method/Class (Rule of Three) |
| Change Preventers | Shotgun Surgery | 1 change spreads across N files | regroup responsibility |

> Smell **is not bug** — it's indication. Code reviewer points as **suggestion**, not as block (unless it violates team standards).

## 4. Design patterns — don't force

> "Let pattern **emerge** from refactoring; don't force it upfront."

Use pattern only when: (a) you **recognize** the problem, (b) pattern **fits**, (c) it **simplifies**, (d) team **understands**. In most stacks, most useful: **Strategy** (variable business rules), **Factory/Builder** (many frameworks have builders), **Adapter** (is the adapters layer itself), **Template Method** (use case flows with fixed steps).

## 5. Object design

- **Responsibility-Driven Design:** object is defined by what it **knows / does / decides** — not by data.
- **Tell, Don't Ask:** ask behavior from object instead of extracting data and deciding outside it.
- **Framework-free core:** domain models without framework annotations — domain doesn't know transport.

## 6. Complexity

- **Essential** (business rule) can't be removed — only **express clearly**.
- **Accidental** (bad abstraction, unnecessary indirection, "framework ceremony", technical debt) should be **minimized**.
- Warning signs: **change amplification** (1 change → N files), **high cognitive load** (need to read much to understand 1 snippet), **unknown unknowns** (can't know what to change).

---

## How agent uses (by phase)

- **Planning:** when proposing architecture/package division, check SOLID and essential vs accidental complexity.
- **Tasks:** break into small, testable tasks (aligns with TDD).
- **Code review:** run code smells table (§3) + SOLID questions (§1) against diff; point as suggestion, attaching evidence in run log when blocking (verification gate).

## What NOT to include

- The "senior engineer" persona / cosmetic imperative tone — we use **agent policy**, not persona.
- Language-specific examples (TypeScript/JS, etc.) — focus on **language-agnostic principles**; principles apply, examples should be adapted to context.

## References

- Architecture-specific skills (concrete DDD patterns + error handling) · Framework-specific skills
- Code reviewer (applies these principles to diff) · Verification gates (evidence requirement)

## Guardrails

- **Respond in English.** All output must be in English.

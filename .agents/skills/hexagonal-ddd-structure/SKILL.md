---
name: hexagonal-ddd-structure
description: "Validates and guides hexagonal architecture (DDD) structure, naming conventions, and package organization. Language-agnostic implementation with support for Java/C#/Go/Node.js. Configurable via profile or prompts. Use when validating service structure, DDD compliance, or generating scaffolds."
argument-hint: "--target <path> --mode <strict|incremental|advisory> --profile <standard|custom>"
---

# Hexagonal DDD Architecture Structure

Validates and guides hexagonal architecture (DDD) implementation, including structure validation, naming conventions, and package organization. **Language and framework agnostic** — configurable via profiles.

## Setup Phase — Load Configuration

**Before validating, determine the conventions:**

1. **Check for profile file** (`.architecture-profile.yml` in the target repo)
2. **If no profile exists, ask the user:**
   ```
   🏗️  Which architectural pattern?
   [1] Hexagonal DDD (default)
   [2] Clean Architecture
   [3] Layered Architecture
   
   💻 Language/framework?
   [1] Java + Spring Boot
   [2] C# + .NET
   [3] Go
   [4] Node + NestJS
   [5] Other
   
   📦 Package structure preference?
   [1] Standard (core/adapters)
   [2] Custom (specify)
   
   🚨 Error handling pattern?
   [1] RFC 7807 Problem Details (REST standard)
   [2] Custom enum-based
   [3] Other
   ```
3. **Load defaults** for the chosen pattern
4. **Optionally generate** `.architecture-profile.yml` for reuse

---

## Workflow

| Intent | Phases |
|--------|--------|
| "validate / review structure" | Setup → Phase 1 + 2 → report |
| "fix / align / correct" | Setup → Phase 1 + 2 + 3 |
| "scaffold new service" | Setup → Generate from template |

### Phase 1 — Structure Validation

Verify **Universal DDD Hexagonal** structure:

**Required Layers:**
- ✅ Core/Domain layer (business logic)
- ✅ Ports (inbound/outbound interfaces)
- ✅ Adapters (in/out implementations)
- ✅ Core is framework-free (no Jackson/JPA/ORM in domain)
- ✅ Dependency rule (Core doesn't depend on anything; Adapters depend on Core)

**Profile-specific:**
- ✅ Package naming (plural vs singular: `adapters/` or `adapter/`)
- ✅ Versioning strategy (none / path-based `v1/` / header-based)
- ✅ Module structure (monolith / multi-module)

**Severity scoring:**
```
0 = Compliant
1-3 = Minor deviations (style)
4-6 = Moderate (wrong layer separation)
7+ = Severe (no hexagonal structure)
```

### Phase 2 — Naming & Conventions

**Universal DDD (always validate):**
- Entity / Value Object / Aggregate Root
- Use Case / Domain Service / Application Service
- Repository / Port / Adapter

**Profile-specific suffixes:**
- Controller suffix (ex.: `Controller` / `Resource` / `Handler`)
- Use Case port suffix (ex.: `UseCasePort` / `UseCase` / `Input`)
- Repository port suffix (ex.: `RepositoryPort` / `Gateway` / `Output`)

### Phase 3 — Fix

Apply corrections based on profile:
1. Move classes to correct layers
2. Rename to follow conventions
3. Add missing architectural components
4. Correct dependency violations

---

## Golden Rules (Universal DDD)

1. **Core/Domain is framework-free** — no framework annotations (Jackson/JPA/Hibernate)
2. **Tell, Don't Ask** — behavior with data (not anemic models)
3. **Dependency rule** — Core depends on nothing; Adapters depend on Core
4. **Ports are interfaces** — abstractions at the boundary
5. **One Aggregate per transaction** — no distributed transactions

---

## Output Format

```
## Architecture Validation: <ServiceName>

Profile: <Standard / Custom>
Pattern: Hexagonal DDD
Mode: <strict / incremental / advisory>
Severity: [✅ Compliant | ⚠️  Minor | 🟡 Moderate | 🔴 Severe]

### Structure Issues
- <layer>: <description> (severity: <score>)

### Naming Violations
- <class>: expected <pattern>, found <actual>

### Recommendations
- <specific fix from refactoring guide>
```

---

## Commands

### Validate structure (default mode)
```bash
/hexagonal-ddd-structure src/
# Uses existing profile or asks
# Incremental mode by default
```

### Validate with specific profile
```bash
/hexagonal-ddd-structure --profile standard src/main/java/
```

### Strict mode (validate everything)
```bash
/hexagonal-ddd-structure --mode strict src/
```

### Generate scaffold for new service
```bash
/hexagonal-ddd-structure --scaffold --profile standard --name myservice
```

---

## References

- **structure-validation.md** — hexagonal structure checklist
- **naming-validation.md** — DDD naming patterns
- **reference.md** — complete convention tables per profile

## Guardrails

- **Respond in English.** All output must be in English.

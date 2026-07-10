# Structure Validation — Hexagonal Architecture

## Universal Hexagonal Structure (DDD)

### Required Layers

```
<base-package>/
├── core/ (or domain/)           ← Pure business logic
│   ├── model/                   ← Entities, VOs, Aggregates
│   ├── ports/
│   │   ├── in/                  ← Inbound ports (use cases)
│   │   └── out/                 ← Outbound ports (repositories, integrations)
│   ├── usecase/                 ← Use case implementations
│   └── exception/               ← Domain exceptions
│
└── adapters/ (or infrastructure/)  ← Framework & tech details
    ├── in/                      ← Inbound adapters
    │   ├── http/                ← REST controllers
    │   ├── messaging/           ← Event consumers
    │   └── cli/                 ← Command-line
    ├── out/                     ← Outbound adapters
    │   ├── database/            ← Persistence
    │   ├── http/                ← HTTP clients
    │   └── messaging/           ← Event publishers
    └── commons/                 ← Shared adapter utilities
```

---

## Validation Checklist

### Level 1 — Core Structure (Blocker if failed)

| Check | Pattern | Severity if violated |
|-------|---------|---------------------|
| Core/Domain package exists | `core/` or `domain/` | 🔴 Critical (10) |
| Adapters package exists | `adapters/` or `infrastructure/` | 🔴 Critical (10) |
| Ports package exists | `core/ports/` or `domain/ports/` | 🔴 Critical (8) |
| Ports separated (in/out) | `ports/in/` + `ports/out/` | 🟡 Moderate (5) |
| Core has no adapter imports | `core/` doesn't import `adapters/` | 🔴 Critical (10) |

### Level 2 — Framework-Free Core (Pure DDD)

| Check | Pattern | Severity if violated |
|-------|---------|---------------------|
| Core without serialization | `core/model/` without serialization annotations | 🔴 Critical (8) |
| Core without persistence | `core/model/` without ORM annotations | 🔴 Critical (8) |
| Core without framework | `core/` without framework-specific annotations | 🔴 Critical (8) |
| Core without HTTP | `core/` without HTTP-specific code | 🔴 Critical (10) |

### Level 3 — Naming Conventions (profile-specific)

| Profile | Adapters naming | Versioning | Main class |
|---------|-----------------|------------|------------|
| **Standard** | `adapters/` (plural) | None by default | `MainApplication` or `Application` |
| **Custom** | (ask user) | (ask user) | (ask user) |

**Severity:** 🟡 Moderate (4) if violating chosen profile convention.

### Level 4 — Dependency Rule

```java
// ✅ CORRECT
package com.example.app.core.usecase;
import com.example.app.core.ports.out.RepositoryPort; // core → core (OK)
import com.example.app.core.model.Entity;             // core → core (OK)

// ❌ WRONG
package com.example.app.core.usecase;
import com.example.app.adapters.out.database.Entity;  // core → adapter (VIOLATION)
```

**Severity:** 🔴 Critical (10) if Core depends on Adapter.

---

## Severity Scoring System

Sum weights of all violations found:

| Score | Severity | Description | Action |
|-------|----------|-----------|--------|
| 0 | ✅ Compliant | Perfect structure | Approve |
| 1-3 | 🟢 Minor | Style deviations | Suggestion (doesn't block) |
| 4-6 | 🟡 Moderate | Incorrect layer separation | Fix recommended |
| 7-9 | 🟠 High | Core with framework dependencies | Block merge |
| 10+ | 🔴 Critical | No recognizable hexagonal structure | Block merge + refactor |

---

## Detection Patterns (scan automation)

### Pattern 1: Core depends on Adapter

```bash
# Grep core/ files looking for adapter imports
grep -r "import.*adapters" core/
grep -r "import.*infrastructure" core/
```

**Weight:** +10 (Critical)

### Pattern 2: Core depends on Framework

```bash
# Serialization annotations
grep -r "@JsonProperty\|@JsonIgnore\|@JsonInclude" core/model/

# ORM annotations  
grep -r "@Entity\|@Table\|@Column\|@ManyToOne" core/model/

# Framework annotations
grep -r "@Autowired\|@Component\|@Service" core/
```

**Weight:** +8 each annotation found (Critical)

### Pattern 3: Wrong package naming

```bash
# Singular adapters (should be plural in standard profile)
ls -d */adapter/ 2>/dev/null  # if exists, warning

# v1/ in new service
ls -d */adapters/in/http/v1/ 2>/dev/null  # warning if no multiple versions
```

**Weight:** +4 (Moderate)

---

## Common Violations & Fixes

### Violation 1: Core model with ORM annotations

**Problem:**
```java
// ❌ core/model/Entity.java
@Entity
@Table(name = "entities")
public class Entity {
    @Id
    @Column(name = "id")
    private Long id;
}
```

**Fix:**
```java
// ✅ core/model/Entity.java (pure POJO)
public class Entity {
    private Long id;
    // constructor, getters, business methods
}

// ✅ adapters/out/database/EntityEntity.java (adapter)
@Entity
@Table(name = "entities")
public class EntityEntity {
    @Id
    @Column(name = "id")
    private Long id;
    
    // Mapper: EntityEntity ↔ Entity (domain)
}
```

---

### Violation 2: Use case calling adapter directly

**Problem:**
```java
// ❌ core/usecase/CreateUseCase.java
@Service
public class CreateUseCase {
    @Autowired
    private RepositoryJPA repository;  // direct adapter!
}
```

**Fix:**
```java
// ✅ core/ports/out/RepositoryPort.java
public interface RepositoryPort {
    Entity save(Entity entity);
}

// ✅ core/usecase/CreateUseCase.java
public class CreateUseCase {
    private final RepositoryPort repository;  // port (interface)
    
    public CreateUseCase(RepositoryPort repository) {
        this.repository = repository;
    }
}

// ✅ adapters/out/database/RepositoryAdapter.java
@Component
public class RepositoryAdapter implements RepositoryPort {
    @Autowired
    private RepositoryJPA jpaRepository;
    
    @Override
    public Entity save(Entity entity) {
        // mapper domain → entity → save → domain
    }
}
```

---

## Profile-Specific Rules

### Profile: Standard

```yaml
base_package: "com.example.app"
adapters_naming: "plural"  # adapters/ not adapter/
versioning: "none"          # no v1/ in new service
core_naming: "core"         # not "domain"
framework_free_core: true
main_class: "MainApplication"
```

### Profile: Custom

Ask user for each convention.

---

## Output Example

```
## Structure Validation: myservice

Profile: Standard
Severity: 🟡 Moderate (Score: 5/10)

### ✅ Compliant
- Core/Adapters separation: OK
- Ports (in/out): OK
- Dependency rule: OK

### 🟡 Moderate Issues
- [adapters/in/http/v1/] Using v1/ path in new service (weight: +4)
  → Remove v1/ unless multiple API versions coexist

### 🟢 Minor Issues
- [core/usecase/] Missing domain events after state changes (weight: +1)
  → Suggest publishing domain events

### Recommendations
1. Remove `v1/` from path (adapters/in/http/controller/)
2. Add domain events (optional improvement)
```
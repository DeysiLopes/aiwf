---
name: clean-code-review
description: Reviews code against SOLID principles, Clean Code rules, and code smells. Detects bloaters, couplers, dispensables. Suggests refactorings by severity. Supports strict/incremental/advisory modes. Use when reviewing PRs, checking code quality, or detecting technical debt. Language-agnostic (focus on principles, not syntax).
argument-hint: "--target <path> --mode <strict|incremental|advisory>"
---

# Clean Code Review — SOLID + Code Smells + Refactorings

Reviews code against **SOLID**, **Clean Code**, and **code smells**. Suggests refactorings by severity. **Universal** (timeless principles, not language-specific).

## When to Use

| Phase | Scenario | Command |
|-------|----------|---------|
| **Planning** | Validate if plan follows SOLID | `/clean-code-review --target plan.md` |
| **Code Review** | Validate implemented code (via domain review) | (internal) |
| **Manual (pre-commit)** | Developer validates before commit | `/clean-code-review src/` |
| **Quarterly audit** | Map technical debt | `/clean-code-review --mode advisory` |

---

## Workflow

| Intent | Phases |
|--------|--------|
| "review / check quality" | Phase 1 (scan smells) + Phase 2 (SOLID) → report |
| "fix / refactor smells" | Phase 1 + 2 + 3 (suggest refactorings) |

### Phase 1 — Scan for Code Smells

Detect:

**Bloaters:**
- Long Method (method > 10-15 lines)
- Large Class (class with multiple responsibilities)
- Long Parameter List (> 3 parameters)
- Primitive Obsession (primitive instead of Value Object)

**Couplers:**
- Feature Envy (method works more on another class)
- Message Chains (`a.getB().getC().getD()`)

**Dispensables:**
- Duplicate Code (same logic repeated)

**Change Preventers:**
- Shotgun Surgery (1 change spreads across N files)

Each smell has a **weight**. Sum for **severity score**.

---

### Phase 2 — SOLID Assessment

Answer the **5 pocket questions**:

| Principle | Question |
|-----------|----------|
| **S**RP | "Does this class have **only one** reason to change?" |
| **O**CP | "Can we **extend without modifying** existing code?" |
| **L**SP | "Does the subtype **substitute** the base type without surprise?" |
| **I**SP | "Is the client forced to depend on method it **doesn't use**?" |
| **D**IP | "Does the high-level module depend on **abstraction** (port), not implementation?" |

Violations add to severity score.

---

### Phase 3 — Suggest Refactorings

| Smell | Refactoring |
|-------|-------------|
| Long Method | Extract Method |
| Large Class | Extract Class |
| Long Parameter List | Introduce Parameter Object (DTO/record) |
| Primitive Obsession | Value Object |
| Feature Envy | Move Method |
| Message Chains | Hide Delegate (Law of Demeter) |
| Duplicate Code | Extract Method/Class (Rule of Three) |
| Shotgun Surgery | Re-group responsibility |

---

## Golden Rules (Clean Code)

1. **Names:** consistency > clarity > specificity > brevity
2. **Short methods:** one indentation level; early return
3. **No magic numbers/strings:** extract to constant/enum
4. **Comment is exception:** good name dispenses comment
5. **Law of Demeter:** "one dot per line" — not `a.getB().getC().getD()`
6. **Tell, Don't Ask:** ask behavior from object, don't extract data

---

## SOLID Principles (quick reference)

### SRP — Single Responsibility Principle

```java
// ❌ WRONG (class does 3 things)
public class UserService {
    public void createUser() { ... }       // persistence
    public void sendEmail() { ... }        // notification
    public void generateReport() { ... }   // reporting
}

// ✅ CORRECT (one responsibility)
public class UserRepository { ... }       // persistence
public class EmailService { ... }         // notification
public class ReportGenerator { ... }      // reporting
```

**Pocket question:** "If I describe this class with 'and' in the middle, does it have more than one responsibility?"

---

### OCP — Open/Closed Principle

```java
// ❌ WRONG (needs modification to extend)
public class DiscountCalculator {
    public double calculate(String type, double price) {
        if (type.equals("STUDENT")) return price * 0.9;
        if (type.equals("SENIOR")) return price * 0.8;
        // new type = modify here
    }
}

// ✅ CORRECT (extends without modifying)
public interface DiscountStrategy {
    double calculate(double price);
}
public class StudentDiscount implements DiscountStrategy { ... }
public class SeniorDiscount implements DiscountStrategy { ... }
// new type = new class (doesn't modify existing)
```

---

### LSP — Liskov Substitution Principle

```java
// ❌ WRONG (subtype breaks contract)
public class Rectangle {
    protected int width, height;
    public void setWidth(int w) { width = w; }
    public void setHeight(int h) { height = h; }
}
public class Square extends Rectangle {
    @Override
    public void setWidth(int w) { width = height = w; }  // breaks!
}

// ✅ CORRECT (favor composition over inheritance)
public interface Shape {
    double area();
}
public class Rectangle implements Shape { ... }
public class Square implements Shape { ... }
```

---

### ISP — Interface Segregation Principle

```java
// ❌ WRONG (fat interface)
public interface Worker {
    void work();
    void eat();      // not all workers eat
    void sleep();    // not all workers sleep
}

// ✅ CORRECT (segregated interfaces)
public interface Workable { void work(); }
public interface Eatable { void eat(); }
public interface Sleepable { void sleep(); }
```

---

### DIP — Dependency Inversion Principle

```java
// ❌ WRONG (high level depends on implementation)
public class OrderService {
    private MySQLOrderRepository repo = new MySQLOrderRepository();  // concrete!
}

// ✅ CORRECT (high level depends on abstraction)
public class OrderService {
    private final OrderRepositoryPort repo;  // interface (port)
    
    public OrderService(OrderRepositoryPort repo) {  // injection
        this.repo = repo;
    }
}
```

---

## Incremental Mode (default)

When used with `--mode incremental`:
- Validates **only modified files** (git diff)
- Loads baseline (`.validation-baseline.yml`)
- Reports legacy violations but **doesn't block**
- Blocks only violations in **new code**

---

## Severity Scoring

Sum weights of all smells + SOLID violations:

| Score | Severity | Description | Action |
|-------|----------|-----------|--------|
| 0 | ✅ OK | Clean code | Approve |
| 1-3 | 🟢 Minor | Improvement suggestions | Suggest (doesn't block) |
| 4-6 | 🟡 Moderate | Code smells detected | Fix recommended |
| 7-9 | 🟠 High | Multiple violations | Fix before merge |
| 10+ | 🔴 Critical | Highly complex code | Block merge + refactor |

---

## Output Format

```
## Clean Code Review: <ClassName>

Mode: <strict / incremental / advisory>
Severity: [✅ OK | 🟢 Minor | 🟡 Moderate | 🟠 High | 🔴 Critical]

### SOLID Violations
- <principle>: <description> (weight: +N)

### Code Smells
- <smell> (weight: +N): <where>

### Suggested Refactorings
- <specific move from catalog>

### Score
Total: X/10
```

---

## Commands

### Validate new code (default)
```bash
/clean-code-review src/
# Incremental mode by default
```

### Validate everything (complete refactor)
```bash
/clean-code-review --mode strict src/
```

### Audit (doesn't block)
```bash
/clean-code-review --mode advisory src/
```

### Generate baseline (1st time)
```bash
/clean-code-review --generate-baseline
```

---

## Installation

Install according to your organization's AI assistant CLI and deployment processes.

## Integration

This skill is called by:
- **Domain review** (meta-skill) — architecture/domain validation
- **Code reviewer** — via domain review
- **Manual** — developer validates locally before commit

## Guardrails

- **Respond in English.** All output must be in English.

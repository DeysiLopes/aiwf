# Naming Validation — DDD Nomenclature

## Universal DDD Patterns (always validate)

### Domain Building Blocks

| Building Block | Naming Pattern | Example | Location |
|----------------|----------------|---------|-----------|
| **Entity** | Domain noun | `Order`, `Customer`, `Product` | `core/model/` |
| **Value Object** | Descriptive noun | `Money`, `Email`, `Address` | `core/model/` |
| **Aggregate Root** | Root noun | `Order` (root of `OrderItem`) | `core/model/` |
| **Domain Service** | `<Verb><Noun>DomainService` | `CalculateTaxDomainService` | `core/service/` |
| **Domain Event** | Past verb + noun | `OrderCreated`, `PaymentCompleted` | `core/event/` |

### Ports (always interfaces)

| Port Type | Naming Pattern | Example | Location |
|-----------|----------------|---------|-----------|
| **Inbound Port (Use Case)** | `<Verb><Noun>UseCasePort` | `CreateOrderUseCasePort` | `core/ports/in/` |
| **Outbound Port (Repository)** | `<Verb><Noun>RepositoryPort` | `SaveOrderRepositoryPort` | `core/ports/out/` |
| **Outbound Port (Integration)** | `<System>IntegrationPort` | `PaymentGatewayIntegrationPort` | `core/ports/out/` |

**Rule:** Ports are **always interfaces** (not concrete classes).

### Adapters (implementations)

| Adapter Type | Naming Pattern | Example | Location |
|--------------|----------------|---------|-----------|
| **Controller** | `<Noun>Controller` | `OrderController` | `adapters/in/http/controller/` |
| **Use Case Impl** | `<Verb><Noun>UseCase` | `CreateOrderUseCase` | `core/usecase/` |
| **Repository Adapter** | `<Noun>RepositoryAdapter` | `OrderRepositoryAdapter` | `adapters/out/database/` |
| **HTTP Client** | `<System>Client` or `<System>Feign` | `PaymentGatewayClient` | `adapters/out/http/` |

---

## Profile-Specific Naming (team conventions)

### Profile: Standard

| Element | Pattern | Example |
|----------|--------|---------|
| **Controller** (new service) | `<Noun>Controller` | `OrderController` |
| **Controller** (with version) | `<Noun>V<N>Controller` | `OrderV1Controller` |
| **UseCase Port** | `<Verb><Noun>UseCasePort` | `CreateOrderUseCasePort` |
| **Repository Port** | `<Verb><Noun>RepositoryPort` | `SaveOrderRepositoryPort` |
| **Response wrapper** | `ResponseDto<T>` → `{"data": {...}}` | `new ResponseDto<>(dto)` |
| **HTTP Client** | `<System>Client` | `PaymentGatewayClient` |
| **Mapper** | Static class or mapper framework | `OrderMapper` |
| **Main class** | `MainApplication` or `Application` | — |

---

## Validation Rules

### Rule 1: Ports MUST be interfaces

```java
// ❌ WRONG
public class CreateOrderUseCasePort { }  // concrete class

// ✅ CORRECT
public interface CreateOrderUseCasePort { }
```

**Severity:** 🔴 Critical (+8)

---

### Rule 2: Controller naming follows profile

**Standard Profile — New Service:**
```java
// ✅ CORRECT (no v1/)
@RestController
@RequestMapping("/orders")
public class OrderController { }
```

```java
// ❌ WRONG (v1/ in new service)
@RestController
@RequestMapping("/v1/orders")
public class OrderV1Controller { }
```

**Standard Profile — Service with multiple versions:**
```java
// ✅ CORRECT (when v2/ coexists)
@RestController
@RequestMapping("/v1/orders")
public class OrderV1Controller { }

@RestController
@RequestMapping("/v2/orders")
public class OrderV2Controller { }
```

**Severity:** 🟡 Moderate (+4) if violating profile convention.

---

### Rule 3: Use Case naming follows DDD

```java
// ✅ CORRECT (domain verb)
public class CreateOrderUseCase implements CreateOrderUseCasePort { }

// ❌ WRONG (generic CRUD)
public class CreateOrderUseCase { }  // "Create" is technical, not domain
```

**Severity:** 🟡 Moderate (+3)

---

### Rule 4: Domain-specific naming, not technical

```java
// ✅ CORRECT
public class OrderValidator { }           // domain: "Order"
public class PaymentService { }           // domain: "Payment"

// ❌ WRONG
public class RequiredFieldsValidator { }  // generic technical
public class DataService { }              // generic technical
```

**Severity:** 🟡 Moderate (+3)

---

### Rule 5: Response wrapper follows profile

**Standard Profile:**
```java
// ✅ CORRECT
return ResponseEntity.ok(new ResponseDto<>(orderDto));
// Output: { "data": { "id": "123", ... } }

// ❌ WRONG (direct return without wrapper)
return ResponseEntity.ok(orderDto);
// Output: { "id": "123", ... }
```

**Severity:** 🟡 Moderate (+4) if violating team standard.

---

## Detection Patterns (scan automation)

### Pattern 1: Port that's not an interface

```bash
# Grep for concrete classes in ports/
grep -r "^public class.*Port " core/ports/
```

**Weight:** +8 (Critical) per occurrence

---

### Pattern 2: Controller with v1/ in new service

```bash
# Check if v1/ exists but no v2/ (= single version service)
ls adapters/in/http/v1/ 2>/dev/null && ! ls adapters/in/http/v2/ 2>/dev/null
```

**Weight:** +4 (Moderate)

---

### Pattern 3: Technical naming instead of domain

```bash
# Classes with generic names in core/
grep -r "class.*\(Data\|Info\|Manager\|Util\|Helper\)Service" core/
```

**Weight:** +3 (Moderate) per occurrence

---

## Common Violations & Fixes

### Violation 1: Port as concrete class

**Problem:**
```java
// ❌ core/ports/in/CreateOrderUseCasePort.java
public class CreateOrderUseCasePort {
    public Order create() { ... }
}
```

**Fix:**
```java
// ✅ core/ports/in/CreateOrderUseCasePort.java (interface)
public interface CreateOrderUseCasePort {
    Order create();
}

// ✅ core/usecase/CreateOrderUseCase.java (implementation)
@Service
public class CreateOrderUseCase implements CreateOrderUseCasePort {
    @Override
    public Order create() { ... }
}
```

---

### Violation 2: Unnecessary v1/

**Problem:**
```
adapters/in/http/
└── v1/
    ├── controller/
    │   └── OrderV1Controller.java
    └── dto/
        └── OrderRequestDto.java

# No v2/ → v1/ is unnecessary
```

**Fix:**
```
adapters/in/http/
├── controller/
│   └── OrderController.java   # no v1/
├── dto/
│   └── OrderRequestDto.java
└── response/
    └── OrderResponseDto.java
```

---

### Violation 3: Generic naming

**Problem:**
```java
// ❌ core/usecase/RequiredFieldsValidator.java
public class RequiredFieldsValidator { }
```

**Fix:**
```java
// ✅ core/usecase/OrderValidator.java (domain-specific)
public class OrderValidator {
    public void validateRequiredFields(Order order) {
        // order-specific validation rules
    }
}
```

---

## Output Example

```
## Naming Validation: myservice

Profile: Standard
Violations: 3

### 🔴 Critical (fix before merge)
- [core/ports/in/CreateOrderUseCasePort.java] Port is a concrete class, should be interface (weight: +8)

### 🟡 Moderate (fix recommended)
- [adapters/in/http/v1/] Using v1/ in new service (weight: +4)
  → Remove v1/ unless multiple API versions coexist
  
- [core/usecase/RequiredFieldsValidator.java] Generic naming instead of domain (weight: +3)
  → Rename to OrderValidator (domain-specific)

### Recommendations
1. Convert CreateOrderUseCasePort to interface
2. Remove v1/ path (move to adapters/in/http/controller/)
3. Rename validator to domain-specific name
```
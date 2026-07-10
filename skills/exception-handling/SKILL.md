---
name: exception-handling
description: "Validates and guides error handling patterns including RFC 7807 Problem Details, custom enum-based patterns, and REST best practices. Language-agnostic with framework-specific implementations. Use when implementing exception handlers, validation error responses, or API error standards."
argument-hint: "--target <path> --pattern <rfc7807|custom>"
---

# Exception Handling Patterns

Validates and guides error handling implementation, including response structures, HTTP status mapping, and exception handling best practices. **Language and framework agnostic** with support for multiple patterns.

## Setup Phase — Choose Pattern

**Before validating, determine the error handling pattern:**

1. **Check for pattern configuration** (`.error-handling-profile.yml` in the target repo)
2. **If no configuration exists, ask the user:**
   ```
   🚨 Which error handling pattern?
   [1] RFC 7807 Problem Details (REST standard)
   [2] Custom enum-based with i18n support
   [3] Custom (specify structure)
   
   💻 Language/framework?
   [1] Java + Spring Boot
   [2] C# + .NET
   [3] Node + Express
   [4] Other
   ```
3. **Load defaults** for the chosen pattern
4. **Optionally generate** `.error-handling-profile.yml` for reuse

---

## Supported Patterns

### Pattern 1: RFC 7807 Problem Details (Standard REST)

Standard pattern for REST APIs ([RFC 7807](https://tools.ietf.org/html/rfc7807)).

**Structure:**
```json
{
  "type": "https://api.example.com/problems/validation-error",
  "title": "Validation Failed",
  "status": 422,
  "detail": "The 'email' field is required",
  "instance": "/orders/123",
  "timestamp": "2026-07-10T14:25:00Z"
}
```

**Validation Checklist:**
- [ ] Response has fields: `type`, `title`, `status`, `detail`, `instance`
- [ ] Content-Type is `application/problem+json`
- [ ] HTTP status consistent with `status` field
- [ ] `type` is a URI (ideally resolvable)
- [ ] Messages don't expose stacktrace or internal details

---

### Pattern 2: Custom Enum-Based with i18n

Pattern for internationalized error messages with structured codes.

**Structure:**
```json
{
  "code": "VAL001",
  "message": "Campo obrigatório: email",
  "value": "email"
}
```

Or multiple messages:
```json
{
  "messages": [
    {"code": "VAL001", "message": "Campo obrigatório: email", "value": "email"},
    {"code": "VAL002", "message": "Campo obrigatório: password", "value": "password"}
  ]
}
```

**Components:**
1. **ErrorEnum** — code + i18n key
2. **ErrorMessage** — response DTO (flat structure)
3. **ErrorMessages** — wrapper for multiple messages
4. **GlobalExceptionHandler** — maps exceptions → status + messages

**Validation Checklist:**
- [ ] ErrorEnum exists with codes + i18n keys
- [ ] i18n resource file exists with all enum keys
- [ ] GlobalExceptionHandler maps exceptions → HTTP status
- [ ] NEVER expose `ex.getMessage()` or stacktrace to consumer
- [ ] ALWAYS log full exception on server (`log.error(msg, throwable)`)
- [ ] Correct status codes:
  - Validation → **422** (UNPROCESSABLE_ENTITY)
  - Persistence → **500** with specific message
  - Catch-all → **500** generic
- [ ] Handler catch-all (`Exception.class`) is LAST (by specificity)
- [ ] MDC cleanup is surgical (`MDC.remove(key)`), never generic `MDC.clear()`

---

## Universal Rules (All Patterns)

### Rule 1: Never expose internal exceptions

**Severity:** 🔴 Critical (10)

```java
// ❌ WRONG
@ExceptionHandler(Exception.class)
public ResponseEntity<String> handleError(Exception ex) {
    return ResponseEntity.status(500).body(ex.getMessage());
    // Can expose: "Connection to database failed: ..."
}

// ✅ CORRECT
@ExceptionHandler(Exception.class)
public ResponseEntity<ErrorResponse> handleError(Exception ex) {
    log.error("Unexpected error", ex);  // stacktrace in log
    ErrorResponse error = ErrorResponse.of(ErrorEnum.INTERNAL_ERROR);
    return ResponseEntity.status(500).body(error);
}
```

---

### Rule 2: Correct HTTP status mapping

**Severity:** 🟡 Moderate (5)

| Error Type | Correct Status | Common Mistake |
|------------|----------------|----------------|
| Validation | 422 (UNPROCESSABLE_ENTITY) | 400, 500 |
| Not Found | 404 (NOT_FOUND) | 400, 500 |
| Conflict | 409 (CONFLICT) | 400, 500 |
| Persistence | 500 (INTERNAL_SERVER_ERROR) | 200, 400 |
| Generic | 500 (INTERNAL_SERVER_ERROR) | 200 |

---

### Rule 3: Handler ordering (specificity)

**Severity:** 🟡 Moderate (5)

```java
// ✅ CORRECT (most specific first)
@ExceptionHandler(ValidationException.class)
public ResponseEntity<?> handleValidation(ValidationException ex) { }

@ExceptionHandler(DataAccessException.class)
public ResponseEntity<?> handlePersistence(DataAccessException ex) { }

@ExceptionHandler(Exception.class)  // LAST (catch-all)
public ResponseEntity<?> handleGeneric(Exception ex) { }
```

---

## Detection Patterns

### Pattern 1: Exposing internal exceptions

```bash
# Grep for ex.getMessage() in exception handlers
grep -r "ex.getMessage()" adapters/in/http/handler/
```

**Weight:** +10 (Critical)

---

### Pattern 2: Wrong HTTP status

```bash
# Grep for wrong status mappings
grep -r "HttpStatus.INTERNAL_SERVER_ERROR" adapters/in/http/handler/ | grep -i "validation"
```

**Weight:** +5 (Moderate)

---

## Common Violations & Fixes

### Violation 1: Exposing internal exception message

**Problem:**
```java
// ❌ WRONG
@ExceptionHandler(DatabaseException.class)
public ResponseEntity<String> handleDatabase(DatabaseException ex) {
    return ResponseEntity.status(500).body(ex.getMessage());
}
```

**Fix:**
```java
// ✅ CORRECT
@ExceptionHandler(DatabaseException.class)
public ResponseEntity<ErrorResponse> handleDatabase(DatabaseException ex) {
    log.error("Database error", ex);  // full stacktrace in log
    ErrorResponse error = ErrorResponse.of(ErrorEnum.DATABASE_ERROR);
    return ResponseEntity.status(500).body(error);
}
```

---

### Violation 2: Wrong status for validation

**Problem:**
```java
// ❌ WRONG (validation returning 500)
@ExceptionHandler(ValidationException.class)
public ResponseEntity<?> handleValidation(ValidationException ex) {
    return ResponseEntity.status(500).body(...);
}
```

**Fix:**
```java
// ✅ CORRECT (validation returns 422)
@ExceptionHandler(ValidationException.class)
public ResponseEntity<?> handleValidation(ValidationException ex) {
    return ResponseEntity.status(422).body(...);  // UNPROCESSABLE_ENTITY
}
```

---

## Output Format

```
## Error Handling Validation: myservice

Pattern: <RFC 7807 / Custom>
Violations: 2

### 🔴 Critical (fix before merge)
- [GlobalExceptionHandler.java:45] Exposing ex.getMessage() to consumer (weight: +10)
  → Use error codes instead of internal exception message

### 🟡 Moderate (fix recommended)
- [GlobalExceptionHandler.java:32] Wrong status: validation returning 500 instead of 422 (weight: +5)
  → Change to UNPROCESSABLE_ENTITY (422)

### Recommendations
1. Never expose internal exceptions to API consumers
2. Fix status code mapping (validation → 422, persistence → 500)
3. Add catch-all handler (Exception.class) as LAST handler
```

---

## Commands

### Validate error handling (default)
```bash
/exception-handling src/
# Uses existing pattern or asks
```

### Validate with specific pattern
```bash
/exception-handling --pattern rfc7807 src/main/java/
```

### Generate error handling scaffold
```bash
/exception-handling --scaffold --pattern rfc7807
```

---

## References

- **rfc7807-pattern.md** — RFC 7807 implementation guide
- **custom-enum-pattern.md** — Custom enum-based implementation guide
- **validation-checklist.md** — Complete validation checklist

## Guardrails

- **Respond in English.** All output must be in English.

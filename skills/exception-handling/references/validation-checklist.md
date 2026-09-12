# Error Handling Validation Checklist

Universal validation checklist for all error handling patterns.

## Critical Rules (Blocker if violated)

### Rule 1: Never expose internal exceptions

**Severity:** 🔴 Critical (10)

- [ ] **NEVER** return `ex.getMessage()` or internal exception details to API consumers
- [ ] **NEVER** include stacktraces in API responses
- [ ] **NEVER** expose database errors, connection strings, or internal system details
- [ ] **ALWAYS** use predefined error codes/messages for consumer-facing responses

**Detection:**
```bash
# Check for ex.getMessage() in handlers
grep -r "ex.getMessage()" adapters/in/http/handler/
grep -r "ex.printStackTrace()" adapters/in/http/handler/
```

---

### Rule 2: Always log full exceptions on server

**Severity:** 🔴 Critical (8)

- [ ] **ALWAYS** log full exception with stacktrace on server side
- [ ] Use appropriate log level (ERROR for exceptions, WARN for business validation)
- [ ] Include relevant context (correlation ID, user ID, request details)
- [ ] Log BEFORE returning response to consumer

**Correct pattern:**
```java
log.error("Database error occurred while processing request {}", requestId, exception);
```

---

## Important Rules (Fix required)

### Rule 3: Correct HTTP status mapping

**Severity:** 🟡 Moderate (5)

| Error Type | Correct Status | Common Mistakes |
|------------|----------------|-----------------|
| Validation | 422 (UNPROCESSABLE_ENTITY) | 400, 500 |
| Not Found | 404 (NOT_FOUND) | 400, 500 |
| Conflict | 409 (CONFLICT) | 400, 500 |
| Unauthorized | 401 (UNAUTHORIZED) | 403, 500 |
| Forbidden | 403 (FORBIDDEN) | 401, 500 |
| Persistence/Database | 500 (INTERNAL_SERVER_ERROR) | 200, 400 |
| Generic/Unknown | 500 (INTERNAL_SERVER_ERROR) | 200, 400 |

---

### Rule 4: Handler ordering (specificity)

**Severity:** 🟡 Moderate (5)

- [ ] Order exception handlers from most specific to least specific
- [ ] Catch-all handler (`Exception.class`) must be LAST
- [ ] Framework resolves handlers by specificity (most specific wins)

**Correct order:**
```java
@ExceptionHandler(ValidationException.class)      // Most specific
public ResponseEntity<?> handleValidation(...) { }

@ExceptionHandler(DataAccessException.class)       // More specific
public ResponseEntity<?> handleDatabase(...) { }

@ExceptionHandler(Exception.class)                 // Least specific (LAST)
public ResponseEntity<?> handleGeneric(...) { }
```

---

### Rule 5: Surgical MDC cleanup

**Severity:** 🟡 Moderate (4)

- [ ] Use `MDC.remove(key)` for specific keys
- [ ] **NEVER** use `MDC.clear()` (removes everything, can affect other threads)
- [ ] Cleanup in finally block to ensure execution

**Correct pattern:**
```java
try {
    MDC.put("correlationId", correlationId);
    // process request
} finally {
    MDC.remove("correlationId");  // Surgical cleanup
}
```

---

## Pattern-Specific Rules

### RFC 7807 Pattern

- [ ] Response includes: `type`, `title`, `status`, `detail`, `instance`
- [ ] Content-Type is `application/problem+json`
- [ ] `type` is a URI (ideally resolvable)
- [ ] `status` matches HTTP status code
- [ ] `detail` is human-readable but doesn't expose internal details
- [ ] Optional: `timestamp` in ISO-8601 format

---

### Custom Enum Pattern

- [ ] ErrorEnum exists with codes + i18n keys
- [ ] messages.properties exists with all enum keys
- [ ] Error codes grouped by prefix (VAL*, BUS*, PER*, SYS*)
- [ ] Messages support parameterization ({0}, {1}, ...)
- [ ] Custom exceptions carry ErrorEnum
- [ ] Support for single and multiple error responses

---

## Detection Patterns

### Pattern 1: Exposing internal exceptions

```bash
# Grep for dangerous patterns in exception handlers
grep -r "ex.getMessage()" adapters/in/http/handler/
grep -r "ex.toString()" adapters/in/http/handler/
grep -r "printStackTrace" adapters/in/http/handler/
```

**Weight:** +10 (Critical) per occurrence

---

### Pattern 2: Wrong HTTP status

```bash
# Grep for validation errors returning 500
grep -A5 "ValidationException" adapters/in/http/handler/ | grep "500"

# Grep for database errors returning non-500
grep -A5 "DataAccessException" adapters/in/http/handler/ | grep -E "(200|400|422)"
```

**Weight:** +5 (Moderate) per occurrence

---

### Pattern 3: Generic MDC.clear()

```bash
# Check for MDC.clear() usage
grep -r "MDC.clear()" adapters/
```

**Weight:** +4 (Moderate) per occurrence

---

## Common Violations

### Violation 1: Internal exception in response

**Problem:**
```java
@ExceptionHandler(Exception.class)
public ResponseEntity<String> handleError(Exception ex) {
    return ResponseEntity.status(500).body(ex.getMessage());
    // Returns: "Connection refused: localhost:3306"
}
```

**Impact:** Exposes database configuration, potential security risk

**Fix:**
```java
@ExceptionHandler(Exception.class)
public ResponseEntity<ErrorResponse> handleError(Exception ex) {
    log.error("Unexpected error", ex);
    return ResponseEntity.status(500).body(ErrorResponse.of(ErrorEnum.INTERNAL_ERROR));
    // Returns: {"code":"SYS001","message":"Internal server error"}
}
```

---

### Violation 2: Validation returning 500

**Problem:**
```java
@ExceptionHandler(ValidationException.class)
public ResponseEntity<?> handleValidation(ValidationException ex) {
    return ResponseEntity.status(500).body(...);
}
```

**Impact:** Client can't distinguish validation errors from system errors

**Fix:**
```java
@ExceptionHandler(ValidationException.class)
public ResponseEntity<?> handleValidation(ValidationException ex) {
    return ResponseEntity.status(422).body(...);
}
```

---

### Violation 3: Missing server-side logging

**Problem:**
```java
@ExceptionHandler(Exception.class)
public ResponseEntity<?> handleError(Exception ex) {
    return ResponseEntity.status(500).body(...);
    // No logging - impossible to debug issues
}
```

**Impact:** No visibility into errors for debugging

**Fix:**
```java
@ExceptionHandler(Exception.class)
public ResponseEntity<?> handleError(Exception ex) {
    log.error("Unexpected error processing request", ex);
    return ResponseEntity.status(500).body(...);
}
```

---

## Severity Scoring

| Score | Severity | Description | Action |
|-------|----------|-------------|--------|
| 0 | ✅ Compliant | Perfect error handling | Approve |
| 1-3 | 🟢 Minor | Style improvements | Suggestion |
| 4-6 | 🟡 Moderate | Wrong status/handler order | Fix recommended |
| 7-9 | 🟠 High | Missing logging, some exposure | Block merge |
| 10+ | 🔴 Critical | Exposing internal exceptions | Block merge + security review |

---

## Output Format

```
## Error Handling Validation: myservice

Pattern: RFC 7807
Violations: 2
Severity: 🔴 Critical (Score: 15/10)

### 🔴 Critical (fix before merge)
- [GlobalExceptionHandler.java:45] Exposing ex.getMessage() to consumer (weight: +10)
  → Use error codes instead of internal exception message
- [GlobalExceptionHandler.java:32] Missing server-side logging (weight: +8)
  → Add log.error() with full exception

### 🟡 Moderate (fix recommended)
- [GlobalExceptionHandler.java:28] Wrong status: validation returning 500 (weight: +5)
  → Change to UNPROCESSABLE_ENTITY (422)

### Recommendations
1. Never expose internal exceptions to API consumers
2. Always log full exceptions on server side
3. Fix status code mapping (validation → 422, persistence → 500)
4. Order handlers by specificity (catch-all last)
```
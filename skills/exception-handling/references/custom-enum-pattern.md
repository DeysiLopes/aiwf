# Custom Enum-Based Pattern with i18n

Pattern for internationalized error messages with structured codes.

## Structure

Single error:
```json
{
  "code": "VAL001",
  "message": "Campo obrigatório: email",
  "value": "email"
}
```

Multiple errors:
```json
{
  "messages": [
    {"code": "VAL001", "message": "Campo obrigatório: email", "value": "email"},
    {"code": "VAL002", "message": "Campo obrigatório: password", "value": "password"}
  ]
}
```

## Components

### 1. ErrorEnum

```java
// core/exception/ErrorEnum.java
public enum ErrorEnum {
    
    // Validation
    FIELD_REQUIRED("VAL001", "field.required"),
    INVALID_FORMAT("VAL002", "field.format.invalid"),
    
    // Business logic
    RESOURCE_NOT_FOUND("BUS001", "resource.not.found"),
    RESOURCE_ALREADY_EXISTS("BUS002", "resource.already.exists"),
    
    // Persistence
    DATABASE_ERROR("PER001", "error.database"),
    QUERY_ERROR("PER002", "error.query"),
    
    // System
    INTERNAL_ERROR("SYS001", "error.internal");
    
    private final String code;
    private final String messageKey;
    
    ErrorEnum(String code, String messageKey) {
        this.code = code;
        this.messageKey = messageKey;
    }
    
    public String getFormattedMessage(Object... args) {
        String template = ResourceBundle
            .getBundle("messages")
            .getString(this.messageKey);
        return MessageFormat.format(template, args);
    }
    
    // getters
}
```

### 2. messages.properties

```properties
# src/main/resources/messages.properties
field.required=Campo obrigatório: {0}
field.format.invalid=Formato inválido para o campo: {0}
resource.not.found=Recurso não encontrado: {0}
resource.already.exists=Recurso já existe: {0}
error.database=Erro ao acessar banco de dados
error.query=Erro ao executar consulta
error.internal=Erro interno do servidor. Contate o suporte.
```

### 3. ErrorMessage + ErrorMessages (DTOs)

```java
// core/exception/ErrorMessage.java
@Data
@Builder
public class ErrorMessage {
    private String code;
    private String message;
    private String value;  // optional (field that caused the error)
}

// core/exception/ErrorMessages.java
@Data
public class ErrorMessages {
    private List<ErrorMessage> messages;
    
    public ErrorMessages(List<ErrorMessage> messages) {
        this.messages = messages;
    }
    
    public static ErrorMessages of(ErrorEnum errorEnum, Object... args) {
        ErrorMessage msg = ErrorMessage.builder()
            .code(errorEnum.getCode())
            .message(errorEnum.getFormattedMessage(args))
            .build();
        return new ErrorMessages(List.of(msg));
    }
    
    public static ErrorMessages of(ErrorEnum errorEnum, String value, Object... args) {
        ErrorMessage msg = ErrorMessage.builder()
            .code(errorEnum.getCode())
            .message(errorEnum.getFormattedMessage(args))
            .value(value)
            .build();
        return new ErrorMessages(List.of(msg));
    }
}
```

### 4. GlobalExceptionHandler

```java
// adapters/in/http/handler/GlobalExceptionHandler.java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorMessages> handleBusinessValidation(
        ValidationException ex) {
        
        log.warn("Business validation: {}", ex.getMessage());
        
        ErrorMessages messages = ErrorMessages.of(ex.getErrorEnum(), ex.getArgs());
        return ResponseEntity
            .status(HttpStatus.UNPROCESSABLE_ENTITY)  // 422
            .body(messages);
    }
    
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ErrorMessages> handlePersistence(
        DataAccessException ex) {
        
        log.error("Database error", ex);  // full stacktrace in log
        
        // NEVER expose ex.getMessage() to consumer
        ErrorMessages messages = ErrorMessages.of(ErrorEnum.DATABASE_ERROR);
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)  // 500
            .body(messages);
    }
    
    @ExceptionHandler(Exception.class)  // catch-all (LAST)
    public ResponseEntity<ErrorMessages> handleGeneric(Exception ex) {
        
        log.error("Unexpected error", ex);  // full stacktrace
        
        ErrorMessages messages = ErrorMessages.of(ErrorEnum.INTERNAL_ERROR);
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(messages);
    }
}
```

## Custom Business Exceptions

```java
// core/exception/BusinessValidationException.java
public class BusinessValidationException extends RuntimeException {
    
    private final ErrorEnum errorEnum;
    private final Object[] args;
    
    public BusinessValidationException(ErrorEnum errorEnum, Object... args) {
        super(errorEnum.getFormattedMessage(args));
        this.errorEnum = errorEnum;
        this.args = args;
    }
    
    public ErrorEnum getErrorEnum() {
        return errorEnum;
    }
    
    public Object[] getArgs() {
        return args;
    }
}

// Usage
throw new BusinessValidationException(
    ErrorEnum.FIELD_REQUIRED, 
    "email"
);
```

## Validation Checklist

### Required (blocking)

- [ ] **ErrorEnum exists** with codes + i18n keys
- [ ] **messages.properties exists** with all enum keys
- [ ] **GlobalExceptionHandler** maps exceptions → HTTP status
- [ ] **NEVER expose `ex.getMessage()`** or stacktrace to consumer
- [ ] **ALWAYS log** full exception on server (`log.error(msg, throwable)`)
- [ ] **Correct status codes**:
  - Validation → **422** (UNPROCESSABLE_ENTITY)
  - Persistence → **500** with specific message
  - Catch-all → **500** generic
- [ ] **Handler catch-all** (`Exception.class`) is **LAST** (by specificity)
- [ ] **MDC cleanup** is surgical (`MDC.remove(key)`), **never** generic `MDC.clear()`

### Recommended

- [ ] Codes grouped by prefix (`VAL*`, `BUS*`, `PER*`, `SYS*`)
- [ ] Messages parameterizable (`{0}`, `{1}`, ...)
- [ ] Custom exceptions carry ErrorEnum
- [ ] Support for multiple errors in single response

## Common Violations & Fixes

### Violation 1: Exposing ex.getMessage()

**Problem:**
```java
// ❌ WRONG
@ExceptionHandler(Exception.class)
public ResponseEntity<String> handleError(Exception ex) {
    return ResponseEntity.status(500).body(ex.getMessage());
}
```

**Fix:**
```java
// ✅ CORRECT
@ExceptionHandler(Exception.class)
public ResponseEntity<ErrorMessages> handleError(Exception ex) {
    log.error("Unexpected error", ex);  // stacktrace in log
    ErrorMessages messages = ErrorMessages.of(ErrorEnum.INTERNAL_ERROR);
    return ResponseEntity.status(500).body(messages);
}
```

---

### Violation 2: Wrong HTTP status

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
    return ResponseEntity.status(422).body(...);
}
```

---

### Violation 3: Generic MDC.clear()

**Problem:**
```java
// ❌ WRONG
@Component
public class CorrelationIdFilter implements Filter {
    @Override
    public void doFilter(...) {
        try {
            MDC.put(CORRELATION_ID, correlationId);
            chain.doFilter(request, response);
        } finally {
            MDC.clear();  // REMOVES EVERYTHING (can affect other contexts)
        }
    }
}
```

**Fix:**
```java
// ✅ CORRECT (surgical)
@Component
public class CorrelationIdFilter implements Filter {
    @Override
    public void doFilter(...) {
        try {
            MDC.put(CORRELATION_ID, correlationId);
            chain.doFilter(request, response);
        } finally {
            MDC.remove(CORRELATION_ID);  // removes only specific key
        }
    }
}
```

## HTTP Status Mapping

| Error Type | Status | ErrorEnum Example |
|------------|--------|-------------------|
| Validation | 422 | `FIELD_REQUIRED`, `INVALID_FORMAT` |
| Not Found | 404 | `RESOURCE_NOT_FOUND` |
| Conflict | 409 | `RESOURCE_ALREADY_EXISTS` |
| Persistence | 500 | `DATABASE_ERROR`, `QUERY_ERROR` |
| Generic | 500 | `INTERNAL_ERROR` |

## Best Practices

1. **Never expose internal exceptions** (DataAccessException, etc.) to API consumers
2. **Always log full exceptions** with stacktrace on server side
3. **Use structured error codes** for easier client handling
4. **Support i18n** for internationalized messages
5. **Group error codes by prefix** for organization (VAL*, BUS*, PER*, SYS*)
6. **Use surgical MDC cleanup** (MDC.remove(key), not MDC.clear())
7. **Order handlers by specificity** (most specific first, catch-all last)
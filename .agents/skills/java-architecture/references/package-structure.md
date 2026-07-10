# Java Package Structure Guide

Complete guide for Java/Spring Boot package structure following hexagonal DDD patterns.

## Standard Structure

```
com.example.app/
├── adapters/
│   ├── commons/
│   │   ├── config/             ← Configuration classes
│   │   │   ├── BeanConfig.java
│   │   │   ├── SecurityConfig.java
│   │   │   └── DatabaseConfig.java
│   │   └── util/               ← Utilities
│   │       ├── HeaderConstants.java
│   │       ├── DateUtil.java
│   │       └── ValidationUtil.java
│   ├── in/
│   │   ├── http/
│   │   │   ├── controller/     ← REST controllers
│   │   │   │   ├── OrderController.java
│   │   │   │   └── CustomerController.java
│   │   │   ├── dto/            ← Request/Response DTOs
│   │   │   │   ├── request/
│   │   │   │   │   ├── CreateOrderRequestDto.java
│   │   │   │   │   └── UpdateOrderRequestDto.java
│   │   │   │   └── response/
│   │   │   │       ├── OrderResponseDto.java
│   │   │   │       └── CustomerResponseDto.java
│   │   │   ├── mapper/         ← Request/Response ↔ Core mappers
│   │   │   │   ├── OrderMapper.java
│   │   │   │   └── CustomerMapper.java
│   │   │   ├── filter/         ← Filters
│   │   │   │   ├── CorrelationIdFilter.java
│   │   │   │   └── AuthenticationFilter.java
│   │   │   └── handler/        ← Exception handlers
│   │   │       └── GlobalExceptionHandler.java
│   │   └── messaging/          ← Message consumers (optional)
│   │       ├── consumer/
│   │       │   └── OrderEventConsumer.java
│   │       └── dto/
│   │           └── OrderEventDto.java
│   └── out/
│       ├── database/           ← JPA entities, repositories
│       │   ├── entity/
│       │   │   ├── OrderEntity.java
│       │   │   ├── CustomerEntity.java
│       │   │   └── OrderItemEntity.java
│       │   ├── repository/
│       │   │   ├── OrderJpaRepository.java
│       │   │   └── CustomerJpaRepository.java
│       │   ├── adapter/
│       │   │   ├── OrderRepositoryAdapter.java
│       │   │   └── CustomerRepositoryAdapter.java
│       │   └── mapper/
│       │       ├── OrderEntityMapper.java
│       │       └── CustomerEntityMapper.java
│       └── http/               ← HTTP clients
│           ├── client/
│           │   ├── PaymentGatewayClient.java
│           │   └── NotificationClient.java
│           ├── dto/
│           │   ├── PaymentRequestDto.java
│           │   └── PaymentResponseDto.java
│           └── config/
│               └── FeignConfig.java
├── core/
│   ├── model/                  ← Domain models (POJOs)
│   │   ├── Order.java
│   │   ├── Customer.java
│   │   ├── OrderItem.java
│   │   └── valueobject/
│   │       ├── Money.java
│   │       └── Email.java
│   ├── ports/
│   │   ├── in/                 ← Use case interfaces
│   │   │   ├── CreateOrderUseCasePort.java
│   │   │   ├── GetOrderUseCasePort.java
│   │   │   └── UpdateOrderUseCasePort.java
│   │   └── out/                ← Repository/Integration interfaces
│   │       ├── OrderRepositoryPort.java
│   │       ├── CustomerRepositoryPort.java
│   │       └── PaymentGatewayPort.java
│   ├── usecase/                ← Use case implementations
│   │   ├── CreateOrderUseCase.java
│   │   ├── GetOrderUseCase.java
│   │   └── UpdateOrderUseCase.java
│   ├── service/                ← Domain services (optional)
│   │   ├── OrderDomainService.java
│   │   └── PricingService.java
│   └── exception/              ← Domain exceptions
│       ├── BusinessValidationException.java
│       ├── ErrorEnum.java
│       └── ErrorResponse.java
└── Application.java            ← Main Spring Boot class
```

## Package Responsibilities

### adapters/commons/config/
Configuration classes for Spring beans, security, database, etc.

```java
@Configuration
public class BeanConfig {
    
    @Bean
    public ObjectMapper objectMapper() {
        // Custom ObjectMapper configuration
    }
}
```

### adapters/commons/util/
Utility classes shared across adapters.

```java
public final class DateUtil {
    
    public static String formatDate(LocalDateTime date) {
        // Date formatting logic
    }
}
```

### adapters/in/http/controller/
REST controllers that handle HTTP requests.

```java
@RestController
@RequestMapping("/orders")
public class OrderController {
    
    @PostMapping
    public ResponseEntity<ResponseDto<OrderDto>> create(
        @Valid @RequestBody CreateOrderRequestDto request) {
        // Handle request
    }
}
```

### adapters/in/http/dto/
Data Transfer Objects for requests and responses.

```java
@Data
public class CreateOrderRequestDto {
    @NotBlank
    private String customerId;
    
    @NotEmpty
    private List<OrderItemRequestDto> items;
}
```

### adapters/in/http/mapper/
Mappers between DTOs and domain models.

```java
public class OrderMapper {
    
    public static OrderDto toDto(Order order) {
        // Convert domain to DTO
    }
    
    public static Order toDomain(CreateOrderRequestDto dto) {
        // Convert DTO to domain
    }
}
```

### adapters/in/http/filter/
Servlet filters for cross-cutting concerns.

```java
@Component
public class CorrelationIdFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, 
                        FilterChain chain) {
        // Add correlation ID to MDC
    }
}
```

### adapters/in/http/handler/
Global exception handlers for REST controllers.

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BusinessValidationException.class)
    public ResponseEntity<ResponseDto<ErrorResponse>> handleValidation(
        BusinessValidationException ex) {
        // Handle business validation errors
    }
}
```

### adapters/out/database/
Database-related adapters including JPA entities and repositories.

```java
@Entity
@Table(name = "orders")
public class OrderEntity {
    
    @Id
    private String id;
    
    @Column(name = "customer_id")
    private String customerId;
    
    // Other fields, getters, setters
}
```

### adapters/out/http/
HTTP clients for external service integration.

```java
@FeignClient(name = "payment-gateway", url = "${payment.gateway.url}")
public interface PaymentGatewayClient {
    
    @PostMapping("/payments")
    PaymentResponseDto processPayment(@RequestBody PaymentRequestDto request);
}
```

### core/model/
Domain models (entities, value objects) - framework-free.

```java
public class Order {
    
    private final String id;
    private final Customer customer;
    private final List<OrderItem> items;
    private OrderStatus status;
    
    // Business methods
    public void complete() {
        this.status = OrderStatus.COMPLETED;
    }
    
    // Getters only (immutable)
}
```

### core/ports/in/
Interfaces for use cases (inbound ports).

```java
public interface CreateOrderUseCasePort {
    Order create(CreateOrderCommand command);
}
```

### core/ports/out/
Interfaces for repositories and integrations (outbound ports).

```java
public interface OrderRepositoryPort {
    Order save(Order order);
    Optional<Order> findById(String id);
}
```

### core/usecase/
Implementations of use case ports.

```java
@Component
@RequiredArgsConstructor
public class CreateOrderUseCase implements CreateOrderUseCasePort {
    
    private final OrderRepositoryPort orderRepository;
    
    @Override
    @Transactional
    public Order create(CreateOrderCommand command) {
        // Business logic
    }
}
```

### core/exception/
Domain exceptions and error handling.

```java
public class BusinessValidationException extends RuntimeException {
    
    private final ErrorEnum errorEnum;
    private final Object[] args;
    
    // Constructor, getters
}
```

## Layer Dependencies

```
adapters → core (allowed)
core → (nothing) (framework-free)
adapters → adapters (allowed, but minimize)
```

## Validation Rules

- [ ] Core layer has no framework dependencies
- [ ] Core doesn't import from adapters
- [ ] Ports are interfaces
- [ ] Controllers use DTOs, not domain models directly
- [ ] Mappers handle conversions between layers
- [ ] Exceptions are handled in GlobalExceptionHandler
- [ ] Configuration is in adapters/commons/config

## Common Mistakes

### Mistake 1: Framework annotations in core

```java
// ❌ WRONG
@Entity
public class Order {
    @Id
    private String id;
}

// ✅ CORRECT
public class Order {
    private final String id;
}
```

### Mistake 2: Core depending on adapters

```java
// ❌ WRONG
package com.example.app.core.usecase;
import com.example.app.adapters.out.database.OrderEntity;

// ✅ CORRECT
package com.example.app.core.usecase;
import com.example.app.core.model.Order;
```

### Mistake 3: Business logic in controllers

```java
// ❌ WRONG
@RestController
public class OrderController {
    
    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateOrderRequestDto dto) {
        // Business logic should NOT be here
        if (dto.getItems().isEmpty()) {
            throw new ValidationException("Items required");
        }
    }
}

// ✅ CORRECT
@RestController
public class OrderController {
    
    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateOrderRequestDto dto) {
        // Delegate to use case
        Order order = createOrderUseCase.create(dto.toDomain());
        return ResponseEntity.ok(OrderMapper.toDto(order));
    }
}
```
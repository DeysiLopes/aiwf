# Java Naming Conventions

Complete naming conventions for Java/Spring Boot hexagonal architecture.

## Core Layer

### Domain Models

| Pattern | Example | Description |
|---------|---------|-------------|
| `<Noun>` | `Order`, `Customer`, `Product` | Domain entity |
| `<Noun>VO` | `MoneyVO`, `EmailVO`, `AddressVO` | Value object |

```java
// Entity
public class Order {
    private final String id;
    private final Customer customer;
    // ...
}

// Value Object
public class MoneyVO {
    private final BigDecimal amount;
    private final String currency;
    // ...
}
```

### Domain Services

| Pattern | Example | Description |
|---------|---------|-------------|
| `<Noun>DomainService` | `OrderDomainService`, `PricingDomainService` | Domain service |

```java
@Service
public class OrderDomainService {
    
    public Money calculateTotal(Order order) {
        // Domain logic
    }
}
```

### Domain Exceptions

| Pattern | Example | Description |
|---------|---------|-------------|
| `<Noun>Exception` | `BusinessValidationException`, `OrderNotFoundException` | Domain exception |

```java
public class BusinessValidationException extends RuntimeException {
    
    private final ErrorEnum errorEnum;
    private final Object[] args;
    // ...
}
```

---

## Ports Layer

### Inbound Ports (Use Cases)

| Pattern | Example | Description |
|---------|---------|-------------|
| `<Verb><Noun>UseCasePort` | `CreateOrderUseCasePort`, `GetOrderUseCasePort` | Use case interface |

```java
public interface CreateOrderUseCasePort {
    Order create(CreateOrderCommand command);
}
```

### Outbound Ports (Repositories)

| Pattern | Example | Description |
|---------|---------|-------------|
| `<Noun>RepositoryPort` | `OrderRepositoryPort`, `CustomerRepositoryPort` | Repository interface |

```java
public interface OrderRepositoryPort {
    Order save(Order order);
    Optional<Order> findById(String id);
}
```

### Outbound Ports (Integrations)

| Pattern | Example | Description |
|---------|---------|-------------|
| `<System>Port` | `PaymentGatewayPort`, `NotificationPort` | Integration interface |

```java
public interface PaymentGatewayPort {
    PaymentResult process(Payment payment);
}
```

---

## Use Case Layer

### Use Case Implementations

| Pattern | Example | Description |
|---------|---------|-------------|
| `<Verb><Noun>UseCase` | `CreateOrderUseCase`, `GetOrderUseCase` | Use case implementation |

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

### Commands

| Pattern | Example | Description |
|---------|---------|-------------|
| `<Verb><Noun>Command` | `CreateOrderCommand`, `UpdateOrderCommand` | Command object |

```java
@Data
public class CreateOrderCommand {
    private String customerId;
    private List<OrderItem> items;
}
```

---

## Adapters Layer

### Controllers

| Pattern | Example | Description |
|---------|---------|-------------|
| `<Noun>Controller` | `OrderController`, `CustomerController` | REST controller |

```java
@RestController
@RequestMapping("/orders")
public class OrderController {
    
    @PostMapping
    public ResponseEntity<ResponseDto<OrderDto>> create(
        @Valid @RequestBody CreateOrderRequestDto request) {
        // ...
    }
}
```

### DTOs

| Pattern | Example | Description |
|---------|---------|-------------|
| `<Verb><Noun>RequestDto` | `CreateOrderRequestDto`, `UpdateOrderRequestDto` | Request DTO |
| `<Noun>ResponseDto` | `OrderResponseDto`, `CustomerResponseDto` | Response DTO |

```java
@Data
public class CreateOrderRequestDto {
    @NotBlank
    private String customerId;
    
    @NotEmpty
    private List<OrderItemRequestDto> items;
}
```

### Mappers

| Pattern | Example | Description |
|---------|---------|-------------|
| `<Noun>Mapper` | `OrderMapper`, `CustomerMapper` | Mapper class |

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

### Filters

| Pattern | Example | Description |
|---------|---------|-------------|
| `<Noun>Filter` | `CorrelationIdFilter`, `AuthenticationFilter` | Servlet filter |

```java
@Component
public class CorrelationIdFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, 
                        FilterChain chain) {
        // Filter logic
    }
}
```

### Exception Handlers

| Pattern | Example | Description |
|---------|---------|-------------|
| `GlobalExceptionHandler` | `GlobalExceptionHandler` | Global exception handler |

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BusinessValidationException.class)
    public ResponseEntity<ResponseDto<ErrorResponse>> handleValidation(
        BusinessValidationException ex) {
        // Handle exception
    }
}
```

---

## Database Adapters

### JPA Entities

| Pattern | Example | Description |
|---------|---------|-------------|
| `<Noun>Entity` | `OrderEntity`, `CustomerEntity` | JPA entity |

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

### JPA Repositories

| Pattern | Example | Description |
|---------|---------|-------------|
| `<Noun>JpaRepository` | `OrderJpaRepository`, `CustomerJpaRepository` | Spring Data JPA repository |

```java
public interface OrderJpaRepository extends JpaRepository<OrderEntity, String> {
    
    List<OrderEntity> findByCustomerId(String customerId);
}
```

### Repository Adapters

| Pattern | Example | Description |
|---------|---------|-------------|
| `<Noun>RepositoryAdapter` | `OrderRepositoryAdapter`, `CustomerRepositoryAdapter` | Repository adapter |

```java
@Component
@RequiredArgsConstructor
public class OrderRepositoryAdapter implements OrderRepositoryPort {
    
    private final OrderJpaRepository jpaRepository;
    private final OrderEntityMapper mapper;
    
    @Override
    public Order save(Order order) {
        OrderEntity entity = mapper.toEntity(order);
        OrderEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }
}
```

### Entity Mappers

| Pattern | Example | Description |
|---------|---------|-------------|
| `<Noun>EntityMapper` | `OrderEntityMapper`, `CustomerEntityMapper` | Entity mapper |

```java
public class OrderEntityMapper {
    
    public static OrderEntity toEntity(Order order) {
        // Convert domain to entity
    }
    
    public static Order toDomain(OrderEntity entity) {
        // Convert entity to domain
    }
}
```

---

## HTTP Clients

### Feign Clients

| Pattern | Example | Description |
|---------|---------|-------------|
| `<System>Client` | `PaymentGatewayClient`, `NotificationClient` | Feign client |

```java
@FeignClient(name = "payment-gateway", url = "${payment.gateway.url}")
public interface PaymentGatewayClient {
    
    @PostMapping("/payments")
    PaymentResponseDto processPayment(@RequestBody PaymentRequestDto request);
}
```

### Client DTOs

| Pattern | Example | Description |
|---------|---------|-------------|
| `<Noun>RequestDto` | `PaymentRequestDto` | Client request DTO |
| `<Noun>ResponseDto` | `PaymentResponseDto` | Client response DTO |

```java
@Data
public class PaymentRequestDto {
    private String orderId;
    private Money amount;
    private String paymentMethod;
}
```

---

## Configuration

### Configuration Classes

| Pattern | Example | Description |
|---------|---------|-------------|
| `<Noun>Config` | `BeanConfig`, `SecurityConfig`, `DatabaseConfig` | Configuration class |

```java
@Configuration
public class BeanConfig {
    
    @Bean
    public ObjectMapper objectMapper() {
        // Custom configuration
    }
}
```

---

## Utilities

| Pattern | Example | Description |
|---------|---------|-------------|
| `<Noun>Util` | `DateUtil`, `ValidationUtil`, `StringUtil` | Utility class |

```java
public final class DateUtil {
    
    public static String formatDate(LocalDateTime date) {
        // Date formatting logic
    }
}
```

### Constants

| Pattern | Example | Description |
|---------|---------|-------------|
| `<Noun>Constants` | `HeaderConstants`, `MessageConstants` | Constants class |

```java
public final class HeaderConstants {
    
    public static final String CORRELATION_ID = "X-Correlation-ID";
    public static final String AUTHORIZATION = "Authorization";
    
    private HeaderConstants() {
        // Private constructor
    }
}
```

---

## General Rules

1. **Class names**: PascalCase (`OrderController`)
2. **Method names**: camelCase (`getById`, `createOrder`)
3. **Constant names**: UPPER_SNAKE_CASE (`CORRELATION_ID`)
4. **Package names**: lowercase with dots (`com.example.app.core.model`)
5. **Interface names**: Same as classes, or with `I` prefix if preferred
6. **Test classes**: `<ClassName>Test` (`OrderControllerTest`)
7. **Test methods**: `should<ExpectedBehavior>_<State>` (`shouldCreateOrder_WhenValidRequest`)

## Validation Checklist

- [ ] Classes use PascalCase
- [ ] Methods use camelCase
- [ ] Constants use UPPER_SNAKE_CASE
- [ ] Packages use lowercase
- [ ] Controllers end with `Controller`
- [ ] DTOs end with `RequestDto` or `ResponseDto`
- [ ] Mappers end with `Mapper`
- [ ** Ports end with `Port`
- [ ] Use cases end with `UseCase`
- [ ] Entities end with `Entity`
- [ ] Exceptions end with `Exception`
---
name: java-architecture
description: "Java/Spring Boot architecture guide following hexagonal DDD patterns. Includes package structure, naming conventions, and configuration patterns. Use when planning, implementing, or reviewing Java/Spring Boot services."
argument-hint: "--target <path> --framework <spring-boot|quarkus|micronaut>"
---

# Java/Spring Boot Architecture Guide

Guide for **Java/Spring Boot architecture** following hexagonal DDD patterns. Defines package structure, naming conventions, and configuration patterns for services.

## Architecture Overview

This guide combines **hexagonal architecture (DDD)** with **Spring Boot best practices**:

- **Core layer**: Pure business logic, framework-free
- **Adapters layer**: Framework-specific implementations
- **Ports layer**: Interfaces between core and adapters
- **Clear separation**: Core doesn't depend on adapters

---

## Package Structure

### Standard Spring Boot Structure

```
com.example.app/
├── adapters/
│   ├── commons/
│   │   ├── config/             ← Configuration classes
│   │   └── util/               ← Utilities (constants, helpers)
│   ├── in/
│   │   ├── http/
│   │   │   ├── controller/     ← REST controllers
│   │   │   ├── dto/            ← Request/Response DTOs
│   │   │   ├── mapper/         ← Request/Response ↔ Core mappers
│   │   │   ├── filter/         ← Filters (correlation ID, auth)
│   │   │   └── handler/        ← Exception handlers
│   │   └── messaging/          ← Message consumers (optional)
│   └── out/
│       ├── database/           ← JPA entities, repositories
│       └── http/               ← HTTP clients (Feign, RestTemplate)
├── core/
│   ├── model/                  ← Domain models (POJOs)
│   ├── ports/
│   │   ├── in/                 ← Use case interfaces
│   │   └── out/                ← Repository/Integration interfaces
│   ├── usecase/                ← Use case implementations
│   └── exception/              ← Domain exceptions
└── Application.java            ← Main Spring Boot class
```

---

## Core Layer Rules

### Framework-Free Core

**Critical:** Core layer must be free of framework dependencies:

- ❌ No Spring annotations (`@Service`, `@Component`, `@Autowired`)
- ❌ No JPA annotations (`@Entity`, `@Table`, `@Column`)
- ❌ No Jackson annotations (`@JsonProperty`, `@JsonIgnore`)
- ❌ No HTTP-specific classes (`HttpServletRequest`, `HttpServletResponse`)
- ✅ Pure POJOs with business logic
- ✅ Interfaces for ports
- ✅ Domain-specific exceptions

**Example:**
```java
// ✅ CORRECT - Framework-free
package com.example.app.core.model;

public class Order {
    private final String id;
    private final Customer customer;
    private final List<OrderItem> items;
    private OrderStatus status;
    
    public Order(String id, Customer customer, List<OrderItem> items) {
        this.id = id;
        this.customer = customer;
        this.items = items;
        this.status = OrderStatus.PENDING;
    }
    
    public void complete() {
        // Business logic
        this.status = OrderStatus.COMPLETED;
    }
    
    // Getters only (no setters for immutability)
}
```

---

## Adapters Layer

### Inbound Adapters (Input)

#### Controllers

```java
// adapters/in/http/controller/OrderController.java
@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {
    
    private final CreateOrderUseCasePort createOrderUseCase;
    private final GetOrderUseCasePort getOrderUseCase;
    
    @PostMapping
    public ResponseEntity<ResponseDto<OrderDto>> create(
        @Valid @RequestBody CreateOrderRequestDto request) {
        
        Order order = createOrderUseCase.create(request.toDomain());
        OrderDto response = OrderMapper.toDto(order);
        
        return ResponseEntity.ok(new ResponseDto<>(response));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ResponseDto<OrderDto>> getById(@PathVariable String id) {
        Order order = getOrderUseCase.getById(id);
        OrderDto response = OrderMapper.toDto(order);
        
        return ResponseEntity.ok(new ResponseDto<>(response));
    }
}
```

#### DTOs

```java
// adapters/in/http/dto/CreateOrderRequestDto.java
@Data
public class CreateOrderRequestDto {
    @NotBlank
    private String customerId;
    
    @NotEmpty
    private List<OrderItemRequestDto> items;
    
    public Order toDomain() {
        // Convert to domain model
        return Order.builder()
            .customerId(customerId)
            .items(items.stream()
                .map(OrderItemRequestDto::toDomain)
                .collect(Collectors.toList()))
            .build();
    }
}
```

#### Mappers

```java
// adapters/in/http/mapper/OrderMapper.java
public class OrderMapper {
    
    public static OrderDto toDto(Order order) {
        return OrderDto.builder()
            .id(order.getId())
            .customerId(order.getCustomer().getId())
            .items(order.getItems().stream()
                .map(OrderItemMapper::toDto)
                .collect(Collectors.toList()))
            .status(order.getStatus().name())
            .build();
    }
    
    public static Order toDomain(CreateOrderRequestDto dto) {
        // Conversion logic
    }
}
```

#### Exception Handlers

```java
// adapters/in/http/handler/GlobalExceptionHandler.java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BusinessValidationException.class)
    public ResponseEntity<ResponseDto<ErrorResponse>> handleValidation(
        BusinessValidationException ex) {
        
        log.warn("Business validation: {}", ex.getMessage());
        
        ErrorResponse error = ErrorResponse.of(ex.getErrorEnum(), ex.getArgs());
        return ResponseEntity
            .status(HttpStatus.UNPROCESSABLE_ENTITY)
            .body(new ResponseDto<>(error));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseDto<ErrorResponse>> handleGeneric(Exception ex) {
        
        log.error("Unexpected error", ex);
        
        ErrorResponse error = ErrorResponse.of(ErrorEnum.INTERNAL_ERROR);
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ResponseDto<>(error));
    }
}
```

### Outbound Adapters (Output)

#### Database Adapter

```java
// adapters/out/database/OrderRepositoryAdapter.java
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
    
    @Override
    public Optional<Order> findById(String id) {
        return jpaRepository.findById(id)
            .map(mapper::toDomain);
    }
}
```

#### HTTP Client Adapter

```java
// adapters/out/http/PaymentGatewayClient.java
@FeignClient(name = "payment-gateway", url = "${payment.gateway.url}")
public interface PaymentGatewayClient {
    
    @PostMapping("/payments")
    PaymentResponseDto processPayment(@RequestBody PaymentRequestDto request);
    
    @GetMapping("/payments/{id}")
    PaymentResponseDto getPaymentStatus(@PathVariable String id);
}
```

---

## Ports Layer

### Inbound Ports (Use Cases)

```java
// core/ports/in/CreateOrderUseCasePort.java
public interface CreateOrderUseCasePort {
    Order create(CreateOrderCommand command);
}

// core/ports/in/GetOrderUseCasePort.java
public interface GetOrderUseCasePort {
    Order getById(String id);
    List<Order> getByCustomerId(String customerId);
}
```

### Outbound Ports (Repositories)

```java
// core/ports/out/OrderRepositoryPort.java
public interface OrderRepositoryPort {
    Order save(Order order);
    Optional<Order> findById(String id);
    List<Order> findByCustomerId(String customerId);
    void delete(String id);
}
```

---

## Use Case Implementations

```java
// core/usecase/CreateOrderUseCase.java
@Component
@RequiredArgsConstructor
public class CreateOrderUseCase implements CreateOrderUseCasePort {
    
    private final OrderRepositoryPort orderRepository;
    private final CustomerRepositoryPort customerRepository;
    private final PaymentGatewayPort paymentGateway;
    
    @Override
    @Transactional
    public Order create(CreateOrderCommand command) {
        // Business logic
        Customer customer = customerRepository.findById(command.getCustomerId())
            .orElseThrow(() -> new BusinessValidationException(
                ErrorEnum.CUSTOMER_NOT_FOUND, 
                command.getCustomerId()
            ));
        
        Order order = Order.create(command, customer);
        
        // Process payment
        PaymentResult payment = paymentGateway.process(order.getPayment());
        
        if (!payment.isApproved()) {
            throw new BusinessValidationException(
                ErrorEnum.PAYMENT_DECLINED,
                payment.getReason()
            );
        }
        
        order.markAsPaid();
        return orderRepository.save(order);
    }
}
```

---

## Configuration Patterns

### Application Configuration

```java
// adapters/commons/config/BeanConfig.java
@Configuration
public class BeanConfig {
    
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }
    
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

### Application Properties

```yaml
# application.yml
spring:
  application:
    name: myservice
  datasource:
    url: ${DATABASE_URL}
    username: ${DATABASE_USERNAME}
    password: ${DATABASE_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false

server:
  port: 8080

payment:
  gateway:
    url: ${PAYMENT_GATEWAY_URL}
```

---

## Naming Conventions

| Element | Pattern | Example |
|---------|---------|---------|
| Controller | `<Noun>Controller` | `OrderController` |
| DTO | `<Noun>RequestDto`, `<Noun>ResponseDto` | `CreateOrderRequestDto` |
| Mapper | `<Noun>Mapper` | `OrderMapper` |
| Use Case Port | `<Verb><Noun>UseCasePort` | `CreateOrderUseCasePort` |
| Use Case Impl | `<Verb><Noun>UseCase` | `CreateOrderUseCase` |
| Repository Port | `<Noun>RepositoryPort` | `OrderRepositoryPort` |
| Repository Adapter | `<Noun>RepositoryAdapter` | `OrderRepositoryAdapter` |
| Entity | `<Noun>Entity` | `OrderEntity` |
| Domain Model | `<Noun>` | `Order` |
| Exception | `<Noun>Exception` | `BusinessValidationException` |

---

## Best Practices

### 1. Dependency Injection

Use constructor injection with Lombok's `@RequiredArgsConstructor`:

```java
@Component
@RequiredArgsConstructor
public class CreateOrderUseCase {
    private final OrderRepositoryPort orderRepository;
    private final CustomerRepositoryPort customerRepository;
}
```

### 2. Immutability

Make domain models immutable:

```java
public class Order {
    private final String id;
    private final Customer customer;
    private final List<OrderItem> items;
    
    // Only getters, no setters
}
```

### 3. Validation

Use `@Valid` for request validation:

```java
@PostMapping
public ResponseEntity<?> create(@Valid @RequestBody CreateOrderRequestDto request) {
    // ...
}
```

### 4. Transaction Management

Use `@Transactional` on use case methods:

```java
@Override
@Transactional
public Order create(CreateOrderCommand command) {
    // ...
}
```

### 5. Logging

Use SLF4J with appropriate log levels:

```java
@Slf4j
@Component
public class CreateOrderUseCase {
    
    public Order create(CreateOrderCommand command) {
        log.info("Creating order for customer: {}", command.getCustomerId());
        // ...
        log.debug("Order created with ID: {}", order.getId());
    }
}
```

---

## Commands

### Validate Java architecture
```bash
/java-architecture src/
# Validates package structure, naming conventions
```

### Generate Java service scaffold
```bash
/java-architecture --scaffold --name myservice
# Generates complete Spring Boot project structure
```

### Validate specific framework
```bash
/java-architecture --framework spring-boot src/
# Validates Spring Boot specific patterns
```

---

## References

- **package-structure.md** — Detailed package structure guide
- **naming-conventions.md** — Complete naming conventions
- **configuration-patterns.md** — Configuration best practices

## Guardrails

- **Respond in English.** All output must be in English.

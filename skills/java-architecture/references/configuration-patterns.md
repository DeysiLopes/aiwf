# Configuration Patterns Guide

Best practices for Java/Spring Boot configuration in hexagonal architecture.

## Bean Configuration

### Standard Bean Configuration

```java
// adapters/commons/config/BeanConfig.java
@Configuration
public class BeanConfig {
    
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        return mapper;
    }
    
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
    
    @Bean
    public Validator validator() {
        return new LocalValidatorFactoryBean();
    }
}
```

### Database Configuration

```java
// adapters/commons/config/DatabaseConfig.java
@Configuration
@EnableJpaRepositories(basePackages = "com.example.app.adapters.out.database.repository")
public class DatabaseConfig {
    
    @Bean
    public DataSource dataSource(
        @Value("${spring.datasource.url}") String url,
        @Value("${spring.datasource.username}") String username,
        @Value("${spring.datasource.password}") String password) {
        
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(url);
        config.setUsername(username);
        config.setPassword(password);
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(5);
        return new HikariDataSource(config);
    }
    
    @Bean
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(
        DataSource dataSource) {
        
        LocalContainerEntityManagerFactoryBean em = 
            new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(dataSource);
        em.setPackagesToScan("com.example.app.adapters.out.database.entity");
        em.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
        
        Properties properties = new Properties();
        properties.setProperty("hibernate.ddl-auto", "validate");
        properties.setProperty("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");
        properties.setProperty("hibernate.show_sql", "false");
        em.setJpaProperties(properties);
        
        return em;
    }
}
```

### Security Configuration

```java
// adapters/commons/config/SecurityConfig.java
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().authenticated())
            .addFilterBefore(jwtAuthenticationFilter, 
                UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(
        AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
```

### Feign Configuration

```java
// adapters/out/http/config/FeignConfig.java
@Configuration
public class FeignConfig {
    
    @Bean
    public RequestInterceptor requestInterceptor() {
        return template -> {
            // Add correlation ID
            String correlationId = MDC.get("correlationId");
            if (correlationId != null) {
                template.header("X-Correlation-ID", correlationId);
            }
            
            // Add authentication
            String authToken = getAuthToken();
            if (authToken != null) {
                template.header("Authorization", "Bearer " + authToken);
            }
        };
    }
    
    @Bean
    public ErrorDecoder errorDecoder() {
        return new CustomErrorDecoder();
    }
    
    @Bean
    public Logger.Level feignLoggerLevel() {
        return Logger.Level.BASIC;
    }
}
```

---

## Application Properties

### application.yml

```yaml
# application.yml
spring:
  application:
    name: myservice
  
  profiles:
    active: ${ENVIRONMENT:dev}
  
  datasource:
    url: ${DATABASE_URL:jdbc:postgresql://localhost:5432/mydb}
    username: ${DATABASE_USERNAME:postgres}
    password: ${DATABASE_PASSWORD:password}
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 30000
  
  jpa:
    hibernate:
      ddl-auto: ${DDL_AUTO:validate}
    show-sql: ${SHOW_SQL:false}
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
  
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB

server:
  port: ${SERVER_PORT:8080}
  compression:
    enabled: true
  tomcat:
    threads:
      max: 200
      min-spare: 10

# Application-specific properties
payment:
  gateway:
    url: ${PAYMENT_GATEWAY_URL:http://localhost:8081}
    timeout: 5000
    retry-attempts: 3

notification:
  service:
    url: ${NOTIFICATION_SERVICE_URL:http://localhost:8082}
    enabled: ${NOTIFICATION_ENABLED:true}

logging:
  level:
    com.example.app: ${LOG_LEVEL:INFO}
    org.springframework.web: INFO
    org.hibernate.SQL: ${SHOW_SQL:false}
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
  file:
    name: logs/application.log
```

### application-dev.yml

```yaml
# application-dev.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/mydb_dev
    username: postgres
    password: password
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

logging:
  level:
    com.example.app: DEBUG
    org.springframework.web: DEBUG
    org.hibernate.SQL: DEBUG
```

### application-prod.yml

```yaml
# application-prod.yml
spring:
  datasource:
    url: ${DATABASE_URL}
    username: ${DATABASE_USERNAME}
    password: ${DATABASE_PASSWORD}
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false

logging:
  level:
    com.example.app: INFO
    org.springframework.web: WARN
    org.hibernate.SQL: WARN
  file:
    name: /var/log/myservice/application.log
```

---

## Environment Variables

### Required Environment Variables

```bash
# Database
DATABASE_URL=jdbc:postgresql://prod-db:5432/mydb
DATABASE_USERNAME=appuser
DATABASE_PASSWORD=secretpassword

# External Services
PAYMENT_GATEWAY_URL=https://payment-gateway.example.com
NOTIFICATION_SERVICE_URL=https://notification.example.com
NOTIFICATION_ENABLED=true

# Server
SERVER_PORT=8080

# Environment
ENVIRONMENT=prod

# Logging
LOG_LEVEL=INFO
SHOW_SQL=false
```

### Optional Environment Variables

```bash
# Connection Pool
DATABASE_POOL_SIZE=10
DATABASE_MIN_IDLE=5

# Timeouts
PAYMENT_GATEWAY_TIMEOUT=5000

# Retry
PAYMENT_GATEWAY_RETRY_ATTEMPTS=3
```

---

## Configuration Properties

### Type-Safe Configuration

```java
// adapters/commons/config/properties/PaymentGatewayProperties.java
@ConfigurationProperties(prefix = "payment.gateway")
@Data
public class PaymentGatewayProperties {
    
    private String url;
    private int timeout = 5000;
    private int retryAttempts = 3;
    private boolean enabled = true;
}
```

```java
// Enable configuration properties
@Configuration
@EnableConfigurationProperties(PaymentGatewayProperties.class)
public class PropertyConfig {
    
    @Bean
    public PaymentGatewayClient paymentGatewayClient(
        PaymentGatewayProperties properties) {
        
        return Feign.builder()
            .options(new Request.Options(properties.getTimeout(), TimeUnit.MILLISECONDS))
            .target(PaymentGatewayClient.class, properties.getUrl());
    }
}
```

---

## Profiles

### Profile-Specific Configuration

```java
// adapters/commons/config/DevConfig.java
@Profile("dev")
@Configuration
public class DevConfig {
    
    @Bean
    public DataSource devDataSource() {
        return new EmbeddedDatabaseBuilder()
            .setType(EmbeddedDatabaseType.H2)
            .addScript("schema.sql")
            .addScript("data.sql")
            .build();
    }
}
```

```java
// adapters/commons/config/ProdConfig.java
@Profile("prod")
@Configuration
public class ProdConfig {
    
    @Bean
    public DataSource prodDataSource(
        @Value("${DATABASE_URL}") String url,
        @Value("${DATABASE_USERNAME}") String username,
        @Value("${DATABASE_PASSWORD}") String password) {
        
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(url);
        config.setUsername(username);
        config.setPassword(password);
        config.setMaximumPoolSize(20);
        config.setMinimumIdle(10);
        return new HikariDataSource(config);
    }
}
```

---

## Best Practices

### 1. Externalize Configuration

❌ **Hardcoded values:**
```java
@Component
public class PaymentService {
    private static final String GATEWAY_URL = "http://localhost:8081";
}
```

✅ **Externalized configuration:**
```java
@Component
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentGatewayProperties properties;
}
```

### 2. Use Profiles for Environments

```yaml
# application.yml
spring:
  profiles:
    active: ${ENVIRONMENT:dev}

---
# application-dev.yml
spring:
  config:
    activate:
      on-profile: dev
  datasource:
    url: jdbc:h2:mem:devdb

---
# application-prod.yml
spring:
  config:
    activate:
      on-profile: prod
  datasource:
    url: ${DATABASE_URL}
```

### 3. Validate Configuration

```java
@Configuration
@EnableConfigurationProperties(PaymentGatewayProperties.class)
public class PropertyConfig {
    
    @Bean
    public PaymentGatewayProperties paymentGatewayProperties() {
        PaymentGatewayProperties properties = new PaymentGatewayProperties();
        // Validate required fields
        if (properties.getUrl() == null) {
            throw new IllegalStateException("Payment gateway URL is required");
        }
        return properties;
    }
}
```

### 4. Use @ConfigurationProperties

```java
@ConfigurationProperties(prefix = "app")
@Data
@Validated
public class AppProperties {
    
    @NotBlank
    private String name;
    
    @Min(1024)
    @Max(65535)
    private int port;
    
    @Valid
    private DatabaseProperties database;
    
    @Data
    public static class DatabaseProperties {
        
        @NotBlank
        private String url;
        
        @Min(1)
        @Max(100)
        private int poolSize = 10;
    }
}
```

### 5. Sensitive Data Handling

❌ **Never log sensitive data:**
```java
log.info("Connecting to database with password: {}", password);
```

✅ **Use placeholders:**
```java
log.info("Connecting to database: {}", url);
log.debug("Database configuration loaded");
```

---

## Validation Checklist

- [ ] Configuration is externalized (not hardcoded)
- [ ] Environment-specific profiles exist
- [ ] Sensitive data is in environment variables
- [ ] Database connection pooling is configured
- [ ] Logging levels are appropriate per environment
- [ ] Timeouts and retries are configured for external services
- [ ] Configuration is validated at startup
- [ ] Default values are provided for optional settings
- [ ] Sensitive data is never logged
- [ ] Configuration properties use type-safe binding
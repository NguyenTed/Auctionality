# Monitoring and Logging Implementation

This document describes the monitoring and logging features implemented in the Auctionality backend.

## Overview

The system implements comprehensive logging and monitoring capabilities as required by the proposal:

- **User Audit Logging**: Tracks all user actions with IP address and user agent
- **Product Moderation Logging**: Tracks admin actions on products
- **Application Logging**: Structured logging with file rotation
- **Monitoring**: Spring Boot Actuator endpoints for health checks and metrics

## 1. User Audit Logging

### Purpose

Track user actions for security, compliance, and debugging purposes.

### Implementation

**Model**: `UserAuditLog`

- Stores: user ID, action type, IP address, user agent, timestamp
- Database table: `user_audit_log`

**Service**: `AuditLogService`

- Asynchronously logs user actions
- Automatically extracts IP address and user agent from HTTP requests
- Handles proxy headers (X-Forwarded-For, X-Real-IP)

### Logged Actions

The following user actions are automatically logged:

- `REGISTER` - User registration
- `LOGIN` - User login
- `CHANGE_PASSWORD` - Password changes
- Additional actions can be added as needed

### Usage Example

```java
@Autowired
private AuditLogService auditLogService;

// Log a user action
auditLogService.logUserAction(user, "LOGIN");
```

### Querying Audit Logs

```java
// Get audit logs for a user
Page<UserAuditLog> logs = auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

// Get audit logs by action type
List<UserAuditLog> loginLogs = auditLogRepository.findByUserIdAndActionOrderByCreatedAtDesc(userId, "LOGIN");
```

## 2. Product Moderation Logging

### Purpose

Track admin actions on products (removal, takedown, etc.) for accountability.

### Implementation

**Model**: `ProductModeration`

- Stores: product ID, admin ID, action type, reason, timestamp
- Database table: `product_moderation`

**Service**: `ProductModerationService`

- Asynchronously logs product moderation actions
- Supports actions: `REMOVE`, `TAKE_DOWN`, `RESTORE`

### Logged Actions

- `REMOVE` - Product permanently deleted by admin
- `TAKE_DOWN` - Product suspended/taken down by admin

### Usage Example

```java
@Autowired
private ProductModerationService productModerationService;

// Log a moderation action
productModerationService.logModerationAction(product, admin, "TAKE_DOWN", "Violates terms of service");
```

### Querying Moderation Logs

```java
// Get moderation history for a product
List<ProductModeration> history = productModerationService.getModerationHistory(productId);

// Get moderation history for an admin
Page<ProductModeration> adminHistory = productModerationService.getModerationHistoryByAdmin(adminId, pageable);
```

## 3. Application Logging

### Configuration

**Logback Configuration**: `logback-spring.xml`

### Features

1. **Multiple Appenders**:

   - **Console**: Outputs to console (development)
   - **File**: All logs written to `logs/auctionality.log`
   - **Error File**: ERROR level logs written to `logs/auctionality-error.log`

2. **Log Rotation**:

   - Files rotated daily and by size (10MB max per file)
   - Compressed archives (gzip)
   - Retention: 30 days for all logs, 500MB total for error logs, 1GB total for all logs

3. **Log Levels**:

   - Application code: `INFO` (default), `DEBUG` (development)
   - Spring Security: `WARN`
   - Hibernate: `WARN`
   - Spring Web: `INFO`

4. **Profile-Specific**:
   - **Development**: More verbose logging (DEBUG level)
   - **Production**: Reduced logging (WARN level for root)

### Log Format

```
2025-12-30 23:30:41.631 [http-nio-8081-exec-1] INFO  c.t.a.service.AuthService - Login attempt for email: user@example.com
```

### Log File Locations

- All logs: `logs/auctionality.log`
- Error logs: `logs/auctionality-error.log`
- Archived logs: `logs/auctionality.log.2025-12-30.0.gz`

## 4. Monitoring with Spring Boot Actuator

### Purpose

Provide health checks, metrics, and monitoring endpoints for production use.

### Configuration

**Dependencies**: `spring-boot-starter-actuator` (already added to `pom.xml`)

**Endpoints**: Configured in `application.yml`

### Available Endpoints

All endpoints are accessible at `/actuator/{endpoint}`:

1. **Health Check**: `/actuator/health`

   - Returns application health status
   - Shows details when authorized

2. **Info**: `/actuator/info`

   - Application information

3. **Metrics**: `/actuator/metrics`

   - Application metrics (JVM, HTTP, custom)
   - Example: `/actuator/metrics/jvm.memory.used`

4. **Prometheus**: `/actuator/prometheus`
   - Metrics in Prometheus format
   - Ready for integration with Grafana

### Security

- Actuator endpoints are publicly accessible (for monitoring tools)
- In production, consider securing these endpoints with authentication

### Example Usage

```bash
# Health check
curl http://localhost:8081/actuator/health

# Get all metrics
curl http://localhost:8081/actuator/metrics

# Get specific metric
curl http://localhost:8081/actuator/metrics/http.server.requests

# Prometheus format
curl http://localhost:8081/actuator/prometheus
```

## 5. Integration with Grafana/ELK

### Prometheus + Grafana (✅ Ready to Use)

A complete Docker Compose setup is provided for easy deployment.

**Quick Start**:

```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

This starts:

- **Prometheus** on `http://localhost:9090` - Scrapes metrics from Actuator
- **Grafana** on `http://localhost:3000` - Visualizes metrics (default: admin/admin)

**See**: `MONITORING_SETUP.md` for detailed setup instructions and troubleshooting.

**Features**:

- ✅ Pre-configured Prometheus to scrape `/actuator/prometheus`
- ✅ Pre-configured Grafana data source
- ✅ Sample dashboard for Spring Boot metrics
- ✅ Automatic provisioning on startup

### ELK Stack (Elasticsearch, Logstash, Kibana)

The log files can be ingested into ELK for log aggregation:

1. **Filebeat** or **Logstash** reads log files from `logs/` directory
2. **Elasticsearch** stores the logs
3. **Kibana** provides visualization and search

**Note**: ELK stack setup can be added if needed. Currently, Grafana + Prometheus is provided for metrics monitoring.

## 6. Best Practices

### Audit Logging

- Always log security-sensitive actions (login, password changes, etc.)
- Use async logging to avoid performance impact
- Don't log sensitive data (passwords, tokens)

### Application Logging

- Use appropriate log levels:
  - `ERROR`: Errors that need immediate attention
  - `WARN`: Warnings that might indicate issues
  - `INFO`: Important business events
  - `DEBUG`: Detailed information for debugging
- Include context in log messages (user ID, request ID, etc.)

### Monitoring

- Set up alerts for critical metrics (error rate, response time)
- Monitor disk space for log files
- Regularly review audit logs for suspicious activity

## 7. Future Enhancements

Potential improvements:

- Add request/response logging interceptor
- Implement distributed tracing (e.g., Zipkin)
- Add custom metrics (business metrics)
- Implement log aggregation service
- Add alerting rules for critical events

## 8. Troubleshooting

### Logs Not Appearing

- Check log file permissions
- Verify log directory exists (`logs/`)
- Check log level configuration

### Actuator Endpoints Not Accessible

- Verify SecurityConfig allows `/actuator/**`
- Check actuator configuration in `application.yml`
- Ensure actuator dependency is in `pom.xml`

### High Disk Usage

- Check log rotation is working
- Verify retention policies
- Consider reducing log level in production

# Monitoring Setup Guide - Grafana + Prometheus

This guide will help you set up Grafana and Prometheus for monitoring your Auctionality application.

## Prerequisites

- Docker and Docker Compose installed
- Backend application running on `localhost:8081`

## Quick Start

### 1. Start Monitoring Stack

```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

This will start:
- **Prometheus** on `http://localhost:9090`
- **Grafana** on `http://localhost:3000`

### 2. Access Grafana

1. Open `http://localhost:3000` in your browser
2. Login with:
   - Username: `admin`
   - Password: `admin`
3. Change the password when prompted (optional)

### 3. Verify Prometheus Data Source

1. Go to **Configuration** → **Data Sources**
2. You should see **Prometheus** already configured
3. Click **Test** to verify connection

### 4. View Dashboards

1. Go to **Dashboards** → **Browse**
2. You should see **Spring Boot Actuator Metrics** dashboard
3. Click to view the dashboard

## Configuration Details

### Prometheus Configuration

**File**: `monitoring/prometheus/prometheus.yml`

- Scrapes metrics from Spring Boot Actuator every 15 seconds
- Target: `host.docker.internal:8081/actuator/prometheus`
- Adjust the target if your backend runs on a different host/port

### Grafana Configuration

**Data Source**: `monitoring/grafana/provisioning/datasources/prometheus.yml`
- Automatically configured to connect to Prometheus

**Dashboards**: `monitoring/grafana/dashboards/`
- Pre-configured dashboard for Spring Boot metrics

## Available Metrics

Spring Boot Actuator provides these metrics (accessible via Prometheus):

### HTTP Metrics
- `http_server_requests_seconds_count` - Total HTTP requests
- `http_server_requests_seconds_sum` - Total request duration
- `http_server_requests_seconds_max` - Max request duration

### JVM Metrics
- `jvm_memory_used_bytes` - Memory usage
- `jvm_memory_max_bytes` - Max memory
- `jvm_threads_live_threads` - Active threads
- `jvm_gc_pause_seconds` - GC pause time

### Application Metrics
- `process_cpu_usage` - CPU usage
- `process_uptime_seconds` - Uptime
- Custom business metrics (if added)

## Customizing the Setup

### Change Prometheus Target

Edit `monitoring/prometheus/prometheus.yml`:

```yaml
static_configs:
  - targets: ['your-backend-host:8081']
```

### Add More Dashboards

1. Create dashboard in Grafana UI
2. Export as JSON
3. Save to `monitoring/grafana/dashboards/`
4. Restart Grafana container

### Change Grafana Credentials

Edit `docker-compose.monitoring.yml`:

```yaml
environment:
  - GF_SECURITY_ADMIN_USER=your-username
  - GF_SECURITY_ADMIN_PASSWORD=your-password
```

## Troubleshooting

### Prometheus Can't Scrape Metrics

1. Verify backend is running: `curl http://localhost:8081/actuator/prometheus`
2. Check Prometheus targets: `http://localhost:9090/targets`
3. If using Docker, ensure `host.docker.internal` resolves correctly
   - On Linux, you may need to use `172.17.0.1` or your host IP

### Grafana Can't Connect to Prometheus

1. Check Prometheus is running: `docker ps`
2. Verify network: Both containers should be on `monitoring` network
3. Check Prometheus URL in Grafana data source config

### No Data in Dashboards

1. Wait a few minutes for Prometheus to scrape metrics
2. Check Prometheus query: `http://localhost:9090/graph`
3. Verify backend `/actuator/prometheus` endpoint is accessible

## Stopping the Monitoring Stack

```bash
docker-compose -f docker-compose.monitoring.yml down
```

To also remove volumes (deletes all data):

```bash
docker-compose -f docker-compose.monitoring.yml down -v
```

## Production Considerations

1. **Security**:
   - Change default Grafana admin password
   - Secure Prometheus and Grafana endpoints
   - Use authentication for Actuator endpoints

2. **Persistence**:
   - Data is stored in Docker volumes
   - Backup volumes regularly
   - Consider external storage for production

3. **Performance**:
   - Adjust scrape interval based on load
   - Configure retention policies in Prometheus
   - Monitor Prometheus and Grafana resource usage

## Alternative: ELK Stack Setup

If you prefer ELK (Elasticsearch, Logstash, Kibana) for log aggregation instead:

1. **Filebeat** can read log files from `logs/` directory
2. **Logstash** processes and enriches logs
3. **Elasticsearch** stores logs
4. **Kibana** visualizes logs

Would you like me to set up ELK stack instead or in addition to Grafana?


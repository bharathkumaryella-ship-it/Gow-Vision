# Docker Setup Guide

Complete guide for building and running GowVision with Docker.

## Overview

GowVision supports containerized deployment for both development and production environments using Docker and Docker Compose.

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 4GB+ RAM
- 10GB+ disk space

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/gowvision.git
cd gowvision
```

### 2. Create .env File

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Services

```bash
docker-compose up -d
```

### 4. Verify Services

```bash
# Check running containers
docker-compose ps

# Check frontend
curl http://localhost:3000

# Check backend health
curl http://localhost:5000/api/health
```

## Docker Images

### Frontend Image

**Dockerfile Path:** `frontend/Dockerfile`

**Build Command:**
```bash
cd frontend
docker build -t gowvision-frontend:latest .
```

**Image Details:**
- Base: Node.js 18
- Build: Vite build
- Serve: Nginx
- Port: 3000

### Backend Image

**Dockerfile Path:** `backend/Dockerfile` (create if needed)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY doc/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY backend/ .

# Create necessary directories
RUN mkdir -p logs temp_uploads

# Expose port
EXPOSE 5000

# Command
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "60", "app:app"]
```

## Docker Compose Configuration

### Complete docker-compose.yml

```yaml
version: '3.8'

services:
  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: gowvision-frontend
    ports:
      - "3000:80"
    environment:
      VITE_API_URL: http://localhost:5000
    depends_on:
      - backend
    networks:
      - gowvision
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: gowvision-backend
    ports:
      - "5000:5000"
    environment:
      FLASK_ENV: production
      FLASK_DEBUG: false
      FLASK_APP: app.py
      DATABASE_URL: postgresql://gowvision:gowvision123@postgres:5432/gowvision
      REDIS_URL: redis://redis:6379
      CORS_ORIGINS: http://frontend:80,http://localhost:3000
      SECRET_KEY: ${SECRET_KEY:-change-me-in-production}
      JWT_SECRET_KEY: ${JWT_SECRET_KEY:-change-me-in-production}
      LOG_LEVEL: INFO
      PYTHONUNBUFFERED: 1
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - gowvision
    volumes:
      - ./backend/logs:/app/logs
      - ./backend/temp_uploads:/app/temp_uploads
      - ./Cattle\ Breeds:/app/Cattle\ Breeds:ro
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: gowvision-postgres
    environment:
      POSTGRES_USER: gowvision
      POSTGRES_PASSWORD: gowvision123
      POSTGRES_DB: gowvision
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - gowvision
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U gowvision"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: gowvision-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - gowvision
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # Optional: Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: gowvision-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    networks:
      - gowvision
    restart: unless-stopped

networks:
  gowvision:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
```

## Development Setup

### Development Compose File

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    volumes:
      - ./backend:/app
      - /app/__pycache__
    environment:
      FLASK_ENV: development
      FLASK_DEBUG: true
    command: flask run --host=0.0.0.0

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      VITE_API_URL: http://localhost:5000

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_dev:/var/lib/postgresql/data

volumes:
  postgres_dev:
```

Run development stack:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

## Common Commands

### Build Images

```bash
# Build all
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend
```

### Start/Stop Services

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Database Management

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U gowvision -d gowvision

# Backup database
docker-compose exec postgres pg_dump -U gowvision gowvision > backup.sql

# Restore database
docker-compose exec -T postgres psql -U gowvision gowvision < backup.sql

# Initialize database
docker-compose exec backend python -c "from app import app, db; app.app_context().push(); db.create_all()"
```

### Run Commands in Container

```bash
# Run Python command
docker-compose exec backend python -c "print('Hello')"

# Run npm command
docker-compose exec frontend npm install

# Run tests
docker-compose exec backend pytest tests/
docker-compose exec frontend npm test
```

### Clean Up

```bash
# Remove containers and networks
docker-compose down

# Remove volumes too (CAUTION: deletes data)
docker-compose down -v

# Remove all images
docker-compose down --rmi all
```

## Networking

Services can communicate using service names:
- Backend: `backend:5000`
- Frontend: `frontend:3000`
- PostgreSQL: `postgres:5432`
- Redis: `redis:6379`

## Volume Management

### Backend Volumes
- `./backend/logs`: Application logs
- `./backend/temp_uploads`: Temporary file uploads
- `./Cattle Breeds`: Readonly dataset

### Database Volumes
- `postgres_data`: PostgreSQL data persistence
- `redis_data`: Redis data persistence

### Clear Volumes

```bash
# Warning: This deletes data
docker volume rm gowvision_postgres_data gowvision_redis_data
```

## Environment Variables in Docker

### Backend Variables

```env
FLASK_ENV=production
FLASK_DEBUG=false
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://gowvision:password@postgres:5432/gowvision
REDIS_URL=redis://redis:6379
CORS_ORIGINS=http://frontend:80,http://localhost:3000
LOG_LEVEL=INFO
```

### Frontend Variables

```env
VITE_API_URL=http://backend:5000
VITE_ENABLE_ANALYTICS=false
```

## Resource Limits

Set resource limits in docker-compose.yml:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Check container status
docker-compose ps

# Inspect container
docker inspect gowvision-backend
```

### Connection Refused

```bash
# Check if service is running
docker-compose ps

# Check networking
docker-compose networking ls

# Restart service
docker-compose restart backend
```

### Port Already In Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port in docker-compose.yml
```

### Database Connection Issues

```bash
# Test PostgreSQL connection
docker-compose exec backend psql -h postgres -U gowvision -d gowvision

# Check PostgreSQL logs
docker-compose logs postgres
```

## Production Deployment

### Use Secrets Management

```yaml
services:
  backend:
    environment:
      DATABASE_URL: ${DATABASE_URL}
      SECRET_KEY: ${SECRET_KEY}
    secrets:
      - db_password

secrets:
  db_password:
    external: true
```

### Use Registry

```bash
# Tag image
docker tag gowvision-backend:latest registry.example.com/gowvision-backend:1.0.0

# Push to registry
docker push registry.example.com/gowvision-backend:1.0.0
```

### Orchestration

For production, consider:
- Docker Swarm
- Kubernetes
- AWS ECS
- Google Cloud Run
- Azure Container Instances

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Best Practices](https://docs.docker.com/develop/dev-best-practices/)

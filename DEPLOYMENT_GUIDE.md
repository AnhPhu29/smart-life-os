# 🚀 SMART LIFE OS - DEPLOYMENT GUIDE

**Last Updated**: April 16, 2026  
**Status**: ✅ Ready for Deployment  
**Target**: Docker + Production Setup

---

## 📋 TABLE OF CONTENTS

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Local Development Setup](#local-development-setup)
3. [Docker Deployment](#docker-deployment)
4. [Cloud Deployment Options](#cloud-deployment-options)
5. [Production Monitoring](#production-monitoring)
6. [Rollback Procedures](#rollback-procedures)
7. [Security Hardening](#security-hardening)

---

## **PRE-DEPLOYMENT CHECKLIST** ✅

### Code Quality
- [ ] All tests passing
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Code reviewed
- [ ] Dependencies up-to-date
- [ ] Security vulnerabilities fixed

### Configuration
- [ ] .env file configured
- [ ] Gemini API key set
- [ ] Database credentials set
- [ ] Redis configured
- [ ] JWT secret generated
- [ ] SMTP configured (optional)
- [ ] Telegram configured (optional)

### Infrastructure
- [ ] MySQL running
- [ ] Redis running
- [ ] Docker installed
- [ ] Docker Compose installed
- [ ] Firewall rules configured
- [ ] SSL certificate ready (HTTPS)

### Documentation
- [ ] README updated
- [ ] API documentation current
- [ ] Deployment steps documented
- [ ] Rollback procedures documented
- [ ] Monitoring setup documented

### Git
- [ ] All changes committed
- [ ] Main branch is stable
- [ ] Version tag created
- [ ] Release notes written

---

## **LOCAL DEVELOPMENT SETUP** 

### Quick Start (5 minutes)

```bash
# 1. Install dependencies
cd smart-life-os
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 2. Configure environment
cp .env.example .env
# Edit .env with your configuration

# 3. Start services
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# 3. Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080/api/v1
# Health Check: http://localhost:8080/api/v1/actuator/health
```

### Database Initialization

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Open Prisma Studio (optional)
npx prisma studio
```

### Verify Local Setup

```bash
# Test API endpoint
curl http://localhost:8080/api/v1/actuator/health
# Should return: { "status": "UP" }

# Test Frontend
open http://localhost:3000

# Check logs
# Backend: Watch terminal output
# Frontend: Open DevTools (F12)
```

---

## **DOCKER DEPLOYMENT** 🐳

### Build Docker Images

```bash
# Build both backend and frontend
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend
```

### Development Environment

```bash
# Start all services in development mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Production Environment

```bash
# Use production docker-compose file
docker-compose -f docker-compose.production.yml up -d

# Check service health
docker-compose ps

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
docker-compose logs -f redis
```

### Health Checks

```bash
# Check backend health
curl http://localhost:8080/api/v1/actuator/health

# Check frontend
curl http://localhost:3000

# Check MySQL
docker-compose exec mysql mysqladmin ping -h localhost

# Check Redis
docker-compose exec redis redis-cli ping

# Docker compose status
docker-compose ps
```

### Troubleshooting Docker

```bash
# View full logs for service
docker-compose logs backend | tail -100

# Rebuild without cache
docker-compose build --no-cache

# Remove unused images/containers
docker system prune -a

# Check Docker resources
docker stats

# Debug container
docker-compose exec backend sh
```

---

## **CLOUD DEPLOYMENT OPTIONS**

### Option 1: AWS Deployment 🌐

#### Prerequisites
- AWS account
- AWS CLI configured
- ECR (Elastic Container Registry) access
- RDS MySQL instance
- ElastiCache Redis

#### Steps

```bash
# 1. Push images to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

docker tag smart-life-os-backend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/smart-life-os:backend
docker tag smart-life-os-frontend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/smart-life-os:frontend

docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/smart-life-os:backend
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/smart-life-os:frontend

# 2. Create ECS Cluster
aws ecs create-cluster --cluster-name smart-life-os

# 3. Register Task Definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# 4. Create Service
aws ecs create-service \
  --cluster smart-life-os \
  --service-name smart-life-os-service \
  --task-definition smart-life-os:1 \
  --desired-count 2

# 5. Create Application Load Balancer
aws elbv2 create-load-balancer \
  --name smart-life-os-alb \
  --subnets subnet-12345678 subnet-87654321
```

#### Cost Estimation
- ECS Fargate: $0.04733 per GB per hour
- RDS MySQL: $0.12 per hour (db.t3.micro)
- ElastiCache Redis: $0.017 per hour (cache.t3.micro)
- Load Balancer: $16/month
- **Estimated Monthly**: ~$200-300

### Option 2: DigitalOcean Deployment 💧

#### Prerequisites
- DigitalOcean account
- Created Droplet (4GB RAM minimum)
- Docker installed on Droplet

#### Steps

```bash
# 1. SSH into Droplet
ssh root@your_droplet_ip

# 2. Clone repository
git clone https://github.com/AnhPhu29/smart-life-os.git
cd smart-life-os

# 3. Set environment variables
cp .env.example .env
nano .env  # Edit configuration

# 4. Start services
docker-compose -f docker-compose.production.yml up -d

# 5. Setup reverse proxy (Nginx)
docker run -d \
  --name nginx \
  -p 80:80 \
  -p 443:443 \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v ./nginx.conf:/etc/nginx/nginx.conf:ro \
  nginx:latest
```

#### Cost Estimation
- Basic Droplet (4GB): $24/month
- Managed Database: Free tier or $12+/month
- Backups: $5/month
- **Estimated Monthly**: ~$50-100

### Option 3: Heroku Deployment 🚀

```bash
# 1. Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# 2. Login to Heroku
heroku login

# 3. Create app
heroku create smart-life-os

# 4. Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# 5. Add Redis
heroku addons:create heroku-redis:premium-0

# 6. Set environment variables
heroku config:set GEMINI_API_KEY=your_key
heroku config:set JWT_SECRET=your_secret

# 7. Deploy
git push heroku main

# 8. Monitor
heroku logs --tail
```

#### Cost Estimation
- Dyno (Basic): $7/month
- PostgreSQL (Hobby): Free
- Redis (Premium): $15/month
- **Estimated Monthly**: ~$22+

---

## **PRODUCTION MONITORING** 📊

### Log Monitoring

```bash
# Docker logs
docker-compose logs -f --tail=100

# Centralized logging (ELK Stack)
docker run -d \
  --name elasticsearch \
  -e "discovery.type=single-node" \
  docker.elastic.co/elasticsearch/elasticsearch:8.0.0

docker run -d \
  --name kibana \
  docker.elastic.co/kibana/kibana:8.0.0
```

### Performance Monitoring

```bash
# Docker stats
docker stats

# CPU/Memory alerts
# Container backend: Alert if > 80% CPU

# Response time monitoring
# Alert if avg response time > 500ms

# Database query monitoring
# Slow query log enabled
# Alert on queries > 1s
```

### Application Monitoring

```bash
# Health check endpoint
curl http://localhost:8080/api/v1/actuator/health

# Error rate monitoring
# Track API errors in real-time

# User activity monitoring
# Track active users
# Track feature usage
```

### Setup Alerts

```bash
# Email alerts (via Nodemailer)
# Alert on service failure
# Alert on high error rate
# Alert on performance issues

# Slack integration (optional)
# Incoming webhook for alerts
# Daily summary reports
```

---

## **ROLLBACK PROCEDURES** 🔄

### Rollback to Previous Version

```bash
# 1. Stop current services
docker-compose down

# 2. Checkout previous version
git log --oneline  # Find previous commit
git checkout <commit-hash>

# 3. Rebuild images
docker-compose build --no-cache

# 4. Start services
docker-compose up -d

# 5. Verify health
curl http://localhost:8080/api/v1/actuator/health
```

### Database Rollback

```bash
# 1. Restore backup
# Using AWS RDS snapshots
aws rds describe-db-snapshots
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier smart-life-os-restored \
  --db-snapshot-identifier smart-life-os-backup

# Using MySQL backup
mysql -u root -p smart_life_os < backup.sql

# 2. Update connection string
# Edit .env with new database endpoint

# 3. Restart services
docker-compose restart
```

### Zero-Downtime Deployment

```bash
# 1. Start new container on different port
docker run -d \
  --name backend-new \
  -e PORT=8081 \
  smart-life-os-backend:new

# 2. Test new version
curl http://localhost:8081/api/v1/actuator/health

# 3. Switch traffic (in nginx)
# upstream backend {
#   server backend-new:8081;  # Point to new
# }

# 4. Stop old container
docker stop backend-old
docker rm backend-old

# 5. Rename container
docker rename backend-new backend
```

---

## **SECURITY HARDENING** 🔒

### Database Security

```env
# Use strong passwords
DB_PASSWORD=GenerateStrongPassword123!@#

# Use encryption at rest
# Enable SSL for database connection
DATABASE_URL=mysql+ssl://user:pass@host/db
```

### API Security

```bash
# Enable HTTPS/TLS
# Use self-signed cert for testing
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365

# Use strong CORS policy
CORS_ORIGIN=https://example.com

# Enable rate limiting
# Implement in middleware
```

### Container Security

```bash
# Run as non-root user
# In Dockerfile:
# USER appuser

# Use minimal base images
# FROM node:18-alpine (small, secure)

# Scan images for vulnerabilities
docker scan smart-life-os-backend
```

### Secrets Management

```bash
# Use AWS Secrets Manager
aws secretsmanager create-secret \
  --name smart-life-os/prod \
  --secret-string '{"DB_PASSWORD":"..."}'

# Or use HashiCorp Vault
vault kv put secret/smart-life-os \
  DB_PASSWORD=password \
  JWT_SECRET=secret
```

---

## **DEPLOYMENT CHECKLIST** ✅

### Pre-Deployment
- [ ] All tests passing
- [ ] Code review completed
- [ ] Environment variables configured
- [ ] Database backed up
- [ ] SSL certificate ready
- [ ] Monitoring configured
- [ ] Rollback plan documented

### Deployment
- [ ] Build Docker images
- [ ] Push images to registry
- [ ] Deploy to staging first
- [ ] Run smoke tests
- [ ] Verify health checks
- [ ] Check logs
- [ ] Test critical features

### Post-Deployment
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify real-time updates (Socket.io)
- [ ] Test all 4 features
- [ ] Check database integrity
- [ ] Notify stakeholders
- [ ] Document changes

---

## **QUICK COMMANDS** 🚀

```bash
# Build and start
docker-compose build && docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Remove everything (careful!)
docker-compose down -v

# Health check
curl http://localhost:8080/api/v1/actuator/health

# Database shell
docker-compose exec mysql mysql -u smartlife -p smart_life_os

# Redis shell
docker-compose exec redis redis-cli

# Rebuild specific service
docker-compose build --no-cache backend
```

---

## **TROUBLESHOOTING** 🔧

| Issue | Solution |
|-------|----------|
| Port already in use | `docker-compose down` then try again |
| Database connection error | Check MySQL container is healthy |
| Frontend not connecting to API | Check NEXT_PUBLIC_API_URL environment variable |
| Out of disk space | `docker system prune -a` |
| High memory usage | Check memory limits in docker-compose.yml |
| SSL certificate error | Verify certificate paths and permissions |

---

## **NEXT STEPS**

1. ✅ Complete pre-deployment checklist
2. ✅ Configure all environment variables
3. ✅ Run local tests
4. ✅ Deploy to staging
5. ✅ Run production tests
6. ✅ Deploy to production
7. ✅ Setup monitoring
8. ✅ Document procedures

**Smart Life OS is ready for deployment! 🎉**

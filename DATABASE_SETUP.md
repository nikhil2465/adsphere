# 🗄️ Database Setup Guide

## Option 1: Docker Setup (Recommended)

### Prerequisites
- Docker Desktop installed and running
- At least 4GB RAM available for Docker

### Step 1: Start Docker Desktop
1. Open Docker Desktop from Start Menu
2. Wait for it to fully start (Docker icon should be green)
3. Ensure you have at least 4GB RAM allocated to Docker

### Step 2: Start Database Services
```bash
# Navigate to docker directory
cd docker

# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Check if services are running
docker-compose ps
```

### Step 3: Wait for Services to Initialize
```bash
# Wait 30 seconds for databases to be ready
timeout 30

# Test PostgreSQL connection
docker exec adsphere-postgres pg_isready -U postgres

# Test Redis connection
docker exec adsphere-redis redis-cli ping
```

### Step 4: Run Database Migrations
```bash
# Navigate to shared utils
cd ../backend/shared-utils

# Run migrations
npm run db:migrate

# Seed with sample data (optional)
npm run db:seed
```

## Option 2: Local PostgreSQL Installation

### Step 1: Install PostgreSQL
1. Download PostgreSQL 15+ from https://www.postgresql.org/download/windows/
2. Run the installer with these settings:
   - Password: `password`
   - Port: `5432`
   - Username: `postgres`
3. Install pgAdmin 4 (included with installer)

### Step 2: Install Redis (Optional but Recommended)
```bash
# Using Chocolatey
choco install redis-64

# Or download from https://github.com/microsoftarchive/redis/releases
```

### Step 3: Create Database
```bash
# Open Command Prompt as Administrator
# Create the database
createdb -U postgres adsphere

# Or use pgAdmin GUI to create database
```

### Step 4: Run Migrations
```bash
# Navigate to shared utils
cd backend/shared-utils

# Run migrations
npm run db:migrate

# Seed with sample data (optional)
npm run db:seed
```

## Option 3: Cloud Database

### AWS RDS PostgreSQL
1. Create AWS account
2. Go to RDS service
3. Create PostgreSQL instance
4. Configure security group to allow your IP
5. Update backend/.env with connection details

### Google Cloud SQL
1. Create Google Cloud account
2. Go to Cloud SQL
3. Create PostgreSQL instance
4. Configure networking
5. Update backend/.env with connection details

### Azure Database for PostgreSQL
1. Create Azure account
2. Go to Azure Database for PostgreSQL
3. Create server and database
4. Configure firewall rules
5. Update backend/.env with connection details

## Environment Configuration

### Update backend/.env for Database
```env
# PostgreSQL Configuration
DB_HOST=localhost          # or your cloud database host
DB_PORT=5432              # or your cloud database port
DB_NAME=adsphere
DB_USER=postgres          # or your database user
DB_PASSWORD=password      # or your database password

# Redis Configuration (if using)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## Database Schema

### Core Tables
- `users` - User accounts and authentication
- `marketplace_credentials` - API credentials for marketplaces
- `campaigns` - Advertising campaigns
- `ads` - Individual advertisements
- `ad_performance` - Performance metrics
- `notifications` - User notifications

### Migration Files
Migration files are located in `backend/shared-utils/src/database/migrate.ts`

## Troubleshooting

### Common Issues

#### 1. PostgreSQL Connection Failed
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Check connection string
psql -h localhost -p 5432 -U postgres -d adsphere

# Restart PostgreSQL service
# Windows: Services -> postgresql-x64-15 -> Restart
```

#### 2. Migration Errors
```bash
# Check migration file exists
ls backend/shared-utils/src/database/migrate.ts

# Run with verbose output
cd backend/shared-utils
npm run db:migrate -- --verbose

# Reset database (WARNING: deletes all data)
npm run db:reset
```

#### 3. Docker Issues
```bash
# Check Docker status
docker --version
docker-compose --version

# Check running containers
docker ps

# View container logs
docker logs adsphere-postgres
docker logs adsphere-redis

# Restart containers
docker-compose restart postgres redis
```

#### 4. Permission Issues
```bash
# Windows: Run Command Prompt as Administrator
# Linux/macOS: Use sudo if needed

# Check file permissions
ls -la backend/shared-utils/dist/

# Fix permissions (Linux/macOS)
chmod +x backend/shared-utils/dist/database/migrate.js
```

## Database Management Tools

### pgAdmin (Recommended)
- Included with PostgreSQL installer
- Web-based database management
- Visual query builder
- Backup and restore tools

### DBeaver
- Free universal database tool
- Supports multiple database types
- Advanced query editor
- ER diagrams

### Command Line Tools
```bash
# Connect to database
psql -h localhost -p 5432 -U postgres -d adsphere

# List tables
\dt

# Describe table
\d users

# Run queries
SELECT * FROM users LIMIT 10;

# Backup database
pg_dump -U postgres adsphere > backup.sql

# Restore database
psql -U postgres adsphere < backup.sql
```

## Performance Optimization

### PostgreSQL Configuration
```sql
-- Increase shared memory
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';

-- Restart PostgreSQL for changes to take effect
```

### Indexing
```sql
-- Add indexes for better performance
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX CONCURRENTLY idx_ads_campaign_id ON ads(campaign_id);
```

### Connection Pooling
Consider using PgBouncer for production environments to handle connection pooling.

## Backup Strategy

### Automated Backups
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U postgres adsphere > "backup_$DATE.sql"

# Schedule with cron (Linux/macOS)
0 2 * * * /path/to/backup-script.sh

# Schedule with Task Scheduler (Windows)
```

### Point-in-Time Recovery
Enable WAL (Write-Ahead Logging) for point-in-time recovery:
```sql
ALTER SYSTEM SET wal_level = replica;
ALTER SYSTEM SET archive_mode = on;
ALTER SYSTEM SET archive_command = 'cp %p /backup/archive/%f';
```

## Monitoring

### Health Checks
```bash
# PostgreSQL health check
pg_isready -h localhost -p 5432

# Redis health check
redis-cli ping

# Application health check
curl http://localhost:8000/health
```

### Performance Monitoring
- Use pg_stat_statements for query performance
- Monitor connection counts
- Track slow queries
- Monitor disk usage and memory

## Security

### Database Security
- Use strong passwords
- Enable SSL connections
- Restrict network access
- Regular security updates
- Audit logging

### Connection Security
```env
# Use SSL in production
DB_SSL_MODE=require
DB_SSL_CERT_PATH=/path/to/cert
DB_SSL_KEY_PATH=/path/to/key
```

## Next Steps

1. Set up database using one of the options above
2. Run migrations to create tables
3. Configure API keys (see CONFIGURE_API_KEYS.md)
4. Start the application
5. Test all integrations

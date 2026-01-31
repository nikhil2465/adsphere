# 🚀 Complete Deployment Guide

## 📋 Prerequisites Checklist

Before starting deployment, ensure you have:

- [ ] Node.js 18+ installed
- [ ] Docker Desktop installed and running
- [ ] Amazon Ads API credentials
- [ ] Walmart Ads API credentials
- [ ] Domain name (for production)
- [ ] SSL certificates (for production HTTPS)

---

## 🔧 Step 1: Configure API Keys

### 1.1 Amazon Ads API Setup

1. **Create Amazon Advertising Account**
   - Go to https://advertising.amazon.com/
   - Sign in with your Amazon account
   - Register for advertising access

2. **Register Application**
   - Visit https://developer.amazon.com/
   - Create new application
   - Select "Advertising API"
   - Set redirect URI: `http://yourdomain.com/api/auth/amazon/callback`

3. **Get Credentials**
   - Client ID: Application identifier
   - Client Secret: Application secret
   - Refresh Token: OAuth refresh token
   - Profile ID: Advertising profile ID

### 1.2 Walmart Ads API Setup

1. **Create Developer Account**
   - Go to https://developer.walmart.com/
   - Register for developer account
   - Apply for Advertising API access

2. **Get Credentials**
   - Client ID: API client identifier
   - Client Secret: API client secret
   - Channel ID: Advertising channel ID

### 1.3 Configure Environment

Edit `backend/.env`:
```env
# Amazon Ads API
AMAZON_CLIENT_ID=your-amazon-client-id
AMAZON_CLIENT_SECRET=your-amazon-client-secret
AMAZON_REFRESH_TOKEN=your-amazon-refresh-token
AMAZON_PROFILE_ID=your-amazon-profile-id
AMAZON_REGION=na

# Walmart Ads API
WALMART_CLIENT_ID=your-walmart-client-id
WALMART_CLIENT_SECRET=your-walmart-client-secret
WALMART_CHANNEL_ID=your-walmart-channel-id
WALMART_ENVIRONMENT=sandbox
```

---

## 🗄️ Step 2: Database Setup

### Option A: Docker (Recommended)

1. **Start Docker Desktop**
2. **Navigate to docker directory**
   ```bash
   cd docker
   ```

3. **Start database services**
   ```bash
   docker-compose up -d postgres redis
   ```

4. **Wait for initialization**
   ```bash
   # Wait 30 seconds
   timeout 30
   
   # Test connections
   docker exec adsphere-postgres pg_isready -U postgres
   docker exec adsphere-redis redis-cli ping
   ```

5. **Run migrations**
   ```bash
   cd ../backend/shared-utils
   npm run db:migrate
   npm run db:seed
   ```

### Option B: Local PostgreSQL

1. **Install PostgreSQL 15+**
   - Download from https://www.postgresql.org/download/windows/
   - Set password: `password`
   - Port: `5432`

2. **Create database**
   ```bash
   createdb -U postgres adsphere
   ```

3. **Run migrations**
   ```bash
   cd backend/shared-utils
   npm run db:migrate
   npm run db:seed
   ```

---

## 📦 Step 3: Install Dependencies

### 3.1 Root Dependencies
```bash
cd "C:\Program Files (x86)\adsphere"
npm install
```

### 3.2 Backend Dependencies
```bash
cd backend
npm install
```

### 3.3 Frontend Dependencies
```bash
cd ../frontend
npm install --legacy-peer-deps
```

### 3.4 Mobile Dependencies
```bash
cd ../mobile
npm install
```

---

## 🧪 Step 4: Test Integrations

### 4.1 Start Development Servers
```bash
# Start all services
cd "C:\Program Files (x86)\adsphere"
npm run dev
```

### 4.2 Test API Connections

1. **Open API Documentation**
   - Go to http://localhost:8000/api/docs
   - Browse available endpoints

2. **Test Authentication**
   ```bash
   curl -X POST http://localhost:8000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'
   ```

3. **Test Amazon Integration**
   ```bash
   curl -X GET http://localhost:8000/api/amazon/campaigns \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

4. **Test Walmart Integration**
   ```bash
   curl -X GET http://localhost:8000/api/walmart/campaigns \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

### 4.3 Test Frontend
- Open http://localhost:3000
- Create test account
- Navigate to Ads Manager
- Test campaign creation

---

## 📱 Step 5: Build Mobile APK

### 5.1 Prerequisites
- Android Studio installed
- Java JDK 11+ installed
- Android device or emulator

### 5.2 Build Debug APK
```bash
cd mobile
npm run android:build
```

### 5.3 Build Release APK
```bash
cd mobile/android

# Generate signing key
keytool -genkey -v -keystore adsphere-release-key.keystore -alias adsphere -keyalg RSA -keysize 2048 -validity 10000

# Build release APK
./gradlew assembleRelease
```

### 5.4 APK Location
- Debug: `mobile/android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `mobile/android/app/build/outputs/apk/release/app-release.apk`

---

## 🐳 Step 6: Production Deployment

### 6.1 Docker Deployment (Recommended)

1. **Configure Production Environment**
   ```bash
   cd docker
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Build and Deploy**
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

3. **Scale Services**
   ```bash
   docker-compose up -d --scale api-gateway=3 --scale frontend=2
   ```

4. **Monitor Deployment**
   ```bash
   docker-compose logs -f
   docker-compose ps
   ```

### 6.2 Manual Deployment

1. **Build Applications**
   ```bash
   # Build backend
   cd backend
   npm run build
   
   # Build frontend
   cd ../frontend
   npm run build
   ```

2. **Start Services**
   ```bash
   # Start each service
   cd api-gateway && npm start
   cd auth-service && npm start
   # ... etc
   ```

### 6.3 SSL Configuration

1. **Obtain SSL Certificates**
   - Use Let's Encrypt (free)
   - Or purchase from certificate authority

2. **Configure Nginx**
   ```bash
   # Edit docker/nginx.conf
   # Uncomment SSL configuration
   # Add certificate paths
   ```

3. **Restart with SSL**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

---

## 🔍 Step 7: Verify Deployment

### 7.1 Health Checks
```bash
# API Gateway
curl http://localhost:8000/health

# Frontend
curl http://localhost:3000

# Database
docker exec adsphere-postgres pg_isready -U postgres

# Redis
docker exec adsphere-redis redis-cli ping
```

### 7.2 Load Testing
```bash
# Install artillery
npm install -g artillery

# Run load test
artillery run load-test.yml
```

### 7.3 Monitoring Setup
- Set up application monitoring
- Configure error tracking (Sentry)
- Set up performance monitoring
- Configure log aggregation

---

## 📊 Step 8: Production Monitoring

### 8.1 Application Metrics
- Response times
- Error rates
- Throughput
- Resource usage

### 8.2 Database Monitoring
- Connection counts
- Query performance
- Disk usage
- Memory usage

### 8.3 Infrastructure Monitoring
- CPU usage
- Memory usage
- Disk I/O
- Network traffic

---

## 🔧 Step 9: Maintenance

### 9.1 Regular Tasks
- Database backups
- Log rotation
- Security updates
- Performance tuning

### 9.2 Backup Strategy
```bash
# Database backup
docker exec adsphere-postgres pg_dump -U postgres adsphere > backup.sql

# Application backup
tar -czf app-backup.tar.gz uploads/ exports/ logs/
```

### 9.3 Update Process
```bash
# Pull latest code
git pull origin main

# Update dependencies
npm run install:all

# Rebuild and redeploy
docker-compose down
docker-compose build
docker-compose up -d
```

---

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL status
   - Verify connection string
   - Check firewall rules

2. **API Integration Errors**
   - Verify API credentials
   - Check rate limits
   - Review API documentation

3. **Mobile Build Failures**
   - Check Android SDK installation
   - Verify Java version
   - Clear Gradle cache

4. **Docker Issues**
   - Restart Docker Desktop
   - Check resource allocation
   - Review container logs

### Log Locations
- Backend: `backend/logs/`
- Docker: `docker-compose logs`
- Mobile: React Native debugger
- Frontend: Browser console

---

## 📞 Support

### Documentation
- API Docs: http://yourdomain.com/api/docs
- Setup Guide: `docs/SETUP_GUIDE.md`
- Database Guide: `docs/DATABASE_SETUP.md`

### Emergency Contacts
- System Administrator
- Database Administrator
- API Support (Amazon/Walmart)

---

## ✅ Deployment Checklist

- [ ] API keys configured
- [ ] Database set up and migrated
- [ ] Dependencies installed
- [ ] All services running
- [ ] API integrations tested
- [ ] Mobile APK built
- [ ] Production deployment complete
- [ ] SSL certificates installed
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Documentation updated

---

## 🎉 Success!

Your AdSphere Enterprise Platform is now deployed and ready for use!

### Access Points
- **Web Application**: http://yourdomain.com
- **API Gateway**: http://yourdomain.com/api
- **API Documentation**: http://yourdomain.com/api/docs
- **Mobile App**: Install APK on Android devices

### Next Steps
1. Train users on the platform
2. Set up regular monitoring
3. Plan for scaling
4. Implement backup procedures
5. Schedule regular maintenance

For additional support, refer to the documentation or contact the support team.

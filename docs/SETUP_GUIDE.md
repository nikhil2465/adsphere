# AdSphere Enterprise - Complete Setup Guide

🚀 **Universal Advertising Management Platform Setup Instructions**

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Development Setup](#development-setup)
6. [Production Deployment](#production-deployment)
7. [Mobile App Setup](#mobile-app-setup)
8. [Marketplace Integration](#marketplace-integration)
9. [Troubleshooting](#troubleshooting)
10. [Advanced Configuration](#advanced-configuration)

---

## 📋 Prerequisites

### System Requirements
- **Operating System**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher
- **Git**: Latest version
- **Docker**: 20.10+ (for containerized deployment)
- **Docker Compose**: 2.0+

### Development Tools (Recommended)
- **IDE**: Visual Studio Code with extensions:
  - TypeScript and JavaScript Language Features
  - ES7+ React/Redux/React-Native snippets
  - Docker
  - GitLens
- **Database Tool**: pgAdmin 4 or DBeaver
- **API Testing**: Postman or Insomnia

### Mobile Development (Optional)
- **Android Studio**: Latest version with Android SDK
- **Java Development Kit**: JDK 11+
- **React Native CLI**: `npm install -g react-native-cli`

---

## 🚀 Quick Start

### 1. Clone and Setup
```bash
# Navigate to the project directory
cd "C:\Program Files (x86)\adsphere"

# Run the automated setup script
npm run setup

# Install all dependencies
npm run install:all
```

### 2. Environment Configuration
```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp mobile/.env.example mobile/.env

# Edit environment files with your credentials
notepad backend/.env
```

### 3. Start Development Servers
```bash
# Start all services in development mode
npm run dev

# Or start individually
npm run dev:backend  # Backend services on ports 8000-8006
npm run dev:frontend # Frontend on port 3000
```

### 4. Access Applications
- **Web Application**: http://localhost:3000
- **API Gateway**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/docs

---

## ⚙️ Environment Configuration

### Backend Environment Variables (`backend/.env`)
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=adsphere
DB_USER=postgres
DB_PASSWORD=password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# API Gateway Configuration
API_GATEWAY_PORT=8000
FRONTEND_URL=http://localhost:3000

# Microservice URLs
AUTH_SERVICE_URL=http://localhost:8001
CAMPAIGN_SERVICE_URL=http://localhost:8002
AD_SERVICE_URL=http://localhost:8003
ANALYTICS_SERVICE_URL=http://localhost:8004
EXPORT_SERVICE_URL=http://localhost:8005
NOTIFICATION_SERVICE_URL=http://localhost:8006

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

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
EXPORT_PATH=./exports

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs

# Development
NODE_ENV=development
```

### Frontend Environment Variables (`frontend/.env`)
```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_API_TIMEOUT=30000

# Application Configuration
REACT_APP_NAME=AdSphere
REACT_APP_VERSION=1.0.0
REACT_APP_DESCRIPTION=Universal Advertising Management Platform

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_EXPORT=true
REACT_APP_ENABLE_REAL_TIME=true

# Third-party Services
REACT_APP_GOOGLE_ANALYTICS_ID=your-ga-id
REACT_APP_SENTRY_DSN=your-sentry-dsn

# Development
GENERATE_SOURCEMAP=true
```

### Mobile Environment Variables (`mobile/.env`)
```env
# API Configuration
API_BASE_URL=http://localhost:8000/api
API_TIMEOUT=30000

# Application Configuration
APP_NAME=AdSphere
APP_VERSION=1.0.0
APP_DESCRIPTION=Universal Advertising Management Platform

# Push Notifications
FCM_SERVER_KEY=your-fcm-server-key
PUSH_NOTIFICATION_ENABLED=true

# Biometric Authentication
BIOMETRIC_ENABLED=true

# Analytics
ANALYTICS_ENABLED=true
```

---

## 🗄️ Database Setup

### PostgreSQL Installation (Windows)
```bash
# Download and install PostgreSQL from https://www.postgresql.org/download/windows/
# During installation, set password as 'password' and port as 5432

# Create database
createdb -U postgres adsphere

# Run migrations
cd backend/shared-utils
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

### PostgreSQL Installation (macOS)
```bash
# Using Homebrew
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb adsphere

# Run migrations
cd backend/shared-utils
npm run db:migrate
npm run db:seed
```

### Redis Installation
```bash
# Windows (using WSL or Docker)
docker run -d -p 6379:6379 --name redis redis:7-alpine

# macOS
brew install redis
brew services start redis

# Linux
sudo apt-get install redis-server
sudo systemctl start redis
```

---

## 💻 Development Setup

### 1. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm run install:all

# Install frontend dependencies
cd ../frontend
npm install

# Install mobile dependencies
cd ../mobile
npm install
```

### 2. Start Development Services
```bash
# Start all services
npm run dev

# Individual services
npm run dev:backend  # Starts all microservices
npm run dev:frontend # Starts React development server
```

### 3. Development URLs
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8000
- **Auth Service**: http://localhost:8001
- **Campaign Service**: http://localhost:8002
- **Ad Service**: http://localhost:8003
- **Analytics Service**: http://localhost:8004
- **Export Service**: http://localhost:8005
- **Notification Service**: http://localhost:8006

### 4. Database Management
```bash
# Create new migration
cd backend/shared-utils
npm run db:migration:create add_new_table

# Run migrations
npm run db:migrate

# Reset database
npm run db:reset

# Seed data
npm run db:seed
```

---

## 🐳 Production Deployment

### Using Docker Compose (Recommended)
```bash
# Navigate to docker directory
cd docker

# Create environment file
cp .env.example .env
# Edit .env with production values

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Scale services
docker-compose up -d --scale api-gateway=3 --scale frontend=2
```

### Manual Production Setup
```bash
# Build all services
npm run build

# Start production servers
cd backend/api-gateway && npm start
cd frontend && npm serve
```

### Environment-Specific Configurations
```bash
# Production environment
NODE_ENV=production

# Staging environment
NODE_ENV=staging

# Development environment
NODE_ENV=development
```

---

## 📱 Mobile App Setup

### Android Development
```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Start Metro bundler
npm start

# Run on Android device/emulator
npm run android

# Build APK for distribution
npm run build:android
```

### APK Generation
```bash
# Generate debug APK
cd mobile/android
./gradlew assembleDebug

# Generate release APK (requires signing configuration)
./gradlew assembleRelease

# APK location
# Debug: mobile/android/app/build/outputs/apk/debug/app-debug.apk
# Release: mobile/android/app/build/outputs/apk/release/app-release.apk
```

### App Signing Configuration
```bash
# Generate signing key
keytool -genkey -v -keystore adsphere-release-key.keystore -alias adsphere -keyalg RSA -keysize 2048 -validity 10000

# Configure signing in mobile/android/app/build.gradle
# Add signing configuration to release build type
```

---

## 🏪 Marketplace Integration

### Amazon Ads API Setup
1. **Create Amazon Advertising Account**
   - Visit https://advertising.amazon.com/
   - Register for advertising access

2. **Register Application**
   - Go to Amazon Developer Console
   - Create new application
   - Obtain Client ID and Client Secret

3. **Get Refresh Token**
   - Use OAuth 2.0 flow to obtain refresh token
   - Store securely in environment variables

4. **Configure in Backend**
   ```env
   AMAZON_CLIENT_ID=your-client-id
   AMAZON_CLIENT_SECRET=your-client-secret
   AMAZON_REFRESH_TOKEN=your-refresh-token
   AMAZON_PROFILE_ID=your-profile-id
   AMAZON_REGION=na
   ```

### Walmart Ads API Setup
1. **Create Walmart Developer Account**
   - Visit https://developer.walmart.com/
   - Register for API access

2. **Apply for Ads API Access**
   - Submit application for advertising API
   - Wait for approval

3. **Get API Credentials**
   - Obtain Client ID and Client Secret
   - Get Channel ID

4. **Configure in Backend**
   ```env
   WALMART_CLIENT_ID=your-client-id
   WALMART_CLIENT_SECRET=your-client-secret
   WALMART_CHANNEL_ID=your-channel-id
   WALMART_ENVIRONMENT=sandbox
   ```

### API Testing
```bash
# Test Amazon integration
curl -X GET "http://localhost:8000/api/amazon/campaigns" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test Walmart integration
curl -X GET "http://localhost:8000/api/walmart/campaigns" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check PostgreSQL status
pg_isready -h localhost -p 5432

# Restart PostgreSQL
# Windows: Services -> postgresql-x64-15 -> Restart
# macOS: brew services restart postgresql@15
# Linux: sudo systemctl restart postgresql
```

#### 2. Redis Connection Errors
```bash
# Check Redis status
redis-cli ping

# Restart Redis
# Docker: docker restart redis
# macOS: brew services restart redis
# Linux: sudo systemctl restart redis
```

#### 3. Port Conflicts
```bash
# Check what's using a port
netstat -ano | findstr :8000

# Kill process using port
taskkill /PID <PID> /F

# Change port in environment variables
API_GATEWAY_PORT=8001
```

#### 4. Node.js Version Issues
```bash
# Check Node.js version
node --version

# Update Node.js using nvm
nvm install 18
nvm use 18

# Set default version
nvm alias default 18
```

#### 5. Mobile Build Issues
```bash
# Clear React Native cache
npx react-native start --reset-cache

# Clean Android build
cd mobile/android
./gradlew clean

# Reinstall dependencies
cd mobile
rm -rf node_modules package-lock.json
npm install
```

### Log Locations
- **Backend logs**: `backend/logs/`
- **Frontend logs**: Browser console
- **Mobile logs**: React Native debugger
- **Docker logs**: `docker-compose logs`

### Performance Optimization
```bash
# Enable production optimizations
NODE_ENV=production

# Monitor memory usage
npm run monitor

# Analyze bundle size
npm run analyze
```

---

## 🔐 Advanced Configuration

### Security Configuration
```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Configure HTTPS
# Add SSL certificates to docker/ssl/
# Update nginx.conf for SSL configuration
```

### Monitoring and Analytics
```bash
# Set up Google Analytics
REACT_APP_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID

# Set up Sentry for error tracking
REACT_APP_SENTRY_DSN=your-sentry-dsn

# Enable performance monitoring
npm run monitor
```

### Backup and Recovery
```bash
# Backup database
pg_dump -U postgres adsphere > backup.sql

# Restore database
psql -U postgres adsphere < backup.sql

# Backup Redis
redis-cli BGSAVE
cp dump.rdb backup/
```

### Scaling Configuration
```bash
# Horizontal scaling with Docker Compose
docker-compose up -d --scale api-gateway=3

# Load balancing with Nginx
# Configure upstream blocks in nginx.conf

# Database scaling
# Set up read replicas
# Configure connection pooling
```

---

## 📞 Support and Resources

### Documentation
- **API Documentation**: http://localhost:8000/api/docs
- **Component Library**: http://localhost:3000/storybook
- **Database Schema**: docs/database-schema.md

### Community Support
- **GitHub Issues**: Report bugs and request features
- **Discord Community**: Join for real-time support
- **Knowledge Base**: Comprehensive guides and tutorials

### Professional Support
- **Enterprise Support**: Priority support and SLA
- **Custom Development**: Tailored solutions
- **Training Programs**: Team training and onboarding

---

## 🎉 Next Steps

1. **Complete Setup**: Follow this guide completely
2. **Test Integrations**: Verify Amazon and Walmart API connections
3. **Create Test Campaigns**: Set up sample campaigns
4. **Explore Features**: Test all platform features
5. **Deploy to Production**: Use Docker for production deployment
6. **Monitor Performance**: Set up monitoring and alerts
7. **Scale as Needed**: Add more resources as user base grows

---

**Congratulations! 🎉 You've successfully set up AdSphere Enterprise Platform.**

For additional help, check our comprehensive documentation or contact our support team.

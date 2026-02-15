<<<<<<< HEAD
# BlindOCR Web - Deployment Guide for PythonAnywhere

This guide will walk you through deploying the BlindOCR web application to PythonAnywhere's free tier.

## Prerequisites

1. A PythonAnywhere account (free tier is sufficient)
2. Git installed on your local machine
3. Your application code pushed to a Git repository (GitHub, GitLab, etc.)

## Step 1: Set up PythonAnywhere

1. Log in to your [PythonAnywhere](https://www.pythonanywhere.com/) account
2. Go to the "Web" tab and click on "Add a new web app"
3. Choose "Flask" as the web framework
4. Select the latest Python version (3.9 or later recommended)
5. Use the default project path: `/home/your_username/BlindOCR_Web`

## Step 2: Install System Dependencies

PythonAnywhere's free tier requires some additional setup for system dependencies:

1. Open a new Bash console in PythonAnywhere
2. Run the following commands:
   ```bash
   # Install Tesseract OCR
   sudo apt-get update
   sudo apt-get install tesseract-ocr
   
   # Install Poppler for PDF processing
   sudo apt-get install poppler-utils
   
   # Install additional language packs if needed (example for Spanish)
   # sudo apt-get install tesseract-ocr-spa
   ```

## Step 3: Deploy Your Application

### Option A: Using Git (Recommended)

1. In the PythonAnywhere console:
   ```bash
   # Navigate to your home directory
   cd ~
   
   # Clone your repository
   git clone https://github.com/yourusername/BlindOCR_Web.git
   cd BlindOCR_Web
   ```

### Option B: Using PythonAnywhere's Files Interface

1. Go to the "Files" tab in PythonAnywhere
2. Upload all files from your local `BlindOCR_Web` directory

## Step 4: Set Up Virtual Environment

1. In the PythonAnywhere console:
   ```bash
   # Create a virtual environment
   mkvirtualenv --python=/usr/bin/python3.9 venv
   
   # Activate the virtual environment
   workon venv
   
   # Install requirements
   pip install -r requirements.txt
   ```

## Step 5: Configure Web App

1. Go to the "Web" tab in PythonAnywhere
2. Click on your web app
3. In the "Code" section:
   - Set the source code directory to: `/home/your_username/BlindOCR_Web`
   - Set the working directory to: `/home/your_username/BlindOCR_Web`
   - Set the virtualenv to: `/home/your_username/.virtualenvs/venv`

4. In the "WSGI configuration file" section, update the file to:
   ```python
   import os
   import sys
   
   path = '/home/your_username/BlindOCR_Web'
   if path not in sys.path:
       sys.path.append(path)
   
   from app import app as application
   ```
   (Replace `your_username` with your actual PythonAnywhere username)

## Step 6: Configure Static Files

1. In the "Static files" section:
   - Add a mapping for `/static/` to `/home/your_username/BlindOCR_Web/static/`
   - Add a mapping for `/audio/` to `/home/your_username/BlindOCR_Web/audio/`

2. Create the audio directory if it doesn't exist:
   ```bash
   mkdir -p ~/BlindOCR_Web/audio
   ```

## Step 7: Set Up Scheduled Tasks (Optional)

To clean up old audio files automatically:

1. Go to the "Tasks" tab
2. Add a new scheduled task that runs daily:
   ```bash
   find /home/your_username/BlindOCR_Web/audio -type f -mtime +1 -delete
   ```

## Step 8: Start Your Web App

1. Go to the "Web" tab
2. Click the green "Reload" button to restart your web app
3. Your app should now be live at: `yourusername.pythonanywhere.com`

## Troubleshooting

### Common Issues

1. **Poppler not found**
   - Make sure you've installed poppler-utils
   - Add this to your `app.py` before any imports:
     ```python
     os.environ['PATH'] += ':/usr/bin/'
     ```

2. **Tesseract not found**
   - Verify Tesseract is installed: `which tesseract`
   - Update the path in `app.py` if needed:
     ```python
     pytesseract.pytesseract.tesseract_cmd = r'/usr/bin/tesseract'
     ```

3. **Import errors**
   - Make sure your virtual environment is activated
   - Try reinstalling requirements: `pip install -r requirements.txt`

## Maintenance

- **Updating Your App**:
  1. Push changes to your Git repository
  2. In PythonAnywhere console:
     ```bash
     cd ~/BlindOCR_Web
     git pull
     ```
  3. Reload your web app

- **Viewing Logs**:
  - Check the error logs in the "Web" tab under "Log files"
  - View server logs in the "Logs" tab

## Security Notes

1. The free tier of PythonAnywhere has some limitations:
   - Your app will go to sleep after a period of inactivity
   - You have limited disk space (500MB total)
   - Outbound internet access is restricted

2. For production use, consider:
   - Upgrading to a paid plan
   - Setting up proper HTTPS
   - Implementing user authentication
   - Adding rate limiting

## Support

If you encounter any issues, please check the PythonAnywhere [help pages](https://help.pythonanywhere.com/) or contact their support.
=======
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
>>>>>>> 76b0c50e88babcd097a1bbe60be8675c18c616ea

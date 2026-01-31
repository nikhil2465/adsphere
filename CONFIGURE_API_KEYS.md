# 🔑 API Keys Configuration Guide

## 📋 Required API Credentials

### 1. Amazon Advertising API

#### Step 1: Create Amazon Advertising Account
1. Go to [Amazon Advertising Console](https://advertising.amazon.com/)
2. Sign in with your Amazon account
3. Register for advertising access (may require approval)

#### Step 2: Register Application
1. Visit [Amazon Developer Console](https://developer.amazon.com/)
2. Create a new application
3. Select "Advertising API" under APIs
4. Configure redirect URI: `http://localhost:8000/api/auth/amazon/callback`

#### Step 3: Get Credentials
You'll receive:
- **Client ID**: Your application identifier
- **Client Secret**: Your application secret
- **Refresh Token**: OAuth refresh token (use OAuth flow)
- **Profile ID**: Your advertising profile ID

#### Step 4: Configure in backend/.env
```env
# Amazon Ads API Configuration
AMAZON_CLIENT_ID=your-amazon-client-id-here
AMAZON_CLIENT_SECRET=your-amazon-client-secret-here
AMAZON_REFRESH_TOKEN=your-amazon-refresh-token-here
AMAZON_PROFILE_ID=your-amazon-profile-id-here
AMAZON_REGION=na  # na, eu, or fe
```

### 2. Walmart Advertising API

#### Step 1: Create Walmart Developer Account
1. Go to [Walmart Developer Portal](https://developer.walmart.com/)
2. Register for a developer account
3. Apply for Advertising API access (requires business verification)

#### Step 2: Get API Credentials
Once approved:
- **Client ID**: Your API client identifier
- **Client Secret**: Your API client secret
- **Channel ID**: Your advertising channel ID

#### Step 3: Configure in backend/.env
```env
# Walmart Ads API Configuration
WALMART_CLIENT_ID=your-walmart-client-id-here
WALMART_CLIENT_SECRET=your-walmart-client-secret-here
WALMART_CHANNEL_ID=your-walmart-channel-id-here
WALMART_ENVIRONMENT=sandbox  # sandbox or production
```

## 🛠️ Environment Configuration Steps

### 1. Edit Backend Environment File
Open `backend/.env` and replace placeholder values:

```env
# Database Configuration (keep these defaults for development)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=adsphere
DB_USER=postgres
DB_PASSWORD=password

# Redis Configuration (keep these defaults)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT Configuration (change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# API Gateway Configuration
API_GATEWAY_PORT=8000
FRONTEND_URL=http://localhost:3000

# Microservice URLs (keep these defaults)
AUTH_SERVICE_URL=http://localhost:8001
CAMPAIGN_SERVICE_URL=http://localhost:8002
AD_SERVICE_URL=http://localhost:8003
ANALYTICS_SERVICE_URL=http://localhost:8004
EXPORT_SERVICE_URL=http://localhost:8005
NOTIFICATION_SERVICE_URL=http://localhost:8006

# Amazon Ads API (replace with your credentials)
AMAZON_CLIENT_ID=your-amazon-client-id
AMAZON_CLIENT_SECRET=your-amazon-client-secret
AMAZON_REFRESH_TOKEN=your-amazon-refresh-token
AMAZON_PROFILE_ID=your-amazon-profile-id
AMAZON_REGION=na

# Walmart Ads API (replace with your credentials)
WALMART_CLIENT_ID=your-walmart-client-id
WALMART_CLIENT_SECRET=your-walmart-client-secret
WALMART_CHANNEL_ID=your-walmart-channel-id
WALMART_ENVIRONMENT=sandbox

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
EXPORT_PATH=./exports

# Email Configuration (optional)
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

### 2. Frontend Environment (frontend/.env)
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

# Third-party Services (optional)
REACT_APP_GOOGLE_ANALYTICS_ID=your-ga-id
REACT_APP_SENTRY_DSN=your-sentry-dsn

# Development
GENERATE_SOURCEMAP=true
```

### 3. Mobile Environment (mobile/.env)
```env
# API Configuration
API_BASE_URL=http://localhost:8000/api
API_TIMEOUT=30000

# Application Configuration
APP_NAME=AdSphere
APP_VERSION=1.0.0
APP_DESCRIPTION=Universal Advertising Management Platform

# Push Notifications (optional)
FCM_SERVER_KEY=your-fcm-server-key
PUSH_NOTIFICATION_ENABLED=true

# Biometric Authentication
BIOMETRIC_ENABLED=true

# Analytics
ANALYTICS_ENABLED=true
```

## 🔐 Security Notes

### For Development
- Use sandbox environments when available
- Keep credentials secure and never commit to version control
- Use strong, unique secrets

### For Production
- Change all default passwords and secrets
- Use production API endpoints
- Enable SSL/HTTPS
- Set up proper firewall rules
- Use environment-specific configurations

## 🧪 Testing API Connections

### Test Amazon Connection
```bash
curl -X GET "http://localhost:8000/api/amazon/campaigns" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Walmart Connection
```bash
curl -X GET "http://localhost:8000/api/walmart/campaigns" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📞 Getting Help

### Amazon Support
- [Amazon Advertising API Documentation](https://advertising-api.amazon.com/docs)
- [Amazon Developer Support](https://developer.amazon.com/support)

### Walmart Support
- [Walmart Developer Documentation](https://developer.walmart.com/docs)
- [Walmart API Support](https://developer.walmart.com/contact)

### AdSphere Support
- Check the logs in `backend/logs/` for error details
- Review API documentation at `http://localhost:8000/api/docs`
- Check environment variables are correctly set

## ⚠️ Important Notes

1. **API Approval**: Both Amazon and Walmart require business verification for API access
2. **Rate Limits**: Be aware of API rate limits and implement proper throttling
3. **Sandbox First**: Always test with sandbox environments before production
4. **Credential Rotation**: Regularly rotate API keys and secrets
5. **Monitoring**: Set up monitoring for API usage and errors

## 🚀 Next Steps After Configuration

1. Install dependencies: `npm run install:all`
2. Set up database: `npm run db:migrate`
3. Start services: `npm run dev`
4. Test integrations: Use the API endpoints
5. Build mobile app: `npm run mobile:build-apk`
6. Deploy: `npm run docker:up`

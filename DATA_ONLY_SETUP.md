# 🔍 AdSphere Data-Only Setup Guide

## 📋 Overview

Your AdSphere project has been successfully configured for **data-only retrieval** from Amazon and Walmart advertising platforms. This setup focuses on retrieving and managing existing ad data without any creation capabilities.

## 🚀 What's Been Updated

### 1. Environment Configuration
- ✅ Updated `.env.example` with data-only API credentials
- ✅ Added `AD_INTEGRATION_SERVICE_URL` for data retrieval service
- ✅ Removed OAuth redirect URI (not needed for data-only)

### 2. New Data Retrieval Service
- ✅ Created `ad-integration-service/src/services/data-retrieval.service.ts`
- ✅ Created `ad-integration-service/src/routes/data-retrieval.routes.ts`
- ✅ Created `ad-integration-service/src/index.ts` (standalone service)
- ✅ Added `package.json` and `tsconfig.json` for the service

### 3. API Gateway Updates
- ✅ Added proxy route for `/api/data` endpoints
- ✅ Commented out unused routes for data-only setup
- ✅ Simplified middleware for data retrieval focus

## 🔧 Available Data Endpoints

### Campaign Data
```
GET /api/data/campaigns                    # All campaigns from all platforms
GET /api/data/campaigns/{platform}         # Platform-specific campaigns
```

### Ad Data
```
GET /api/data/ads                          # All ads from all platforms
GET /api/data/ads/{platform}               # Platform-specific ads
```

### Performance Data
```
GET /api/data/performance/campaign/{platform}/{campaignId}?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

### Health & Status
```
GET /api/data/health                        # Connection status to platforms
GET /api/docs                               # Full API documentation
```

## 🔑 Required API Credentials

### Amazon Ads (Read-Only)
```env
AMAZON_CLIENT_ID=your-amazon-client-id
AMAZON_CLIENT_SECRET=your-amazon-client-secret
AMAZON_REFRESH_TOKEN=your-amazon-refresh-token
AMAZON_PROFILE_ID=your-amazon-profile-id
AMAZON_REGION=na
```

### Walmart Ads (Read-Only)
```env
WALMART_CLIENT_ID=your-walmart-client-id
WALMART_CLIENT_SECRET=your-walmart-client-secret
WALMART_CHANNEL_ID=your-walmart-channel-id
WALMART_ENVIRONMENT=sandbox
```

## 🏃‍♂️ Quick Start

### 1. Configure Environment
```bash
# Copy the example environment file
cp backend/.env.example backend/.env

# Edit with your actual API credentials
notepad backend/.env
```

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Start Services
```bash
# Start all services (data-only mode)
npm run dev
```

### 4. Test Data Retrieval
```bash
# Test health check
curl http://localhost:8000/api/data/health

# Test Amazon campaigns (if configured)
curl http://localhost:8000/api/data/campaigns/AMAZON

# Test Walmart campaigns (if configured)
curl http://localhost:8000/api/data/campaigns/WALMART
```

## 📊 Data Capabilities

### What You Can Retrieve
- ✅ **Campaign Data**: Names, status, budget, dates
- ✅ **Ad Data**: Ad details, content, status
- ✅ **Performance Metrics**: Impressions, clicks, conversions, spend, revenue
- ✅ **Keyword Data**: Keywords, bids, performance
- ✅ **Targeting Data**: Targeting criteria and performance

### What You Cannot Do
- ❌ Create new campaigns
- ❌ Create new ads
- ❌ Modify existing campaigns
- ❌ Modify existing ads
- ❌ Delete campaigns or ads

## 🔍 API Usage Examples

### Get All Campaigns
```bash
curl -X GET "http://localhost:8000/api/data/campaigns" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Platform-Specific Campaigns
```bash
curl -X GET "http://localhost:8000/api/data/campaigns/AMAZON" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Campaign Performance
```bash
curl -X GET "http://localhost:8000/api/data/performance/campaign/AMAZON/123456789?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Check Platform Connections
```bash
curl -X GET "http://localhost:8000/api/data/health" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🛠️ Service Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │ Data Retrieval  │
│   (React App)   │───▶│   (Port 8000)   │───▶│   Service       │
│                 │    │                 │    │   (Port 8003)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                              ┌─────────────────┐
                                              │   Amazon Ads    │
                                              │   Walmart Ads   │
                                              │   APIs          │
                                              └─────────────────┘
```

## 📝 Response Format

All data endpoints return consistent JSON responses:

```json
{
  "success": true,
  "data": [...],
  "count": 42,
  "platform": "AMAZON",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Platform not configured",
  "message": "Amazon integration not configured"
}
```

## 🚨 Important Notes

1. **Read-Only Access**: All API credentials should be configured for read-only access
2. **Rate Limits**: Both Amazon and Walmart have API rate limits - implement proper throttling
3. **Sandbox First**: Always test with sandbox environments before production
4. **Data Freshness**: Performance data may have delays depending on platform
5. **Authentication**: JWT tokens required for all data endpoints

## 📞 Support & Troubleshooting

### Common Issues
- **401 Unauthorized**: Check JWT token validity
- **400 Platform not configured**: Verify API credentials in `.env`
- **500 Internal Error**: Check platform API status and credentials

### Debug Information
- Check service logs: `backend/logs/`
- API documentation: `http://localhost:8000/api/docs`
- Health check: `http://localhost:8000/api/data/health`

## 🎯 Next Steps

1. **Get API Credentials**: Apply for Amazon and Walmart developer access
2. **Configure Environment**: Update `.env` with your credentials
3. **Test Connections**: Verify platform connectivity
4. **Build Frontend**: Create dashboard to display retrieved data
5. **Set Up Monitoring**: Monitor API usage and performance

---

**Your AdSphere project is now ready for data-only advertising management!** 🎉

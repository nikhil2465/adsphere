# Real Data Setup Steps - AdSphere

## 🎯 Current Status Analysis

### ✅ Working Components
- **API Gateway**: Port 8000 (running)
- **Data Retrieval Service**: Port 8003 (running)
- **Mock Amazon Data**: Fully functional
- **All API Endpoints**: Working with mock data

### ❌ Missing Components
- **Real Amazon API**: Placeholder credentials
- **Real Walmart API**: Not configured
- **Business Verification**: In progress

## 🚀 Step-by-Step Real Data Setup

### Phase 1: Amazon Real Data

#### Step 1: Complete Amazon Account Setup
1. **Set up billing** in Amazon Advertising Console ✅ (in progress)
2. **Business verification** (1-2 business days)
3. **Wait for approval** ⏳

#### Step 2: Get Amazon API Credentials
After approval, get from Amazon Developer Console:
- **Client ID**: Application identifier
- **Client Secret**: Application secret
- **Profile ID**: Advertising profile ID
- **Refresh Token**: OAuth 2.0 token

#### Step 3: Update Environment
Edit `backend/.env`:
```env
# Replace placeholder values with real credentials
AMAZON_CLIENT_ID=your-real-amazon-client-id
AMAZON_CLIENT_SECRET=your-real-amazon-client-secret
AMAZON_REFRESH_TOKEN=your-real-amazon-refresh-token
AMAZON_PROFILE_ID=your-real-amazon-profile-id
```

#### Step 4: Test Real Data Connection
```bash
# Restart services
npm run dev

# Test health check - should show amazon: true
curl http://localhost:8000/api/data/health

# Test real campaigns
curl http://localhost:8000/api/data/campaigns/AMAZON
```

### Phase 2: Walmart Real Data

#### Step 1: Complete Walmart Developer Registration
1. **Register** at Walmart Developer Portal
2. **Apply for Advertising API** (read-only permissions)
3. **Business verification** (3-7 business days)

#### Step 2: Get Walmart API Credentials
After approval:
- **Client ID**: From developer dashboard
- **Client Secret**: Generated after approval
- **Channel ID**: From Walmart Advertising Console

#### Step 3: Update Environment
```env
# Add Walmart credentials
WALMART_CLIENT_ID=your-real-walmart-client-id
WALMART_CLIENT_SECRET=your-real-walmart-client-secret
WALMART_CHANNEL_ID=your-real-walmart-channel-id
```

### Phase 3: Real API Integration

#### Step 1: Implement Real API Calls
The system is designed to automatically switch from mock to real data when credentials are detected:

```javascript
// Current logic in index.js
const hasAmazonCredentials = process.env.AMAZON_CLIENT_ID && 
                            process.env.AMAZON_CLIENT_ID !== 'your-amazon-client-id';

if (hasAmazonCredentials) {
  // TODO: Implement real Amazon API call
  // Currently returns empty array - needs implementation
} else {
  // Return mock data (current working state)
}
```

#### Step 2: Add Real API Implementation
Need to create real API integration files:
- `src/integrations/real-amazon-ads.js`
- `src/integrations/real-walmart-ads.js`

## 🔧 Current System Architecture

### Data Flow
```
Frontend → API Gateway (8000) → Data Service (8003) → Mock/Real APIs
```

### Auto-Switch Logic
```javascript
// System automatically detects real credentials
if (realCredentials) {
  useRealAPI();
} else {
  useMockData();
}
```

## ⚠️ Impact on Current Functionalities

### ✅ Preserved Components
- **All existing endpoints**: Will continue working
- **Mock data system**: Remains as fallback
- **API Gateway routing**: Unchanged
- **Data structure**: Same format for mock and real data

### 🔄 Changes When Real Data Added
- **Data source**: Switches from mock to real APIs
- **Response format**: Same structure, real data
- **Performance**: May be slower (real API calls)
- **Rate limits**: Real API limits apply

### 🛡️ Safety Features
- **Fallback to mock**: If real API fails
- **Error handling**: Preserved from mock system
- **Data validation**: Same for mock and real data

## 📋 Immediate Action Plan

### Right Now (Today)
1. ✅ **Complete Amazon billing setup** (in progress)
2. ⏳ **Wait for Amazon approval** (1-2 days)
3. 🔄 **Continue Walmart registration**

### After Amazon Approval (1-2 days)
1. 📝 **Get Amazon API credentials**
2. ⚙️ **Update .env file**
3. 🔄 **Restart services**
4. 🧪 **Test real data connection**

### After Walmart Approval (3-7 days)
1. 📝 **Get Walmart API credentials**
2. ⚙️ **Update .env file**
3. 🔄 **Restart services**
4. 🧪 **Test Walmart data**

### Final Step: Real API Implementation
1. 🔧 **Implement real Amazon API calls**
2. 🔧 **Implement real Walmart API calls**
3. 🧪 **Test both platforms**
4. 📊 **Monitor performance**

## 🎯 Success Criteria

### Phase 1 Success
- [ ] Real Amazon credentials in .env
- [ ] Health check shows `amazon: true`
- [ ] Real campaign data returned

### Phase 2 Success  
- [ ] Real Walmart credentials in .env
- [ ] Health check shows `walmart: true`
- [ ] Real Walmart data returned

### Full Success
- [ ] Both platforms returning real data
- [ ] Mock data as fallback
- [ ] All existing functionalities preserved
- [ ] Error handling working
- [ ] Performance acceptable

## 🚨 Important Notes

### No Breaking Changes
- **All current endpoints preserved**
- **Mock data remains as fallback**
- **Same API response format**
- **No frontend changes needed**

### Gradual Transition
- **Can add one platform at a time**
- **Mock data always available**
- **Easy rollback if needed**
- **Zero downtime during transition**

### Security
- **Credentials stored in .env (gitignored)**
- **No hardcoded secrets**
- **Read-only permissions only**
- **Rate limiting preserved**

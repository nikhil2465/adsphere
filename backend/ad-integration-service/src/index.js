const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUiExpress = require('swagger-ui-express');
require('dotenv').config();
const { mockAmazonData, mockWalmartData, getMockDataByPlatform } = require('./mock-data');

const app = express();
const PORT = process.env.AD_INTEGRATION_SERVICE_PORT || 8003;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// General middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AdSphere Data Retrieval Service',
      version: '1.0.0',
      description: 'Data retrieval service for advertising platforms (Amazon, Walmart)',
      contact: {
        name: 'AdSphere Support',
        email: 'support@adsphere.com'
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ad-integration-service',
    version: '1.0.0',
    mode: 'data-retrieval-only'
  });
});

// Service info endpoint
app.get('/info', (req, res) => {
  res.status(200).json({
    service: 'ad-integration-service',
    version: '1.0.0',
    mode: 'data-retrieval-only',
    supportedPlatforms: ['AMAZON', 'WALMART'],
    capabilities: [
      'campaign-retrieval',
      'ad-retrieval', 
      'performance-data',
      'keyword-data',
      'targeting-data'
    ],
    timestamp: new Date().toISOString()
  });
});

// Mock data endpoints for testing
app.get('/api/data/health', (req, res) => {
  const hasAmazonCredentials = process.env.AMAZON_CLIENT_ID && 
                              process.env.AMAZON_CLIENT_ID !== 'your-amazon-client-id';
  const hasWalmartCredentials = process.env.WALMART_CLIENT_ID && 
                                process.env.WALMART_CLIENT_ID !== 'your-walmart-client-id';
  
  let message = 'Using mock data for all platforms';
  if (hasAmazonCredentials && hasWalmartCredentials) {
    message = 'Using real APIs for both platforms';
  } else if (hasAmazonCredentials) {
    message = 'Using real Amazon API, mock Walmart data';
  } else if (hasWalmartCredentials) {
    message = 'Using mock Amazon data, real Walmart API';
  }
  
  res.json({
    success: true,
    data: {
      amazon: hasAmazonCredentials,
      walmart: hasWalmartCredentials,
      mockData: true
    },
    timestamp: new Date().toISOString(),
    message: message
  });
});

app.get('/api/data/campaigns', (req, res) => {
  const hasAmazonCredentials = process.env.AMAZON_CLIENT_ID && 
                              process.env.AMAZON_CLIENT_ID !== 'your-amazon-client-id';
  const hasWalmartCredentials = process.env.WALMART_CLIENT_ID && 
                                process.env.WALMART_CLIENT_ID !== 'your-walmart-client-id';
  
  // Combine campaigns from both platforms
  let allCampaigns = [];
  let sources = [];
  
  if (hasAmazonCredentials) {
    // TODO: Implement real Amazon API call
    // allCampaigns.push(...realAmazonCampaigns);
    sources.push('REAL_AMAZON_API');
  } else {
    allCampaigns.push(...mockAmazonData.campaigns);
    sources.push('MOCK_AMAZON_DATA');
  }
  
  if (hasWalmartCredentials) {
    // TODO: Implement real Walmart API call
    // allCampaigns.push(...realWalmartCampaigns);
    sources.push('REAL_WALMART_API');
  } else {
    allCampaigns.push(...mockWalmartData.campaigns);
    sources.push('MOCK_WALMART_DATA');
  }
  
  res.json({
    success: true,
    data: allCampaigns,
    count: allCampaigns.length,
    platform: 'ALL',
    sources: sources,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/data/campaigns/:platform', (req, res) => {
  const { platform } = req.params;
  const platformUpper = platform.toUpperCase();
  
  if (platformUpper === 'AMAZON') {
    const hasAmazonCredentials = process.env.AMAZON_CLIENT_ID && 
                                process.env.AMAZON_CLIENT_ID !== 'your-amazon-client-id';
    
    if (hasAmazonCredentials) {
      // TODO: Implement real Amazon API call
      res.json({
        success: true,
        data: [],
        count: 0,
        platform: platformUpper,
        source: 'REAL_AMAZON_API',
        message: 'Real Amazon API integration coming soon'
      });
    } else {
      // Return mock Amazon data
      res.json({
        success: true,
        data: mockAmazonData.campaigns,
        count: mockAmazonData.campaigns.length,
        platform: platformUpper,
        source: 'MOCK_AMAZON_DATA',
        timestamp: new Date().toISOString()
      });
    }
  } else if (platformUpper === 'WALMART') {
    const hasWalmartCredentials = process.env.WALMART_CLIENT_ID && 
                                  process.env.WALMART_CLIENT_ID !== 'your-walmart-client-id';
    
    if (hasWalmartCredentials) {
      // TODO: Implement real Walmart API call
      res.json({
        success: true,
        data: [],
        count: 0,
        platform: platformUpper,
        source: 'REAL_WALMART_API',
        message: 'Real Walmart API integration coming soon'
      });
    } else {
      // Return mock Walmart data
      res.json({
        success: true,
        data: mockWalmartData.campaigns,
        count: mockWalmartData.campaigns.length,
        platform: platformUpper,
        source: 'MOCK_WALMART_DATA',
        timestamp: new Date().toISOString()
      });
    }
  } else {
    res.status(400).json({
      success: false,
      error: 'Invalid platform',
      message: 'Platform must be AMAZON or WALMART'
    });
  }
});

app.get('/api/data/ads', (req, res) => {
  const { campaignId } = req.query;
  const hasAmazonCredentials = process.env.AMAZON_CLIENT_ID && 
                              process.env.AMAZON_CLIENT_ID !== 'your-amazon-client-id';
  
  let ads = mockAmazonData.ads;
  if (campaignId) {
    ads = ads.filter(ad => ad.campaignId === campaignId);
  }
  
  res.json({
    success: true,
    data: ads,
    count: ads.length,
    filtered: campaignId ? `by campaign ${campaignId}` : 'all ads',
    source: hasAmazonCredentials ? 'REAL_API' : 'MOCK_DATA',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/data/ads/:platform', (req, res) => {
  const { platform } = req.params;
  const { campaignId } = req.query;
  
  if (platform.toUpperCase() === 'AMAZON') {
    let ads = mockAmazonData.ads;
    if (campaignId) {
      ads = ads.filter(ad => ad.campaignId === campaignId);
    }
    
    res.json({
      success: true,
      data: ads,
      count: ads.length,
      platform: platform.toUpperCase(),
      filtered: campaignId ? `by campaign ${campaignId}` : 'all ads',
      source: 'MOCK_DATA',
      timestamp: new Date().toISOString()
    });
  } else if (platform.toUpperCase() === 'WALMART') {
    res.json({
      success: true,
      data: [],
      count: 0,
      platform: platform.toUpperCase(),
      message: 'Walmart API integration coming soon'
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Invalid platform',
      message: 'Platform must be AMAZON or WALMART'
    });
  }
});

app.get('/api/data/performance/campaign/:platform/:campaignId', (req, res) => {
  const { platform, campaignId } = req.params;
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      error: 'Missing parameters',
      message: 'startDate and endDate are required'
    });
  }
  
  if (platform.toUpperCase() === 'AMAZON') {
    const performance = mockAmazonData.performance[campaignId];
    if (performance) {
      res.json({
        success: true,
        data: performance,
        campaignId,
        platform: platform.toUpperCase(),
        period: { startDate, endDate },
        source: 'MOCK_DATA',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Campaign not found',
        message: `No performance data for campaign ${campaignId}`
      });
    }
  } else {
    res.status(400).json({
      success: false,
      error: 'Platform not supported',
      message: 'Only AMAZON platform is supported in mock data'
    });
  }
});

app.get('/api/data/keywords/:platform/:campaignId', (req, res) => {
  const { platform, campaignId } = req.params;
  
  if (platform.toUpperCase() === 'AMAZON') {
    const keywords = mockAmazonData.keywords.filter(kw => kw.campaignId === campaignId);
    res.json({
      success: true,
      data: keywords,
      count: keywords.length,
      campaignId,
      platform: platform.toUpperCase(),
      source: 'MOCK_DATA',
      timestamp: new Date().toISOString()
    });
  } else {
    res.json({
      success: true,
      data: [],
      count: 0,
      campaignId,
      platform: platform.toUpperCase(),
      message: 'Keyword data not available for this platform'
    });
  }
});

app.get('/api/data/targeting/:platform/:campaignId', (req, res) => {
  const { platform, campaignId } = req.params;
  
  if (platform.toUpperCase() === 'AMAZON') {
    const targeting = mockAmazonData.targeting.filter(tgt => tgt.campaignId === campaignId);
    res.json({
      success: true,
      data: targeting,
      count: targeting.length,
      campaignId,
      platform: platform.toUpperCase(),
      source: 'MOCK_DATA',
      timestamp: new Date().toISOString()
    });
  } else {
    res.json({
      success: true,
      data: [],
      count: 0,
      campaignId,
      platform: platform.toUpperCase(),
      message: 'Targeting data not available for this platform'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      'GET /api/data/campaigns',
      'GET /api/data/campaigns/:platform',
      'GET /api/data/ads',
      'GET /api/data/ads/:platform',
      'GET /api/data/performance/campaign/:platform/:campaignId',
      'GET /api/data/keywords/:platform/:campaignId',
      'GET /api/data/targeting/:platform/:campaignId',
      'GET /api/data/health',
      'GET /health',
      'GET /info',
      'GET /api/docs'
    ]
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Ad Integration Service (Data Retrieval) running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`ℹ️  Service Info: http://localhost:${PORT}/info`);
  console.log(`🔗 Data Endpoints: http://localhost:${PORT}/api/data/*`);
});

module.exports = app;

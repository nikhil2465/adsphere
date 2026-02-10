import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
// import dataRetrievalRoutes from './routes/data-retrieval.routes';
// import logger from '@adsphere/shared-utils/src/utils/logger';

dotenv.config();

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
  apis: ['./src/routes/*.ts'],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));

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

// Data retrieval routes
// app.use('/api/data', dataRetrievalRoutes);

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
      'GET /api/data/health',
      'GET /health',
      'GET /info',
      'GET /api/docs'
    ]
  });
});

// Error handling middleware (simple version for data-only setup)
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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

export default app;

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Import routes (commented out for data-only setup)
// import authRoutes from './routes/auth';
// import campaignRoutes from './routes/campaigns';
// import adRoutes from './routes/ads';
// import analyticsRoutes from './routes/analytics';
// import exportRoutes from './routes/export';
// import notificationRoutes from './routes/notifications';

// Import middleware (commented out for data-only setup)
// import { errorHandler } from './middleware/errorHandler';
// import { requestLogger } from './middleware/requestLogger';

dotenv.config();

const app = express();
const PORT = process.env.API_GATEWAY_PORT || 8000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// General middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// Request logging middleware (simple version for data-only setup)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AdSphere API Gateway',
      version: '1.0.0',
      description: 'Universal Advertising Management Platform API',
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
    service: 'api-gateway',
    version: '1.0.0'
  });
});

// Proxy middleware for microservices
const serviceProxies = {
  '/api/auth': {
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:8001',
    changeOrigin: true,
  },
  '/api/campaigns': {
    target: process.env.CAMPAIGN_SERVICE_URL || 'http://localhost:8002',
    changeOrigin: true,
  },
  '/api/ads': {
    target: process.env.AD_SERVICE_URL || 'http://localhost:8003',
    changeOrigin: true,
  },
  '/api/analytics': {
    target: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:8004',
    changeOrigin: true,
  },
  '/api/export': {
    target: process.env.EXPORT_SERVICE_URL || 'http://localhost:8005',
    changeOrigin: true,
  },
  '/api/notifications': {
    target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8006',
    changeOrigin: true,
  },
  // Data retrieval service proxy (read-only)
  '/api/data': {
    target: process.env.AD_INTEGRATION_SERVICE_URL || 'http://localhost:8003',
    changeOrigin: true,
  },
};

// Apply proxy middleware for each service
Object.entries(serviceProxies).forEach(([path, options]) => {
  app.use(path, createProxyMiddleware(options));
});

// Direct routes (commented out for data-only setup)
// app.use('/api', authRoutes);
// app.use('/api', campaignRoutes);
// app.use('/api', adRoutes);
// app.use('/api', analyticsRoutes);
// app.use('/api', exportRoutes);
// app.use('/api', notificationRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handling middleware (simple version for data-only setup)
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});

export default app;

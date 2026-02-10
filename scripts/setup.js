#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up AdSphere Enterprise Platform...\n');

// Create necessary directories
const directories = [
  'logs',
  'uploads',
  'exports',
  'temp',
  'config',
  'docs/api',
  'backend/shared-utils/src/models',
  'backend/shared-utils/src/validators',
  'backend/shared-utils/src/middleware',
  'backend/api-gateway/src/routes',
  'backend/api-gateway/src/middleware',
  'backend/auth-service/src',
  'backend/ad-integration-service/src',
  'backend/data-processing-service/src',
  'backend/notification-service/src',
  'frontend/src/components',
  'frontend/src/pages',
  'frontend/src/store',
  'frontend/src/services',
  'frontend/src/utils',
  'frontend/src/hooks',
  'frontend/src/types',
  'mobile/src/components',
  'mobile/src/screens',
  'mobile/src/navigation',
  'mobile/src/store',
  'mobile/src/services',
  'mobile/src/utils',
  'mobile/src/types',
];

directories.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  } else {
    console.log(`ℹ️  Directory already exists: ${dir}`);
  }
});

// Create environment files
const envFiles = [
  {
    path: 'backend/.env.example',
    content: `# Database Configuration
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
AMAZON_REDIRECT_URI=http://localhost:8000/api/auth/amazon/callback
AMAZON_API_BASE_URL=https://advertising-api.amazon.com

# Walmart Ads API
WALMART_CLIENT_ID=your-walmart-client-id
WALMART_CLIENT_SECRET=your-walmart-client-secret
WALMART_API_BASE_URL=https://api.walmart.com

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
EXPORT_PATH=./exports

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs

# Development
NODE_ENV=development
`,
  },
  {
    path: 'frontend/.env.example',
    content: `# API Configuration
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
`,
  },
  {
    path: 'mobile/.env.example',
    content: `# API Configuration
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
`,
  },
];

envFiles.forEach(({ path: filePath, content }) => {
  const fullPath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Created environment file: ${filePath}`);
  } else {
    console.log(`ℹ️  Environment file already exists: ${filePath}`);
  }
});

// Create Docker configuration
const dockerCompose = `version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15
    container_name: adsphere-postgres
    environment:
      POSTGRES_DB: adsphere
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/shared-utils/src/database/migrate.sql:/docker-entrypoint-initdb.d/migrate.sql
    networks:
      - adsphere-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: adsphere-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - adsphere-network

  # API Gateway
  api-gateway:
    build:
      context: ./backend/api-gateway
      dockerfile: Dockerfile
    container_name: adsphere-api-gateway
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis
    networks:
      - adsphere-network

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: adsphere-frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_BASE_URL=http://localhost:8000/api
    depends_on:
      - api-gateway
    networks:
      - adsphere-network

volumes:
  postgres_data:
  redis_data:

networks:
  adsphere-network:
    driver: bridge
`;

const dockerComposePath = path.join(__dirname, '..', 'docker', 'docker-compose.yml');
if (!fs.existsSync(dockerComposePath)) {
  fs.writeFileSync(dockerComposePath, dockerCompose);
  console.log('✅ Created Docker Compose configuration');
} else {
  console.log('ℹ️  Docker Compose configuration already exists');
}

// Create package.json scripts for easy development
const rootPackageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(rootPackageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf8'));
  
  if (!packageJson.scripts.setup) {
    packageJson.scripts.setup = 'node scripts/setup.js';
    fs.writeFileSync(rootPackageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Added setup script to root package.json');
  }
}

// Create .gitignore
const gitignore = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
/backend/*/dist/
/frontend/build/
/mobile/android/app/build/
/mobile/ios/build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# Application specific
uploads/
exports/
temp/
*.db
*.sqlite

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Mobile specific
mobile/android/app/release/
mobile/android/app/debug/
mobile/ios/build/
mobile/node_modules/
`;

const gitignorePath = path.join(__dirname, '..', '.gitignore');
if (!fs.existsSync(gitignorePath)) {
  fs.writeFileSync(gitignorePath, gitignore);
  console.log('✅ Created .gitignore file');
} else {
  console.log('ℹ️  .gitignore file already exists');
}

console.log('\n🎉 Setup completed successfully!\n');
console.log('📋 Next steps:');
console.log('1. Copy environment files:');
console.log('   cp backend/.env.example backend/.env');
console.log('   cp frontend/.env.example frontend/.env');
console.log('   cp mobile/.env.example mobile/.env');
console.log('\n2. Install dependencies:');
console.log('   npm run install:all');
console.log('\n3. Set up database:');
console.log('   npm run db:migrate');
console.log('\n4. Start development servers:');
console.log('   npm run dev');
console.log('\n5. Build mobile APK:');
console.log('   npm run mobile:build-apk');
console.log('\n📚 For detailed instructions, check the README.md file.');

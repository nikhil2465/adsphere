# AdSphere - Enterprise Advertising Management Platform

🚀 **Universal Advertising Management Solution for Marketplaces**

A comprehensive, enterprise-grade platform for managing advertisements across multiple marketplaces including Amazon, Walmart, and more. Built with modern microservices architecture and cross-platform mobile support.

## 🌟 Key Features

### 📊 **Multi-Platform Integration**
- **Amazon Ads**: Sponsored Products, Brands, Display, DSP
- **Walmart Ads**: Sponsored Products, Brands, Search Brand Amplifier
- **Extensible Architecture**: Easy addition of new marketplaces
- **Real-time Synchronization**: Automatic data fetching and updates

### 🎯 **Advanced Ads Manager**
- **Unified Dashboard**: Single view of all campaigns
- **Campaign Management**: Create, edit, optimize ads
- **Performance Analytics**: Comprehensive metrics and insights
- **A/B Testing**: Optimize ad performance
- **Budget Management**: Automated bidding and budget allocation

### 📱 **Cross-Platform Mobile App**
- **Android APK**: Ready-to-deploy mobile application
- **Real-time Notifications**: Instant alerts for performance changes
- **Offline Support**: Core functionality without internet
- **Push Notifications**: Critical updates and alerts

### 📈 **Data & Analytics**
- **Advanced Reporting**: Custom reports and dashboards
- **Data Export**: CSV, Excel, PDF formats
- **API Access**: RESTful API for integrations
- **Real-time Analytics**: Live performance monitoring

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Mobile App    │    │  External APIs  │
│   (React)       │    │ (React Native)  │    │ (Amazon, Walmart)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   API Gateway   │
                    │   (Express)     │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Auth Service   │    │Ad Integration   │    │ Data Processing │
│                 │    │    Service      │    │    Service      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Database      │
                    │ (PostgreSQL)    │
                    └─────────────────┘
```

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ and npm 8+
- PostgreSQL 14+
- Docker & Docker Compose (optional)
- Android Studio (for mobile development)

### 1. **Installation**
```bash
# Clone and setup
cd "C:\Program Files (x86)\adsphere"
npm run setup
npm run install:all
```

### 2. **Environment Configuration**
```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Configure your API keys
# Edit backend/.env with your marketplace credentials
```

### 3. **Database Setup**
```bash
# Start PostgreSQL (or use Docker)
cd backend
npm run db:migrate
npm run db:seed
```

### 4. **Start Development Servers**
```bash
# Start all services
npm run dev

# Individual services
npm run dev:backend  # Backend on http://localhost:8000
npm run dev:frontend # Frontend on http://localhost:3000
```

### 5. **Build Mobile APK**
```bash
# Build Android APK
npm run mobile:build-apk
# APK will be in mobile/android/app/build/outputs/apk/
```

## 📱 Mobile Application

### Features
- **Campaign Management**: Create and manage ads on-the-go
- **Performance Monitoring**: Real-time metrics and alerts
- **Push Notifications**: Instant updates on campaign changes
- **Offline Mode**: Access critical data without internet
- **Biometric Authentication**: Secure access to your account

### APK Installation
1. Build the APK using `npm run mobile:build-apk`
2. Transfer APK to Android device
3. Enable "Install from unknown sources" in settings
4. Install and launch the app

## 🔧 Configuration

### Amazon Ads API Setup
1. Create Amazon Advertising account
2. Register application in Amazon Developer Console
3. Obtain Client ID and Client Secret
4. Configure in `backend/.env`

### Walmart Ads API Setup
1. Create Walmart Developer account
2. Register for Ads API access
3. Obtain API credentials
4. Configure in `backend/.env`

## 📊 Data Export Formats

### Supported Formats
- **CSV**: Excel-compatible data export
- **Excel**: Formatted spreadsheets with charts
- **PDF**: Professional reports with visualizations
- **JSON**: Raw data for API integrations

### Export Types
- Campaign performance reports
- Ad group analytics
- Keyword performance
- Budget utilization
- ROI analysis

## 🐳 Docker Deployment

```bash
# Build and deploy all services
npm run docker:build
npm run docker:up

# Access services
# Web App: http://localhost:3000
# API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## 📚 API Documentation

### Authentication
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

### Get Campaigns
```bash
curl -X GET http://localhost:8000/api/campaigns \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Export Data
```bash
curl -X POST http://localhost:8000/api/export/csv \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"campaignId":"123","dateRange":"30d"}'
```

## 🔒 Security Features

- **OAuth 2.0 Authentication**: Secure user authentication
- **API Rate Limiting**: Prevent abuse and ensure stability
- **Data Encryption**: End-to-end encryption for sensitive data
- **Audit Logging**: Complete audit trail for all actions
- **Role-Based Access Control**: Granular permissions

## 🌍 Internationalization

- **Multi-language Support**: English, Spanish, French, German
- **Currency Support**: USD, EUR, GBP, CAD, AUD
- **Regional Compliance**: GDPR, CCPA compliant
- **Time Zone Handling**: Automatic timezone detection

## 📞 Support & Contributing

### Getting Help
- **Documentation**: Check `/docs` folder
- **API Reference**: http://localhost:8000/docs
- **Issues**: Create GitHub issues for bugs
- **Community**: Join our Discord community

### Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🏢 Enterprise Features

### Advanced Analytics
- **Predictive Analytics**: ML-powered performance predictions
- **Competitive Intelligence**: Market and competitor analysis
- **Automated Optimization**: AI-driven bid management
- **Custom Dashboards**: Tailored analytics views

### Team Collaboration
- **Multi-user Support**: Team-based account management
- **Approval Workflows**: Multi-level campaign approvals
- **Activity Feeds**: Real-time team activity tracking
- **Shared Libraries**: Common assets and templates

### Enterprise Integrations
- **Slack/Teams**: Real-time notifications
- **Google Analytics**: Enhanced tracking
- **Salesforce**: CRM integration
- **Zapier**: 3000+ app integrations

---

**AdSphere** - Transform your advertising management across all marketplaces. 🚀

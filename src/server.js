const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const businessesRouter = require('./routes/businesses');
const advertisingRouter = require('./routes/advertising');
const facebookRouter = require('./routes/facebook');
const googleAdSenseRouter = require('./routes/googleAdSense');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/businesses', businessesRouter);
app.use('/api/advertising', advertisingRouter);
app.use('/api/facebook', facebookRouter);
app.use('/api/google-adsense', googleAdSenseRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Hernandez Advertising Platform'
  });
});

// Root endpoint with API documentation
app.get('/', (req, res) => {
  res.json({
    name: 'Hernandez Advertising Platform API',
    version: '1.0.0',
    description: 'Easy to deploy advertising platform with Secretary of State integration',
    endpoints: {
      health: 'GET /health',
      businesses: {
        list: 'GET /api/businesses',
        get: 'GET /api/businesses/:id',
        create: 'POST /api/businesses',
        update: 'PUT /api/businesses/:id',
        delete: 'DELETE /api/businesses/:id',
        validate: 'POST /api/businesses/:id/validate',
        sync: 'POST /api/businesses/:id/sync',
        hours: 'POST /api/businesses/:id/hours',
        holidays: 'POST /api/businesses/:id/holidays'
      },
      advertising: {
        allPackages: 'GET /api/advertising/packages',
        radioPackages: 'GET /api/advertising/radio',
        digitalPackages: 'GET /api/advertising/digital',
        printPackages: 'GET /api/advertising/print',
        eventsPackages: 'GET /api/advertising/events',
        websitePackages: 'GET /api/advertising/website',
        allOptions: 'GET /api/advertising/all',
        createPackage: 'POST /api/advertising/packages',
        subscribe: 'POST /api/advertising/subscribe',
        businessAdvertising: 'GET /api/advertising/business/:businessId',
        updateSubscription: 'PUT /api/advertising/subscription/:id'
      },
      facebook: {
        packages: 'GET /api/facebook/packages',
        createPage: 'POST /api/facebook/pages',
        getPages: 'GET /api/facebook/pages/:business_id',
        createCampaign: 'POST /api/facebook/campaigns',
        getCampaigns: 'GET /api/facebook/campaigns/:business_id',
        getCampaignInsights: 'GET /api/facebook/campaigns/:campaign_id/insights',
        updateCampaignStatus: 'PUT /api/facebook/campaigns/:campaign_id/status'
      },
      googleAdSense: {
        packages: 'GET /api/google-adsense/packages',
        combinedPackages: 'GET /api/google-adsense/combined-packages',
        createAccount: 'POST /api/google-adsense/accounts',
        getAccount: 'GET /api/google-adsense/accounts/:business_id',
        createAdUnit: 'POST /api/google-adsense/ad-units',
        getAdUnits: 'GET /api/google-adsense/ad-units/:account_id',
        getReport: 'GET /api/google-adsense/reports/:account_id'
      }
    },
    features: [
      'Secretary of State business validation',
      'Multi-platform sync (Google, Yellow Pages)',
      'Business hours and holiday management',
      'Radio, digital, and print advertising packages',
      'Facebook Page creation and Ads Manager integration',
      'Google AdSense setup and management',
      'Full demographic and geographic targeting',
      'Combined Facebook + AdSense packages',
      'Real-time data (no mock data)',
      'Easy deployment with Docker'
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    path: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║   Hernandez Advertising Platform                                ║
║   Server running on port ${PORT}                                   ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║   API Documentation: http://localhost:${PORT}                       ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;

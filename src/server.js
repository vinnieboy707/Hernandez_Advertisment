const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const businessesRouter = require('./routes/businesses');
const advertisingRouter = require('./routes/advertising');

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
        allOptions: 'GET /api/advertising/all',
        createPackage: 'POST /api/advertising/packages',
        subscribe: 'POST /api/advertising/subscribe',
        businessAdvertising: 'GET /api/advertising/business/:businessId',
        updateSubscription: 'PUT /api/advertising/subscription/:id'
      }
    },
    features: [
      'Secretary of State business validation',
      'Multi-platform sync (Google, Yellow Pages)',
      'Business hours and holiday management',
      'Radio, digital, and print advertising packages',
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

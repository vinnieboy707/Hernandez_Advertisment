# 🎯 Hernandez Advertising Platform

An easy-to-deploy, easy-to-use advertising platform that validates official business information through the Secretary of State and syncs across multiple platforms. Now with **Facebook Ads and Google AdSense integration** for complete digital advertising management!

## ✨ Features

### Business Management
- **Secretary of State Integration**: Automatically validate business registration and contact information
- **Multi-Platform Sync**: Sync business information across Google Business Profile, Yellow Pages, and other platforms
- **Business Hours Management**: Set and manage open hours and scheduled holidays

### Advertising Solutions
- **Facebook Marketing**: Create Facebook pages and run targeted ad campaigns
  - Full demographic targeting (age, gender, education, income)
  - Geographic targeting (countries, cities, regions, ZIP codes)
  - Interest and behavior-based targeting
  - Campaign performance tracking and insights
- **Google AdSense**: Setup and manage AdSense for website monetization
  - Account creation and ad unit management
  - Multiple ad formats (display, in-feed, in-article, multiplex)
  - Performance reporting and revenue tracking
- **Traditional Advertising**: Radio, digital, print, events, and website packages
- **Combined Packages**: Integrated Facebook + AdSense solutions

### Technical Features
- **Real-Time Data**: No mock data - all information is validated and synchronized in real-time
- **Easy Deployment**: Deploy with Docker in minutes
- **RESTful API**: Complete API for all operations
- **Modern Web Dashboard**: React-based admin interface
- **Simplified Process**: Everything managed through one platform

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL 15+ (handled by Docker)

### Deployment with Docker (Recommended)

1. **Clone the repository**:
```bash
git clone https://github.com/vinnieboy707/Hernandez_Advertisment.git
cd Hernandez_Advertisment
```

2. **Configure environment variables**:
```bash
cp .env.example .env
# Edit .env with your API keys and credentials
```

3. **Start the application**:
```bash
docker-compose up -d
```

4. **Access the platform**:
- API: http://localhost:3000
- API Documentation: http://localhost:3000
- Health Check: http://localhost:3000/health

### Local Development

1. **Install dependencies**:
```bash
npm install
cd client && npm install
```

2. **Set up PostgreSQL database**:
```bash
# Create database
createdb hernandez_ads

# Set DATABASE_URL in .env
DATABASE_URL=postgresql://username:password@localhost:5432/hernandez_ads
```

3. **Initialize database**:
```bash
npm run init-db
```

4. **Start the backend server**:
```bash
npm run dev
```

5. **Start the frontend** (in another terminal):
```bash
cd client
npm start
```

## 📋 API Documentation

### Business Endpoints

#### Get All Businesses
```http
GET /api/businesses
```

#### Get Business by ID
```http
GET /api/businesses/:id
```

#### Create Business
```http
POST /api/businesses
Content-Type: application/json

{
  "business_name": "Example Business",
  "sos_registration_number": "C1234567",
  "contact_email": "info@example.com",
  "contact_phone": "(555) 123-4567",
  "address": "123 Main St",
  "city": "Los Angeles",
  "state": "CA",
  "zip_code": "90001",
  "business_type": "Restaurant"
}
```

#### Validate Business with Secretary of State
```http
POST /api/businesses/:id/validate
```

#### Sync Business to All Platforms
```http
POST /api/businesses/:id/sync
```

#### Update Business Hours
```http
POST /api/businesses/:id/hours
Content-Type: application/json

{
  "hours": [
    {
      "day_of_week": 1,
      "open_time": "09:00",
      "close_time": "17:00",
      "is_closed": false
    }
  ]
}
```

#### Add Holiday
```http
POST /api/businesses/:id/holidays
Content-Type: application/json

{
  "holiday_name": "Christmas",
  "holiday_date": "2024-12-25",
  "is_closed": true
}
```

### Advertising Endpoints

#### Get All Advertising Packages
```http
GET /api/advertising/packages
```

#### Get Radio Advertising Packages
```http
GET /api/advertising/radio
```

#### Get Digital Advertising Packages
```http
GET /api/advertising/digital
```

#### Get Print Advertising Packages
```http
GET /api/advertising/print
```

#### Get All Advertising Options
```http
GET /api/advertising/all
```

### Facebook Marketing Endpoints

#### Get Facebook Advertising Packages
```http
GET /api/facebook/packages
```

#### Create Facebook Page
```http
POST /api/facebook/pages
Content-Type: application/json

{
  "business_id": 1,
  "name": "My Business",
  "about": "Business description",
  "category_id": "2500",
  "city": "Los Angeles",
  "state": "CA",
  "website": "https://mybusiness.com"
}
```

#### Create Facebook Ad Campaign
```http
POST /api/facebook/campaigns
Content-Type: application/json

{
  "business_id": 1,
  "ad_account_id": "act_123456789",
  "campaign_name": "Local Awareness",
  "objective": "REACH",
  "budget_amount": 500,
  "budget_type": "lifetime",
  "targeting": {
    "age_min": 25,
    "age_max": 55,
    "genders": [1, 2],
    "geo_locations": {
      "countries": ["US"],
      "cities": [{"key": "2418779", "name": "Los Angeles"}]
    }
  }
}
```

#### Get Campaign Insights
```http
GET /api/facebook/campaigns/:campaign_id/insights
```

### Google AdSense Endpoints

#### Get AdSense Packages
```http
GET /api/google-adsense/packages
```

#### Get Combined Packages (Facebook + AdSense)
```http
GET /api/google-adsense/combined-packages
```

#### Create AdSense Account
```http
POST /api/google-adsense/accounts
Content-Type: application/json

{
  "business_id": 1,
  "business_name": "My Business",
  "website_url": "https://mybusiness.com",
  "contact_email": "owner@mybusiness.com"
}
```

#### Create Ad Unit
```http
POST /api/google-adsense/ad-units
Content-Type: application/json

{
  "business_id": 1,
  "account_id": 1,
  "name": "Homepage Banner",
  "ad_type": "display",
  "size": "responsive"
}
```

#### Get Performance Report
```http
GET /api/google-adsense/reports/:account_id?start_date=2024-01-01&end_date=2024-01-31
```

#### Subscribe Business to Package
```http
POST /api/advertising/subscribe
Content-Type: application/json

{
  "business_id": 1,
  "package_id": 1,
  "start_date": "2024-01-01"
}
```

📚 **For complete API documentation, see:**
- [FACEBOOK_ADSENSE_API.md](FACEBOOK_ADSENSE_API.md) - Detailed API reference
- [FACEBOOK_GOOGLE_SETUP.md](FACEBOOK_GOOGLE_SETUP.md) - Setup guide for Facebook & Google credentials

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/hernandez_ads

# Server Configuration
PORT=3000
NODE_ENV=development

# Secretary of State API Keys (State-specific)
SOS_API_KEY=your_secretary_of_state_api_key
SOS_STATE=CA

# Google Business Profile API
GOOGLE_API_KEY=your_google_api_key
GOOGLE_BUSINESS_ACCOUNT_ID=your_google_business_account_id

# Yellow Pages API
YELLOWPAGES_API_KEY=your_yellowpages_api_key

# Radio Station API
RADIO_API_KEY=your_radio_station_api_key

# Facebook Marketing API
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Google AdSense API
GOOGLE_ADSENSE_CLIENT_ID=your_client_id
GOOGLE_ADSENSE_CLIENT_SECRET=your_client_secret
GOOGLE_ADSENSE_REFRESH_TOKEN=your_refresh_token
```

**Setup Guides:**
- See [FACEBOOK_GOOGLE_SETUP.md](FACEBOOK_GOOGLE_SETUP.md) for detailed instructions on obtaining Facebook and Google credentials

### State-Specific Configuration

The platform supports multiple states for Secretary of State validation:
- California (CA)
- New York (NY)
- Texas (TX)
- And more...

Each state has different API endpoints and validation requirements. Configure `SOS_STATE` in your `.env` file.

## 📊 Database Schema

The platform uses PostgreSQL with the following main tables:

- **businesses**: Store business information
- **business_hours**: Operating hours by day of week
- **holidays**: Scheduled holidays and closures
- **platform_sync**: Track synchronization status across platforms
- **advertising_packages**: Available advertising packages
- **business_advertising**: Business subscription to packages
- **facebook_pages**: Facebook business pages
- **facebook_campaigns**: Facebook ad campaigns with targeting
- **google_adsense_accounts**: Google AdSense accounts
- **google_adsense_units**: AdSense ad units
- **business_hours**: Store operating hours by day of week
- **holidays**: Store scheduled holidays and closures
- **platform_sync**: Track synchronization status across platforms
- **advertising_packages**: Available advertising packages
- **business_advertising**: Business subscriptions to advertising packages

## 🎨 Frontend Dashboard

The React-based dashboard provides:

- **Home**: Overview and quick stats
- **Businesses**: Add, edit, and manage businesses
- **Advertising Options**: Browse and subscribe to advertising packages

Access the dashboard at http://localhost:3000 (when using the proxy in development).

## 📦 Advertising Packages

### Radio Advertising
- Morning Drive Time Premium
- Afternoon Drive Time
- Weekend Package
- All-Day Rotation
- 3-Month Bundle Campaigns

### Digital Advertising
- Social Media Boost
- Search Engine Marketing
- Display Advertising
- Video Advertising

### Print Advertising
- Local Newspaper Ads
- Community Magazines
- Direct Mail Campaigns

## 🔒 Security Features

- Rate limiting on API endpoints
- Helmet.js for security headers
- Input validation
- Prepared statements for SQL queries
- Environment-based configuration

## 🧪 Testing

To test the API:

```bash
# Health check
curl http://localhost:3000/health

# Get all businesses
curl http://localhost:3000/api/businesses

# Get advertising options
curl http://localhost:3000/api/advertising/all
```

## 📝 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, please open an issue in the GitHub repository.

## 🌟 Roadmap

- [ ] Additional platform integrations (Yelp, Bing Places)
- [ ] Email notification system
- [ ] Advanced analytics dashboard
- [ ] Mobile application
- [ ] Payment processing integration
- [ ] Multi-language support
- [ ] Automated reporting

---

Built with ❤️ by Hernandez Advertising

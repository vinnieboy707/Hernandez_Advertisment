# 🎯 Hernandez Advertising Platform

An easy-to-deploy, easy-to-use advertising platform that validates official business information through the Secretary of State and syncs across multiple platforms including Google Business Profile, Yellow Pages, and more.

## ✨ Features

- **Secretary of State Integration**: Automatically validate business registration and contact information
- **Multi-Platform Sync**: Sync business information across Google Business Profile, Yellow Pages, and other platforms
- **Business Hours Management**: Set and manage open hours and scheduled holidays
- **Advertising Packages**: Access to radio stations, digital, and print advertising options with real pricing
- **Real-Time Data**: No mock data - all information is validated and synchronized in real-time
- **Easy Deployment**: Deploy with Docker in minutes
- **RESTful API**: Complete API for all operations
- **Modern Web Dashboard**: React-based admin interface

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
```

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

# System Architecture

## Overview

The Hernandez Advertising Platform is a full-stack application designed for easy deployment and use, with integration to the Secretary of State and multiple advertising platforms.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React Frontend (Port 3001 - dev / served by API - prod)│  │
│  │  - Business Management Dashboard                        │  │
│  │  - Advertising Package Browser                          │  │
│  │  - Real-time Status Updates                             │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Server Layer                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Express.js Server (Port 3000)                          │  │
│  │  - RESTful API Endpoints                                │  │
│  │  - Request Validation & Rate Limiting                   │  │
│  │  - Security (Helmet, CORS)                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌───────────────┬──────────┴──────────┬──────────────────┐   │
│  │               │                     │                  │   │
│  ▼               ▼                     ▼                  ▼   │
│ ┌────────┐  ┌─────────┐         ┌──────────┐      ┌─────────┐│
│ │Business│  │Advertis-│         │Secretary │      │Platform ││
│ │Routes  │  │ing      │         │of State  │      │Sync     ││
│ │        │  │Routes   │         │Service   │      │Service  ││
│ └────────┘  └─────────┘         └──────────┘      └─────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Integration Layer                            │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │  Secretary   │    Google    │    Yellow    │    Radio     │ │
│  │  of State    │   Business   │    Pages     │   Stations   │ │
│  │  API         │   Profile    │    API       │    APIs      │ │
│  │              │   API        │              │              │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Database Layer                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database (Port 5432)                        │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │  Tables:                                           │ │  │
│  │  │  - businesses                                      │ │  │
│  │  │  - business_hours                                  │ │  │
│  │  │  - holidays                                        │ │  │
│  │  │  - platform_sync                                   │ │  │
│  │  │  - advertising_packages                            │ │  │
│  │  │  - business_advertising                            │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Descriptions

### Frontend Layer

**Technology**: React 18
**Purpose**: User interface for business owners and administrators

**Features**:
- Business registration and management
- Hours and holiday configuration
- Platform synchronization controls
- Advertising package browsing and subscription
- Real-time validation feedback

### API Server Layer

**Technology**: Node.js + Express.js
**Port**: 3000
**Purpose**: RESTful API server handling all business logic

**Key Components**:
- **Business Routes**: CRUD operations for businesses, validation, sync
- **Advertising Routes**: Package management and subscriptions
- **Middleware**: Security (Helmet), CORS, rate limiting, error handling

**Security Features**:
- Rate limiting (100 requests per 15 minutes)
- Helmet.js security headers
- Input validation and sanitization
- SQL injection prevention with prepared statements

### Service Layer

**Purpose**: Business logic and external integrations

**Services**:

1. **Secretary of State Service**
   - Validates business registration numbers
   - Retrieves official business information
   - Supports multiple states (CA, NY, TX, etc.)

2. **Platform Sync Service**
   - Google Business Profile sync
   - Yellow Pages sync
   - Extensible for additional platforms

3. **Advertising Service**
   - Manages advertising packages
   - Radio station packages
   - Digital advertising options
   - Print advertising options
   - Subscription management

### Integration Layer

**External APIs**:

1. **Secretary of State APIs**
   - State-specific business validation
   - Official contact information
   - Business status verification

2. **Google Business Profile API**
   - Business listing management
   - Hours synchronization
   - Holiday updates

3. **Yellow Pages API**
   - Business directory listings
   - Contact information sync

4. **Radio Station APIs**
   - Advertising package information
   - Campaign management

### Database Layer

**Technology**: PostgreSQL 15
**Port**: 5432

**Schema**:

```sql
businesses
  ├─ id (PK)
  ├─ business_name
  ├─ sos_registration_number (UNIQUE)
  ├─ contact_email
  ├─ contact_phone
  ├─ address, city, state, zip_code
  ├─ business_type
  ├─ validated (boolean)
  └─ timestamps

business_hours
  ├─ id (PK)
  ├─ business_id (FK → businesses)
  ├─ day_of_week (0-6)
  ├─ open_time, close_time
  └─ is_closed

holidays
  ├─ id (PK)
  ├─ business_id (FK → businesses)
  ├─ holiday_name
  ├─ holiday_date
  └─ special_hours

platform_sync
  ├─ id (PK)
  ├─ business_id (FK → businesses)
  ├─ platform_name
  ├─ platform_business_id
  ├─ sync_status
  └─ last_synced

advertising_packages
  ├─ id (PK)
  ├─ package_name
  ├─ package_type (radio/digital/print)
  ├─ description
  ├─ price
  ├─ duration_days
  ├─ features (JSONB)
  └─ provider_info

business_advertising
  ├─ id (PK)
  ├─ business_id (FK → businesses)
  ├─ package_id (FK → advertising_packages)
  ├─ start_date, end_date
  └─ status
```

## Data Flow

### Business Registration Flow

```
1. User submits business information
   │
2. API receives and validates input
   │
3. Secretary of State Service validates registration
   │
4. Business saved to database with validation status
   │
5. Response returned to user with validation result
```

### Platform Sync Flow

```
1. User requests platform sync
   │
2. API fetches complete business data (hours, holidays)
   │
3. Platform Sync Service formats data for each platform
   │
4. Parallel API calls to Google, Yellow Pages, etc.
   │
5. Sync results saved to platform_sync table
   │
6. Response with sync status for each platform
```

### Advertising Subscription Flow

```
1. User browses advertising packages
   │
2. User selects package and business
   │
3. API validates business and package existence
   │
4. Subscription created with calculated end date
   │
5. Business can access advertising benefits
```

## Deployment Architecture

### Docker Deployment

```
┌─────────────────────────────────────┐
│  Docker Host                        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  hernandez_ads_api          │   │
│  │  (Node.js + Express)        │   │
│  │  Port: 3000                 │   │
│  └────────────┬────────────────┘   │
│               │                     │
│  ┌────────────▼────────────────┐   │
│  │  hernandez_ads_db           │   │
│  │  (PostgreSQL 15)            │   │
│  │  Port: 5432                 │   │
│  │  Volume: postgres_data      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  hernandez_ads_db_init      │   │
│  │  (One-time initialization)  │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Scalability Considerations

**Horizontal Scaling**:
- Multiple API server instances behind load balancer
- Database connection pooling
- Caching layer (Redis) for frequently accessed data

**Vertical Scaling**:
- Increase container resources
- Optimize database queries with indexes
- Implement query result caching

## Security Architecture

### Authentication & Authorization
- API key-based authentication for external services
- Rate limiting to prevent abuse
- Request validation and sanitization

### Data Protection
- Prepared statements prevent SQL injection
- CORS configuration limits cross-origin requests
- Helmet.js adds security headers
- Environment variables for sensitive data

### Network Security
- HTTPS in production (with reverse proxy)
- Firewall rules limit database access
- Docker network isolation

## Monitoring & Logging

### Health Checks
- API health endpoint: `/health`
- Database connection monitoring
- Service availability checks

### Logging
- Application logs via console
- Docker logs: `docker-compose logs`
- Error tracking and reporting

## Performance Optimizations

### Database
- Indexed columns for fast queries
- Connection pooling
- Prepared statement caching

### API
- Response compression
- Query result caching
- Efficient data serialization

### Frontend
- React production builds
- Code splitting
- Asset optimization

## Future Enhancements

### Planned Features
- [ ] Redis caching layer
- [ ] WebSocket for real-time updates
- [ ] Background job processing (Bull/Redis)
- [ ] Email notification service
- [ ] Advanced analytics dashboard
- [ ] Multi-tenant support
- [ ] Mobile application
- [ ] Payment processing integration

### Scalability Roadmap
- [ ] Kubernetes deployment
- [ ] Microservices architecture
- [ ] Event-driven architecture
- [ ] GraphQL API option
- [ ] CDN for static assets

## Technology Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 18.2.0 |
| Backend | Node.js | 18+ |
| Framework | Express.js | 4.18.2 |
| Database | PostgreSQL | 15 |
| Containerization | Docker | 20.10+ |
| Orchestration | Docker Compose | 2.0+ |

## Development Workflow

```
Developer
    │
    ├─► Local Development (npm run dev)
    │   ├─ Hot reload with nodemon
    │   └─ React dev server
    │
    ├─► Testing (curl/Postman)
    │   └─ API endpoint validation
    │
    ├─► Git Commit
    │   └─ Push to repository
    │
    └─► Deployment
        ├─ Docker build
        ├─ Container start
        └─ Health check validation
```

## Support & Maintenance

### Regular Maintenance
- Update dependencies monthly
- Security patches as needed
- Database backups daily
- Log rotation weekly

### Monitoring Points
- API response times
- Database query performance
- Error rates
- External API availability

---

For questions about the architecture, see:
- [README.md](README.md) - General overview
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment details
- [QUICKSTART.md](QUICKSTART.md) - Getting started

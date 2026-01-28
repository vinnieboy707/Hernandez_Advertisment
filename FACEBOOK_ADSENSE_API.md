# Facebook & Google AdSense API Documentation

Complete API documentation for Facebook Ads and Google AdSense integration features.

## Table of Contents
- [Facebook Marketing API](#facebook-marketing-api)
- [Google AdSense API](#google-adsense-api)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Rate Limits](#rate-limits)

---

## Facebook Marketing API

### Get Facebook Advertising Packages

Get all available Facebook advertising packages with pricing and features.

**Endpoint:** `GET /api/facebook/packages`

**Response:**
```json
[
  {
    "package_type": "facebook_ads",
    "provider_name": "Facebook Marketing",
    "packages": [
      {
        "name": "Facebook Local Awareness - Basic",
        "description": "Reach local customers within 10 miles with basic demographic targeting",
        "price": 500,
        "duration_days": 30,
        "features": {
          "page_creation": true,
          "geographic_radius": "10 miles",
          "demographic_targeting": "basic",
          "estimated_reach": 5000,
          "ad_placements": ["Facebook Feed", "Instagram Feed"],
          "daily_budget": 15
        }
      }
    ]
  }
]
```

---

### Create Facebook Page

Create a Facebook Business Page for a business.

**Endpoint:** `POST /api/facebook/pages`

**Request Body:**
```json
{
  "business_id": 1,
  "name": "My Business Name",
  "about": "Business description",
  "category_id": "2500",
  "city": "Los Angeles",
  "state": "CA",
  "street": "123 Main St",
  "zip": "90001",
  "phone": "(555) 123-4567",
  "website": "https://mybusiness.com"
}
```

**Response:**
```json
{
  "message": "Facebook page created successfully",
  "page": {
    "id": 1,
    "business_id": 1,
    "facebook_page_id": "123456789",
    "page_name": "My Business Name",
    "category": "2500",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### Get Facebook Pages

Get all Facebook pages for a business.

**Endpoint:** `GET /api/facebook/pages/:business_id`

**Response:**
```json
{
  "pages": [
    {
      "id": 1,
      "business_id": 1,
      "facebook_page_id": "123456789",
      "page_name": "My Business Name",
      "page_url": "https://facebook.com/mybusiness",
      "status": "active"
    }
  ]
}
```

---

### Create Ad Campaign

Create a Facebook ad campaign with full demographic and geographic targeting.

**Endpoint:** `POST /api/facebook/campaigns`

**Request Body:**
```json
{
  "business_id": 1,
  "ad_account_id": "act_123456789",
  "campaign_name": "Summer Sale 2024",
  "objective": "REACH",
  "budget_amount": 1200,
  "budget_type": "lifetime",
  "targeting": {
    "age_min": 25,
    "age_max": 55,
    "genders": [1, 2],
    "geo_locations": {
      "countries": ["US"],
      "cities": [
        {"key": "2418779", "name": "Los Angeles"}
      ],
      "regions": [
        {"key": "3847", "name": "California"}
      ],
      "zips": ["90001", "90002"]
    },
    "interests": ["6003139266461", "6003107902433"],
    "behaviors": ["6002714895372"],
    "demographics": {
      "education_statuses": [1, 2, 3],
      "income": [2, 3, 4]
    },
    "locale": ["en_US"]
  },
  "creative": {
    "object_story_spec": {
      "page_id": "123456789",
      "link_data": {
        "message": "Check out our summer sale!",
        "link": "https://mybusiness.com/sale",
        "image_hash": "abcd1234",
        "name": "Summer Sale"
      }
    }
  },
  "start_time": "2024-06-01T00:00:00Z",
  "end_time": "2024-08-31T23:59:59Z"
}
```

**Targeting Options:**

**Demographics:**
- `age_min`, `age_max`: Age range (18-65+)
- `genders`: [1=male, 2=female, 3=all]
- `education_statuses`: [1=High School, 2=Some College, 3=Bachelor's, 4=Graduate]
- `income`: [1=Top 10%, 2=Top 25%, 3=Top 50%, 4=All]

**Geographic:**
- `countries`: Array of country codes (e.g., ["US", "CA"])
- `cities`: Array of city objects with key and name
- `regions`: Array of region/state objects
- `zips`: Array of ZIP codes

**Interests & Behaviors:**
- `interests`: Array of Facebook interest IDs
- `behaviors`: Array of Facebook behavior IDs

**Response:**
```json
{
  "message": "Campaign created successfully",
  "campaign": {
    "id": 1,
    "business_id": 1,
    "campaign_id": "23851234567890123",
    "campaign_name": "Summer Sale 2024",
    "objective": "REACH",
    "status": "paused",
    "budget_amount": 1200,
    "budget_type": "lifetime",
    "targeting": { ... }
  }
}
```

---

### Get Campaigns

Get all campaigns for a business.

**Endpoint:** `GET /api/facebook/campaigns/:business_id`

**Response:**
```json
{
  "campaigns": [
    {
      "id": 1,
      "campaign_id": "23851234567890123",
      "campaign_name": "Summer Sale 2024",
      "status": "active",
      "impressions": 15000,
      "reach": 12000,
      "clicks": 450,
      "spend": 150.50
    }
  ]
}
```

---

### Get Campaign Insights

Get detailed performance metrics for a campaign.

**Endpoint:** `GET /api/facebook/campaigns/:campaign_id/insights`

**Response:**
```json
{
  "campaign": {
    "id": 1,
    "campaign_name": "Summer Sale 2024",
    "status": "active"
  },
  "insights": {
    "impressions": 15000,
    "reach": 12000,
    "clicks": 450,
    "spend": 150.50,
    "cpm": 10.03,
    "cpc": 0.33,
    "ctr": 3.0,
    "actions": [
      {
        "action_type": "link_click",
        "value": 450
      }
    ]
  }
}
```

---

### Update Campaign Status

Change campaign status (activate, pause, or delete).

**Endpoint:** `PUT /api/facebook/campaigns/:campaign_id/status`

**Request Body:**
```json
{
  "status": "active"
}
```

**Valid statuses:** `active`, `paused`, `deleted`

**Response:**
```json
{
  "message": "Campaign status updated",
  "campaign_id": "23851234567890123",
  "status": "active"
}
```

---

## Google AdSense API

### Get Google AdSense Packages

Get all available Google AdSense packages.

**Endpoint:** `GET /api/google-adsense/packages`

**Response:**
```json
[
  {
    "package_type": "google_adsense",
    "provider_name": "Google AdSense",
    "packages": [
      {
        "name": "AdSense Starter",
        "description": "Basic AdSense setup with responsive display ads",
        "price": 300,
        "duration_days": 90,
        "features": {
          "account_setup": true,
          "ad_units": 3,
          "ad_types": ["Display Ads"],
          "estimated_monthly_revenue": "50-200"
        }
      }
    ]
  }
]
```

---

### Get Combined Packages

Get combined Facebook + AdSense packages.

**Endpoint:** `GET /api/google-adsense/combined-packages`

**Response:**
```json
[
  {
    "package_type": "combined",
    "provider_name": "Complete Digital Advertising",
    "packages": [
      {
        "name": "Digital Growth Bundle",
        "price": 1800,
        "duration_days": 90,
        "features": {
          "facebook_page": true,
          "facebook_ads": "Local targeting",
          "facebook_budget": 40,
          "adsense_setup": true,
          "adsense_ad_units": 5
        }
      }
    ]
  }
]
```

---

### Create AdSense Account

Create a Google AdSense account for a business.

**Endpoint:** `POST /api/google-adsense/accounts`

**Request Body:**
```json
{
  "business_id": 1,
  "business_name": "My Business",
  "website_url": "https://mybusiness.com",
  "contact_email": "owner@mybusiness.com",
  "phone": "(555) 123-4567"
}
```

**Response:**
```json
{
  "message": "AdSense account application submitted. Manual approval required from Google.",
  "account": {
    "id": 1,
    "business_id": 1,
    "website_url": "https://mybusiness.com",
    "account_status": "pending_approval",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### Get AdSense Account

Get AdSense account details for a business.

**Endpoint:** `GET /api/google-adsense/accounts/:business_id`

**Response:**
```json
{
  "account": {
    "id": 1,
    "business_id": 1,
    "adsense_account_id": "pub-1234567890123456",
    "website_url": "https://mybusiness.com",
    "account_status": "active",
    "approval_date": "2024-01-15T00:00:00Z"
  }
}
```

---

### Create Ad Unit

Create a new AdSense ad unit.

**Endpoint:** `POST /api/google-adsense/ad-units`

**Request Body:**
```json
{
  "business_id": 1,
  "account_id": 1,
  "name": "Homepage Banner",
  "ad_type": "display",
  "size": "responsive",
  "placement_location": "header"
}
```

**Ad Types:** `display`, `in-feed`, `in-article`, `multiplex`
**Sizes:** `responsive`, `728x90`, `300x250`, `160x600`, etc.

**Response:**
```json
{
  "message": "Ad unit created successfully",
  "ad_unit": {
    "id": 1,
    "ad_unit_id": "1234567890",
    "ad_unit_name": "Homepage Banner",
    "ad_type": "display",
    "ad_size": "responsive",
    "ad_code": "<script async src=\"...\">...</script>",
    "status": "active"
  }
}
```

---

### Get Ad Units

Get all ad units for an account.

**Endpoint:** `GET /api/google-adsense/ad-units/:account_id`

**Response:**
```json
{
  "ad_units": [
    {
      "id": 1,
      "ad_unit_id": "1234567890",
      "ad_unit_name": "Homepage Banner",
      "ad_type": "display",
      "status": "active",
      "impressions": 50000,
      "clicks": 150,
      "earnings": 75.50
    }
  ]
}
```

---

### Get Performance Report

Get AdSense performance metrics for a date range.

**Endpoint:** `GET /api/google-adsense/reports/:account_id?start_date=2024-01-01&end_date=2024-01-31`

**Query Parameters:**
- `start_date`: Start date (YYYY-MM-DD)
- `end_date`: End date (YYYY-MM-DD)

**Response:**
```json
{
  "account": {
    "id": 1,
    "adsense_account_id": "pub-1234567890123456"
  },
  "report": {
    "rows": [
      {
        "date": "2024-01-01",
        "impressions": 1500,
        "clicks": 45,
        "estimated_earnings": 22.50,
        "page_views": 1200,
        "ctr": 3.0
      }
    ],
    "totals": {
      "impressions": 50000,
      "clicks": 1500,
      "estimated_earnings": 750.00
    }
  },
  "date_range": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  }
}
```

---

## Authentication

### Facebook Authentication

To use Facebook Marketing API features, you need:

1. **Facebook App**: Create an app at https://developers.facebook.com
2. **Access Token**: Generate a user access token with these permissions:
   - `pages_manage_metadata`
   - `pages_read_engagement`
   - `ads_management`
   - `business_management`
3. **Ad Account**: Business Manager ad account ID

Set these in your `.env` file:
```
FACEBOOK_ACCESS_TOKEN=your_long_lived_access_token
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
```

### Google AdSense Authentication

To use Google AdSense API features:

1. **Google Cloud Project**: Create project at https://console.cloud.google.com
2. **Enable AdSense Management API**
3. **OAuth 2.0 Credentials**: Create OAuth client ID
4. **Generate Refresh Token**: Use OAuth flow to get refresh token

Set these in your `.env` file:
```
GOOGLE_ADSENSE_CLIENT_ID=your_client_id
GOOGLE_ADSENSE_CLIENT_SECRET=your_client_secret
GOOGLE_ADSENSE_REFRESH_TOKEN=your_refresh_token
```

---

## Error Handling

All endpoints return errors in this format:

```json
{
  "error": "Error message description"
}
```

**HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request (invalid input)
- `404`: Not Found
- `500`: Internal Server Error

---

## Rate Limits

- **General API**: 100 requests per 15 minutes per IP
- **Facebook API**: Subject to Facebook's rate limits
- **Google AdSense API**: Subject to Google's quota limits

---

## Example: Complete Facebook Campaign Setup

```bash
# 1. Create Facebook Page
curl -X POST http://localhost:3000/api/facebook/pages \
  -H "Content-Type: application/json" \
  -d '{
    "business_id": 1,
    "name": "My Business",
    "about": "Business description",
    "category_id": "2500",
    "city": "Los Angeles",
    "state": "CA",
    "street": "123 Main St",
    "zip": "90001",
    "phone": "(555) 123-4567",
    "website": "https://mybusiness.com"
  }'

# 2. Create Ad Campaign
curl -X POST http://localhost:3000/api/facebook/campaigns \
  -H "Content-Type: application/json" \
  -d '{
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
    },
    "start_time": "2024-06-01T00:00:00Z",
    "end_time": "2024-06-30T23:59:59Z"
  }'

# 3. Activate Campaign
curl -X PUT http://localhost:3000/api/facebook/campaigns/23851234567890123/status \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}'

# 4. Check Performance
curl http://localhost:3000/api/facebook/campaigns/23851234567890123/insights
```

---

## Support

For API support and questions:
- Documentation: See README.md
- Issues: GitHub Issues
- Email: support@hernandez-advertising.com

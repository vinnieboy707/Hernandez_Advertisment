# API Testing Examples

This document provides examples of how to test the Hernandez Advertising Platform API using curl.

## Prerequisites

- Platform running on http://localhost:3000
- curl installed
- jq installed (optional, for pretty JSON output)

## Health Check

```bash
curl http://localhost:3000/health | jq
```

## Business Endpoints

### Get All Businesses

```bash
curl http://localhost:3000/api/businesses | jq
```

### Create a New Business

```bash
curl -X POST http://localhost:3000/api/businesses \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "Test Restaurant",
    "sos_registration_number": "C9999999",
    "contact_email": "test@restaurant.com",
    "contact_phone": "(555) 111-2222",
    "address": "123 Test Street",
    "city": "Los Angeles",
    "state": "CA",
    "zip_code": "90001",
    "business_type": "Restaurant"
  }' | jq
```

### Get a Specific Business

```bash
# Replace {id} with actual business ID
curl http://localhost:3000/api/businesses/1 | jq
```

### Update a Business

```bash
# Replace {id} with actual business ID
curl -X PUT http://localhost:3000/api/businesses/1 \
  -H "Content-Type: application/json" \
  -d '{
    "contact_phone": "(555) 999-8888",
    "contact_email": "updated@restaurant.com"
  }' | jq
```

### Validate Business with Secretary of State

```bash
# Replace {id} with actual business ID
curl -X POST http://localhost:3000/api/businesses/1/validate | jq
```

### Sync Business to All Platforms

```bash
# Replace {id} with actual business ID
curl -X POST http://localhost:3000/api/businesses/1/sync | jq
```

### Sync to Specific Platforms

```bash
# Replace {id} with actual business ID
curl -X POST http://localhost:3000/api/businesses/1/sync \
  -H "Content-Type: application/json" \
  -d '{
    "platforms": ["google", "yellowpages"]
  }' | jq
```

### Add Business Hours

```bash
# Replace {id} with actual business ID
curl -X POST http://localhost:3000/api/businesses/1/hours \
  -H "Content-Type: application/json" \
  -d '{
    "hours": [
      {"day_of_week": 1, "open_time": "09:00", "close_time": "17:00", "is_closed": false},
      {"day_of_week": 2, "open_time": "09:00", "close_time": "17:00", "is_closed": false},
      {"day_of_week": 3, "open_time": "09:00", "close_time": "17:00", "is_closed": false},
      {"day_of_week": 4, "open_time": "09:00", "close_time": "17:00", "is_closed": false},
      {"day_of_week": 5, "open_time": "09:00", "close_time": "17:00", "is_closed": false},
      {"day_of_week": 6, "open_time": "10:00", "close_time": "14:00", "is_closed": false},
      {"day_of_week": 0, "is_closed": true}
    ]
  }' | jq
```

### Add Holiday

```bash
# Replace {id} with actual business ID
curl -X POST http://localhost:3000/api/businesses/1/holidays \
  -H "Content-Type: application/json" \
  -d '{
    "holiday_name": "Christmas",
    "holiday_date": "2024-12-25",
    "is_closed": true
  }' | jq
```

### Delete a Business

```bash
# Replace {id} with actual business ID
curl -X DELETE http://localhost:3000/api/businesses/1 | jq
```

## Advertising Endpoints

### Get All Advertising Packages

```bash
curl http://localhost:3000/api/advertising/packages | jq
```

### Get Radio Advertising Packages

```bash
curl http://localhost:3000/api/advertising/radio | jq
```

### Get Digital Advertising Packages

```bash
curl http://localhost:3000/api/advertising/digital | jq
```

### Get Print Advertising Packages

```bash
curl http://localhost:3000/api/advertising/print | jq
```

### Get All Advertising Options

```bash
curl http://localhost:3000/api/advertising/all | jq
```

### Create Custom Advertising Package

```bash
curl -X POST http://localhost:3000/api/advertising/packages \
  -H "Content-Type: application/json" \
  -d '{
    "package_name": "Custom Radio Package",
    "package_type": "radio",
    "description": "Custom radio advertising package",
    "price": 650.00,
    "duration_days": 30,
    "features": {
      "spots_per_day": 3,
      "time_slots": ["morning", "evening"]
    },
    "provider_name": "Custom Radio Network",
    "provider_contact": "custom@radio.com"
  }' | jq
```

### Subscribe Business to Advertising Package

```bash
curl -X POST http://localhost:3000/api/advertising/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "business_id": 1,
    "package_id": 1,
    "start_date": "2024-02-01"
  }' | jq
```

### Get Business Advertising Subscriptions

```bash
# Replace {businessId} with actual business ID
curl http://localhost:3000/api/advertising/business/1 | jq
```

### Update Subscription Status

```bash
# Replace {id} with actual subscription ID
curl -X PUT http://localhost:3000/api/advertising/subscription/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "cancelled"
  }' | jq
```

## Batch Testing Script

Create a file `test-api.sh`:

```bash
#!/bin/bash

API_URL="http://localhost:3000"

echo "Testing Health Endpoint..."
curl -s $API_URL/health | jq

echo -e "\nTesting Businesses Endpoint..."
curl -s $API_URL/api/businesses | jq

echo -e "\nTesting Advertising Packages..."
curl -s $API_URL/api/advertising/all | jq

echo -e "\nCreating Test Business..."
BUSINESS_ID=$(curl -s -X POST $API_URL/api/businesses \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "Auto Test Business",
    "sos_registration_number": "C'$(date +%s)'",
    "contact_email": "autotest@example.com",
    "contact_phone": "(555) 000-0000",
    "address": "123 Auto Test St",
    "city": "Los Angeles",
    "state": "CA",
    "zip_code": "90001",
    "business_type": "Test"
  }' | jq -r '.business.id')

echo "Created business with ID: $BUSINESS_ID"

if [ ! -z "$BUSINESS_ID" ] && [ "$BUSINESS_ID" != "null" ]; then
  echo -e "\nValidating Business..."
  curl -s -X POST $API_URL/api/businesses/$BUSINESS_ID/validate | jq
  
  echo -e "\nAdding Business Hours..."
  curl -s -X POST $API_URL/api/businesses/$BUSINESS_ID/hours \
    -H "Content-Type: application/json" \
    -d '{
      "hours": [
        {"day_of_week": 1, "open_time": "09:00", "close_time": "17:00", "is_closed": false}
      ]
    }' | jq
fi

echo -e "\nTest Complete!"
```

Make it executable and run:

```bash
chmod +x test-api.sh
./test-api.sh
```

## Using Postman

Import the following as a Postman collection:

1. Create a new collection "Hernandez Advertising Platform"
2. Add base URL variable: `{{base_url}}` = `http://localhost:3000`
3. Import the endpoints above as individual requests
4. Organize into folders: Businesses, Advertising, Health

## Common Response Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid input data
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists (duplicate)
- `500 Internal Server Error`: Server error

## Notes

- Replace placeholder IDs (`{id}`, `1`, etc.) with actual values from your database
- Some endpoints require existing resources (e.g., can't sync a business that doesn't exist)
- API keys in `.env` must be configured for full functionality
- Rate limiting is enabled (100 requests per 15 minutes by default)

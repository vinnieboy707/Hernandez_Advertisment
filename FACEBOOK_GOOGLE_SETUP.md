# Facebook & Google AdSense Setup Guide

Complete guide to setting up Facebook Marketing API and Google AdSense API integrations.

## Table of Contents
- [Facebook Marketing API Setup](#facebook-marketing-api-setup)
- [Google AdSense API Setup](#google-adsense-api-setup)
- [Testing Your Setup](#testing-your-setup)
- [Troubleshooting](#troubleshooting)

---

## Facebook Marketing API Setup

### Prerequisites
- Facebook account
- Business Manager account
- Ad account with payment method

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com)
2. Click **"My Apps"** → **"Create App"**
3. Select **"Business"** as app type
4. Fill in app details:
   - **App Name**: Your app name (e.g., "Hernandez Advertising")
   - **Contact Email**: Your email
5. Click **"Create App"**

### Step 2: Configure App Settings

1. In your app dashboard, go to **Settings** → **Basic**
2. Note your **App ID** and **App Secret**
3. Add **App Domains**: Your domain (e.g., `hernandez-ads.com`)
4. Under **"Add a Product"**, add:
   - **Facebook Login**
   - **Marketing API**

### Step 3: Generate Access Token

#### Option A: Using Graph API Explorer (Development)

1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app from dropdown
3. Click **"Generate Access Token"**
4. Grant these permissions:
   - `pages_manage_metadata`
   - `pages_read_engagement`
   - `pages_read_user_content`
   - `ads_management`
   - `ads_read`
   - `business_management`
5. Click **"Generate Access Token"** and copy it

#### Option B: Get Long-Lived Token (Production)

```bash
# Exchange short-lived token for long-lived token
curl -G https://graph.facebook.com/v18.0/oauth/access_token \
  -d grant_type=fb_exchange_token \
  -d client_id=YOUR_APP_ID \
  -d client_secret=YOUR_APP_SECRET \
  -d fb_exchange_token=SHORT_LIVED_TOKEN
```

**Important**: Long-lived tokens last ~60 days. Implement token refresh in production.

### Step 4: Get Ad Account ID

1. Go to [Facebook Business Manager](https://business.facebook.com)
2. Click **"Business Settings"** → **"Accounts"** → **"Ad Accounts"**
3. Your Ad Account ID will be like `123456789`
4. Use format `act_123456789` in API calls

### Step 5: Configure Environment Variables

Add to your `.env` file:

```bash
FACEBOOK_ACCESS_TOKEN=your_long_lived_access_token_here
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
FACEBOOK_API_VERSION=v18.0
```

### Step 6: Verify Setup

Test your credentials:

```bash
# Test API access
curl -G https://graph.facebook.com/v18.0/me/accounts \
  -d access_token=YOUR_ACCESS_TOKEN

# Expected response: List of pages you manage
```

---

## Google AdSense API Setup

### Prerequisites
- Google account
- Verified website
- AdSense account (can be created during setup)

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **"Select Project"** → **"New Project"**
3. Enter project details:
   - **Project Name**: "Hernandez Advertising Platform"
   - **Location**: Your organization (if applicable)
4. Click **"Create"**

### Step 2: Enable AdSense Management API

1. In your project, go to **"APIs & Services"** → **"Library"**
2. Search for **"AdSense Management API"**
3. Click on it and press **"Enable"**
4. Also enable **"AdSense Host API"** (optional, for advanced features)

### Step 3: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Configure consent screen (first time only):
   - **User Type**: External
   - **App Name**: Your app name
   - **User Support Email**: Your email
   - **Scopes**: Add `https://www.googleapis.com/auth/adsense.readonly`
   - Add test users if needed
4. Create OAuth Client:
   - **Application Type**: Web application
   - **Name**: "Hernandez Advertising Platform"
   - **Authorized redirect URIs**: `http://localhost:3000/oauth2callback`
5. Download JSON credentials

### Step 4: Generate Refresh Token

Use this Node.js script to get your refresh token:

```javascript
// oauth-token.js
const { google } = require('googleapis');
const readline = require('readline');

const oauth2Client = new google.auth.OAuth2(
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  'http://localhost:3000/oauth2callback'
);

const scopes = [
  'https://www.googleapis.com/auth/adsense.readonly',
  'https://www.googleapis.com/auth/adsense'
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes
});

console.log('Authorize this app by visiting:', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter the code from that page: ', async (code) => {
  rl.close();
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('\nRefresh Token:', tokens.refresh_token);
    console.log('\nAdd this to your .env file:');
    console.log(`GOOGLE_ADSENSE_REFRESH_TOKEN=${tokens.refresh_token}`);
  } catch (error) {
    console.error('Error retrieving token:', error);
  }
});
```

Run it:

```bash
npm install googleapis
node oauth-token.js
```

### Step 5: Configure Environment Variables

Add to your `.env` file:

```bash
GOOGLE_ADSENSE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_ADSENSE_CLIENT_SECRET=your_client_secret
GOOGLE_ADSENSE_REFRESH_TOKEN=your_refresh_token
GOOGLE_API_KEY=your_api_key  # Optional, for additional features
```

### Step 6: Verify Setup

Test your credentials:

```bash
# Using the platform API
curl http://localhost:3000/api/google-adsense/packages
```

---

## Testing Your Setup

### Test Facebook Integration

```bash
# 1. Start the server
npm start

# 2. Get Facebook packages
curl http://localhost:3000/api/facebook/packages

# 3. Create a test page (replace business_id with your actual business ID)
curl -X POST http://localhost:3000/api/facebook/pages \
  -H "Content-Type: application/json" \
  -d '{
    "business_id": 1,
    "name": "Test Business Page",
    "about": "Test page",
    "category_id": "2500",
    "city": "Los Angeles",
    "state": "CA",
    "street": "123 Test St",
    "zip": "90001",
    "phone": "(555) 555-5555",
    "website": "https://testbusiness.com"
  }'

# 4. Expected: Page created successfully
```

### Test Google AdSense Integration

```bash
# 1. Get AdSense packages
curl http://localhost:3000/api/google-adsense/packages

# 2. Create AdSense account
curl -X POST http://localhost:3000/api/google-adsense/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "business_id": 1,
    "business_name": "Test Business",
    "website_url": "https://testbusiness.com",
    "contact_email": "owner@testbusiness.com",
    "phone": "(555) 555-5555"
  }'

# 3. Expected: Account application submitted
```

### Test Combined Packages

```bash
# Get combined Facebook + AdSense packages
curl http://localhost:3000/api/google-adsense/combined-packages
```

---

## Troubleshooting

### Facebook Issues

#### Error: "Invalid OAuth access token"

**Cause**: Token expired or invalid

**Solution**:
1. Generate a new access token from Graph API Explorer
2. For production, implement automatic token refresh
3. Check token permissions include all required scopes

#### Error: "User must be an admin of the page"

**Cause**: Access token doesn't have page management permissions

**Solution**:
1. Ensure you're a page admin
2. Re-generate token with `pages_manage_metadata` permission
3. Grant permission to your app to manage the page

#### Error: "Ad account not accessible"

**Cause**: Ad account ID is wrong or you don't have access

**Solution**:
1. Verify ad account ID in Business Manager
2. Ensure you have admin/advertiser role
3. Use format `act_123456789` in API calls

### Google AdSense Issues

#### Error: "Invalid Credentials"

**Cause**: OAuth credentials are incorrect

**Solution**:
1. Verify CLIENT_ID and CLIENT_SECRET match your Cloud Console
2. Regenerate refresh token if needed
3. Ensure API is enabled in Cloud Console

#### Error: "Quota exceeded"

**Cause**: Too many API calls

**Solution**:
1. Check quota limits in Cloud Console
2. Request quota increase if needed
3. Implement caching to reduce API calls

#### Error: "AdSense account not found"

**Cause**: AdSense account not approved or linked

**Solution**:
1. Complete AdSense account setup in AdSense portal
2. Verify website ownership
3. Wait for Google approval (can take days)

### General Issues

#### Server won't start

**Check**:
```bash
# Verify all dependencies installed
npm install

# Check for syntax errors
node -c src/server.js

# Verify environment variables
cat .env | grep -E "(FACEBOOK|GOOGLE)"

# Test database connection
npm run init-db
```

#### API returns 500 errors

**Debug steps**:
1. Check server logs for detailed error
2. Verify all required environment variables are set
3. Test external API connectivity
4. Check database is running and accessible

---

## Best Practices

### Security

1. **Never commit tokens to git**
   - Add `.env` to `.gitignore`
   - Use environment variables in production

2. **Rotate tokens regularly**
   - Facebook: Refresh long-lived tokens before expiry
   - Google: Regenerate refresh tokens periodically

3. **Limit token permissions**
   - Only request necessary scopes
   - Use separate tokens for different environments

### Production Deployment

1. **Use secret management**
   - AWS Secrets Manager
   - Azure Key Vault
   - Google Secret Manager

2. **Implement token refresh**
   - Automatically refresh expired tokens
   - Store refresh tokens securely
   - Handle refresh failures gracefully

3. **Monitor API usage**
   - Track quota limits
   - Set up alerts for failures
   - Log all API calls for debugging

---

## Support Resources

### Facebook
- [Marketing API Documentation](https://developers.facebook.com/docs/marketing-apis)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Business Manager](https://business.facebook.com)

### Google AdSense
- [AdSense Management API](https://developers.google.com/adsense/management)
- [Cloud Console](https://console.cloud.google.com)
- [AdSense Help](https://support.google.com/adsense)

### Platform
- GitHub Issues: Report bugs and request features
- API Documentation: See FACEBOOK_ADSENSE_API.md
- General Docs: See README.md

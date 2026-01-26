# Quick Start Guide

Get the Hernandez Advertising Platform running in 5 minutes!

## Option 1: Docker (Recommended) 

**Fastest way to get started - no local dependencies needed!**

### Step 1: Install Docker

- **Windows/Mac**: Download [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux**: 
  ```bash
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  ```

### Step 2: Clone and Configure

```bash
# Clone repository
git clone https://github.com/vinnieboy707/Hernandez_Advertisment.git
cd Hernandez_Advertisment

# Run setup script (creates .env with random password)
./setup.sh
```

### Step 3: Add API Keys

Edit the `.env` file and add your API keys:

```bash
nano .env  # or use any text editor
```

Required keys:
- `SOS_API_KEY`: Your Secretary of State API key
- `GOOGLE_API_KEY`: Google Business Profile API key
- `YELLOWPAGES_API_KEY`: Yellow Pages API key

### Step 4: Start the Platform

```bash
docker-compose up -d
```

### Step 5: Access the Platform

- **API Documentation**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **Sample API Call**: 
  ```bash
  curl http://localhost:3000/api/advertising/all
  ```

### View Logs

```bash
docker-compose logs -f
```

### Stop the Platform

```bash
docker-compose down
```

---

## Option 2: Local Development

**For developers who want to modify the code**

### Step 1: Install Prerequisites

- Node.js 18+ ([download](https://nodejs.org/))
- PostgreSQL 15+ ([download](https://www.postgresql.org/download/))

### Step 2: Set Up Database

```bash
# Create database
createdb hernandez_ads

# Create user
psql -d postgres -c "CREATE USER hernandez_user WITH PASSWORD 'your_password';"
psql -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE hernandez_ads TO hernandez_user;"
```

### Step 3: Clone and Install

```bash
# Clone repository
git clone https://github.com/vinnieboy707/Hernandez_Advertisment.git
cd Hernandez_Advertisment

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### Step 4: Configure Environment

```bash
cp .env.example .env
# Edit .env with your database URL and API keys
```

Update `DATABASE_URL` in `.env`:
```
DATABASE_URL=postgresql://hernandez_user:your_password@localhost:5432/hernandez_ads
```

### Step 5: Initialize Database

```bash
# Create tables
npm run init-db

# Add sample data (optional)
npm run seed
```

### Step 6: Start the Application

**Backend** (in one terminal):
```bash
npm run dev
```

**Frontend** (in another terminal):
```bash
cd client
npm start
```

### Step 7: Access the Platform

- **Backend API**: http://localhost:3000
- **Frontend Dashboard**: http://localhost:3001 (or the port shown by React)

---

## First Steps After Setup

### 1. Test the API

```bash
# Check health
curl http://localhost:3000/health

# Get advertising options
curl http://localhost:3000/api/advertising/all
```

### 2. Create Your First Business

```bash
curl -X POST http://localhost:3000/api/businesses \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "My Business",
    "sos_registration_number": "C1234567",
    "contact_email": "info@mybusiness.com",
    "contact_phone": "(555) 123-4567",
    "address": "123 Main St",
    "city": "Los Angeles",
    "state": "CA",
    "zip_code": "90001",
    "business_type": "Restaurant"
  }'
```

### 3. Browse Advertising Packages

```bash
# Radio packages
curl http://localhost:3000/api/advertising/radio

# Digital packages
curl http://localhost:3000/api/advertising/digital

# Print packages
curl http://localhost:3000/api/advertising/print
```

---

## Getting API Keys

### Secretary of State API

**California**:
1. Visit https://businesssearch.sos.ca.gov/
2. Contact CA Secretary of State office for API access
3. Provide business information and use case

**New York**:
1. Visit https://dos.ny.gov/
2. Register for API access
3. Follow documentation provided

**Other States**: Contact your state's Secretary of State office

### Google Business Profile API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "Google Business Profile API"
4. Create credentials (API key)
5. Set up OAuth 2.0 for account access

### Yellow Pages API

1. Visit [Yellow Pages for Business](https://www.yellowpages.com/)
2. Contact business development: businessdev@yellowpages.com
3. Request API access for your business

---

## Troubleshooting

### Docker Issues

**Port already in use**:
```bash
# Edit docker-compose.yml and change port 3000 to 8080
ports:
  - "8080:3000"
```

**Database connection failed**:
```bash
# Restart services
docker-compose restart

# Check logs
docker-compose logs db
```

### Local Development Issues

**npm install fails**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Database connection error**:
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in .env
- Check user permissions

**Port 3000 already in use**:
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=8080
```

---

## Next Steps

- 📖 Read the [complete README](README.md)
- 🚀 See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- 🧪 Check [API_TESTING.md](API_TESTING.md) for API examples
- 💡 Explore the code in `src/` directory

---

## Need Help?

- **Issues**: https://github.com/vinnieboy707/Hernandez_Advertisment/issues
- **Documentation**: See README.md and DEPLOYMENT.md
- **API Reference**: http://localhost:3000 (when running)

---

**Happy Advertising! 🎯**

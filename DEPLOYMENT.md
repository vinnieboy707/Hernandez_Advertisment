# Deployment Guide

This guide provides detailed instructions for deploying the Hernandez Advertising Platform.

## Table of Contents

1. [Docker Deployment](#docker-deployment)
2. [Cloud Deployment](#cloud-deployment)
3. [Database Setup](#database-setup)
4. [Configuration](#configuration)
5. [Troubleshooting](#troubleshooting)

## Docker Deployment

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

### Steps

1. **Clone and navigate to the project**:
```bash
git clone https://github.com/vinnieboy707/Hernandez_Advertisment.git
cd Hernandez_Advertisment
```

2. **Create and configure environment file**:
```bash
cp .env.example .env
```

Edit `.env` and set:
- `DB_PASSWORD`: Strong password for PostgreSQL
- `SOS_API_KEY`: Your Secretary of State API key
- `SOS_STATE`: Your state code (CA, NY, TX, etc.)
- API keys for Google, Yellow Pages, etc.

3. **Start services**:
```bash
docker-compose up -d
```

4. **Verify deployment**:
```bash
# Check running containers
docker-compose ps

# Check logs
docker-compose logs -f api

# Test health endpoint
curl http://localhost:3000/health
```

5. **Access the platform**:
- API: http://localhost:3000
- Health: http://localhost:3000/health

### Updating the Deployment

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Stopping the Platform

```bash
# Stop services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

## Cloud Deployment

### AWS EC2

1. **Launch EC2 instance**:
   - AMI: Amazon Linux 2 or Ubuntu 20.04+
   - Instance type: t2.small or larger
   - Security group: Open ports 22, 80, 3000

2. **Install Docker**:
```bash
# Amazon Linux 2
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

3. **Deploy application**:
```bash
git clone https://github.com/vinnieboy707/Hernandez_Advertisment.git
cd Hernandez_Advertisment
cp .env.example .env
# Edit .env with your credentials
docker-compose up -d
```

4. **Configure domain** (optional):
   - Point your domain to EC2 public IP
   - Set up nginx reverse proxy
   - Install SSL certificate with Let's Encrypt

### Google Cloud Platform

1. **Create Compute Engine instance**:
   - Machine type: e2-small or larger
   - Boot disk: Ubuntu 20.04 LTS
   - Firewall: Allow HTTP, HTTPS

2. **SSH into instance and install Docker**:
```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
```

3. **Deploy application** (same as AWS steps above)

### Azure

1. **Create Azure VM**:
   - Image: Ubuntu Server 20.04 LTS
   - Size: B2s or larger
   - Open ports: 22, 80, 3000

2. **Install Docker and deploy** (same as AWS steps)

## Database Setup

### PostgreSQL Configuration

The Docker setup includes PostgreSQL automatically. For manual setup:

1. **Install PostgreSQL 15**:
```bash
# Ubuntu/Debian
sudo apt install postgresql-15 postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql15-server
```

2. **Create database and user**:
```sql
CREATE DATABASE hernandez_ads;
CREATE USER hernandez_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE hernandez_ads TO hernandez_user;
```

3. **Initialize schema**:
```bash
export DATABASE_URL=postgresql://hernandez_user:password@localhost:5432/hernandez_ads
npm run init-db
```

### Database Backups

```bash
# Create backup
docker-compose exec db pg_dump -U hernandez_user hernandez_ads > backup.sql

# Restore backup
docker-compose exec -T db psql -U hernandez_user hernandez_ads < backup.sql
```

## Configuration

### API Keys Setup

#### Secretary of State API

Each state has different requirements:

**California**:
- Register at: https://businesssearch.sos.ca.gov/
- API documentation: Contact CA SOS office

**New York**:
- Register at: https://dos.ny.gov/
- API key required for programmatic access

**Texas**:
- Register at: https://mycpa.cpa.state.tx.us/
- API available for verified businesses

#### Google Business Profile API

1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable "Google Business Profile API"
4. Create credentials (API key)
5. Set up OAuth 2.0 for account access
6. Copy API key and account ID to `.env`

#### Yellow Pages API

Contact Yellow Pages for API access:
- Website: https://www.yellowpages.com/
- Email: businessdev@yellowpages.com

### Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| PORT | No | Server port (default: 3000) |
| NODE_ENV | No | Environment (development/production) |
| SOS_API_KEY | Yes | Secretary of State API key |
| SOS_STATE | Yes | State code (CA, NY, TX, etc.) |
| GOOGLE_API_KEY | Yes | Google Business Profile API key |
| GOOGLE_BUSINESS_ACCOUNT_ID | Yes | Google Business account ID |
| YELLOWPAGES_API_KEY | Yes | Yellow Pages API key |
| RADIO_API_KEY | No | Radio advertising API key |
| RATE_LIMIT_WINDOW_MS | No | Rate limit window (default: 900000) |
| RATE_LIMIT_MAX_REQUESTS | No | Max requests per window (default: 100) |

## Troubleshooting

### Common Issues

#### Database Connection Failed

```bash
# Check if database is running
docker-compose ps

# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

#### API Returns 500 Error

```bash
# Check API logs
docker-compose logs api

# Verify environment variables
docker-compose exec api env | grep DATABASE_URL

# Restart API
docker-compose restart api
```

#### Port Already in Use

```bash
# Change port in docker-compose.yml
# From:
ports:
  - "3000:3000"
# To:
ports:
  - "8080:3000"

# Or stop conflicting service
sudo lsof -i :3000
sudo kill -9 <PID>
```

#### Database Not Initialized

```bash
# Manually initialize database
docker-compose exec api npm run init-db

# Check if tables exist
docker-compose exec db psql -U hernandez_user -d hernandez_ads -c "\dt"
```

### Logs and Monitoring

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api
docker-compose logs -f db

# View last 100 lines
docker-compose logs --tail=100 api
```

### Performance Tuning

1. **Increase PostgreSQL memory**:

Edit `docker-compose.yml`:
```yaml
db:
  command: postgres -c shared_buffers=256MB -c max_connections=200
```

2. **Scale API instances**:
```bash
docker-compose up -d --scale api=3
```

3. **Add nginx load balancer**:

Create `nginx.conf` and add to `docker-compose.yml`.

### Security Hardening

1. **Use strong passwords**:
```bash
# Generate random password
openssl rand -base64 32
```

2. **Limit database access**:
```yaml
db:
  ports:
    - "127.0.0.1:5432:5432"  # Only localhost
```

3. **Enable SSL/TLS**:
   - Use Let's Encrypt for free SSL
   - Configure nginx as reverse proxy
   - Force HTTPS redirects

4. **Update dependencies regularly**:
```bash
npm audit
npm audit fix
```

## Support

For issues or questions:
- GitHub Issues: https://github.com/vinnieboy707/Hernandez_Advertisment/issues
- Email: support@hernandez-ads.com

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [API Design Guidelines](https://restfulapi.net/)

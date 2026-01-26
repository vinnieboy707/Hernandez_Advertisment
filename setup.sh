#!/bin/bash

# Hernandez Advertising Platform - Setup Script
# This script helps set up the platform for first-time use

set -e

echo "=================================="
echo "Hernandez Advertising Platform"
echo "Setup Script"
echo "=================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    
    # Generate random password for database
    DB_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
    
    # Update .env with generated password
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if ! sed -i '' "s/\${DB_PASSWORD:-change_this_password}/$DB_PASSWORD/g" .env; then
            echo "❌ Failed to update DB_PASSWORD in .env using sed (macOS)."
            echo "   Please open .env and set DB_PASSWORD manually."
            exit 1
        fi
    else
        # Linux
        if ! sed -i "s/\${DB_PASSWORD:-change_this_password}/$DB_PASSWORD/g" .env; then
            echo "❌ Failed to update DB_PASSWORD in .env using sed (Linux)."
            echo "   Please open .env and set DB_PASSWORD manually."
            exit 1
        fi
    fi
    
    # Verify that the placeholder was actually replaced
    if grep -q "\${DB_PASSWORD:-change_this_password}" .env; then
        echo "❌ The DB_PASSWORD placeholder is still present in .env."
        echo "   This likely means the expected pattern changed in .env.example."
        echo "   Please edit .env and set DB_PASSWORD to a secure value manually."
        exit 1
    fi
    
    echo "✅ Created .env file with generated database password"
    echo "⚠️  Please edit .env file and add your API keys:"
    echo "    - SOS_API_KEY (Secretary of State)"
    echo "    - GOOGLE_API_KEY (Google Business Profile)"
    echo "    - YELLOWPAGES_API_KEY (Yellow Pages)"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Ask if user wants to start the platform
read -p "Do you want to start the platform now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting Hernandez Advertising Platform..."
    echo ""
    
    # Start services
    docker-compose up -d
    
    echo ""
    echo "⏳ Waiting for services to start..."
    sleep 10
    
    # Check health
    echo "🔍 Checking application health..."
    if curl -s http://localhost:3000/health > /dev/null; then
        echo "✅ Platform is running!"
        echo ""
        echo "=================================="
        echo "Access Points:"
        echo "=================================="
        echo "API Documentation: http://localhost:3000"
        echo "Health Check: http://localhost:3000/health"
        echo "Database: localhost:5432"
        echo ""
        echo "To view logs: docker-compose logs -f"
        echo "To stop: docker-compose down"
        echo "=================================="
    else
        echo "⚠️  Platform started but health check failed"
        echo "Check logs with: docker-compose logs"
    fi
else
    echo "Setup complete! To start later, run: docker-compose up -d"
fi

echo ""
echo "📚 For more information, see:"
echo "   - README.md"
echo "   - DEPLOYMENT.md"
echo ""

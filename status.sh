#!/bin/bash

# System Status Check Script
# Checks if all components of the platform are running correctly

echo "=================================="
echo "Hernandez Advertising Platform"
echo "System Status Check"
echo "=================================="
echo ""

# Check if Docker is running
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed"
    
    if docker info &> /dev/null; then
        echo "✅ Docker daemon is running"
    else
        echo "❌ Docker daemon is not running"
        echo "   Start Docker and try again"
        exit 1
    fi
else
    echo "⚠️  Docker is not installed (required for Docker deployment)"
fi

echo ""

# Check if docker-compose is available
if command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose is installed"
else
    echo "⚠️  Docker Compose is not installed"
fi

echo ""
echo "=================================="
echo "Service Status"
echo "=================================="
echo ""

# Check if services are running
COMPOSE_FILE="docker-compose.yml"
EXPECTED_SERVICES=("db" "api")

if ! command -v docker-compose > /dev/null 2>&1; then
    echo "⚠️  Docker Compose is not available, skipping service status checks"
elif [ ! -f "$COMPOSE_FILE" ]; then
    echo "⚠️  $COMPOSE_FILE not found, skipping service status checks"
else
    # Validate expected services exist in docker-compose.yml
    MISSING_SERVICES=()
    for SERVICE in "${EXPECTED_SERVICES[@]}"; do
        if ! docker-compose -f "$COMPOSE_FILE" config --services 2>/dev/null | grep -qx "$SERVICE"; then
            MISSING_SERVICES+=("$SERVICE")
        fi
    done

    if [ "${#MISSING_SERVICES[@]}" -ne 0 ]; then
        echo "⚠️  Expected Docker services not defined in $COMPOSE_FILE: ${MISSING_SERVICES[*]}"
        echo "   Update $COMPOSE_FILE or adjust the expected services in status.sh."
    elif docker-compose -f "$COMPOSE_FILE" ps 2>/dev/null | grep -q "Up"; then
        echo "Docker Services:"
        docker-compose -f "$COMPOSE_FILE" ps
        echo ""
        
        # Check API health
        echo "Checking API health..."
        if curl -s http://localhost:3000/health > /dev/null 2>&1; then
            echo "✅ API is responding"
            HEALTH=$(curl -s http://localhost:3000/health)
            echo "   $HEALTH"
        else
            echo "❌ API is not responding on port 3000"
        fi
        
        echo ""
        
        # Check database
        echo "Checking database..."
        if docker-compose -f "$COMPOSE_FILE" exec -T db pg_isready -U hernandez_user > /dev/null 2>&1; then
            echo "✅ Database is ready"
        else
            echo "❌ Database is not ready"
        fi
    else
        echo "⚠️  No Docker services are running"
        echo "   Run 'docker-compose up -d' to start services"
    fi
fi

echo ""
echo "=================================="
echo "Configuration"
echo "=================================="
echo ""

# Check .env file
if [ -f .env ]; then
    echo "✅ .env file exists"
    
    # Check for required variables
    REQUIRED_VARS=("DATABASE_URL" "SOS_API_KEY" "GOOGLE_API_KEY" "YELLOWPAGES_API_KEY")
    
    for VAR in "${REQUIRED_VARS[@]}"; do
        if grep -q "^${VAR}=" .env 2>/dev/null; then
            VALUE=$(grep "^${VAR}=" .env | cut -d'=' -f2)
            if [ ! -z "$VALUE" ] && [ "$VALUE" != "your_${VAR,,}" ] && [[ ! "$VALUE" =~ ^your_ ]]; then
                echo "✅ $VAR is configured"
            else
                echo "⚠️  $VAR needs to be configured"
            fi
        else
            echo "❌ $VAR is missing"
        fi
    done
else
    echo "❌ .env file not found"
    echo "   Copy .env.example to .env and configure it"
fi

echo ""
echo "=================================="
echo "Quick Actions"
echo "=================================="
echo ""
echo "Start services:     docker-compose up -d"
echo "Stop services:      docker-compose down"
echo "View logs:          docker-compose logs -f"
echo "Restart services:   docker-compose restart"
echo "Check health:       curl http://localhost:3000/health"
echo ""
echo "API Documentation:  http://localhost:3000"
echo ""

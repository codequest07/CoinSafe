#!/bin/bash

# CoinSafe DigitalOcean Deployment Script
# This script deploys the CoinSafe application to DigitalOcean

set -e

echo "🚀 Starting CoinSafe deployment to DigitalOcean..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create a .env file with your environment variables."
    echo "You can copy from Backend/env.example as a starting point."
    exit 1
fi

# Build and start the services
echo "📦 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Your application should be available at:"
echo "   Frontend: http://your-server-ip"
echo "   Backend API: http://your-server-ip:1234"
echo ""
echo "📊 To check service status:"
echo "   docker-compose ps"
echo ""
echo "📝 To view logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 To stop services:"
echo "   docker-compose down" 
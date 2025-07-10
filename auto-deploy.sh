#!/bin/bash

# Auto-deploy script for CoinSafe
# This script can be triggered by GitHub webhooks

set -e

echo "🚀 Auto-deploy triggered at $(date)"

# Navigate to project directory
cd /root/coinsafe

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Stop current services
echo "🛑 Stopping current services..."
docker-compose down

# Rebuild and start services
echo "🔨 Rebuilding and starting services..."
docker-compose build
docker-compose up -d

echo "✅ Auto-deploy completed at $(date)" 
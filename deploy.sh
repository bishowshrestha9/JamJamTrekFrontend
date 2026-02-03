#!/bin/bash

# JamJam Trek Frontend Deployment Script
# This script builds and deploys the Next.js application to production

echo "🚀 Starting deployment..."

# Navigate to project directory
cd /var/www/JamJamTrekFrontend || exit 1

# Pull latest changes (if using git)
echo "📥 Pulling latest changes..."
git pull origin main || echo "⚠️  Git pull skipped (not a git repo or no changes)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the Next.js application
echo "🔨 Building Next.js application..."
npm run build

# Restart PM2 process
echo "🔄 Restarting PM2 process..."
pm2 restart jamjam-frontend

# Show PM2 status
echo "✅ Deployment complete! Current PM2 status:"
pm2 status

echo "🎉 Deployment finished successfully!"

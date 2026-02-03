#!/bin/bash

# JamJam Frontend Deployment Script
# Run this script on your Contabo server

set -e

echo "🚀 Starting deployment of JamJam Frontend..."

# Configuration
APP_NAME="jamjam-frontend"
APP_DIR="/var/www/jamjam"
REPO_URL="https://github.com/DishantGiri/jamjam.git"  # Update with your actual repo URL
BRANCH="main"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run this script as root or with sudo"
    exit 1
fi

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Installing Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}Installing PM2...${NC}"
    npm install -g pm2
fi

# Create application directory if it doesn't exist
if [ ! -d "$APP_DIR" ]; then
    echo -e "${YELLOW}Creating application directory...${NC}"
    mkdir -p "$APP_DIR"
fi

# Navigate to application directory
cd "$APP_DIR"

# Clone or pull latest code
if [ -d ".git" ]; then
    echo -e "${YELLOW}Pulling latest code...${NC}"
    git fetch origin
    git reset --hard origin/$BRANCH
else
    echo -e "${YELLOW}Cloning repository...${NC}"
    cd ..
    rm -rf jamjam
    git clone -b $BRANCH "$REPO_URL" jamjam
    cd jamjam
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Build the application
echo -e "${YELLOW}Building Next.js application...${NC}"
npm run build

# Stop existing PM2 process if running
if pm2 list | grep -q "$APP_NAME"; then
    echo -e "${YELLOW}Stopping existing PM2 process...${NC}"
    pm2 stop "$APP_NAME"
    pm2 delete "$APP_NAME"
fi

# Start application with PM2
echo -e "${YELLOW}Starting application with PM2...${NC}"
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup systemd -u root --hp /root

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}Your application is now running on port 3000${NC}"
echo -e "${YELLOW}Useful PM2 commands:${NC}"
echo "  pm2 list              - View all running processes"
echo "  pm2 logs $APP_NAME    - View logs"
echo "  pm2 restart $APP_NAME - Restart the application"
echo "  pm2 stop $APP_NAME    - Stop the application"
echo "  pm2 monit             - Monitor processes"

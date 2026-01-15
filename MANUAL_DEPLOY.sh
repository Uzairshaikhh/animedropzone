#!/bin/bash

# Manual Deployment Script for animedropzone
# Run this on the server to sync latest code and build

set -e  # Exit on error

echo "=== AnimeDrop Zone Manual Deployment ==="
echo "Current directory: $(pwd)"
echo ""

# Step 1: Check git status
echo "1️⃣  Checking git status..."
git status

echo ""
echo "2️⃣  Fetching latest from GitHub..."
git fetch origin

echo ""
echo "3️⃣  Checking commits..."
git log --oneline -3

echo ""
echo "4️⃣  Pulling latest code..."
git pull origin main

echo ""
echo ""

echo "5️⃣  Installing dependencies..."
npm install

echo ""
echo "6️⃣  Building project..."
npm run build

echo ""
echo "7️⃣  Listing build directory..."
ls -lh build/ | head -10

echo ""
echo "8️⃣  Copying build files to public directory..."
cp -r build/* /home/u728583244/domains/animedropzone.com/public_html/

echo ""
echo "✅ Deployment complete!"
echo "Latest commit: $(git log --oneline -1)"
echo ""
echo "Verify at: https://animedropzone.com/index.html"

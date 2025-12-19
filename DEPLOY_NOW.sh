#!/bin/bash

# Anime Figure Store - Deployment Script
# Run this on your server in /home/u728583244/animedropzone

echo "📦 Starting deployment..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd /home/u728583244/animedropzone || exit 1

echo "1️⃣  Pulling latest code from GitHub..."
git pull origin main

echo ""
echo "2️⃣  Copying build files to public directory..."
cp -r build/* .

echo ""
echo "3️⃣  Verifying Razorpay script..."
if grep -q "razorpay" index.html; then
  echo "✅ Razorpay script found in index.html"
else
  echo "❌ Razorpay script NOT found!"
fi

echo ""
echo "4️⃣  Listing deployed files..."
ls -lh index.html
ls -lh assets/ | head -5

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "1. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
echo "2. Visit: https://animedropzone.com"
echo "3. Test Razorpay payment"
echo ""

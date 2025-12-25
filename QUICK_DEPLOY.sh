#!/bin/bash

# 🚀 Anime Figure Store - Quick Deploy to Hostinger
# Run this script on your Hostinger server to deploy the latest changes

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 ANIMEDROPZONE DEPLOYMENT SCRIPT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ Error: package.json not found!${NC}"
  echo "Please run this script from the project root directory."
  exit 1
fi

echo -e "${BLUE}📍 Current directory: $(pwd)${NC}"
echo ""

# Step 1: Pull latest code from GitHub
echo -e "${BLUE}1️⃣  Pulling latest code from GitHub...${NC}"
git pull origin main
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Git pull successful${NC}"
else
  echo -e "${RED}❌ Git pull failed${NC}"
  exit 1
fi
echo ""

# Step 2: Build the project
echo -e "${BLUE}2️⃣  Building the project...${NC}"
npm run build
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Build successful${NC}"
else
  echo -e "${RED}❌ Build failed${NC}"
  exit 1
fi
echo ""

# Step 3: Copy files to public_html
echo -e "${BLUE}3️⃣  Copying build files to public directory...${NC}"
if [ -d "build" ]; then
  # Backup old files
  if [ -f "~/public_html/index.html" ]; then
    echo "📦 Creating backup of old files..."
    mkdir -p ~/backups/animedropzone_$(date +%Y%m%d_%H%M%S)
    cp -r ~/public_html/* ~/backups/animedropzone_$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true
  fi
  
  # Copy new files
  cp -r build/* ~/public_html/
  cp .htaccess ~/public_html/ 2>/dev/null || true
  cp _redirects ~/public_html/ 2>/dev/null || true
  echo -e "${GREEN}✅ Files copied successfully${NC}"
else
  echo -e "${RED}❌ build directory not found${NC}"
  exit 1
fi
echo ""

# Step 4: Verify deployment
echo -e "${BLUE}4️⃣  Verifying deployment...${NC}"
if [ -f "~/public_html/index.html" ]; then
  echo -e "${GREEN}✅ index.html found in public_html${NC}"
  echo -e "${GREEN}✅ File size: $(ls -lh ~/public_html/index.html | awk '{print $5}')${NC}"
else
  echo -e "${RED}❌ index.html NOT found in public_html${NC}"
  exit 1
fi

if [ -d "~/public_html/assets" ]; then
  echo -e "${GREEN}✅ assets folder found${NC}"
  ASSET_COUNT=$(find ~/public_html/assets -type f | wc -l)
  echo -e "${GREEN}✅ Asset files: $ASSET_COUNT${NC}"
else
  echo -e "${RED}❌ assets folder NOT found${NC}"
  exit 1
fi
echo ""

# Step 5: Clear cache indicator
echo -e "${BLUE}5️⃣  Deployment complete!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ DEPLOYMENT SUCCESSFUL!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Next Steps:"
echo "1. Visit: https://animedropzone.com"
echo "2. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
echo "3. Test the site thoroughly"
echo "4. Check console for any errors (F12)"
echo ""
echo "🧪 Test URLs:"
echo "   - Homepage: https://animedropzone.com/"
echo "   - Category: https://animedropzone.com/category/figures"
echo "   - Admin: https://animedropzone.com/secret-admin-panel-7b2cbf"
echo ""
echo "📊 Deployment Time: $(date)"
echo ""

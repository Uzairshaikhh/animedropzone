#!/bin/bash

# 🚀 SSH Deployment Script for Anime Figure Store
# This script builds locally and deploys to your SSH server
# Usage: ./DEPLOY_SSH.sh

set -e  # Exit on any error

# Configuration
SSH_USER="u728583244"
SSH_HOST="your.server.com"  # Replace with your actual server domain/IP
SSH_PATH="/home/u728583244/animedropzone"
REMOTE_BUILD_PATH="${SSH_PATH}/build"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 Anime Figure Store - SSH Deployment${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# Step 1: Verify SSH connection
echo -e "${YELLOW}Step 1: Verifying SSH connection to ${SSH_HOST}...${NC}"
if ssh -q "${SSH_USER}@${SSH_HOST}" exit; then
    echo -e "${GREEN}✓ SSH connection successful${NC}"
else
    echo -e "${RED}✗ SSH connection failed. Please check:${NC}"
    echo "  - SSH_USER: ${SSH_USER}"
    echo "  - SSH_HOST: ${SSH_HOST}"
    echo "  - SSH key is configured"
    exit 1
fi
echo ""

# Step 2: Build locally
echo -e "${YELLOW}Step 2: Building project locally...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi
echo ""

# Step 3: Create temporary tar file
echo -e "${YELLOW}Step 3: Creating deployment package...${NC}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ARCHIVE="build_${TIMESTAMP}.tar.gz"
tar -czf "${ARCHIVE}" build/
if [ -f "${ARCHIVE}" ]; then
    echo -e "${GREEN}✓ Archive created: ${ARCHIVE}${NC}"
else
    echo -e "${RED}✗ Failed to create archive${NC}"
    exit 1
fi
echo ""

# Step 4: Upload archive to server
echo -e "${YELLOW}Step 4: Uploading to server (this may take a moment)...${NC}"
scp -C "${ARCHIVE}" "${SSH_USER}@${SSH_HOST}:${SSH_PATH}/"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Archive uploaded successfully${NC}"
else
    echo -e "${RED}✗ Upload failed${NC}"
    rm -f "${ARCHIVE}"
    exit 1
fi
echo ""

# Step 5: Extract and deploy on remote server
echo -e "${YELLOW}Step 5: Extracting and deploying on remote server...${NC}"
ssh "${SSH_USER}@${SSH_HOST}" bash << 'REMOTE_SCRIPT'
    set -e
    cd /home/u728583244/animedropzone
    
    # Get the latest archive
    LATEST_ARCHIVE=$(ls -t build_*.tar.gz 2>/dev/null | head -1)
    
    if [ -z "$LATEST_ARCHIVE" ]; then
        echo "Error: No archive found"
        exit 1
    fi
    
    echo "Extracting $LATEST_ARCHIVE..."
    tar -xzf "$LATEST_ARCHIVE"
    
    # Backup old files
    if [ -d "public_html_backup" ]; then
        rm -rf public_html_backup
    fi
    mkdir -p public_html_backup
    
    # Copy current files to backup
    if [ -f "index.html" ]; then
        cp -r . public_html_backup/ 2>/dev/null || true
    fi
    
    # Copy new files from build directory
    cp -r build/* .
    
    # Verify deployment
    if [ -f "index.html" ]; then
        echo "✓ Deployment successful"
        echo "Files deployed:"
        ls -lh index.html
        ls -lh assets/ | head -3
    else
        echo "Error: Deployment failed - index.html not found"
        exit 1
    fi
REMOTE_SCRIPT

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Remote extraction and deployment successful${NC}"
else
    echo -e "${RED}✗ Remote deployment failed${NC}"
    exit 1
fi
echo ""

# Step 6: Cleanup
echo -e "${YELLOW}Step 6: Cleaning up...${NC}"
rm -f "${ARCHIVE}"
echo -e "${GREEN}✓ Cleanup complete${NC}"
echo ""

# Step 7: Verification
echo -e "${YELLOW}Step 7: Verifying deployment...${NC}"
ssh "${SSH_USER}@${SSH_HOST}" bash << 'VERIFY_SCRIPT'
    cd /home/u728583244/animedropzone
    echo "📊 Deployment Summary:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✓ index.html exists: $([ -f index.html ] && echo 'YES' || echo 'NO')"
    echo "✓ assets folder exists: $([ -d assets ] && echo 'YES' || echo 'NO')"
    echo "✓ File count: $(find . -type f | wc -l) files"
    echo "✓ Total size: $(du -sh . | cut -f1)"
    echo ""
    echo "📅 Last modified:"
    ls -lh index.html | awk '{print $6, $7, $8, $9}'
VERIFY_SCRIPT

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Next Steps:"
echo "1. Clear browser cache: Ctrl+Shift+Del (or Cmd+Shift+Del on Mac)"
echo "2. Visit: https://your-domain.com"
echo "3. Test category pages on mobile"
echo "4. Verify: No crashes when clicking 'Anime Figures'"
echo ""
echo "📝 Deployment Notes:"
echo "   - Backup of previous files: public_html_backup/"
echo "   - Build timestamp: ${TIMESTAMP}"
echo "   - SSH Host: ${SSH_HOST}"
echo "   - Server Path: ${SSH_PATH}"
echo ""

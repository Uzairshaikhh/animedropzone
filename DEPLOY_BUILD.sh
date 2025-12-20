#!/bin/bash

# Deployment script to copy build files to Hostinger
# This script uploads your local build/ directory to the server

set -e

HOSTINGER_USER="u728583244"
HOSTINGER_HOST="185.203.119.11"
HOSTINGER_PATH="/home/u728583244/domains/animedropzone.com/public_html"
LOCAL_BUILD_DIR="$(pwd)/build"

echo "🚀 Starting deployment to Hostinger..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if build directory exists
if [ ! -d "$LOCAL_BUILD_DIR" ]; then
    echo "❌ Build directory not found at $LOCAL_BUILD_DIR"
    echo "Run 'npm run build' first"
    exit 1
fi

echo "📦 Local build directory: $LOCAL_BUILD_DIR"
echo "📍 Remote destination: $HOSTINGER_USER@$HOSTINGER_HOST:$HOSTINGER_PATH"

# Try SSH deployment
echo ""
echo "Attempting SSH deployment..."
if ssh "$HOSTINGER_USER@$HOSTINGER_HOST" "echo 'SSH connection successful'" > /dev/null 2>&1; then
    echo "✅ SSH connection established"
    echo "🔄 Copying build files..."
    
    # Copy all files, preserving structure
    scp -r "$LOCAL_BUILD_DIR"/* "$HOSTINGER_USER@$HOSTINGER_HOST:$HOSTINGER_PATH/"
    
    # Verify deployment
    echo ""
    echo "✅ Verifying deployment..."
    ssh "$HOSTINGER_USER@$HOSTINGER_HOST" "ls -lh $HOSTINGER_PATH/assets/*.js | head -5"
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ DEPLOYMENT COMPLETE!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Visit: https://animedropzone.com"
    echo "2. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+F5 (Windows)"
    echo "3. Open DevTools (F12) and check Console for errors"
    echo ""
else
    echo "❌ SSH connection failed"
    echo ""
    echo "Alternative deployment methods:"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📌 METHOD 1: Use Hostinger File Manager (Easiest)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "1. Go to Hostinger Control Panel"
    echo "2. Click 'File Manager' or 'File Storage'"
    echo "3. Navigate to: public_html"
    echo "4. Upload all files from your local build/ folder:"
    echo "   - build/index.html"
    echo "   - build/assets/* (all files)"
    echo "   - build/_redirects"
    echo "5. Replace existing files when prompted"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📌 METHOD 2: Try SFTP"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Download an SFTP client (Cyberduck, FileZilla, WinSCP)"
    echo "Connect with:"
    echo "  Host: 185.203.119.11"
    echo "  User: $HOSTINGER_USER"
    echo "  Password: [Your Hostinger password]"
    echo ""
    echo "Then upload build/* to: /home/u728583244/domains/animedropzone.com/public_html"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📌 METHOD 3: Ask for SSH Key Setup"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Request SSH key-based authentication from Hostinger support"
    echo "to enable automated deployments"
    echo ""
    exit 1
fi

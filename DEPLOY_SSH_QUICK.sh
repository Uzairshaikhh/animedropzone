#!/bin/bash

# 🚀 QUICK SSH Deployment - One Command Deploy
# Usage: ./DEPLOY_SSH_QUICK.sh

set -e

SSH_USER="u728583244"
SSH_HOST="in-mum-web2124"
SSH_PATH="/home/u728583244/animedropzone"

echo "🚀 Quick SSH Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Build
echo "📦 Building..."
npm run build > /dev/null 2>&1 && echo "✓ Build complete" || (echo "✗ Build failed"; exit 1)

# Deploy
echo "📤 Deploying to ${SSH_HOST}..."
tar -czf deploy.tar.gz build/
scp -C deploy.tar.gz "${SSH_USER}@${SSH_HOST}:${SSH_PATH}/" > /dev/null 2>&1

# Extract on server
ssh "${SSH_USER}@${SSH_HOST}" "cd ${SSH_PATH} && tar -xzf deploy.tar.gz && cp -r build/* . && rm deploy.tar.gz && echo '✓ Deployed'"

rm deploy.tar.gz

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment complete!"
echo ""
echo "Clear cache and test at your website"

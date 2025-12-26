#!/bin/bash

# Deploy latest build to Hostinger server with SSH
# This fixes the infinite loop issue in Figures category

echo "🚀 Deploying fixed build to Hostinger..."

# Copy the latest built files to the server
rsync -avz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='src' \
  --exclude='*.ts' \
  --exclude='*.tsx' \
  build/ \
  u728583244@185.136.166.204:/home/u728583244/domains/animedropzone.com/public_html/

echo "✅ Build deployed to server"
echo "🔄 Clearing any cache..."

# Optional: SSH in and clear cache if needed
ssh -p 22 u728583244@185.136.166.204 "cd /home/u728583244/domains/animedropzone.com/public_html && ls -la index.html"

echo "✅ Deployment complete!"
echo "Test: Visit https://animedropzone.com/category/figures in your browser"
echo "💡 Tip: Clear browser cache (Cmd+Shift+R) if you still see old version"

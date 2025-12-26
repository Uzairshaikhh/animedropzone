#!/bin/bash

# Deploy freshly rebuilt site to Hostinger

SSH_USER="u728583244"
SSH_HOST="animedropzone.com"
LOCAL_BUILD_PATH="/Users/numanshaikh/Downloads/Anime Figure Store Website (2)/build"
REMOTE_PATH="/home/${SSH_USER}/domains/animedropzone.com/public_html"

echo "Starting clean deployment to Hostinger..."
echo "Deploying from: $LOCAL_BUILD_PATH"
echo "Deploying to: $REMOTE_PATH"

# Backup old files
echo "Creating backup of remote files..."
ssh "${SSH_USER}@${SSH_HOST}" "cd ${REMOTE_PATH} && tar -czf backup-$(date +%s).tar.gz --exclude=backup* . && echo 'Backup created'"

# Clear remote directory except backups
echo "Clearing remote directory..."
ssh "${SSH_USER}@${SSH_HOST}" "cd ${REMOTE_PATH} && find . -maxdepth 1 -type f -delete && rm -rf assets/ && echo 'Directory cleared'"

# Deploy new files
echo "Uploading new build files..."
rsync -avz --delete "${LOCAL_BUILD_PATH}/" "${SSH_USER}@${SSH_HOST}:${REMOTE_PATH}/"

echo "✓ Deployment complete!"
echo "Visit: https://animedropzone.com"

#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Deploying fixed bundle to Hostinger...${NC}"

# SSH connection details
SSH_HOST="u728583244@in-mum-web2124.hostinger.com"
REMOTE_PATH="~/domains/animedropzone.com/public_html"

# 1. Download the new bundle from GitHub
echo -e "${YELLOW}Downloading index-Bjj8D8CO.js from GitHub...${NC}"
BUNDLE_URL="https://github.com/Uzairshaikhh/animedropzone/raw/main/build/assets/index-Bjj8D8CO.js"

# Try to download using curl or wget
if command -v curl &> /dev/null; then
  curl -L -o /tmp/index-Bjj8D8CO.js "$BUNDLE_URL"
elif command -v wget &> /dev/null; then
  wget "$BUNDLE_URL" -O /tmp/index-Bjj8D8CO.js
else
  echo -e "${RED}Error: Neither curl nor wget found${NC}"
  exit 1
fi

if [ -f /tmp/index-Bjj8D8CO.js ]; then
  echo -e "${GREEN}✓ Bundle downloaded successfully${NC}"
  ls -lh /tmp/index-Bjj8D8CO.js
else
  echo -e "${RED}Error: Failed to download bundle${NC}"
  exit 1
fi

# 2. Download index.html as well
echo -e "${YELLOW}Downloading updated index.html...${NC}"
HTML_URL="https://github.com/Uzairshaikhh/animedropzone/raw/main/build/index.html"

if command -v curl &> /dev/null; then
  curl -L -o /tmp/index.html "$HTML_URL"
elif command -v wget &> /dev/null; then
  wget "$HTML_URL" -O /tmp/index.html
fi

if [ -f /tmp/index.html ]; then
  echo -e "${GREEN}✓ index.html downloaded successfully${NC}"
fi

# 3. Upload both files via SCP
echo -e "${YELLOW}Uploading files to server...${NC}"

if scp /tmp/index-Bjj8D8CO.js "$SSH_HOST:$REMOTE_PATH/assets/"; then
  echo -e "${GREEN}✓ Bundle uploaded successfully${NC}"
else
  echo -e "${RED}Error: Failed to upload bundle${NC}"
  exit 1
fi

if [ -f /tmp/index.html ] && scp /tmp/index.html "$SSH_HOST:$REMOTE_PATH/"; then
  echo -e "${GREEN}✓ index.html uploaded successfully${NC}"
fi

# 4. Verify files on server
echo -e "${YELLOW}Verifying files on server...${NC}"
ssh "$SSH_HOST" "cd $REMOTE_PATH && ls -lh assets/index-Bjj8D8CO.js && head -c 50 index.html"

echo -e "${GREEN}✓ Deployment complete!${NC}"
echo -e "${YELLOW}Testing website at https://animedropzone.com${NC}"

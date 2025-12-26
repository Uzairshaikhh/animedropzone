# 🚀 SSH Server Deployment Guide

## 📋 Quick Setup (5 minutes)

### Prerequisites

- SSH access to your server (u728583244@your.server.com)
- SSH key configured (no password prompt)
- Server path: `/home/u728583244/animedropzone`

### One-Time Setup

1. **Update SSH configuration in script**:

   ```bash
   # Edit DEPLOY_SSH.sh or DEPLOY_SSH_QUICK.sh
   # Change: SSH_HOST="your.server.com"
   # To your actual server domain/IP
   ```

2. **Make scripts executable**:

   ```bash
   chmod +x DEPLOY_SSH.sh
   chmod +x DEPLOY_SSH_QUICK.sh
   ```

3. **Test SSH connection**:
   ```bash
   ssh u728583244@your.server.com "echo Connected!"
   ```

---

## 🚀 Deployment Methods

### Method 1: Full Deployment (Recommended)

Best for production deployments with verification.

```bash
./DEPLOY_SSH.sh
```

**What it does:**

- ✓ Builds project locally
- ✓ Creates backup of old files
- ✓ Uploads build files to server
- ✓ Extracts and deploys
- ✓ Verifies deployment
- ✓ Cleans up temp files

**Time**: ~2-5 minutes depending on internet speed

---

### Method 2: Quick Deployment

Fast deployment for small updates.

```bash
./DEPLOY_SSH_QUICK.sh
```

**What it does:**

- ✓ Builds locally
- ✓ Uploads and extracts
- ✓ Done!

**Time**: ~30-60 seconds

---

### Method 3: Manual SSH Deployment

For direct server control.

```bash
# Step 1: Build locally
npm run build

# Step 2: SSH into server
ssh u728583244@your.server.com

# Step 3: On server, go to project directory
cd /home/u728583244/animedropzone

# Step 4: Pull latest from GitHub
git pull origin main

# Step 5: Copy build files
cp -r build/* .

# Step 6: Verify
ls -lh index.html
```

---

### Method 4: SCP Direct Upload (Windows/Mac)

Transfer files directly without tar.

```bash
# From your local machine
scp -r build/* u728583244@your.server.com:/home/u728583244/animedropzone/

# Or with compression (faster)
scp -C -r build/* u728583244@your.server.com:/home/u728583244/animedropzone/
```

---

## 🔧 Troubleshooting

### "SSH connection failed"

```bash
# Check SSH key is loaded
ssh-add -l

# Add SSH key if needed
ssh-add ~/.ssh/id_rsa

# Test connection directly
ssh u728583244@your.server.com "whoami"
```

### "Permission denied (publickey)"

```bash
# SSH key not configured on server
# Run on server:
mkdir -p ~/.ssh
cat >> ~/.ssh/authorized_keys << 'EOF'
# Paste your public key here
# (from ~/.ssh/id_rsa.pub on your local machine)
EOF

chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### "Build files not updating"

```bash
# Clear server cache
ssh u728583244@your.server.com "cd /home/u728583244/animedropzone && rm -rf .htaccess"

# Reload website
# Clear browser cache: Ctrl+Shift+Del
```

### "Deployment hangs"

```bash
# Kill hanging process
Ctrl+C  # On your machine

# Check server manually
ssh u728583244@your.server.com "ps aux | grep tar"

# Clean up if needed
ssh u728583244@your.server.com "rm -f /home/u728583244/animedropzone/deploy*.tar.gz"
```

---

## 📊 Deployment Checklist

Before each deployment:

- [ ] Changes committed to git: `git status`
- [ ] Build succeeds locally: `npm run build`
- [ ] SSH connection works: `ssh u728583244@your.server.com "echo OK"`
- [ ] Server path exists: `/home/u728583244/animedropzone`

After each deployment:

- [ ] Website loads: https://your-domain.com
- [ ] Categories page works
- [ ] Anime Figures category loads without crash
- [ ] Products display with images
- [ ] Add to cart works
- [ ] No console errors (F12 → Console)
- [ ] Mobile device test (if applicable)

---

## 🔒 Security Notes

1. **SSH Key Security**

   - Keep private key safe
   - Never commit private keys to git
   - Use `~/.ssh/config` for convenience

2. **File Permissions**

   - Set correct permissions on deployed files
   - Don't run as root
   - Use appropriate group ownership

3. **Backup Strategy**
   - Previous files backed up to `public_html_backup/`
   - Keep timestamp records
   - Test rollback procedure

---

## 📝 SSH Config Example

Create `~/.ssh/config` for easier deployment:

```
Host animedropzone
    HostName your.server.com
    User u728583244
    IdentityFile ~/.ssh/id_rsa
    Port 22
    StrictHostKeyChecking accept-new
```

Then use:

```bash
ssh animedropzone "cd /home/u728583244/animedropzone && ls"
scp -r build/* animedropzone:/home/u728583244/animedropzone/
```

---

## 🚀 Advanced Deployment

### Zero-Downtime Deployment

```bash
#!/bin/bash
# Deploy to new directory, then symlink

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
NEW_DIR="/home/u728583244/animedropzone_${TIMESTAMP}"

# Copy build to new directory
cp -r build "$NEW_DIR"

# Update symlink
ln -sfn "$NEW_DIR" /home/u728583244/animedropzone

# Keep last 3 versions, delete old ones
find /home/u728583244 -maxdepth 1 -type d -name 'animedropzone_*' | sort -r | tail -n +4 | xargs rm -rf
```

### Automated Deployment from GitHub

```bash
# On server, run this in cron job (every hour)
cd /home/u728583244/animedropzone
git pull origin main
npm install
npm run build
cp -r build/* .
```

Then in crontab:

```
0 * * * * cd /home/u728583244/animedropzone && ./auto-deploy.sh
```

---

## 📞 Quick Commands Reference

```bash
# Deploy with full verification
./DEPLOY_SSH.sh

# Quick deploy
./DEPLOY_SSH_QUICK.sh

# Check remote file status
ssh u728583244@your.server.com "ls -lh /home/u728583244/animedropzone/index.html"

# View deployment logs
ssh u728583244@your.server.com "tail -20 /home/u728583244/animedropzone/.deploy.log"

# Rollback to backup
ssh u728583244@your.server.com "cp -r /home/u728583244/animedropzone_backup/* /home/u728583244/animedropzone/"

# Check disk usage
ssh u728583244@your.server.com "du -sh /home/u728583244/animedropzone"

# Restart web server
ssh u728583244@your.server.com "systemctl restart nginx"  # or apache2
```

---

## ✅ Verification After Deployment

### On Command Line

```bash
# Check files exist
ssh u728583244@your.server.com "ls -lh /home/u728583244/animedropzone/index.html"

# Check asset files
ssh u728583244@your.server.com "ls -lh /home/u728583244/animedropzone/assets/ | head -5"

# Check file count
ssh u728583244@your.server.com "find /home/u728583244/animedropzone -type f | wc -l"
```

### In Browser

1. Open https://your-domain.com
2. Press F12 (DevTools)
3. Go to Network tab
4. Reload page
5. Check for:
   - ✓ index.html loads (200 status)
   - ✓ CSS/JS files load (200 status)
   - ✓ No 404 errors
   - ✓ No red errors in Console tab

### On Mobile

1. Clear browser cache
2. Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
3. Test category pages
4. Try Anime Figures category
5. Verify no crashes

---

## 📊 Deployment Status Indicators

| Indicator           | Status | Action        |
| ------------------- | ------ | ------------- |
| Website loads       | ✓      | Monitor       |
| All files present   | ✓      | Monitor       |
| No 404 errors       | ✓      | Monitor       |
| Crash fixes working | ✓      | Monitor       |
| Mobile responsive   | ✓      | Monitor       |
| Performance good    | ?      | Check metrics |

---

## 🎯 Next Steps

1. **Edit script**: Update `SSH_HOST` in DEPLOY_SSH.sh
2. **Make executable**: `chmod +x DEPLOY_SSH.sh`
3. **Test SSH**: `ssh u728583244@your.server.com "echo OK"`
4. **Run deployment**: `./DEPLOY_SSH.sh`
5. **Verify**: Visit https://your-domain.com
6. **Test mobile**: Open on iPhone/Android
7. **Monitor**: Check for errors in browser console

---

**Last Updated**: December 26, 2025  
**Status**: ✅ Ready to Deploy  
**Server Path**: `/home/u728583244/animedropzone`  
**Build Folder**: `/build`

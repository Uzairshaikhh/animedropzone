# 🚀 Hostinger SSH Deployment - Correct Path Guide

## Current Status

✅ You have SSH access to Hostinger  
❌ Repository not in `~/repositories/animedropzone`  
❌ npm command not found (Node.js may not be in PATH)

---

## Step 1: Find Your Repository Location

Run this command to search for the cloned repository:

```bash
find ~ -name "animedropzone" -type d 2>/dev/null
```

**This will show:** `/path/to/animedropzone` directory

**Common locations on Hostinger:**

- `~/public_html/animedropzone`
- `~/animedropzone`
- `~/repositories/animedropzone` (if using Git integration)
- `/var/www/vhosts/yourdomain.com/animedropzone`

---

## Step 2: Enable Node.js (If Not Found)

If npm command doesn't work, Node.js might not be enabled:

```bash
# Check if Node.js is available
which node
which npm

# If nothing shows, try:
source ~/.bashrc
source ~/.bash_profile

# Then try again:
node --version
npm --version
```

**If still not found:**

- Go to **Hostinger Control Panel** → **Websites** → Your site
- Check **Application type** - should be "Node.js" or enabled
- If not, enable Node.js version 18+

---

## Step 3: Deploy (After Finding Path)

Once you find the repository path:

```bash
# Replace PATH with actual path (e.g., ~/animedropzone)
cd PATH/animedropzone

# Check if you're in the right place
pwd
ls -la

# Should show: src/, package.json, vite.config.ts, .htaccess, etc.

# Then build
npm install
npm run build

# Deploy
cp -r build/* ~/public_html/
cp .htaccess ~/public_html/

# Verify
ls ~/public_html/index.html
```

---

## Alternative: Check Your Deployment Settings

In **Hostinger Control Panel**:

1. **Websites** → Select your site
2. **Settings** → **Application**
3. Check:
   - Where was repository cloned? (Git URL)
   - What's the deploy directory?
   - Is Node.js enabled?
   - What version?

The deployment path should be shown there.

---

## Quick Commands to Run Now

Execute these one by one:

```bash
# 1. Find the repo
find ~ -name "animedropzone" -type d 2>/dev/null | head -5

# 2. Check Node.js
node --version
npm --version

# 3. List your home directory
ls -la ~/ | grep -E "(animedropzone|repositories|public_html)"
```

**Share the output** and I'll give you the exact commands to run.

---

## If Repository Is in public_html

If the repo was cloned directly into public_html:

```bash
cd ~/public_html

# If animedropzone folder exists here
ls animedropzone/

# Enter it
cd animedropzone

# Build
npm install
npm run build

# Move build files UP to public_html root
cp -r build/* ../
cp .htaccess ../
```

---

## Hostinger Git Integration Alternative

If Hostinger set up automatic Git deployment:

1. **Hostinger Control Panel** → Your site
2. Go to **Git** section
3. Check if deployment is automatic on push
4. Check build logs for errors

If automatic, just:

- Push code changes to GitHub
- Hostinger automatically builds and deploys
- No manual SSH commands needed

---

## Questions to Answer

To help you faster, tell me:

1. **What did this command show?**

   ```bash
   find ~ -name "animedropzone" -type d 2>/dev/null
   ```

2. **What is the output of:**

   ```bash
   node --version
   npm --version
   ```

3. **Is there a folder structure in** `~/public_html/`**?**
   ```bash
   ls ~/public_html/
   ```

Send me these outputs and I'll give you the exact path and commands to run!

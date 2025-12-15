# 🔧 Blank White Page - Fix This Now

## Problem

Your domain shows a blank white page because **the build files are NOT in the web root yet**.

---

## Why This Happened

✅ Hostinger cloned your code  
✅ Git repository is on server  
❌ **You haven't built the app yet**  
❌ **You haven't moved build files to public_html/**  
❌ **That's why it's blank**

---

## 🚨 SOLUTION - Execute NOW

### Access Hostinger SSH Terminal

**Option 1: Via Hostinger Control Panel (EASIEST)**

1. Go to **Hostinger Control Panel**
2. Click **Websites**
3. Select your website
4. Go to **Advanced** tab
5. Click **Terminal** button
6. A terminal will open in your browser

**Option 2: Via SSH Client**

```bash
ssh username@yourdomain.com
# Or: ssh username@[server-ip]
# Enter your password when prompted
```

---

## Execute These 3 Commands in Order

### Command 1: Navigate to Repository & Build

```bash
cd ~/repositories/animedropzone
npm install && npm run build
```

**Wait for completion** (shows "✓ built in X.Xs")

### Command 2: Move Build Files to Web Root

```bash
cp -r build/* ~/public_html/
cp .htaccess ~/public_html/
ls ~/public_html/
```

**Should show:** `index.html`, `assets/`, `.htaccess`

### Command 3: Clear Browser Cache & Test

```bash
echo "Done! Now visit your domain..."
```

---

## Then Test Your Domain

1. **Don't refresh yet** - Clear cache first:

   - Press `Ctrl + Shift + Delete` (Windows/Linux)
   - Or `Cmd + Shift + Delete` (Mac)
   - Select "All time" → Clear browsing data

2. **Visit your domain** fresh:

   ```
   https://yourdomain.com
   ```

3. **Should see:** Anime store homepage with products

4. **If still blank:**
   - [ ] Open DevTools: Press `F12`
   - [ ] Go to **Console** tab
   - [ ] Look for RED ERROR messages
   - [ ] Take a screenshot and check against troubleshooting below

---

## ⚠️ If Still Blank After Commands

### Step 1: Verify Files Are There

```bash
ls -la ~/public_html/index.html
ls -la ~/public_html/.htaccess
```

Should output file info (not "No such file or directory")

### Step 2: Check Build Folder Exists

```bash
ls -la ~/repositories/animedropzone/build/
```

Should show: `index.html`, `assets/`, etc.

### Step 3: Check .htaccess Permissions

```bash
chmod 644 ~/public_html/.htaccess
chmod 755 ~/public_html/
```

### Step 4: Check Apache mod_rewrite

Contact **Hostinger Support** - ask them to:

- ✅ Enable `mod_rewrite` for your account
- ✅ Confirm `AllowOverride All` is set in Apache config
- ✅ Verify document root is `~/public_html/`

---

## Environment Variables Issue

**If site loads but shows errors in console:**

### Via Control Panel:

1. **Hostinger Control Panel** → **Websites** → Your site
2. Go to **Environment variables** section
3. Add these:
   ```
   VITE_SUPABASE_URL = https://[your-project].supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGc...
   ```

### Via .env File:

```bash
cat > ~/public_html/.env << 'EOF'
VITE_SUPABASE_URL=https://[your-project].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
EOF
```

**Get your keys from:** Supabase → Project Settings → API → Copy values

---

## Verify Each Step

After each command, check if it succeeded:

| Command             | Success Indicator                 |
| ------------------- | --------------------------------- |
| `npm install`       | No red errors, shows "up to date" |
| `npm run build`     | Shows "✓ built in X.Xs"           |
| `cp -r build/*`     | No errors displayed               |
| `ls ~/public_html/` | Shows `index.html`                |
| Visit domain        | See homepage, not blank           |
| DevTools Console    | No red error messages             |

---

## Quick Checklist

- [ ] Opened Hostinger Terminal (Control Panel → Advanced → Terminal)
- [ ] Ran: `cd ~/repositories/animedropzone`
- [ ] Ran: `npm install && npm run build` (waited for completion)
- [ ] Ran: `cp -r build/* ~/public_html/ && cp .htaccess ~/public_html/`
- [ ] Cleared browser cache (Ctrl+Shift+Del)
- [ ] Visited domain fresh - **see homepage**
- [ ] Opened F12 console - **no red errors**

---

## Still Stuck?

Run this diagnostic command in SSH:

```bash
echo "=== Repository Status ===" && \
cd ~/repositories/animedropzone && \
pwd && git status && \
echo "=== Build Check ===" && \
ls -la build/index.html 2>/dev/null || echo "Build folder missing!" && \
echo "=== Web Root Check ===" && \
ls -la ~/public_html/index.html 2>/dev/null || echo "Files not copied!" && \
echo "=== htaccess Check ===" && \
head -5 ~/public_html/.htaccess
```

Copy the output and compare to this:

- Should show: `On branch main`, `working tree clean`
- Should show: `build/index.html` exists
- Should show: `public_html/index.html` exists
- Should show: `.htaccess` content (RewriteEngine On)

---

## 📞 Need More Help?

1. **Run the diagnostic command above** - send output
2. **Check DevTools Console** (F12) - screenshot errors
3. **Contact Hostinger Support:**
   - Ask to enable: `mod_rewrite`
   - Ask for document root location
   - Ask if Node.js is enabled (usually automatic)

Your domain should show the store immediately after running these commands!

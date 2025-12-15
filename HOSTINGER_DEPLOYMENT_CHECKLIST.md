# Hostinger Deployment Checklist - Action Items

## STATUS: Repository Cloned ✅

Your code is now on Hostinger's servers. Next steps:

---

## IMMEDIATE ACTIONS REQUIRED

### Step 1: Build the Application

SSH into your Hostinger account and run:

```bash
npm install
npm run build
```

**What this does:**

- Installs all dependencies
- Compiles React/Vite app
- Creates production-ready `build/` folder
- Takes ~30-60 seconds

### Step 2: Set Up Web Root

Choose ONE of these options:

**Option A: Move build files to public_html (Simple)**

```bash
# After build completes
cp -r build/* ~/public_html/
```

- Upload `.htaccess` file to `~/public_html/`
- Your site is live immediately

**Option B: Configure public_html path (Advanced)**

- In Hostinger Control Panel → Website Settings
- Set "Document Root" to `/path/to/build`
- Push changes via Git for auto-deploy

### Step 3: Verify Deployment

After uploading, test immediately:

1. **Home Page**

   ```
   https://yourdomain.com
   ```

   Should show store homepage

2. **Direct Product Link**

   ```
   https://yourdomain.com/product/[product-id]
   ```

   Should load product details (no 404)

3. **Page Refresh Test**

   - Go to any product page
   - Press F5 (hard refresh)
   - Should stay on same page (no 404)

4. **Browser Console Check**

   - Press F12 → Console tab
   - Should have NO red errors
   - Check for missing Supabase config

5. **Test Features**
   - Click back button → Should return to previous page
   - Click "Select Image" → Should show image dropdown
   - Add to cart → Should update cart count

---

## CONFIGURATION FILES READY

### .htaccess

✅ Already in repository - handles routing

- Redirects all requests to `index.html`
- Enables proper caching
- Must be in web root

### Environment Variables

⚠️ MUST SET IN HOSTINGER

Add these in Hostinger Control Panel or .env file:

```
VITE_SUPABASE_URL=your_actual_supabase_url
VITE_SUPABASE_ANON_KEY=your_actual_anon_key
```

Without these, the app won't connect to your database!

---

## TROUBLESHOOTING DURING DEPLOYMENT

**Problem:** Nothing appears, blank page

- [ ] Check if `build/` folder is in web root
- [ ] Verify `index.html` exists in root
- [ ] Check F12 console for errors

**Problem:** 404 errors on page refresh

- [ ] Confirm `.htaccess` is uploaded
- [ ] Verify `mod_rewrite` is enabled (Hostinger support)
- [ ] Check that rewrite rule syntax is correct

**Problem:** Images/CSS not loading

- [ ] Open DevTools (F12)
- [ ] Check Network tab for 404s
- [ ] Verify asset paths in console

**Problem:** "Cannot connect to database"

- [ ] Set VITE_SUPABASE_URL correctly
- [ ] Set VITE_SUPABASE_ANON_KEY correctly
- [ ] Rebuild after setting vars: `npm run build`

---

## QUICK REFERENCE: File Locations

```
Repository Root (after git clone):
├── package.json           ← Dependencies list
├── vite.config.ts         ← Build config
├── .htaccess              ← Routing rules (UPLOAD THIS)
├── netlify.toml           ← Netlify config (skip)
├── build/                 ← PRODUCTION FILES (after npm run build)
│   ├── index.html         ← Main entry point
│   ├── assets/            ← JS, CSS, images
│   └── ...
└── src/                   ← Source code (don't upload)
    ├── pages/
    ├── components/
    └── ...

Upload to Hostinger:
~/public_html/            ← Web root
├── index.html            ← From build/
├── assets/               ← From build/assets/
├── .htaccess             ← From root
└── ...
```

---

## NEXT STEPS SUMMARY

1. **SSH to Hostinger** (or use Terminal in Control Panel)
2. **Run:** `npm install && npm run build`
3. **Upload:** `build/` folder to `public_html/`
4. **Upload:** `.htaccess` file to `public_html/`
5. **Set:** Environment variables in Control Panel
6. **Test:** Visit domain, check console, test features
7. **Done:** Your site is live! 🎉

---

## Need Help?

- **Hostinger Terminal/SSH Access:** Control Panel → Hosting → Advanced → Terminal
- **Check Deployment Logs:** Control Panel → Websites → [Your Site] → Logs
- **Supabase Config:** Check `src/utils/supabase/info.ts` for current keys
- **Git Status:** Run `git status` to verify no uncommitted changes

---

**Last Updated:** December 15, 2025
**Project Type:** React + Vite (Static Site)
**Build Time:** ~30 seconds
**Recommended Node Version:** 18+

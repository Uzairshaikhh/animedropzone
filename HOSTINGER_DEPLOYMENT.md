# Hostinger Deployment Guide

## Project Type

This is a **React + Vite** application, NOT a PHP project. Hostinger's automatic detection was looking for PHP files (composer.json), but this is a modern Node.js front-end application.

## Pre-Deployment Checklist

- [x] Build output is in the `build/` directory
- [x] `.htaccess` file is configured for SPA routing
- [x] `netlify.toml` is configured for Netlify deployments
- [x] All environment variables are set in Hostinger panel
- [x] Git repository is cloned successfully

## Deployment Steps on Hostinger

### 1. **Configure Application Type**

- Go to **Hostinger Control Panel** → **Websites**
- Select your website
- Go to **Settings** → **Application type**
- Set to **Custom (Node.js)** or **Static Site**
- If no Node.js option, treat as static HTML/CSS/JS

### 2. **Build the Application Locally (Already Done)**

```bash
npm install
npm run build
```

This creates the `build/` directory with production-ready files.

### 3. **Upload Build Files to Hostinger**

**Option A: Using Hostinger File Manager**

- Connect via SFTP or File Manager
- Upload contents of `build/` folder to `public_html/` or your web root
- Ensure `index.html` is in the root

**Option B: Using Git Integration (Recommended)**

- Enable Git in Hostinger Control Panel
- Connect your GitHub repository
- Set build command: `npm install && npm run build`
- Set publish directory: `build`
- Deploy on each push to main branch

### 4. **.htaccess Configuration**

The `.htaccess` file is already configured to:

- Route all requests to `index.html` for React Router
- Enable proper caching for assets
- Ensure SPA (Single Page Application) works correctly

**Verify in Hostinger:**

- Ensure `.htaccess` file is uploaded to web root
- Check that `mod_rewrite` is enabled (usually enabled by default)

### 5. **Environment Variables**

Create/update environment variables in Hostinger:

1.  Go to **Control Panel** → **Environment variables** (or .env file via SFTP)
2.  Add required variables:
    ```
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_key
    ```
3.  These must match your `src/utils/supabase/info.ts` configuration

### 6. **Test Deployment**

- Visit your website URL
- Test navigation (back button, product pages)
- Check console for errors (F12 → Console)
- Test image selector on product pages
- Verify no 404 errors on page refresh

## Troubleshooting

### Issue: "404 Not Found" on page refresh

**Cause:** SPA routing not configured  
**Solution:** Ensure `.htaccess` file is uploaded and `mod_rewrite` is enabled

### Issue: Blank page or nothing loads

**Cause:** Build files not in correct directory  
**Solution:** Verify `build/` folder contents are in web root (not `build/` as subdirectory)

### Issue: Images or CSS not loading

**Cause:** Incorrect asset paths  
**Solution:** Check browser DevTools (F12) for 404 errors on assets

### Issue: Environment variables not working

**Cause:** VITE variables must be set before build  
**Solution:** Set env vars in Hostinger, then rebuild: `npm run build`

## File Structure After Deployment

```
public_html/
├── index.html          (main entry point)
├── .htaccess           (routing configuration)
├── assets/
│   ├── index-[hash].js     (React app bundle)
│   ├── index-[hash].css    (Tailwind CSS)
│   └── [other assets]
└── [other static files]
```

## Quick Deployment Verification

After upload, check these in browser:

1. **Home page loads** → `https://yourdomain.com`
2. **Direct product link works** → `https://yourdomain.com/product/123`
3. **Page refresh doesn't 404** → Press F5 on any route
4. **Back navigation works** → Click back button from product page
5. **Image selector works** → Click "Select Image" button
6. **No console errors** → F12 → Console tab

## Additional Notes

- **Node version:** Project requires Node 18+
- **Build size:** ~1.4 MB (minified, not gzipped)
- **Build time:** ~5 seconds
- **Supported browsers:** Modern browsers (Chrome, Firefox, Safari, Edge)

## Need Help?

If deployment fails:

1. Check Hostinger error logs in Control Panel
2. Verify `.htaccess` is in web root
3. Confirm `build/` folder was deployed (not `src/`)
4. Test locally: `npm run build && npm run preview`
5. Contact Hostinger support - confirm your account has mod_rewrite enabled

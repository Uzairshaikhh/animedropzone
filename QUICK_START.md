# 🚀 QUICK START - Deploy Now!

## Status: ✅ READY TO DEPLOY

Repository is cloned on Hostinger and verified clean.

---

## 3 Commands to Go Live

Copy and paste these into Hostinger SSH terminal:

```bash
# 1. Build the app (2 minutes)
npm install && npm run build

# 2. Deploy to web (10 seconds)
cp -r build/* ~/public_html/ && cp .htaccess ~/public_html/

# 3. Test
echo "Visit: https://yourdomain.com"
```

---

## 4. Set Environment Variables

In **Hostinger Control Panel** → **Environment Variables** (or via .env file):

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from: Supabase Dashboard → Settings → API → Project URL & anon key

---

## 5. Verify It Works

After deployment, test these:

- [ ] Visit `https://yourdomain.com` → Homepage loads
- [ ] Click a product → Product page loads
- [ ] Refresh page (F5) → No 404 error
- [ ] Click back button → Returns to previous page
- [ ] Click "Select Image" → Shows image dropdown
- [ ] Press F12 → Console has no red errors

---

## ⚠️ If Something Breaks

**404 on page refresh?**

- Confirm `.htaccess` is in `public_html/`
- Contact Hostinger: enable `mod_rewrite`

**Blank page?**

- Open DevTools (F12)
- Check Console for errors
- Verify Supabase keys are set

**Images/CSS missing?**

- Check Network tab in DevTools
- Verify `build/assets/` exists in `public_html/`

---

## 📚 Full Guides

- **Detailed steps:** `HOSTINGER_DEPLOYMENT_CHECKLIST.md`
- **Troubleshooting:** `HOSTINGER_DEPLOYMENT.md`
- **Complete status:** `DEPLOYMENT_STATUS.md`

---

## 💡 That's It!

Your app is configured and ready. Just run the 3 commands above and you're live.

Good luck! 🎉

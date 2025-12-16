# 🔍 Email Configuration Verification Guide

## Quick Check: Are Emails Working?

To verify if emails are working, you need to check:

### 1. Supabase Environment Variables (CRITICAL)

Go to: https://supabase.com/dashboard

- Settings ⚙️ → Edge Functions → `make-server-95a96d8e` → Configuration

**Check if these 3 variables are set:**

```
✅ EMAIL_PROVIDER = hostinger
✅ HOSTINGER_SMTP_USER = noreply@animedropzone.com
✅ HOSTINGER_SMTP_PASS = [should show as dots/hidden]
```

**If ANY are missing → Emails WILL NOT work**

---

### 2. Test Email Sending

**Option A: Place Test Order**

1. Go to: https://animedropzone.com/shop
2. Add any product
3. Complete checkout with your email
4. Check inbox for order confirmation email
5. Check if admin got notification at: anime.drop.zone.00@gmail.com

**Option B: Check Supabase Logs**

1. Go to: https://supabase.com/dashboard
2. Edge Functions → `make-server-95a96d8e`
3. Click **"Logs"** tab
4. Place test order on website
5. Watch logs for messages like:
   ```
   ✅ Email sent successfully via Hostinger SMTP
   OR
   ❌ Hostinger credentials NOT configured
   ❌ Hostinger SMTP error
   ```

---

### 3. Common Issues & Fixes

**Issue: "Hostinger credentials NOT configured"**

- Solution: Add the 3 variables to Supabase (EMAIL_PROVIDER, HOSTINGER_SMTP_USER, HOSTINGER_SMTP_PASS)
- Status: Variables NOT SET

**Issue: "AUTHENTICATION FAILED"**

- Solution: Wrong password in HOSTINGER_SMTP_PASS
- Fix: Reset email password in Hostinger Control Panel, update in Supabase

**Issue: "Connection refused"**

- Solution: Check SMTP settings
- Fix: Make sure IMAP/SMTP is enabled in Hostinger email account settings

**Issue: No error but no email received**

- Solution: Check spam folder
- Also check: Hostinger email daily sending limits (usually 300/day)

---

## Current Status

**Email Service Code:** ✅ Deployed
**Website:** ✅ Live at animedropzone.com
**Server:** ✅ Production updated (Dec 16 08:40)

**Pending:**
⏳ Verify Supabase environment variables are configured
⏳ Test with order placement
⏳ Check if emails are being received

---

## What You Need to Do

1. **Verify Supabase has all 3 variables set** (this is critical)
2. **Place a test order** on the website
3. **Check your inbox** for the confirmation email
4. **Tell me:**
   - Did you receive the email?
   - Any errors in Supabase logs?
   - What error message (if any)?

Once you confirm those, I can help troubleshoot further if needed!

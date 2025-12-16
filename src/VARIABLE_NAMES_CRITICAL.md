# 🚨 CRITICAL: Variable Name Reference

## The Problem You're Experiencing

**Emails NOT being sent** = Environment variables are wrong in Supabase

---

## EXACT Variable Names Required in Supabase

### ✅ THESE ARE CORRECT:

```
Variable Name: EMAIL_PROVIDER
Value: hostinger

Variable Name: HOSTINGER_SMTP_USER
Value: noreply@animedropzone.com

Variable Name: HOSTINGER_SMTP_PASS
Value: [your actual email password]
```

---

## ❌ COMMON MISTAKES (Will NOT work):

```
❌ WRONG: HOSTINGER_EMAIL
          Should be: HOSTINGER_SMTP_USER

❌ WRONG: HOSTINGER_PASSWORD
          Should be: HOSTINGER_SMTP_PASS

❌ WRONG: HOSTINGER_USER
          Should be: HOSTINGER_SMTP_USER

❌ WRONG: EMAIL_SERVICE or EMAIL_PROVIDER_TYPE
          Should be: EMAIL_PROVIDER
```

---

## How to Verify in Supabase

1. **Open:** https://supabase.com/dashboard
2. **Select Project:** AnimeDrop Zone
3. **Go to:** Settings ⚙️ → Edge Functions (left sidebar)
4. **Click Function:** `make-server-95a96d8e`
5. **Click Tab:** "Configuration" or "Environment Variables"

### Look for EXACTLY these 3 variables:

- [ ] `EMAIL_PROVIDER` = `hostinger`
- [ ] `HOSTINGER_SMTP_USER` = `noreply@animedropzone.com`
- [ ] `HOSTINGER_SMTP_PASS` = `[hidden dots/asterisks]`

**If ANY are missing or named differently → emails won't send**

---

## What the Code Expects

Your email service code is looking for:

```typescript
// From email-service.tsx line 206-207:
const hostingerEmail = Deno.env.get("HOSTINGER_SMTP_USER");
const hostingerPassword = Deno.env.get("HOSTINGER_SMTP_PASS");
```

**Translation:** The code REQUIRES these EXACT names. If you use different names, the code won't find them.

---

## Testing Variable Names

After setting variables in Supabase:

1. **Wait 2-3 minutes** for redeploy
2. **Place test order** on website
3. **Check Supabase Logs:**
   - Edge Functions → `make-server-95a96d8e`
   - Click "Logs" tab
   - Look for:

**✅ SUCCESS (emails will work):**

```
🔍 Hostinger SMTP Configuration:
  SMTP Host: smtp.hostinger.com
  SMTP Port: 465
  From Email: noreply@animedropzone.com
  To Email: customer@example.com
✅ Connected to Hostinger SMTP server
✅ Email sent via Hostinger SMTP
```

**❌ FAILURE (wrong variable names):**

```
❌ Hostinger credentials NOT configured
⚠️ SETUP REQUIRED - Add these secrets to Supabase Edge Functions:
   • HOSTINGER_SMTP_USER = your-email@yourdomain.com
   • HOSTINGER_SMTP_PASS = your-email-password
```

---

## Quick Checklist

- [ ] Opened Supabase Dashboard
- [ ] Navigated to Edge Functions
- [ ] Found function `make-server-95a96d8e`
- [ ] Found Configuration/Secrets tab
- [ ] Verified `EMAIL_PROVIDER` = `hostinger`
- [ ] Verified `HOSTINGER_SMTP_USER` = `noreply@animedropzone.com`
- [ ] Verified `HOSTINGER_SMTP_PASS` is filled (shows dots)
- [ ] Clicked Save on all variables
- [ ] Waited 2-3 minutes
- [ ] Placed test order
- [ ] Received order confirmation email
- [ ] Admin received order notification

**Once all checked → Emails are working!**

---

## If Still Not Working

**Step 1: Check the Logs**

```
Edge Functions → make-server-95a96d8e → Logs Tab
```

**Step 2: Look for Error Message**

- See "Hostinger credentials NOT configured" → Variable names are wrong
- See "HOSTINGER AUTHENTICATION FAILED" → Password is wrong
- See "HOSTINGER CONNECTION FAILED" → Host/Port is wrong

**Step 3: Fix Based on Error**

- Wrong names → Use exact names above
- Wrong password → Reset in Hostinger Control Panel
- Connection issue → Check host is `smtp.hostinger.com` and port is `465`

---

**Last Updated:** December 16, 2025  
**Critical:** Variable names MUST match exactly

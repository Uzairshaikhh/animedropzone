# 🔍 Email Delivery Debugging - Complete Checklist

## 🚨 CRITICAL: What's Happening?

Your system is **NOT sending emails** because:

1. **EMAIL_PROVIDER might NOT be set to "hostinger"** in Supabase
2. **MailerSend trial may be expired** (limited free tier)
3. **Hostinger SMTP credentials are missing** from Supabase

---

## ✅ STEP 1: Check Current Email Provider (2 minutes)

### Go to Supabase Dashboard:

1. **Open:** https://supabase.com/dashboard
2. **Select Your Project:** AnimeDrop Zone
3. **Navigate to:** Settings → Edge Functions (left sidebar)
4. **Click Function:** `make-server-95a96d8e`
5. **Click Tab:** `Configuration` or `Environment Variables`

### Look for These Variables:

```
📌 EMAIL_PROVIDER = ?

✅ If it says: "hostinger"
   → Hostinger is configured, proceed to Step 2

❌ If it says: "mailersend"
   → MailerSend is active, but it might be expired

⚠️ If it's empty/blank
   → System defaults to MailerSend, this is the problem!

❌ If it says something else (resend, gmail, etc)
   → That provider might not be configured correctly
```

---

## ✅ STEP 2A: If EMAIL_PROVIDER = "hostinger"

### Check Hostinger Credentials:

**Look for these variables:**

```
✅ HOSTINGER_SMTP_USER = noreply@animedropzone.com
✅ HOSTINGER_SMTP_PASS = [your email password]
```

**If Missing or Empty:**

1. Add `HOSTINGER_SMTP_USER = noreply@animedropzone.com`
2. Add `HOSTINGER_SMTP_PASS = [your actual email password from Hostinger]`
3. Click **Save**
4. Wait 2-3 minutes for redeploy
5. Test by placing a test order

**If Present:**
→ Go to **Step 3: Test Email Sending**

---

## ✅ STEP 2B: If EMAIL_PROVIDER = "mailersend" (or Not Set)

### This is Likely Your Problem!

The system is trying to use MailerSend, which might be:

- ✗ Expired trial (12,000 emails/month free tier)
- ✗ Invalid API key
- ✗ Account suspended

### SOLUTION: Switch to Hostinger

1. **Edit EMAIL_PROVIDER:**

   - Change value to: `hostinger`
   - Click Save

2. **Add Hostinger Credentials:**

   ```
   HOSTINGER_SMTP_USER = noreply@animedropzone.com
   HOSTINGER_SMTP_PASS = [your email password]
   ```

3. **Remove MailerSend Variables (Optional but Recommended):**

   - Delete or empty: `MAILERSEND_API_KEY`
   - Delete or empty: `MAILERSEND_FROM_EMAIL`

4. **Click Save**

5. **Wait 2-3 minutes** for Supabase to redeploy functions

6. **Test immediately** (see Step 3)

---

## ✅ STEP 3: Test Email Sending (3 minutes)

### Test 1: Send a Test Email via Admin Panel

1. **Open your website:** https://animedropzone.com
2. **Go to Admin Dashboard** (if you have access)
3. **Look for "Send Test Email" or "Email Settings"**
4. **Enter test email** (your personal email)
5. **Click "Send Test"**
6. **Check your inbox** (and spam folder!)

### Test 2: Place a Test Order

1. **Go to:** https://animedropzone.com/shop
2. **Add any product** to cart
3. **Click "Checkout"**
4. **Fill in your test email address**
5. **Complete checkout** with test payment
6. **Check your inbox** for order confirmation

**Expected Emails:**

- ✅ Order confirmation email to **you** (customer)
- ✅ Admin notification email to **anime.drop.zone.00@gmail.com** (admin)

### Test 3: Check Spam/Promotions

**Gmail users:**

- ✅ Check "Promotions" tab
- ✅ Check "Spam" folder
- ✅ Mark as "Not Spam" if found

**Outlook/Hotmail:**

- ✅ Check "Junk" folder
- ✅ Check "Other" folder

---

## 🔧 TROUBLESHOOTING: If Emails Still Not Working

### Problem: "Connection refused" or "Authentication failed"

**Cause:** Wrong Hostinger credentials
**Fix:**

1. Go to Hostinger Control Panel
2. Find your email account (noreply@animedropzone.com)
3. Reset the password
4. Update HOSTINGER_SMTP_PASS in Supabase with new password
5. Save and wait 2 minutes
6. Test again

### Problem: "SSL/TLS error"

**Cause:** Port or protocol mismatch
**Check:**

1. Port should be: `465` (SSL) or `587` (TLS)
2. Default is `465` which should work
3. If not working, add this to Supabase:
   ```
   HOSTINGER_SMTP_PORT = 587
   ```

### Problem: Emails appear to send but aren't received

**Check 1: Admin Email**

- Ask admin to check **spam/junk folder**
- Admin should mark as "Not Spam"
- Check: `anime.drop.zone.00@gmail.com`

**Check 2: Hostinger Email Limits**

- Hostinger has daily sending limits
- Check how many emails you've sent today
- If limit reached, wait 24 hours

**Check 3: Supabase Logs**

1. Go to Supabase Dashboard
2. Click "Edge Functions"
3. Click `make-server-95a96d8e`
4. Click **Logs** tab
5. Look for:
   - ✅ `"✅ Email sent via Hostinger SMTP"`
   - ❌ `"❌ Hostinger SMTP error"`

---

## 📋 Quick Reference Card

### Current Status Check:

```bash
❓ EMAIL_PROVIDER = [Check Supabase - what do you see?]
❓ HOSTINGER_SMTP_USER = [Should be: noreply@animedropzone.com]
❓ HOSTINGER_SMTP_PASS = [Should be filled]
```

### What Needs to Happen:

1. ✅ Set EMAIL_PROVIDER = "hostinger"
2. ✅ Set HOSTINGER_SMTP_USER = noreply@animedropzone.com
3. ✅ Set HOSTINGER_SMTP_PASS = [your email password]
4. ✅ Save in Supabase
5. ✅ Wait 2-3 minutes
6. ✅ Test with a test order

### Expected Result:

- ✅ Customer receives order confirmation
- ✅ Admin receives notification
- ✅ Both arrive within 1 minute
- ✅ Check spam if not in inbox

---

## 🚀 Quick Fix Summary

**If using MailerSend (emails not working):**

```
1. Open Supabase Dashboard
2. Edge Functions → make-server-95a96d8e → Configuration
3. Change EMAIL_PROVIDER to: hostinger
4. Add HOSTINGER_SMTP_USER = noreply@animedropzone.com
5. Add HOSTINGER_SMTP_PASS = [your email password]
6. Save
7. Wait 2 minutes
8. Test by placing order
```

**Time required:** 5 minutes

**Expected result:** Emails working within 1-2 minutes after save

---

## ❓ Common Questions

**Q: Where do I find my email password?**
A: In Hostinger Control Panel → Email Accounts → Your email → Password (or reset it)

**Q: How long until emails work after saving?**
A: Supabase redeploys automatically within 2-3 minutes. Test after waiting.

**Q: What if I don't remember my email password?**
A: Reset it in Hostinger Control Panel, then update HOSTINGER_SMTP_PASS in Supabase.

**Q: Do I need both EMAIL_PROVIDER and credentials?**
A: Yes! EMAIL_PROVIDER tells the system which service to use, credentials authenticate it.

**Q: What if MailerSend is expired?**
A: Switch to Hostinger (these steps) or another provider (Resend, Gmail, SendGrid).

---

## 📞 Need Help?

1. **Check the logs** in Supabase → Edge Functions → Logs
2. **Verify email address** is correct in Hostinger panel
3. **Check spam folder** on receiving end
4. **Wait 2-3 minutes** after saving in Supabase
5. **Test with your own email** first before ordering

---

**Last Updated:** December 16, 2025  
**Status:** Critical - Email Not Sending  
**Priority:** HIGH - Customers can't receive orders

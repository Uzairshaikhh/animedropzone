# ⚡ Hostinger Email - 5 Minute Setup

## 🎯 What You Need

1. Your Hostinger email address (e.g., `noreply@animedropzone.com`)
2. Your email password
3. Access to Supabase Dashboard

---

## 🚀 Setup Steps

### Step 1: Get Email Credentials (2 minutes)

**Go to Hostinger:**
```
https://hpanel.hostinger.com/
```

**Option A: Use Existing Email**
1. Click **Emails**
2. Find your email account
3. If you forgot password:
   - Click **Manage**
   - Click **Change Password**
   - Set new password and SAVE IT

**Option B: Create New Email (Recommended)**
1. Click **Emails** → **Email Accounts**
2. Click **Create Email Account**
3. Enter:
   - **Username:** `noreply` (or `orders`, `info`, etc.)
   - **Domain:** Select `animedropzone.com`
   - **Password:** Create strong password
4. Click **Create**
5. Your email: `noreply@animedropzone.com`

---

### Step 2: Add to Supabase (3 minutes)

**Go to Supabase:**
```
https://supabase.com/dashboard
```

**Add Environment Variables:**
1. Click your project
2. Click **Project Settings** (⚙️ bottom left)
3. Click **Edge Functions** tab
4. Scroll to **Environment Variables**
5. Add these 3 variables:

#### Variable 1:
```
Name: EMAIL_PROVIDER
Value: hostinger
```
Click **Add** or **Save**

#### Variable 2:
```
Name: HOSTINGER_EMAIL
Value: noreply@animedropzone.com
```
⚠️ **Replace with YOUR email**

#### Variable 3:
```
Name: HOSTINGER_PASSWORD  
Value: your_email_password
```
⚠️ **Replace with YOUR password**

---

### Step 3: Test (1 minute)

1. Go to your website: `animedropzone.com`
2. Add a product to cart
3. Complete checkout
4. Check email inbox for confirmation

**✅ Success!** You should receive order confirmation email.

---

## 🔍 Verify It's Working

### Check Supabase Logs:
1. Supabase Dashboard
2. **Edge Functions** → **Logs**
3. Look for:
```
📧 Sending email via HOSTINGER
✅ Connected to Hostinger SMTP server
✅ Email sent via Hostinger SMTP
```

### Check Hostinger Sent Mail:
1. Go to https://hpanel.hostinger.com/
2. Click **Emails** → **Webmail**
3. Login with your email
4. Check **Sent** folder
5. You should see sent order confirmations

---

## ❌ Troubleshooting

### "Authentication Failed"
**Fix:**
- Go to Hostinger hPanel
- Reset email password
- Update `HOSTINGER_PASSWORD` in Supabase
- Use full email as username: `noreply@animedropzone.com`

### "Connection Refused"  
**Fix:**
Add these optional variables to Supabase:
```
Name: HOSTINGER_SMTP_HOST
Value: smtp.hostinger.com

Name: HOSTINGER_SMTP_PORT
Value: 465
```

### Still Not Working?
**Check:**
- Email address is complete: `name@animedropzone.com`
- Password has no extra spaces
- `EMAIL_PROVIDER` is set to `hostinger` (not `mailersend`)
- All 3 variables added to Supabase

---

## 📋 Quick Copy-Paste Template

**For Supabase Environment Variables:**

```
EMAIL_PROVIDER = hostinger
HOSTINGER_EMAIL = noreply@animedropzone.com
HOSTINGER_PASSWORD = your_password_here
```

**Optional (if needed):**
```
HOSTINGER_SMTP_HOST = smtp.hostinger.com
HOSTINGER_SMTP_PORT = 465
```

---

## ✅ Final Checklist

- [ ] Hostinger email created/confirmed
- [ ] Email password saved securely
- [ ] `EMAIL_PROVIDER=hostinger` added to Supabase
- [ ] `HOSTINGER_EMAIL` added to Supabase
- [ ] `HOSTINGER_PASSWORD` added to Supabase
- [ ] Test order placed
- [ ] Confirmation email received
- [ ] Checked Supabase logs for success

---

## 🎉 Done!

You're now using Hostinger SMTP for all emails!

**Benefits:**
- ✅ Professional emails from your domain
- ✅ No third-party service needed
- ✅ Included with your hosting
- ✅ Reliable delivery
- ✅ Full control

**Your emails now send from:**
`AnimeDrop Zone <noreply@animedropzone.com>`

Much more professional than generic email services!

---

## 📞 Need Help?

**Hostinger Support:** 24/7 live chat in hPanel  
**Email Issues:** Check Supabase Edge Function logs for details

---

**Setup Time:** 5 minutes ⚡  
**Cost:** FREE (included with hosting) 💰  
**Reliability:** High ⭐⭐⭐⭐⭐  

**🚀 Your email system is now production-ready!**

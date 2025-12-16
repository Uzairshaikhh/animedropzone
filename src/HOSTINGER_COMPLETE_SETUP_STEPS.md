# 📧 Hostinger Email Setup - Complete Implementation

**Status:** Your code is READY. Just need to configure Hostinger + Supabase.  
**Time Required:** 10 minutes  
**Difficulty:** Easy ✅

---

## 🎯 What You're Setting Up

- **Email Sending:** From your custom domain (`noreply@animedropzone.com`)
- **Provider:** Hostinger SMTP
- **Recipients:** Customer order confirmations, admin notifications
- **Status:** No third-party service needed - using Hostinger directly

---

## 📋 Phase 1: Create/Confirm Hostinger Email (3 mins)

### Step 1: Login to Hostinger hPanel

```
https://hpanel.hostinger.com/
```

### Step 2: Navigate to Emails

1. Click **Emails** (left sidebar)
2. You should see your domain: `animedropzone.com`
3. Look for email accounts

### Step 3: Create Email Account (if needed)

**If you already have an email account:**

- Note the **email address** (e.g., `noreply@animedropzone.com`)
- Go to Step 4 to get the password

**If you DON'T have an email account:**

1. Click **Create Email Account**
2. Enter username: `noreply` (or `info`, `orders`, `support`)
3. Domain: Select `animedropzone.com`
4. Password: Create strong password (16+ chars, mix of upper/lower/numbers/symbols)
5. Click **Create**

### Step 4: Get/Confirm Your Email Password

**If you created a new email:**

- Password: Use the one you just created

**If you're using existing email and forgot password:**

1. Click **Emails** → Find your email → Click **Manage**
2. Click **Change Password**
3. Create new strong password
4. Click **Save**
5. Note this new password

### ✅ You now have:

- **Email Address:** `noreply@animedropzone.com` (full address with domain)
- **Password:** Your strong password
- **SMTP Host:** `smtp.hostinger.com`
- **SMTP Port:** `465` (SSL) or `587` (TLS)

---

## 🔐 Phase 2: Add Hostinger Credentials to Supabase (5 mins)

### Step 1: Login to Supabase Dashboard

```
https://supabase.com/dashboard
```

### Step 2: Select Your Project

- Click your `animedropzone` project

### Step 3: Go to Edge Functions Settings

1. Click **Project Settings** (⚙️ icon, bottom left)
2. Left sidebar → **Edge Functions** (or **Functions**)
3. Scroll down or look for **Environment Variables** or **Secrets** section

### Step 4: Add Environment Variables/Secrets

**You need to add:**

#### Variable 1: Email Provider

```
Name:  EMAIL_PROVIDER
Value: hostinger
```

Click **Add** or **Save**

#### Variable 2: SMTP User (Email Address)

```
Name:  HOSTINGER_SMTP_USER
Value: noreply@animedropzone.com
```

⚠️ **Use YOUR full email address** (with domain)  
Click **Add** or **Save**

#### Variable 3: SMTP Password

```
Name:  HOSTINGER_SMTP_PASS
Value: your_strong_password_here
```

⚠️ **Use YOUR actual email password**  
Click **Add** or **Save**

#### Variable 4 (Optional): SMTP Host

```
Name:  HOSTINGER_SMTP_HOST
Value: smtp.hostinger.com
```

(Already defaults to this, but you can add it)

#### Variable 5 (Optional): SMTP Port

```
Name:  HOSTINGER_SMTP_PORT
Value: 465
```

(Use 465 for SSL, 587 for TLS)

### ✅ After Adding Variables

- Supabase will **automatically redeploy** your Edge Functions (wait 1-2 minutes)
- You should see a green checkmark or "Deployed" status

---

## 🧪 Phase 3: Test Email Sending (2 mins)

### Option A: Test Order (Recommended)

1. Go to your website: `https://animedropzone.com` (once DNS works)
2. Add a product to cart
3. Complete checkout
4. Enter your email
5. **Check your inbox** for order confirmation email

### Option B: Check Supabase Logs

1. Supabase Dashboard → **Edge Functions** → **Logs**
2. You should see:

```
📧 Sending email via HOSTINGER to: customer@email.com
✅ Connected to Hostinger SMTP server
✅ Email sent via Hostinger SMTP
```

### Option C: Check Hostinger Sent Mail

1. Go to Hostinger hPanel → **Emails** → **Webmail**
2. Login with your email (`noreply@animedropzone.com`)
3. Check **Sent** folder
4. You should see sent emails there

---

## ✅ Verification Checklist

- [ ] Created or confirmed Hostinger email account
- [ ] Have full email address (noreply@animedropzone.com)
- [ ] Have strong email password
- [ ] Added EMAIL_PROVIDER = hostinger to Supabase
- [ ] Added HOSTINGER_SMTP_USER to Supabase
- [ ] Added HOSTINGER_SMTP_PASS to Supabase
- [ ] Waited 1-2 minutes for Supabase to redeploy
- [ ] Placed test order OR checked logs
- [ ] Received confirmation email ✅

---

## 🐛 Troubleshooting

### Email Not Sending?

**Check 1: Supabase Logs**

```
Supabase Dashboard → Edge Functions → Logs
Look for error messages (lines with ❌)
```

**Check 2: Credentials**

- Email address must be FULL: `noreply@animedropzone.com`
- Password must be EXACT match (copy-paste if possible)
- No extra spaces

**Check 3: SMTP Authentication**
In Hostinger hPanel:

- Go to **Emails** → Your email → **Manage**
- Make sure IMAP/SMTP is **ENABLED**
- If disabled, click **Enable** and save

**Check 4: Email Password Reset**

1. Hostinger hPanel → **Emails** → **Manage**
2. Click **Change Password**
3. Create NEW strong password
4. Copy the NEW password
5. Update HOSTINGER_SMTP_PASS in Supabase with NEW password

### Error: "Authentication Failed"

- Wrong email or password
- IMAP/SMTP not enabled in Hostinger
- See "Check 3" and "Check 4" above

### Error: "Connection Refused"

- SMTP server address wrong (should be `smtp.hostinger.com`)
- SMTP port wrong (try 465 for SSL or 587 for TLS)
- Firewall/network issue (unlikely)

### Emails Going to Spam?

- This is normal initially
- Wait a few days - deliverability will improve
- Hostinger SMTP is reputable, emails will eventually reach inbox

---

## 🎉 Success!

Once configured, your emails will automatically send from your custom domain. You'll see:

✅ Order confirmations to customers  
✅ Admin notifications for new orders  
✅ System emails from your professional domain

---

## 📞 Support

**Hostinger Help:**

- hPanel Live Chat (24/7)
- https://support.hostinger.com/

**Supabase Help:**

- https://supabase.com/docs
- Supabase Docs → Edge Functions

---

## 🔄 Next Steps

Once verified working:

1. Build + Deploy to production
2. Monitor Supabase logs for errors
3. Check Hostinger email account periodically
4. Adjust email templates as needed

**Your email setup is now COMPLETE!** 🚀

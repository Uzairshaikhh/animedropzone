# 📧 Hostinger Email Configuration Guide

## ✅ Using Hostinger for Sending Emails

Since you already have Hostinger email, this is the perfect solution!

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get Your Hostinger Email Credentials

You need:
1. **Email Address:** Your full Hostinger email (e.g., `noreply@animedropzone.com`)
2. **Email Password:** The password for this email account

#### Where to Find Credentials:

**Option A: Hostinger Control Panel (hPanel)**
1. Login to https://hpanel.hostinger.com/
2. Go to **Emails** section
3. Find your email account
4. **Email:** Already shown (e.g., `noreply@animedropzone.com`)
5. **Password:** 
   - If you forgot it, click "Manage" → "Change Password"
   - Set a new strong password and save it

**Option B: Create New Email for Sending**
1. Login to hPanel
2. Go to **Emails** → **Email Accounts**
3. Click **Create Email Account**
4. **Username:** `noreply` or `info` or `orders`
5. **Domain:** Select `animedropzone.com`
6. **Password:** Create strong password
7. Click **Create**
8. Full email: `noreply@animedropzone.com`

---

### Step 2: Add Hostinger SMTP Settings to Supabase

1. **Go to Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/YOUR_PROJECT_ID
   ```

2. **Navigate to Edge Functions:**
   - Click **Project Settings** (⚙️ bottom left)
   - Click **Edge Functions** tab
   - Scroll to **Environment Variables** section

3. **Add These Environment Variables:**

   Click **Add Variable** for each:

   **Variable 1: Email Provider**
   ```
   Name: EMAIL_PROVIDER
   Value: hostinger
   ```

   **Variable 2: Hostinger Email**
   ```
   Name: HOSTINGER_EMAIL
   Value: noreply@animedropzone.com
   ```
   ⚠️ Replace with YOUR actual Hostinger email

   **Variable 3: Hostinger Password**
   ```
   Name: HOSTINGER_PASSWORD
   Value: your_email_password_here
   ```
   ⚠️ Replace with YOUR actual email password

   **Variable 4: SMTP Host (Optional - has default)**
   ```
   Name: HOSTINGER_SMTP_HOST
   Value: smtp.hostinger.com
   ```

   **Variable 5: SMTP Port (Optional - has default)**
   ```
   Name: HOSTINGER_SMTP_PORT
   Value: 465
   ```
   Use 465 for SSL or 587 for TLS

4. **Click Save** after adding each variable

---

### Step 3: Test Email Sending

1. **Place a Test Order:**
   - Go to your website
   - Add a product to cart
   - Complete checkout
   - Check if you receive confirmation email

2. **Check Supabase Logs:**
   - Go to Supabase Dashboard
   - **Edge Functions** → **Logs**
   - Look for:
     ```
     ✅ Connected to Hostinger SMTP server
     ✅ Email sent via Hostinger SMTP
     ```

---

## 🔧 Hostinger SMTP Settings Reference

### Standard Hostinger SMTP Configuration:

| Setting | Value |
|---------|-------|
| **SMTP Server** | `smtp.hostinger.com` |
| **Port (SSL)** | `465` |
| **Port (TLS)** | `587` |
| **Authentication** | Required |
| **Username** | Your full email address |
| **Password** | Your email password |

---

## ⚙️ Complete Supabase Environment Variables

Here's what you need in Supabase:

```env
# Email Provider Selection
EMAIL_PROVIDER=hostinger

# Hostinger SMTP Configuration
HOSTINGER_EMAIL=noreply@animedropzone.com
HOSTINGER_PASSWORD=your_strong_password_here
HOSTINGER_SMTP_HOST=smtp.hostinger.com
HOSTINGER_SMTP_PORT=465

# Admin Email (for receiving notifications)
ADMIN_EMAIL=anime.drop.zone.00@gmail.com

# Frontend URL
FRONTEND_URL=https://animedropzone.com
```

---

## 🔒 Security Best Practices

### 1. Use a Dedicated Email for Sending
Don't use your personal email. Create:
- `noreply@animedropzone.com` - For automated emails
- `orders@animedropzone.com` - For order confirmations
- `support@animedropzone.com` - For customer support

### 2. Use Strong Password
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Don't reuse passwords from other accounts

### 3. Enable SMTP Authentication
Hostinger requires authentication - this is already handled by the code.

### 4. Monitor Email Sending
Check Hostinger email panel regularly for:
- Sent emails count
- Failed deliveries
- Spam reports

---

## 🐛 Troubleshooting

### Error: "Authentication Failed"

**Cause:** Wrong email or password

**Fix:**
1. Double-check email address (must be full: `name@domain.com`)
2. Reset password in Hostinger hPanel:
   - Emails → Manage → Change Password
3. Update `HOSTINGER_PASSWORD` in Supabase with new password
4. Make sure no extra spaces in password

### Error: "Connection Refused"

**Cause:** Wrong SMTP server or port

**Fix:**
1. Verify SMTP host: `smtp.hostinger.com`
2. Try different port:
   - Port 465 for SSL (recommended)
   - Port 587 for TLS (alternative)
3. Update `HOSTINGER_SMTP_PORT` in Supabase

### Error: "SMTP not enabled"

**Cause:** SMTP/IMAP disabled in email account

**Fix:**
1. Login to Hostinger hPanel
2. Go to **Emails** → Your email → **Manage**
3. Check if SMTP is enabled
4. Enable if disabled

### Emails Not Sending

**Checklist:**
- [ ] Email address is correct format: `name@animedropzone.com`
- [ ] Password is correct (try resetting)
- [ ] `EMAIL_PROVIDER` is set to `hostinger`
- [ ] All environment variables added to Supabase
- [ ] Edge function redeployed (auto happens when env vars change)
- [ ] Check Supabase logs for error details

---

## 📊 Expected Behavior

### ✅ Success Logs (Supabase):
```
📧 Sending email via HOSTINGER to: customer@email.com
🔍 Hostinger SMTP Configuration:
  SMTP Host: smtp.hostinger.com
  SMTP Port: 465
  From Email: noreply@animedropzone.com
  To Email: customer@email.com
✅ Connected to Hostinger SMTP server
✅ Email sent via Hostinger SMTP
✅ Email sent successfully to customer@email.com
```

### ✅ What Customers See:
- **From:** AnimeDrop Zone <noreply@animedropzone.com>
- **Subject:** Order Confirmation - Your AnimeDrop Zone Order
- **Content:** Professional HTML email with order details

---

## 📧 Email Types Being Sent

Your system sends these emails:

1. **Customer Order Confirmation**
   - To: Customer's email
   - When: After successful checkout
   - Contains: Order details, tracking info, payment summary

2. **Admin Order Notification**
   - To: anime.drop.zone.00@gmail.com
   - When: New order placed
   - Contains: Customer info, order details, payment method

3. **Quote Emails** (Custom Clothing)
   - To: Customer's email
   - When: Custom clothing quote created
   - Contains: Quote details, pricing, acceptance link

4. **Password Reset** (if implemented)
   - To: User's email
   - When: User requests password reset
   - Contains: Reset link

---

## 💰 Hostinger Email Limits

### Free/Shared Hosting Plans:
- **Sending Limit:** Usually 100-300 emails per hour
- **Daily Limit:** Check your specific plan
- **Recipients:** Unlimited

### To Check Your Limits:
1. Login to Hostinger hPanel
2. Go to **Emails**
3. Look for "Email Sending Limits" section

### If You Hit Limits:
- Upgrade to Business hosting (higher limits)
- Use VPS hosting (much higher limits)
- Implement email queue/throttling

---

## 🎯 Testing Checklist

After setup, test all scenarios:

- [ ] **Order Confirmation Email** (to customer)
  - Place test order
  - Check customer email inbox
  - Verify all order details correct

- [ ] **Admin Notification Email**
  - Place test order
  - Check anime.drop.zone.00@gmail.com inbox
  - Verify order notification received

- [ ] **Check Spam Folder**
  - If emails not in inbox, check spam
  - Mark as "Not Spam" to train email filters

- [ ] **Check Sent Mail in Hostinger**
  - Login to Hostinger Webmail
  - Check "Sent" folder
  - Verify emails are being sent

---

## 🌟 Advantages of Hostinger SMTP

✅ **Already Have It:** Using existing service  
✅ **No Extra Cost:** Included with hosting  
✅ **Professional:** Emails from your domain  
✅ **Reliable:** Good deliverability  
✅ **No Quotas:** Depends on plan, usually sufficient  
✅ **Full Control:** Manage in hPanel  

---

## 📝 Quick Reference Card

**Keep these handy:**

```
SMTP Server: smtp.hostinger.com
SSL Port: 465
TLS Port: 587
Email: noreply@animedropzone.com
Username: noreply@animedropzone.com (same as email)
Auth: Required
```

---

## 🔄 Switching from MailerSend to Hostinger

Your code already supports multiple providers! Just change:

**Before:**
```
EMAIL_PROVIDER=mailersend
```

**After:**
```
EMAIL_PROVIDER=hostinger
```

That's it! The system automatically uses Hostinger SMTP.

---

## 🎉 You're All Set!

After following this guide:
1. ✅ Hostinger SMTP configured
2. ✅ Professional emails from your domain
3. ✅ No third-party email service needed
4. ✅ Reliable email delivery
5. ✅ Full control over sending

---

## 📞 Support

### Hostinger Support:
- **Live Chat:** Available 24/7 in hPanel
- **Knowledge Base:** https://support.hostinger.com/
- **Email:** support@hostinger.com

### Email Not Working?
Check Supabase logs for detailed error messages:
- Supabase Dashboard → Edge Functions → Logs
- Look for lines starting with ❌ or ⚠️

---

**Last Updated:** December 12, 2024  
**Provider:** Hostinger SMTP  
**Status:** Production Ready ✅  
**Setup Time:** 5 minutes  

**🎊 Enjoy reliable email sending with your own domain!**

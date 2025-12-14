# 📧 Hostinger Email Setup Guide for AnimeDropZone

## Overview

This guide will help you set up professional email sending using Hostinger's SMTP server integrated with your Supabase backend.

## ✅ What You'll Get

- ✉️ Professional email addresses (e.g., noreply@yourdomain.com)
- 📧 Order confirmation emails to customers
- 🔔 Admin notifications for new orders
- 💬 Customer support email responses
- ✔️ Custom domain email reputation

---

## 📋 Prerequisites

1. **Hostinger Account** with email hosting enabled
2. **Custom Domain** registered and connected to Hostinger
3. **Supabase Project** with Edge Functions (already set up)
4. **Admin Access** to both Hostinger and Supabase dashboards

---

## 🔧 Step-by-Step Setup

### Step 1: Create Email Account in Hostinger

1. **Log in to Hostinger Dashboard**

   - Go to [https://hpanel.hostinger.com](https://hpanel.hostinger.com)
   - Enter your credentials

2. **Navigate to Email Section**

   - Click on your domain name
   - Find **Email** or **Mail** section in the left sidebar
   - Click **Create Email Account** or **Add Email**

3. **Create Noreply Email Address**

   - Email: `noreply@yourdomain.com` (or `noreply@animedropzone.com`)
   - Password: Create a **strong password** (at least 16 characters)
   - Store this password securely - you'll need it in Step 3

4. **Create Admin Email Address** (Optional but Recommended)

   - Email: `admin@yourdomain.com`
   - Password: Create another strong password
   - This will receive order notifications

5. **Verify Email Creation**
   - The email accounts should appear in your Hostinger Email list
   - Status should show as **Active** ✅

---

### Step 2: Get SMTP Configuration Details

1. **From Hostinger Dashboard**, go to your email settings
2. **Find SMTP Configuration** (usually in Email Settings or Help section)
3. **Record These Details:**

| Setting           | Value                                                       |
| ----------------- | ----------------------------------------------------------- |
| **SMTP Host**     | `smtp.hostinger.com`                                        |
| **SMTP Port**     | `465` (SSL) or `587` (TLS)                                  |
| **SMTP User**     | Your full email address (e.g., `noreply@animedropzone.com`) |
| **SMTP Password** | The password you created in Step 1                          |

---

### Step 3: Add Secrets to Supabase

1. **Log in to Supabase Dashboard**

   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Select your project

2. **Navigate to Edge Functions Secrets**

   - Click **Project Settings** (gear icon)
   - Go to **Edge Functions** (in the left sidebar)
   - Click the **Secrets** tab

3. **Add These Secrets** (One at a time)

#### Secret 1: HOSTINGER_SMTP_USER

```
Name:  HOSTINGER_SMTP_USER
Value: noreply@animedropzone.com
```

#### Secret 2: HOSTINGER_SMTP_PASS

```
Name:  HOSTINGER_SMTP_PASS
Value: your-email-password-here
```

#### Secret 3: HOSTINGER_SMTP_HOST (Optional)

```
Name:  HOSTINGER_SMTP_HOST
Value: smtp.hostinger.com
```

#### Secret 4: HOSTINGER_SMTP_PORT (Optional)

```
Name:  HOSTINGER_SMTP_PORT
Value: 465
```

#### Secret 5: EMAIL_PROVIDER

```
Name:  EMAIL_PROVIDER
Value: hostinger
```

#### Secret 6: ADMIN_EMAIL

```
Name:  ADMIN_EMAIL
Value: admin@animedropzone.com
```

4. **Click Save** for each secret

---

### Step 4: Redeploy Functions

After adding all secrets, you need to redeploy your Edge Functions:

1. Go to the **Functions** section in Supabase
2. Find `make-server-95a96d8e` function
3. Click the **Deploy** button or redeploy from your terminal:

```bash
supabase functions deploy make-server-95a96d8e
```

---

### Step 5: Test Email Sending

1. **Go to Your Admin Panel**

   - URL: `https://yourdomain.com/secret-admin-panel-7b2cbf`

2. **Navigate to Email Setup**

   - Look for **Email Configuration** section
   - Should show your Hostinger configuration

3. **Click "Check Status"**

   - Should show ✅ Email system configured

4. **Click "Send Test Email"**
   - Should receive a test email at your specified address
   - Check spam folder if not in inbox

---

## ✨ Email Features Now Available

Once configured, your system will automatically send:

### 📦 Order Confirmation Email

- Sent to customer after order placement
- Contains order details, tracking info, and estimated delivery
- Includes your logo and branding

### 🔔 Admin Notification Email

- Sent to `admin@animedropzone.com` when new order is placed
- Contains customer details and payment information
- Helps admin quickly process orders

### 💬 Custom Clothing Quote Email

- Sent to customer for custom clothing requests
- Admin can reply with pricing details

### ✅ Email Verification (Signup)

- Sent when user creates new account
- Contains verification link

---

## 🔧 Troubleshooting

### ❌ Error: "Unauthenticated"

**Solution:**

- Check HOSTINGER_SMTP_USER and HOSTINGER_SMTP_PASS are correct
- Verify email account is **Active** in Hostinger dashboard
- Redeploy the function

### ❌ Error: "SMTP Connection Failed"

**Solution:**

- Verify HOSTINGER_SMTP_HOST is `smtp.hostinger.com`
- Check port is `465` (not 587 unless using TLS)
- Ensure your firewall allows SMTP connections

### ❌ Emails Going to Spam

**Solution:**

- Verify your domain is pointing to Hostinger nameservers
- Check SPF, DKIM, DMARC records in Hostinger DNS settings
- Use a professional domain (not free domain)

### ❌ Email Not Sending

**Solution:**

1. Check Edge Function logs in Supabase:
   - Go to **Functions** → `make-server-95a96d8e` → **Logs**
   - Look for error messages
2. Verify all secrets are added correctly
3. Redeploy the function
4. Test with "Send Test Email" in admin panel

---

## 📊 Monitoring Email Sends

### Check Email Logs in Supabase

1. Go to **Edge Functions** → `make-server-95a96d8e`
2. Click **Logs** tab
3. Filter by `test-email` or `sendEmail` to see recent emails

### Check Hostinger Webmail

1. Go to Hostinger Dashboard
2. Click **Webmail**
3. Log in with your noreply email account
4. Check **Sent** folder to verify emails were sent

---

## 🔐 Security Best Practices

✅ **Do:**

- Use strong passwords (16+ characters with numbers, special chars)
- Store passwords securely
- Use a noreply account (prevents customer replies)
- Enable two-factor authentication on Hostinger
- Regularly review email logs

❌ **Don't:**

- Share passwords with anyone
- Use simple/weak passwords
- Commit secrets to GitHub
- Use production email for testing
- Leave old email accounts active

---

## 📞 Support

If you encounter issues:

1. **Check Supabase Function Logs** for detailed error messages
2. **Verify Hostinger Email Account** is active and configured
3. **Test SMTP Settings** with a simple test
4. **Contact Hostinger Support** if SMTP issues persist

---

## 📋 Checklist

Before considering setup complete:

- [ ] Hostinger email account created (`noreply@animedropzone.com`)
- [ ] Admin email account created (optional but recommended)
- [ ] SMTP credentials obtained from Hostinger
- [ ] All 6 secrets added to Supabase
- [ ] Functions redeployed
- [ ] Test email sent successfully
- [ ] Email received in inbox (not spam)
- [ ] Admin notifications working

---

**Setup Complete! 🎉**

Your email system is now ready to send professional emails to customers!

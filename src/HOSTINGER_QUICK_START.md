# 🚀 Hostinger Email Setup - Quick Reference Card

## **In 5 Minutes: Get Hostinger SMTP Working**

---

## Step 1️⃣: Create Email in Hostinger (2 min)

1. Go to **hpanel.hostinger.com** → Login
2. Click your **Domain** → **Email** section
3. Click **Create Email Account**
4. Enter:
   - **Email**: `noreply@yourdomain.com`
   - **Password**: Create a strong password (save this!)
5. Click **Create** ✅

---

## Step 2️⃣: Add Secrets to Supabase (2 min)

1. Go to **Supabase Dashboard**
2. Click **Project Settings** (gear icon)
3. Left sidebar → **Edge Functions** → **Secrets**
4. Click **New Secret** and add these 3:

### Secret #1

```
Name:  HOSTINGER_SMTP_USER
Value: noreply@yourdomain.com
```

**Click Save**

### Secret #2

```
Name:  HOSTINGER_SMTP_PASS
Value: [your-email-password-from-step-1]
```

**Click Save**

### Secret #3

```
Name:  EMAIL_PROVIDER
Value: hostinger
```

**Click Save**

---

## Step 3️⃣: Redeploy Function (1 min)

1. In Supabase, go to **Functions** section
2. Find **make-server-95a96d8e**
3. Click the **Deploy** button
4. Wait for deploy to complete ✅

---

## ✅ Test It!

1. In your admin panel, go to **Email Configuration**
2. Click **Check Status** → Should show ✅ **Configured**
3. Click **Send Test Email**
4. Check your inbox (and spam folder)

---

## 📊 Your SMTP Details

| What              | Value                                     |
| ----------------- | ----------------------------------------- |
| **SMTP Host**     | `smtp.hostinger.com`                      |
| **SMTP Port**     | `587`                                     |
| **SMTP User**     | Your email (e.g., noreply@yourdomain.com) |
| **SMTP Password** | Your email password                       |

---

## ❌ If It Doesn't Work...

**Problem**: "Unauthenticated" error

- ✅ Double-check email and password are correct
- ✅ Verify email account shows "Active" in Hostinger
- ✅ Redeploy the function

**Problem**: "Connection Failed"

- ✅ Make sure SMTP Host is `smtp.hostinger.com`
- ✅ Check port is `587`

**Problem**: Email going to spam

- ✅ Verify your domain's DNS records are pointing to Hostinger
- ✅ Check SPF/DKIM records in Hostinger

---

## 🔐 Important Notes

⚠️ **Do NOT:**

- Share your email password
- Put passwords in code or GitHub
- Use weak passwords

✅ **Do:**

- Use a strong password (16+ chars, numbers, symbols)
- Keep password secure
- Use "noreply" email for bulk emails

---

**Everything set up? You're all good! 🎉**

Your store will now send professional order confirmation emails to customers!

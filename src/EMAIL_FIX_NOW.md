# ⚡ EMAIL FIX - Do This RIGHT NOW (5 minutes)

## The Problem

❌ Customers not receiving order confirmation emails  
❌ Admin not receiving order notifications

---

## The Cause

Your email provider is probably not configured correctly in Supabase. The system is either:

- Using expired MailerSend trial
- Using Hostinger without proper credentials
- Using the wrong provider entirely

---

## The Fix (STEP BY STEP)

### STEP 1: Open Supabase Dashboard

Go to: **https://supabase.com/dashboard**

### STEP 2: Navigate to Edge Functions Settings

1. **Click** your project name
2. **Left sidebar** → Click **"Settings"** (⚙️ icon)
3. **Scroll down** → Click **"Edge Functions"**
4. **Click function:** `make-server-95a96d8e`

### STEP 3: Click Configuration Tab

Look for a tab labeled:

- **"Configuration"** OR
- **"Secrets"** OR
- **"Environment Variables"**

### STEP 4: Check EMAIL_PROVIDER

**Look for variable named:** `EMAIL_PROVIDER`

```
IF YOU SEE → EMAIL_PROVIDER = "hostinger"
  ✅ Skip to Step 5 (check credentials)

IF YOU SEE → EMAIL_PROVIDER = "mailersend"
  ⚠️ MailerSend might be expired!
     Change to "hostinger" (see Step 5A)

IF IT'S EMPTY or NOT THERE
  ⚠️ It defaults to MailerSend and it's failing
     Set it to "hostinger" (see Step 5A)
```

### STEP 5: Fix Email Configuration

#### 5A: Set EMAIL_PROVIDER to Hostinger

1. **Find/Click** `EMAIL_PROVIDER`
2. **Change value to:** `hostinger`
3. **Click Save**

#### 5B: Add Hostinger Credentials

Add these 2 new variables:

**Variable 1:**

```
Name: HOSTINGER_SMTP_USER
Value: noreply@animedropzone.com
Click Save
```

**Variable 2:**

```
Name: HOSTINGER_SMTP_PASS
Value: [YOUR EMAIL PASSWORD FROM HOSTINGER]
Click Save
```

⚠️ **Don't know your password?** Go to Hostinger Control Panel → Email Accounts → Your email → Reset Password

### STEP 6: Wait for Deployment

⏳ **Supabase will auto-redeploy** (2-3 minutes)

You'll see: `✅ Function deployed` (green checkmark)

### STEP 7: Test Email Immediately

**Test 1 - Quick Test:**

1. Open https://animedropzone.com/shop
2. Add any product to cart
3. Click "Checkout"
4. **Use YOUR email address** as customer email
5. Complete checkout with test payment
6. **Check your email inbox** (and spam folder)

**Expected:**

- ✅ Receive order confirmation email
- ✅ Admin receives notification at anime.drop.zone.00@gmail.com

**If no email after 2 minutes:**

- ✅ Check SPAM folder
- ✅ Refresh page and try again
- ✅ Check Supabase logs for errors

---

## ✅ SUCCESS CRITERIA

You'll know it's fixed when:

1. ✅ Customer receives order email automatically
2. ✅ Admin receives order notification
3. ✅ Both arrive within 1-2 minutes
4. ✅ Supabase logs show: `✅ Email sent via Hostinger SMTP`

---

## 🔴 IF STILL NOT WORKING

**Check Supabase Logs:**

1. Edge Functions → `make-server-95a96d8e`
2. Click **"Logs"** tab
3. Look for error messages
4. Common errors:

```
"Authentication failed"
→ Wrong password, reset it in Hostinger

"Connection refused"
→ Check HOSTINGER_SMTP_PORT = 465

"Email address invalid"
→ Check HOSTINGER_SMTP_USER spelling
```

**Check Email Settings:**

1. Go to Hostinger Control Panel
2. Email Accounts
3. Click noreply@animedropzone.com
4. Verify password is correct
5. Check "IMAP/SMTP" is enabled

---

## ⏱️ TIME ESTIMATES

| Task                         | Time        |
| ---------------------------- | ----------- |
| Open Supabase & navigate     | 1 min       |
| Set EMAIL_PROVIDER           | 1 min       |
| Add HOSTINGER_SMTP_USER      | 1 min       |
| Add HOSTINGER_SMTP_PASS      | 1 min       |
| **Subtotal (before deploy)** | **4 min**   |
| Wait for Supabase redeploy   | 2-3 min     |
| Test with order              | 2 min       |
| **TOTAL TIME**               | **8-9 min** |

---

## 🎯 CONFIRMATION CHECKLIST

After completing above steps, verify:

- [ ] EMAIL_PROVIDER set to "hostinger"
- [ ] HOSTINGER_SMTP_USER = noreply@animedropzone.com
- [ ] HOSTINGER_SMTP_PASS = filled (hidden by dots)
- [ ] All saved in Supabase
- [ ] Function deployed (green checkmark)
- [ ] Waited 2-3 minutes
- [ ] Placed test order
- [ ] Received confirmation email
- [ ] Admin received notification

---

**🎉 Once all checked → EMAILS ARE WORKING!**

If still having issues, check the detailed `EMAIL_DEBUG_CHECKLIST.md` file.

# ✅ Test Your Hostinger Email Setup

## 🎯 Quick Test

You've already configured Supabase with:
- ✅ `EMAIL_PROVIDER = hostinger`
- ✅ `HOSTINGER_EMAIL = your_email@animedropzone.com`
- ✅ `HOSTINGER_PASSWORD = your_password`

## 🚀 Test Methods

### Method 1: Place a Test Order (Recommended)

This is the easiest way to test:

1. **Go to your website:** `https://animedropzone.com`

2. **Add a product to cart**
   - Browse any category (Figures, Accessories, etc.)
   - Click "Add to Cart" on any product

3. **Go to checkout**
   - Click cart icon
   - Click "Proceed to Checkout"

4. **Fill in your details**
   - **Important:** Use YOUR REAL email address
   - Name: Your name
   - Email: **YOUR_EMAIL@gmail.com** (or any email you can check)
   - Phone: Any number
   - Address: Any address
   - Payment: Select "Cash on Delivery" (easiest for testing)

5. **Complete the order**
   - Click "Place Order"
   - Wait for confirmation

6. **Check your email inbox**
   - You should receive: "Order Confirmation - Your AnimeDrop Zone Order"
   - From: `AnimeDrop Zone <noreply@animedropzone.com>` (or your Hostinger email)
   - Contains: Order details, tracking number, payment info

7. **Check admin email**
   - Admin should receive notification at: `anime.drop.zone.00@gmail.com`

---

### Method 2: Check Supabase Logs

Watch the email sending in real-time:

1. **Go to Supabase Dashboard**
   ```
   https://supabase.com/dashboard
   ```

2. **Navigate to Edge Functions**
   - Click your project
   - Click "Edge Functions" in left sidebar
   - Click "Logs" tab

3. **Place a test order** (as described above)

4. **Watch for these log messages:**

   **✅ Success indicators:**
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

   **❌ If you see errors:**
   - Look for lines with ❌ or "error"
   - Common issues listed below

---

## 🔍 Expected Results

### Customer Email Should Look Like:

```
From: AnimeDrop Zone <noreply@animedropzone.com>
To: customer@email.com
Subject: Order Confirmation - Your AnimeDrop Zone Order

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANIMEDROPZONE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 Thank you for your order!

Order Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order ID: ORD-1234567890123
Tracking ID: TRK-1234567890123
Status: Pending

Items Ordered:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Naruto Figure - ₹2,500 x 1

Subtotal: ₹2,500
Shipping: ₹100
Discount: ₹0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: ₹2,600

Payment Method: Cash on Delivery

Shipping Address:
Your Name
Your Address
Your City, State - PIN

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

© 2024 AnimeDrop Zone. All rights reserved.
```

### Admin Notification Email:

Admin receives a similar email at `anime.drop.zone.00@gmail.com`

---

## 🐛 Troubleshooting

### ❌ Error: "Authentication Failed" or "535"

**Problem:** Wrong email or password

**Fix:**
1. Go to Hostinger hPanel: https://hpanel.hostinger.com/
2. Click **Emails** → Find your email
3. Click **Manage** → **Change Password**
4. Set a NEW password and save it
5. Go to Supabase → Project Settings → Edge Functions → Environment Variables
6. Find `HOSTINGER_PASSWORD`
7. Click **Edit** (pencil icon)
8. Update with new password
9. Click **Save**
10. Try placing order again

**Double-check:**
- `HOSTINGER_EMAIL` must be the FULL email: `noreply@animedropzone.com`
- Not just `noreply`
- No extra spaces
- No quotes

---

### ❌ Error: "Connection Refused" or "ECONNREFUSED"

**Problem:** Wrong SMTP server or port

**Fix:**
1. Go to Supabase → Environment Variables
2. Add these two new variables:

   **Variable 1:**
   ```
   Name: HOSTINGER_SMTP_HOST
   Value: smtp.hostinger.com
   ```

   **Variable 2:**
   ```
   Name: HOSTINGER_SMTP_PORT
   Value: 465
   ```

3. Try placing order again

---

### ❌ No Email Received

**Check these:**

1. **Email went to spam folder?**
   - Check your spam/junk folder
   - Mark as "Not Spam" to train filters

2. **Typo in email address?**
   - Check the email you entered during checkout
   - Make sure it's correct

3. **Check Hostinger Webmail**
   - Go to https://hpanel.hostinger.com/
   - Click **Emails** → **Webmail**
   - Login with your Hostinger email
   - Check **Sent** folder
   - If email is there, it was sent successfully
   - If not in sent folder, check Supabase logs

4. **Check Supabase Logs**
   - Look for error messages
   - Share the error message for more help

5. **Verify environment variables**
   ```
   EMAIL_PROVIDER = hostinger (lowercase)
   HOSTINGER_EMAIL = noreply@animedropzone.com (full email)
   HOSTINGER_PASSWORD = your_password (no spaces)
   ```

---

### ❌ "SMTP not enabled" or "IMAP disabled"

**Problem:** Email account doesn't have SMTP enabled

**Fix:**
1. Go to Hostinger hPanel
2. Click **Emails** → Your email → **Manage**
3. Look for SMTP/IMAP settings
4. Make sure they're enabled
5. If disabled, enable them
6. Try again

---

### ❌ Still seeing "Unauthenticated" errors

**Problem:** Still using MailerSend instead of Hostinger

**Fix:**
1. Go to Supabase → Environment Variables
2. Find `EMAIL_PROVIDER`
3. Make absolutely sure it says: `hostinger` (all lowercase, no spaces)
4. NOT `mailersend`
5. Save and try again

---

## 📊 Success Checklist

After placing a test order:

- [ ] **Customer receives email** (check inbox/spam)
- [ ] **Email is from your domain** (`noreply@animedropzone.com`)
- [ ] **Email contains order details** (Order ID, tracking, items)
- [ ] **Admin receives notification** (`anime.drop.zone.00@gmail.com`)
- [ ] **Supabase logs show success** (✅ Email sent via Hostinger SMTP)
- [ ] **Hostinger Sent folder has email** (in Webmail)

If ALL checkboxes are checked: **🎉 SUCCESS! Your email system is working!**

---

## 🎯 What Emails Are Sent?

Your system sends these emails automatically:

### 1. **Customer Order Confirmation**
- **When:** Customer completes checkout
- **To:** Customer's email address
- **Contains:**
  - Order ID
  - Tracking ID
  - Items ordered
  - Total amount
  - Shipping address
  - Payment method
  - Order status

### 2. **Admin Order Notification**
- **When:** Customer completes checkout
- **To:** `anime.drop.zone.00@gmail.com`
- **Contains:**
  - Customer information
  - Order details
  - Payment method
  - Shipping address
  - Order management info

### 3. **WhatsApp Notification** (if configured)
- **When:** Customer completes checkout
- **To:** Customer's WhatsApp (via Twilio)
- **Contains:** Order confirmation and tracking

### 4. **Custom Clothing Quote** (if customer requests)
- **When:** Admin creates custom quote
- **To:** Customer's email
- **Contains:**
  - Quote details
  - Pricing
  - Design specifications
  - Acceptance link

---

## 💡 Pro Tips

### Test Different Scenarios:

1. **Test with different email providers:**
   - Try with Gmail
   - Try with Yahoo
   - Try with Outlook
   - See which ones deliver best

2. **Test spam filters:**
   - First order might go to spam
   - Mark as "Not Spam"
   - Future emails should go to inbox

3. **Check delivery time:**
   - Emails should arrive within seconds
   - If delayed >5 minutes, check logs

4. **Verify email content:**
   - All order details correct?
   - Links working?
   - Images loading?
   - Professional appearance?

---

## 📧 Hostinger Email Limits

**Check your plan limits:**

1. Go to https://hpanel.hostinger.com/
2. Click **Emails**
3. Look for "Sending Limits" or "Email Quota"

**Typical limits:**
- **Shared Hosting:** 100-300 emails/hour
- **Business Hosting:** 500-1000 emails/hour
- **VPS/Cloud:** Much higher limits

**If you hit limits:**
- Emails will queue and send later
- Upgrade to higher plan if needed
- Consider email queue system for high volume

---

## 🎉 Next Steps After Testing

Once email is working:

1. **Test all order flows:**
   - [ ] Cash on Delivery orders
   - [ ] UPI payment orders
   - [ ] Razorpay payment orders
   - [ ] Custom clothing quotes

2. **Monitor deliverability:**
   - [ ] Check spam rates
   - [ ] Monitor bounce rates
   - [ ] Track open rates (if you add tracking)

3. **Customize emails:**
   - [ ] Add your logo
   - [ ] Customize colors (purple/black theme)
   - [ ] Add social media links
   - [ ] Add customer support info

4. **Set up SPF/DKIM** (Advanced - improves deliverability):
   - [ ] Go to Hostinger hPanel
   - [ ] Navigate to Email → Email Routing
   - [ ] Follow SPF/DKIM setup instructions
   - [ ] This prevents emails from going to spam

---

## 📞 Need Help?

### If email still not working:

1. **Share Supabase logs:**
   - Copy the log output when you place an order
   - Look for any ❌ error messages
   - Share the complete error message

2. **Verify Hostinger settings:**
   - Can you send email from Hostinger Webmail?
   - Try sending a test email manually
   - If that works, problem is in code/config

3. **Check Hostinger Support:**
   - 24/7 live chat in hPanel
   - They can verify your SMTP settings
   - They can check if your account has sending restrictions

---

## ✅ Quick Reference

**Environment Variables in Supabase:**
```
EMAIL_PROVIDER=hostinger
HOSTINGER_EMAIL=noreply@animedropzone.com
HOSTINGER_PASSWORD=your_email_password
HOSTINGER_SMTP_HOST=smtp.hostinger.com (optional)
HOSTINGER_SMTP_PORT=465 (optional)
```

**Hostinger SMTP Settings:**
```
Server: smtp.hostinger.com
Port: 465 (SSL) or 587 (TLS)
Username: Your full email address
Password: Your email password
Authentication: Required
```

**Test Checklist:**
```
1. Add product to cart
2. Checkout with YOUR email
3. Complete order
4. Check email (inbox/spam)
5. Verify Supabase logs
6. Confirm admin notification
```

---

**🚀 Start testing now! Place a test order and check your email!**

**Expected result:** You'll receive a professional order confirmation email from `noreply@animedropzone.com` within seconds.

**🎊 Good luck!**

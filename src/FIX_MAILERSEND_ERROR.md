# 🔧 Fix MailerSend "Unauthenticated" Error

## ❌ Error You're Seeing:
```
❌ MailerSend error: {"message":"Unauthenticated."}
⚠️ AUTHENTICATION FAILED
❌ FAILED to send customer order confirmation email
```

## 🎯 Root Cause:
Your MailerSend API key is either:
1. **Invalid or Expired**
2. **MailerSend Account Not Verified**
3. **API Key Revoked/Deleted**

## ✅ Complete Fix (Choose ONE Solution)

---

### **SOLUTION 1: Generate New MailerSend API Key** (Recommended - 5 minutes)

#### Step 1: Go to MailerSend Dashboard
```
https://app.mailersend.com/
```

#### Step 2: Delete Old API Key
1. Click **Settings** (⚙️ icon) in left sidebar
2. Click **API Tokens**
3. Find your current key (if listed)
4. Click **Delete** (trash icon)
5. Confirm deletion

#### Step 3: Create NEW API Key
1. Still on **API Tokens** page
2. Click **Generate New Token** button
3. Give it a name: `AnimeDrop Zone Production`
4. **Scopes:** Select **Full Access** (or at minimum: Email Send)
5. Click **Create Token**
6. **COPY the key immediately!** (starts with `mlsn.`)

Example: `mlsn.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz`

#### Step 4: Update in Supabase
1. Go to your **Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/YOUR_PROJECT_ID
   ```

2. Navigate to **Project Settings** (⚙️ bottom left)

3. Click **Edge Functions** tab

4. Scroll to **Environment Variables** section

5. Find `MAILERSEND_API_KEY`
   - If exists: Click **Edit** → Paste new key → **Save**
   - If not exists: Click **Add Variable**
     - Name: `MAILERSEND_API_KEY`
     - Value: `mlsn.your_new_key_here`
     - Click **Save**

6. **IMPORTANT:** Redeploy Edge Function
   - The function needs to restart to pick up new env variable
   - It should auto-restart, but if emails still fail, manually redeploy

#### Step 5: Test Email
1. Place a test order on your website
2. Check Supabase logs for success message:
   ```
   ✅ Email sent via MailerSend
   ```

---

### **SOLUTION 2: Verify Your MailerSend Account** (If Account is Unverified)

#### Check Account Status:
1. Go to https://app.mailersend.com/email-verification
2. If you see "Verify your email", click the verify button
3. Check your email inbox for verification link
4. Click link to verify

#### After Verification:
- Wait 5 minutes for MailerSend to activate your account
- Try generating a new API key (follow Solution 1 steps 3-5)

---

### **SOLUTION 3: Verify Your Domain** (Removes Trial Limits)

#### Why Verify Domain:
- Trial accounts have recipient limits (5-10 unique emails)
- Verified domains get 12,000 emails/month FREE
- No more "Unauthenticated" errors

#### How to Verify:
1. Go to https://app.mailersend.com/domains
2. Click **Add Domain**
3. Enter your domain: `animedropzone.com`
4. MailerSend will show DNS records
5. Add these records to your domain DNS:
   
   **Example DNS Records:**
   ```
   Type: TXT
   Host: _mailersend
   Value: ms-domain-verify=abc123...
   
   Type: TXT  
   Host: @
   Value: v=spf1 include:spf.mailersend.net ~all
   
   Type: CNAME
   Host: ms1._domainkey
   Value: ms1.mailersend.net
   ```

6. Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
7. Add the DNS records
8. Wait 10-60 minutes for DNS propagation
9. Return to MailerSend → Click **Verify Domain**

#### After Domain Verified:
- Update FROM email in Supabase:
  - Name: `MAILERSEND_FROM_EMAIL`
  - Value: `noreply@animedropzone.com` (or any `@animedropzone.com` email)

---

### **SOLUTION 4: Switch to Alternative Email Provider** (Easiest - 2 minutes)

If MailerSend continues to fail, use a different provider:

#### Option A: Resend (3,000 emails/month FREE)

1. **Sign up:** https://resend.com/signup
2. **Get API Key:** Dashboard → API Keys → Create
3. **Add to Supabase:**
   ```
   Name: EMAIL_PROVIDER
   Value: resend
   
   Name: RESEND_API_KEY
   Value: re_your_api_key_here
   ```

#### Option B: Brevo/Sendinblue (300 emails/day FREE)

1. **Sign up:** https://www.brevo.com/
2. **Get API Key:** Settings → API Keys → Generate
3. **Add to Supabase:**
   ```
   Name: EMAIL_PROVIDER
   Value: brevo
   
   Name: BREVO_API_KEY
   Value: your_brevo_api_key
   
   Name: BREVO_FROM_EMAIL
   Value: noreply@animedropzone.com
   ```

#### Option C: SendGrid (100 emails/day FREE)

1. **Sign up:** https://signup.sendgrid.com/
2. **Get API Key:** Settings → API Keys → Create API Key
3. **Add to Supabase:**
   ```
   Name: EMAIL_PROVIDER
   Value: sendgrid
   
   Name: SENDGRID_API_KEY
   Value: SG.your_api_key_here
   
   Name: SENDGRID_FROM_EMAIL
   Value: noreply@animedropzone.com
   ```

---

## 🧪 Testing Your Fix

### Method 1: Place Test Order
1. Go to your website
2. Add a product to cart
3. Complete checkout
4. Check if you receive order confirmation email

### Method 2: Check Supabase Logs
1. Go to Supabase Dashboard
2. **Project Settings** → **Edge Functions** → **Logs**
3. Look for:
   ```
   ✅ Email sent successfully to customer@email.com
   ```

### Method 3: Test from Admin Panel (If available)
1. Login to admin panel
2. Go to **Email Setup** tab
3. Click **Test Email**
4. Check if test email arrives

---

## 🔍 Debug Checklist

If emails still fail after fixes:

- [ ] **New API key generated** (not old one)
- [ ] **API key starts with `mlsn.`** (for MailerSend)
- [ ] **No extra spaces** in API key
- [ ] **No quotes** around API key in Supabase
- [ ] **MailerSend account verified** (check email for verification link)
- [ ] **Edge function redeployed** after env var update
- [ ] **FROM email is valid** (e.g., `info@test-zkq340endq0gd796.mlsender.net`)
- [ ] **No trial limits reached** (verify domain if trial)

---

## 📊 Expected Behavior After Fix

### ✅ Success Logs:
```
📧 Sending email via MAILERSEND to: customer@email.com
🔍 MailerSend Configuration Debug:
  MAILERSEND_API_KEY: SET
  API Key length: 67
  API Key starts with mlsn: true
  From Email (final): info@test-zkq340endq0gd796.mlsender.net
📤 Sending request to MailerSend API...
📥 MailerSend API Response Status: 202
✅ Email sent via MailerSend
✅ Email sent successfully to customer@email.com
```

### ❌ If Still Failing:
```
❌ MailerSend error: {"message":"Unauthenticated."}
```
**→ Generate a completely NEW API key**
**→ OR switch to alternative provider (Resend, Brevo, SendGrid)**

---

## 💡 Quick Comparison: Email Providers

| Provider | Free Tier | Setup Time | Recommended |
|----------|-----------|------------|-------------|
| **MailerSend** | 12,000/month* | 10 min | ✅ Best (if domain verified) |
| **Resend** | 3,000/month | 2 min | ✅ Easiest |
| **Brevo** | 300/day | 5 min | ✅ Good alternative |
| **SendGrid** | 100/day | 5 min | ⚠️ Limited free tier |

*Requires domain verification, otherwise trial limits apply

---

## 🎯 Recommended Action Plan

### For Immediate Fix (5 minutes):
1. Generate NEW MailerSend API key
2. Update in Supabase
3. Test order

### For Long-Term Solution (30 minutes):
1. Verify your domain `animedropzone.com` in MailerSend
2. Update FROM email to use your domain
3. Get 12,000 emails/month free forever

### If MailerSend Continues to Fail:
1. Switch to **Resend** (easiest alternative)
2. Takes 2 minutes to set up
3. 3,000 emails/month free

---

## 📞 Support Resources

### MailerSend Support:
- **Documentation:** https://developers.mailersend.com/
- **Support:** https://www.mailersend.com/support
- **Status Page:** https://status.mailersend.com/

### Alternative Providers:
- **Resend Docs:** https://resend.com/docs
- **Brevo Docs:** https://developers.brevo.com/
- **SendGrid Docs:** https://docs.sendgrid.com/

---

## ✅ Success Criteria

You'll know the fix worked when:
1. ✅ Customers receive order confirmation emails
2. ✅ Admin receives order notification emails  
3. ✅ No "Unauthenticated" errors in logs
4. ✅ Supabase logs show: `✅ Email sent successfully`

---

**Last Updated:** December 12, 2024  
**Status:** Ready to Fix  
**Estimated Fix Time:** 5-30 minutes depending on solution  

**🎉 Choose Solution 1 for quickest fix, or Solution 4 if you want to try a different provider!**

# 📧 Set Up Custom Domain for MailerSend

## 🎯 Goal: Change Email From Address

**Current:** `info@test-zkq340endq0gd796.mlsender.net`  
**Target:** `noreply@animedropzone.com` (or `info@animedropzone.com`)

---

## ⚠️ IMPORTANT: You Must Verify Your Domain First!

You **CANNOT** just change the email address in code. MailerSend will **reject** emails from unverified domains.

**Required Steps:**
1. ✅ Add your domain to MailerSend
2. ✅ Add DNS records to your domain
3. ✅ Verify domain in MailerSend
4. ✅ Update environment variable
5. ✅ Test!

**Time Required:** 10-15 minutes (plus DNS propagation: 5 mins - 24 hours)

---

## 📋 Step-by-Step Guide

### **Step 1: Log in to MailerSend**

1. Go to: **https://app.mailersend.com**
2. Log in with your account
3. You should see your dashboard

---

### **Step 2: Add Your Domain**

1. In the left sidebar, click **"Domains"**
2. Click **"Add Domain"** button (top right)
3. Enter your domain: **`animedropzone.com`**
   - ⚠️ Enter ONLY the domain (no www, no http://)
   - ✅ Correct: `animedropzone.com`
   - ❌ Wrong: `www.animedropzone.com`, `https://animedropzone.com`
4. Click **"Add Domain"**

---

### **Step 3: Get DNS Records**

After adding the domain, MailerSend will show you **DNS records** to add.

You'll see something like this:

#### **SPF Record (TXT)**
```
Type: TXT
Name: @ (or animedropzone.com)
Value: v=spf1 include:spf.mailersend.net ~all
```

#### **DKIM Record (TXT)**
```
Type: TXT
Name: mta._domainkey.animedropzone.com
Value: k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC... (long string)
```

#### **Custom Return-Path (CNAME)**
```
Type: CNAME
Name: email.animedropzone.com
Value: mailersend.net
```

#### **Tracking Domain (Optional - CNAME)**
```
Type: CNAME
Name: track.animedropzone.com
Value: mailersend.net
```

**⚠️ Don't close this page yet! You'll need these records in the next step.**

---

### **Step 4: Add DNS Records to Your Domain**

Now you need to add these records to your domain's DNS settings.

#### **Where is Your Domain Registered?**

Your domain could be registered with:
- **GoDaddy**
- **Namecheap**
- **Cloudflare**
- **Google Domains**
- **Domain.com**
- **BigRock** (popular in India)
- **Other**

---

#### **Example: Adding DNS Records in Cloudflare** (Most Common)

1. Log in to **Cloudflare**
2. Select your domain: **animedropzone.com**
3. Go to **DNS** tab
4. Click **"Add Record"**

**Add SPF Record:**
- Type: `TXT`
- Name: `@`
- Content: `v=spf1 include:spf.mailersend.net ~all`
- TTL: `Auto`
- Proxy status: `DNS only` (gray cloud)
- Click **Save**

**Add DKIM Record:**
- Type: `TXT`
- Name: `mta._domainkey` (Cloudflare adds domain automatically)
- Content: (paste the long DKIM value from MailerSend)
- TTL: `Auto`
- Proxy status: `DNS only` (gray cloud)
- Click **Save**

**Add Return-Path CNAME:**
- Type: `CNAME`
- Name: `email`
- Target: `mailersend.net`
- TTL: `Auto`
- Proxy status: `DNS only` (gray cloud)
- Click **Save**

**Optional: Add Tracking CNAME:**
- Type: `CNAME`
- Name: `track`
- Target: `mailersend.net`
- TTL: `Auto`
- Proxy status: `DNS only` (gray cloud)
- Click **Save**

---

#### **Example: Adding DNS Records in GoDaddy**

1. Log in to **GoDaddy**
2. Go to **My Products** → **Domain Settings**
3. Click **DNS** next to your domain
4. Scroll to **Records** section

**Add SPF Record:**
- Type: `TXT`
- Name: `@`
- Value: `v=spf1 include:spf.mailersend.net ~all`
- TTL: `1 Hour`
- Click **Add**

**Add DKIM Record:**
- Type: `TXT`
- Name: `mta._domainkey.animedropzone.com`
- Value: (paste DKIM value)
- TTL: `1 Hour`
- Click **Add**

**Add CNAME Records:**
- Type: `CNAME`
- Name: `email`
- Value: `mailersend.net`
- TTL: `1 Hour`
- Click **Add**

(Repeat for tracking if needed)

---

#### **Example: Adding DNS Records in Namecheap**

1. Log in to **Namecheap**
2. Go to **Domain List** → Click **Manage** next to your domain
3. Go to **Advanced DNS** tab

**Add SPF Record:**
- Type: `TXT Record`
- Host: `@`
- Value: `v=spf1 include:spf.mailersend.net ~all`
- TTL: `Automatic`
- Click **Save**

**Add DKIM Record:**
- Type: `TXT Record`
- Host: `mta._domainkey`
- Value: (paste DKIM value)
- TTL: `Automatic`
- Click **Save**

**Add CNAME Records:**
- Type: `CNAME Record`
- Host: `email`
- Value: `mailersend.net`
- TTL: `Automatic`
- Click **Save**

---

### **Step 5: Verify Domain in MailerSend**

1. Go back to **MailerSend dashboard**
2. Go to **Domains** section
3. Find your domain: **animedropzone.com**
4. Click **"Verify Domain"** button
5. MailerSend will check your DNS records

**Status Options:**

#### **✅ All Records Verified - Domain Active**
- Your domain is ready to use!
- You can now send emails from `@animedropzone.com`

#### **⚠️ Pending Verification**
- DNS records not found yet
- **Wait 5-60 minutes** for DNS propagation
- Click "Verify" again after waiting

#### **❌ Verification Failed**
- DNS records incorrect or missing
- Double-check the records you added
- Make sure there are no typos
- Try again after 15 minutes

---

### **Step 6: Create Sender Identity**

Once your domain is verified:

1. In MailerSend, go to **"Email" → "Sender Identity"** (or "Senders")
2. Click **"Add Sender"**
3. Enter details:
   - **Name:** `AnimeDropZone`
   - **Email:** `noreply@animedropzone.com` (or `info@animedropzone.com`)
4. Click **"Save"**

**Popular sender email options:**
- ✅ `noreply@animedropzone.com` (professional, no replies)
- ✅ `orders@animedropzone.com` (order-specific)
- ✅ `info@animedropzone.com` (general info)
- ✅ `shop@animedropzone.com` (e-commerce)
- ❌ `admin@animedropzone.com` (less professional)

**Recommendation:** Use `noreply@animedropzone.com` or `orders@animedropzone.com`

---

### **Step 7: Update Environment Variable**

Once your domain is verified and sender is created, update your environment variable:

1. Go to **Supabase Dashboard**
2. Select your project
3. Go to **Settings → Edge Functions → Secrets**
4. Find or add: **`MAILERSEND_FROM_EMAIL`**
5. Set value to: **`noreply@animedropzone.com`**
6. Click **Save**
7. **Restart your Edge Functions** (redeploy or wait a few minutes)

---

### **Step 8: Test!**

1. Place a test order on your website
2. Check the email you receive
3. **Look at the "From" address** - it should now be:
   - `AnimeDropZone <noreply@animedropzone.com>`

---

## 🎯 Quick Checklist

```
☐ 1. Log in to MailerSend
☐ 2. Add domain: animedropzone.com
☐ 3. Copy DNS records from MailerSend
☐ 4. Log in to your domain registrar (Cloudflare/GoDaddy/etc)
☐ 5. Add SPF record (TXT)
☐ 6. Add DKIM record (TXT)
☐ 7. Add Return-Path CNAME
☐ 8. Wait 5-60 minutes for DNS propagation
☐ 9. Verify domain in MailerSend
☐ 10. Create sender identity (noreply@animedropzone.com)
☐ 11. Add MAILERSEND_FROM_EMAIL to Supabase secrets
☐ 12. Test with an order!
```

---

## ⏰ How Long Does This Take?

### **Your Time:**
- Adding domain: 1 minute
- Adding DNS records: 5-10 minutes
- Creating sender: 1 minute
- Updating environment: 1 minute
- **Total: ~15 minutes**

### **DNS Propagation:**
- **Fast:** 5-15 minutes (most common)
- **Normal:** 30-60 minutes
- **Slow:** Up to 24 hours (rare)

**Tip:** Most DNS changes propagate within 15-30 minutes!

---

## ❓ Common Issues & Solutions

### **Issue 1: "Domain not verified" after 1 hour**

**Solution:**
- Check DNS records in your registrar
- Make sure there are no typos
- Ensure TTL is set to Auto or 1 Hour
- Try removing and re-adding the records
- Contact your domain registrar support

---

### **Issue 2: "SPF record already exists"**

If you already have an SPF record, you need to **merge** them:

**Existing SPF:**
```
v=spf1 include:_spf.google.com ~all
```

**Updated SPF (merged):**
```
v=spf1 include:_spf.google.com include:spf.mailersend.net ~all
```

**⚠️ You can only have ONE SPF record!**

---

### **Issue 3: "Emails still coming from test domain"**

**Solution:**
- Make sure you updated `MAILERSEND_FROM_EMAIL` in Supabase
- Restart Edge Functions (redeploy)
- Clear browser cache
- Wait 5 minutes and try again

---

### **Issue 4: "Domain verification shows red X"**

**Solution:**
- Click the red X to see which record is missing
- Re-check that specific DNS record
- Wait 15 more minutes
- Click "Verify" again

---

## 🎊 Benefits of Custom Domain

### **Before (Test Domain):**
```
From: info@test-zkq340endq0gd796.mlsender.net
```
- ❌ Looks unprofessional
- ❌ May go to spam
- ❌ Customers don't trust it
- ❌ Hard to remember

### **After (Custom Domain):**
```
From: AnimeDropZone <noreply@animedropzone.com>
```
- ✅ Professional appearance
- ✅ Better deliverability
- ✅ Customers trust it
- ✅ Matches your brand
- ✅ Less likely to be marked as spam
- ✅ Builds brand recognition

---

## 📚 Helpful Resources

- **MailerSend Docs:** https://www.mailersend.com/help/how-to-verify-a-domain
- **DNS Checker:** https://dnschecker.org (check DNS propagation)
- **MXToolbox:** https://mxtoolbox.com/spf.aspx (verify SPF records)

---

## 🆘 Need Help?

### **Can't find DNS settings?**
- Google: "How to add DNS records in [your registrar name]"
- Example: "How to add DNS records in GoDaddy"
- Contact your domain registrar's support

### **Domain not verifying?**
- Use DNS checker: https://dnschecker.org
- Search for your domain and TXT records
- Check if SPF and DKIM records are visible globally

### **Still stuck?**
- Check MailerSend's help center
- Contact MailerSend support (they're very helpful!)
- Or reach out to your domain registrar

---

## ✅ Summary

**To change your email sender from test domain to animedropzone.com:**

1. ⏰ **Time:** 15 minutes + DNS wait (5-60 mins)
2. 🔧 **Steps:** Add domain → Add DNS records → Verify → Update env var
3. 💰 **Cost:** FREE (included in MailerSend free tier)
4. 🎯 **Result:** Professional emails from `noreply@animedropzone.com`

**Start now and you could be sending professional emails within 30 minutes!** 🚀

---

## 🎯 After Setup

Once completed, your emails will show:

```
From: AnimeDropZone <noreply@animedropzone.com>
Reply-To: (none - or you can set one)
```

**Much more professional!** 💜✨

---

**Good luck with your setup! You've got this!** 🎊

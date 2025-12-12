# 📧 How to Change Email Sender to animedropzone.com

## ✅ Good News: Code is Already Ready!

Your code is **already configured** to use a custom email sender. You just need to:

1. ✅ Verify your domain in MailerSend
2. ✅ Add one environment variable
3. ✅ Test!

**No code changes needed!** 🎉

---

## 🎯 Current vs Target

### **Current Email Sender:**
```
From: info@test-zkq340endq0gd796.mlsender.net
```
❌ Test domain  
❌ Unprofessional  
❌ May go to spam  

### **Target Email Sender:**
```
From: AnimeDropZone <noreply@animedropzone.com>
```
✅ Your domain  
✅ Professional  
✅ Better deliverability  
✅ Builds trust  

---

## 📋 What You Need to Do

### **Step 1: Verify Domain in MailerSend** ⏰ 10 minutes

1. Go to: **https://app.mailersend.com**
2. Log in with your account
3. Click **"Domains"** in sidebar
4. Click **"Add Domain"**
5. Enter: **`animedropzone.com`** (just the domain, no www or https)
6. Click **"Add Domain"**

MailerSend will show you **DNS records** to add:
- SPF record (TXT)
- DKIM record (TXT)
- Return-Path (CNAME)

**Keep this page open!**

---

### **Step 2: Add DNS Records** ⏰ 5 minutes

Log in to your **domain registrar** (where you bought animedropzone.com):
- Cloudflare
- GoDaddy
- Namecheap
- Google Domains
- BigRock
- Others

Find the **DNS Management** section and add the records from MailerSend.

#### **Example DNS Records:**

**SPF Record:**
```
Type: TXT
Name: @
Value: v=spf1 include:spf.mailersend.net ~all
```

**DKIM Record:**
```
Type: TXT
Name: mta._domainkey
Value: (long string from MailerSend)
```

**Return-Path:**
```
Type: CNAME
Name: email
Value: mailersend.net
```

---

### **Step 3: Wait for DNS Propagation** ⏰ 5-60 minutes

After adding DNS records, wait for them to propagate:
- **Usually:** 5-15 minutes
- **Maximum:** Up to 24 hours (rare)

You can check propagation at: https://dnschecker.org

---

### **Step 4: Verify Domain** ⏰ 1 minute

1. Go back to **MailerSend → Domains**
2. Find **animedropzone.com**
3. Click **"Verify Domain"**
4. Wait for verification (should show green checkmarks)

If verification fails:
- Wait 15 more minutes
- Try again
- Check DNS records are correct

---

### **Step 5: Create Sender Identity** ⏰ 2 minutes

1. In MailerSend, go to **"Email" → "Senders"** (or "Sender Identity")
2. Click **"Add Sender"**
3. Fill in details:
   - **Name:** `AnimeDropZone`
   - **Email:** `noreply@animedropzone.com`
4. Click **"Save"**

**Recommended sender emails:**
- ✅ `noreply@animedropzone.com` ← **Best choice!**
- ✅ `orders@animedropzone.com`
- ✅ `info@animedropzone.com`
- ✅ `shop@animedropzone.com`

---

### **Step 6: Update Environment Variable** ⏰ 2 minutes

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **Edge Functions** → **Secrets**
4. Look for **`MAILERSEND_FROM_EMAIL`**
   - If it exists: Click **Edit** and update the value
   - If it doesn't exist: Click **Add Secret**
5. Set the value to: **`noreply@animedropzone.com`**
6. Click **Save**

**Important:** Use the EXACT email you created in Step 5!

---

### **Step 7: Restart Edge Functions** ⏰ 1 minute

Your Edge Functions need to reload the new environment variable:

**Option 1: Wait**
- Just wait 5 minutes
- Functions will auto-reload

**Option 2: Redeploy** (faster)
- Go to **Edge Functions** in Supabase
- Find your function
- Click **Redeploy** or make a small change to trigger redeploy

---

### **Step 8: Test!** ⏰ 2 minutes

1. Place a test order on your website
2. Use a real email address you can check
3. Wait for the order confirmation email
4. **Check the "From" field** - it should now show:
   ```
   From: AnimeDropZone <noreply@animedropzone.com>
   ```

**Success!** 🎉

---

## ⏰ Total Time Required

| Step | Time |
|------|------|
| Verify domain in MailerSend | 10 mins |
| Add DNS records | 5 mins |
| Wait for DNS propagation | 5-60 mins |
| Verify domain | 1 min |
| Create sender identity | 2 mins |
| Update environment variable | 2 mins |
| Restart Edge Functions | 1 min |
| Test | 2 mins |
| **Total** | **30-90 mins** |

**Most of the time is waiting for DNS!**

---

## 🔧 Technical Details

### **How the Code Works:**

The email service already checks for your custom sender email:

```typescript
let fromEmail = Deno.env.get('MAILERSEND_FROM_EMAIL') 
  || Deno.env.get('mail_sender') 
  || 'info@test-zkq340endq0gd796.mlsender.net';
```

**Priority:**
1. ✅ `MAILERSEND_FROM_EMAIL` ← **Your custom email (highest priority)**
2. ✅ `mail_sender` ← Alternative variable
3. ✅ `info@test-zkq340endq0gd796.mlsender.net` ← Fallback (current)

**Once you add `MAILERSEND_FROM_EMAIL`, it will automatically use your custom email!**

---

## ❓ Frequently Asked Questions

### **Q: Do I need to change any code?**
**A:** No! The code is already configured. Just add the environment variable.

### **Q: Can I use any email address?**
**A:** No. It must be on a **verified domain** and must be created as a **sender identity** in MailerSend.

### **Q: What if I don't have access to DNS settings?**
**A:** Contact whoever manages your domain (domain registrar, developer, IT team). You MUST add DNS records to verify the domain.

### **Q: Can I skip domain verification?**
**A:** No. MailerSend will reject emails from unverified domains. This is required.

### **Q: How long does DNS propagation take?**
**A:** Usually 5-30 minutes, but can take up to 24 hours in rare cases.

### **Q: Will emails still work during setup?**
**A:** Yes! The system will continue using the test domain until you complete setup.

### **Q: What if verification fails?**
**A:** 
- Wait 15-30 minutes for DNS to propagate
- Check DNS records are correct (no typos)
- Try verifying again
- Contact MailerSend support if still failing

### **Q: Do I need to pay for this?**
**A:** No! This is included in MailerSend's free tier (12,000 emails/month).

---

## 🆘 Troubleshooting

### **Issue: "Domain not verified" after 1 hour**

**Solutions:**
1. Check DNS records in your domain registrar
2. Verify there are no typos in the records
3. Remove and re-add the DNS records
4. Use https://dnschecker.org to check if records are visible globally
5. Contact your domain registrar support

---

### **Issue: Emails still from test domain after setup**

**Solutions:**
1. Check `MAILERSEND_FROM_EMAIL` is set in Supabase
2. Verify the value is correct: `noreply@animedropzone.com`
3. Restart Edge Functions (redeploy)
4. Wait 5 minutes and try again
5. Check browser console for logs

---

### **Issue: "SPF record already exists"**

If you already have an SPF record, **merge** them:

**Before:**
```
v=spf1 include:_spf.google.com ~all
```

**After (merged):**
```
v=spf1 include:_spf.google.com include:spf.mailersend.net ~all
```

**⚠️ Important:** You can only have ONE SPF record per domain!

---

### **Issue: Can't find DNS management in domain registrar**

**Look for these sections:**
- DNS Management
- DNS Settings
- Advanced DNS
- Domain Settings → DNS
- Manage DNS
- DNS Records

**Still can't find it?**
- Google: "How to add DNS records in [your registrar]"
- Example: "How to add DNS records in GoDaddy"
- Contact your registrar's support

---

## 📚 Resources

### **Official Guides:**
- **MailerSend Domain Verification:** https://www.mailersend.com/help/how-to-verify-a-domain
- **MailerSend Getting Started:** https://www.mailersend.com/help/getting-started

### **DNS Tools:**
- **DNS Checker:** https://dnschecker.org
- **MXToolbox SPF Check:** https://mxtoolbox.com/spf.aspx
- **MXToolbox DKIM Check:** https://mxtoolbox.com/dkim.aspx

### **Support:**
- **MailerSend Support:** support@mailersend.com
- **MailerSend Help Center:** https://www.mailersend.com/help

---

## ✅ Quick Checklist

Copy this checklist and check off each item as you complete it:

```
☐ 1. Log in to MailerSend
☐ 2. Add domain: animedropzone.com
☐ 3. Copy DNS records
☐ 4. Log in to domain registrar
☐ 5. Add SPF record (TXT)
☐ 6. Add DKIM record (TXT)
☐ 7. Add Return-Path CNAME
☐ 8. Wait 15-30 minutes
☐ 9. Verify domain in MailerSend
☐ 10. Create sender: noreply@animedropzone.com
☐ 11. Add MAILERSEND_FROM_EMAIL to Supabase
☐ 12. Restart Edge Functions
☐ 13. Place test order
☐ 14. Check email "From" address
☐ 15. Success! 🎉
```

---

## 🎊 Summary

### **What You Need to Do:**
1. ✅ Verify domain in MailerSend (add DNS records)
2. ✅ Create sender identity: `noreply@animedropzone.com`
3. ✅ Add environment variable: `MAILERSEND_FROM_EMAIL`
4. ✅ Test!

### **What You DON'T Need to Do:**
- ❌ Change any code (already done!)
- ❌ Pay anything (free tier)
- ❌ Create new MailerSend account (use existing)

### **Result:**
```
From: AnimeDropZone <noreply@animedropzone.com>
```

**Professional emails that build trust and improve deliverability!** 💜✨

---

## 🚀 Ready to Start?

**Detailed guide:** See `MAILERSEND_CUSTOM_DOMAIN_SETUP.md`  
**Quick reference:** See `QUICK_EMAIL_SETUP.txt`

**You've got this!** 🎉

Start with Step 1 and work through each step. Most setups complete in 30-60 minutes!

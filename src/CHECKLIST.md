# ✅ Email Domain Setup Checklist

Print this page or keep it open while you work through the setup!

---

## 🎯 Goal

Change email sender from:
- ❌ `info@test-zkq340endq0gd796.mlsender.net`
- ✅ `noreply@animedropzone.com`

---

## 📋 Checklist

### **Part 1: MailerSend Setup**

- [ ] 1. Go to https://app.mailersend.com and log in
- [ ] 2. Click "Domains" in the sidebar
- [ ] 3. Click "Add Domain" button
- [ ] 4. Enter domain: `animedropzone.com`
- [ ] 5. Click "Add Domain"
- [ ] 6. **Keep this page open** (you'll need the DNS records)

---

### **Part 2: Add DNS Records**

- [ ] 7. Log in to your domain registrar (Cloudflare/GoDaddy/Namecheap/etc)
- [ ] 8. Find "DNS Management" or "DNS Settings"
- [ ] 9. Add **SPF Record**:
  - Type: `TXT`
  - Name: `@`
  - Value: `v=spf1 include:spf.mailersend.net ~all`
- [ ] 10. Add **DKIM Record**:
  - Type: `TXT`
  - Name: `mta._domainkey`
  - Value: (copy from MailerSend page)
- [ ] 11. Add **Return-Path**:
  - Type: `CNAME`
  - Name: `email`
  - Value: `mailersend.net`
- [ ] 12. Save all DNS records

---

### **Part 3: Verify Domain**

- [ ] 13. Wait 15-30 minutes for DNS propagation
- [ ] 14. Go back to MailerSend → Domains
- [ ] 15. Click "Verify Domain" next to animedropzone.com
- [ ] 16. Wait for green checkmarks ✅
- [ ] 17. If verification fails, wait 15 more minutes and try again

---

### **Part 4: Create Sender**

- [ ] 18. In MailerSend, go to "Email" → "Senders"
- [ ] 19. Click "Add Sender"
- [ ] 20. Name: `AnimeDropZone`
- [ ] 21. Email: `noreply@animedropzone.com`
- [ ] 22. Click "Save"

---

### **Part 5: Update Environment Variable**

- [ ] 23. Go to Supabase Dashboard (https://supabase.com/dashboard)
- [ ] 24. Select your project
- [ ] 25. Go to Settings → Edge Functions → Secrets
- [ ] 26. Click "Add Secret" or edit existing `MAILERSEND_FROM_EMAIL`
- [ ] 27. Name: `MAILERSEND_FROM_EMAIL`
- [ ] 28. Value: `noreply@animedropzone.com`
- [ ] 29. Click "Save"

---

### **Part 6: Restart & Test**

- [ ] 30. Wait 5 minutes (or redeploy Edge Functions)
- [ ] 31. Place a test order on your website
- [ ] 32. Check the order confirmation email
- [ ] 33. Verify "From" shows: `AnimeDropZone <noreply@animedropzone.com>`
- [ ] 34. **SUCCESS!** 🎉

---

## 📝 Notes & Important Info

### **DNS Records Summary**

Write down your DNS records here for reference:

**SPF:**
```
Type: TXT
Name: @
Value: v=spf1 include:spf.mailersend.net ~all
```

**DKIM:**
```
Type: TXT
Name: mta._domainkey
Value: _______________________________________
       _______________________________________
       (copy from MailerSend)
```

**Return-Path:**
```
Type: CNAME
Name: email
Value: mailersend.net
```

---

### **Environment Variable**

```
Name: MAILERSEND_FROM_EMAIL
Value: noreply@animedropzone.com
```

---

### **Where is my domain registered?**

My domain registrar is: ___________________

DNS Settings location: ___________________

---

### **Timeline**

| Task | Time | Status |
|------|------|--------|
| Add domain in MailerSend | 5 mins | ☐ |
| Add DNS records | 5 mins | ☐ |
| Wait for DNS propagation | 15-30 mins | ☐ |
| Verify domain | 2 mins | ☐ |
| Create sender | 2 mins | ☐ |
| Update env variable | 2 mins | ☐ |
| Test | 2 mins | ☐ |
| **Total** | **30-60 mins** | |

---

## 🆘 Troubleshooting

### Problem: Domain not verifying

**Try:**
- [ ] Wait 15 more minutes
- [ ] Check DNS records for typos
- [ ] Use https://dnschecker.org to check records
- [ ] Remove and re-add DNS records

---

### Problem: Can't find DNS settings

**Try:**
- [ ] Look for "DNS Management", "Advanced DNS", or "DNS Settings"
- [ ] Google: "How to add DNS records in [your registrar name]"
- [ ] Contact domain registrar support

---

### Problem: Emails still from test domain

**Try:**
- [ ] Verify `MAILERSEND_FROM_EMAIL` is set in Supabase
- [ ] Check the value is: `noreply@animedropzone.com`
- [ ] Restart Edge Functions
- [ ] Wait 5 minutes
- [ ] Clear browser cache

---

## ✅ Completion

Date completed: ___________________

Time taken: ___________________

**New sender email:** `noreply@animedropzone.com` ✅

---

## 📚 Reference Documents

For detailed instructions, see:
- `EMAIL_SENDER_INSTRUCTIONS.md` - Complete guide
- `MAILERSEND_CUSTOM_DOMAIN_SETUP.md` - Domain setup details
- `QUICK_EMAIL_SETUP.txt` - Quick reference

---

## 🎊 You're Done!

When all checkboxes are checked, your emails will be sent from your professional domain!

**Congratulations!** 🎉💜

# 🚀 Quick Email Provider Switch Guide

## Your app now supports 5 email providers!

You can switch between them anytime by changing ONE environment variable.

---

## ✅ **Option 1: SendGrid (Recommended)**

### Why SendGrid?
- ✅ 100 emails/day FREE forever
- ✅ Very reliable
- ✅ Easy setup (5 minutes)
- ✅ No credit card needed

### Setup in 3 Steps:

**Step 1:** Sign up at [sendgrid.com](https://sendgrid.com)

**Step 2:** Create API Key
- Go to: Settings → API Keys → Create API Key
- Name: "AnimeDrop Zone"
- Permission: Full Access
- **Copy the key!** (You won't see it again)

**Step 3:** Verify Your Email
- Go to: Settings → Sender Authentication → Verify Single Sender
- Email: `uzair.shaikh.01kb@gmail.com`
- Name: `AnimeDrop Zone`
- Check your email and click verify

**Step 4:** Add to Your App
Click the key icon in Figma Make and add:
```
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=uzair.shaikh.01kb@gmail.com
```

**Done!** Your app will now send emails via SendGrid.

---

## ✅ **Option 2: Brevo (Best Free Tier!)**

### Why Brevo?
- ✅ **300 emails/day FREE** (3x more than SendGrid!)
- ✅ Very reliable
- ✅ Easy setup
- ✅ No credit card needed

### Setup in 3 Steps:

**Step 1:** Sign up at [brevo.com](https://brevo.com)

**Step 2:** Create API Key
- Go to: Settings → SMTP & API → API Keys
- Create new key (Version 3)
- **Copy the key!**

**Step 3:** Verify Your Email
- Go to: Senders → Add a New Sender
- Email: `uzair.shaikh.01kb@gmail.com`
- Check your email and verify

**Step 4:** Add to Your App
```
EMAIL_PROVIDER=brevo
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxx
BREVO_FROM_EMAIL=uzair.shaikh.01kb@gmail.com
```

**Done!** Your app will now send emails via Brevo.

---

## ✅ **Option 3: Keep Using Resend (Current)**

You're already set up with Resend. If it's working well, you can keep it!

Just make sure these are set:
```
EMAIL_PROVIDER=resend
RESEND_API_KEY=(already configured)
```

---

## ✅ **Option 4: Gmail SMTP (Easiest but Limited)**

### Why Gmail SMTP?
- ✅ Super easy setup (3 minutes)
- ✅ 1,000 emails/month free via SMTP2GO
- ⚠️ Lower daily limit

### Setup in 2 Steps:

**Step 1:** Sign up at [smtp2go.com](https://www.smtp2go.com)

**Step 2:** Get API Key
- Verify your email
- Go to: Settings → API Keys → Create
- Copy the key

**Step 3:** Add to Your App
```
EMAIL_PROVIDER=gmail
SMTP2GO_API_KEY=api-xxxxxxxxxxxxxxx
GMAIL_USER=uzair.shaikh.01kb@gmail.com
```

**Done!** Your app will now send emails via Gmail SMTP.

---

## 📊 **Quick Comparison**

| Provider | Free Limit | Setup Time | My Pick |
|----------|-----------|------------|---------|
| **Brevo** | 300/day | 5 min | ⭐⭐⭐⭐⭐ BEST! |
| **SendGrid** | 100/day | 5 min | ⭐⭐⭐⭐ Great |
| **Resend** | 100/day | 5 min | ⭐⭐⭐⭐ Current |
| **Gmail SMTP** | 33/day | 3 min | ⭐⭐⭐ Quick |

---

## 🎯 **My Recommendation**

**For AnimeDrop Zone, use Brevo:**

1. Sign up at brevo.com (takes 2 minutes)
2. Get your API key
3. Verify uzair.shaikh.01kb@gmail.com as sender
4. Add these to environment variables:
   ```
   EMAIL_PROVIDER=brevo
   BREVO_API_KEY=xkeysib-your-key
   BREVO_FROM_EMAIL=uzair.shaikh.01kb@gmail.com
   ```

**Why Brevo?**
- 300 emails per day = ~9,000 per month FREE
- Perfect for your store volume
- No credit card required
- Very reliable

---

## ⚡ **How to Add Environment Variables**

1. In Figma Make, look for the **key icon** 🔑 in the top toolbar
2. Click it to open environment variables
3. Add the variables listed above
4. Click save
5. Your app will restart automatically

---

## 🆘 **Having Issues?**

### "Failed to send email"
- Check your API key is correct (no extra spaces)
- Make sure EMAIL_PROVIDER matches your service
- Verify your sender email in the provider's dashboard

### "Sender not verified"
- You must verify your email in the provider's dashboard
- For SendGrid: Settings → Sender Authentication
- For Brevo: Senders → Add New Sender

### Still stuck?
Check the full guide: `/EMAIL_SETUP_GUIDE.md`

---

## 🎉 **That's It!**

Your email system is now flexible and can use any major provider. Switch anytime by changing the `EMAIL_PROVIDER` variable!

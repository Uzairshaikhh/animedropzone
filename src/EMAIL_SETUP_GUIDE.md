# Email Service Setup Guide for AnimeDrop Zone

Your application now supports **5 different email providers**. Choose the one that best fits your needs.

---

## 📧 **Available Email Providers**

### **1. SendGrid (Recommended - Best Free Tier)**
- **Free Tier**: 100 emails/day forever
- **Setup Time**: 5 minutes
- **Best For**: Small to medium businesses

#### Setup Steps:
1. Go to [sendgrid.com](https://sendgrid.com) and sign up
2. Verify your email
3. Go to Settings → API Keys → Create API Key
4. Copy the API key
5. In Figma Make, add these environment variables:
   - `EMAIL_PROVIDER` = `sendgrid`
   - `SENDGRID_API_KEY` = `your_api_key_here`
   - `SENDGRID_FROM_EMAIL` = `uzair.shaikh.01kb@gmail.com`

**Verify Sender Email:**
- Go to Settings → Sender Authentication
- Click "Verify Single Sender"
- Use `uzair.shaikh.01kb@gmail.com` as sender
- Check email and verify

---

### **2. Brevo (Formerly Sendinblue) - Most Generous Free Tier**
- **Free Tier**: 300 emails/day
- **Setup Time**: 5 minutes
- **Best For**: Higher email volume

#### Setup Steps:
1. Go to [brevo.com](https://brevo.com) and sign up
2. Go to Settings → SMTP & API → API Keys
3. Create a new API key (Version 3)
4. Copy the API key
5. In Figma Make, add these environment variables:
   - `EMAIL_PROVIDER` = `brevo`
   - `BREVO_API_KEY` = `your_api_key_here`
   - `BREVO_FROM_EMAIL` = `uzair.shaikh.01kb@gmail.com`

**Verify Sender Email:**
- Go to Senders → Add a New Sender
- Use `uzair.shaikh.01kb@gmail.com`
- Verify via email

---

### **3. Mailgun**
- **Free Tier**: 5,000 emails/month (first 3 months), then $0.80 per 1,000
- **Setup Time**: 10 minutes (requires credit card)
- **Best For**: Developers who want powerful features

#### Setup Steps:
1. Go to [mailgun.com](https://mailgun.com) and sign up
2. Add credit card (won't be charged during free tier)
3. Go to Sending → Domain verification
4. Add and verify a domain OR use sandbox domain (sandbox domain can only send to authorized recipients)
5. Go to Settings → API Keys
6. Copy your Private API Key
7. In Figma Make, add these environment variables:
   - `EMAIL_PROVIDER` = `mailgun`
   - `MAILGUN_API_KEY` = `your_api_key_here`
   - `MAILGUN_DOMAIN` = `sandbox123.mailgun.org` (or your verified domain)
   - `MAILGUN_FROM_EMAIL` = `uzair.shaikh.01kb@gmail.com`

---

### **4. Gmail SMTP via SMTP2GO (Easiest)**
- **Free Tier**: 1,000 emails/month
- **Setup Time**: 3 minutes
- **Best For**: Quick setup, personal projects

#### Setup Steps:
1. Go to [smtp2go.com](https://www.smtp2go.com) and sign up
2. Verify your email
3. Go to Settings → API Keys → Create API Key
4. Copy the API key
5. In Figma Make, add these environment variables:
   - `EMAIL_PROVIDER` = `gmail`
   - `SMTP2GO_API_KEY` = `your_api_key_here`
   - `GMAIL_USER` = `uzair.shaikh.01kb@gmail.com`

**Note:** SMTP2GO acts as a relay for Gmail and is much easier than setting up Gmail App Passwords.

---

### **5. Resend (Currently Using)**
- **Free Tier**: 100 emails/day, 3,000 emails/month
- **Setup Time**: 5 minutes
- **Best For**: Modern API, good documentation

#### Current Setup:
You're already using Resend. No changes needed if you want to continue.

To explicitly set it:
- `EMAIL_PROVIDER` = `resend`
- `RESEND_API_KEY` = (already configured)

---

## 🚀 **Quick Start: Switch to SendGrid (Recommended)**

1. **Sign up for SendGrid**: [sendgrid.com/free](https://sendgrid.com/free/)

2. **Create API Key**:
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Name it "AnimeDrop Zone"
   - Choose "Full Access"
   - Copy the key immediately (you won't see it again)

3. **Verify Sender Email**:
   - Go to Settings → Sender Authentication
   - Click "Verify a Single Sender"
   - Email: `uzair.shaikh.01kb@gmail.com`
   - Name: `AnimeDrop Zone`
   - Submit and verify via email

4. **Add to Your App**:
   In Figma Make, click the environment variable icon and add:
   ```
   EMAIL_PROVIDER = sendgrid
   SENDGRID_API_KEY = SG.xxxxxxxxxxxxx
   SENDGRID_FROM_EMAIL = uzair.shaikh.01kb@gmail.com
   ```

5. **Test**:
   Place a test order and check if emails arrive!

---

## 📊 **Provider Comparison**

| Provider | Free Emails/Day | Free Emails/Month | Setup Difficulty | Reliability |
|----------|-----------------|-------------------|------------------|-------------|
| **Brevo** | 300 | 9,000 | Easy | Excellent |
| **SendGrid** | 100 | 3,000 | Easy | Excellent |
| **Resend** | 100 | 3,000 | Easy | Excellent |
| **SMTP2GO** | ~33 | 1,000 | Very Easy | Good |
| **Mailgun** | ~166 | 5,000* | Medium | Excellent |

*Mailgun's 5,000 emails/month is only for first 3 months

---

## 🔧 **How to Switch Providers**

Simply update the `EMAIL_PROVIDER` environment variable in Figma Make:

- For SendGrid: `EMAIL_PROVIDER=sendgrid`
- For Brevo: `EMAIL_PROVIDER=brevo`
- For Mailgun: `EMAIL_PROVIDER=mailgun`
- For Gmail: `EMAIL_PROVIDER=gmail`
- For Resend: `EMAIL_PROVIDER=resend` (default)

The system will automatically use the correct provider!

---

## ⚠️ **Important Notes**

### **For ALL Providers:**
1. **Verify your sender email** - This is required to send emails
2. **Don't share API keys** - Keep them secret
3. **Monitor usage** - Check your dashboard to avoid hitting limits

### **Production Tips:**
1. **Verify a domain** (recommended for better deliverability)
2. **Use a professional email** like `noreply@yourdomain.com`
3. **Set up SPF and DKIM** records for your domain

---

## 🆘 **Troubleshooting**

### Emails not sending?
1. Check the browser console for error messages
2. Verify your API key is correct
3. Make sure sender email is verified
4. Check you haven't hit daily/monthly limits

### Emails going to spam?
1. Verify your domain
2. Set up SPF and DKIM records
3. Warm up your sending (start with low volume)
4. Avoid spam trigger words in emails

### SendGrid: "The from address does not match a verified Sender Identity"
- You must verify your sender email in SendGrid dashboard
- Go to Settings → Sender Authentication → Verify a Single Sender

### Brevo: "Sender email not authorized"
- Add your email as a sender in Brevo dashboard
- Go to Senders → Add a New Sender

---

## 💡 **Recommended Setup for AnimeDrop Zone**

**For Production**: Use **Brevo** (300 emails/day free)
- Best free tier
- Easy setup
- Reliable delivery

**Setup Steps**:
1. Sign up at brevo.com
2. Create API key
3. Verify sender email: `uzair.shaikh.01kb@gmail.com`
4. Add environment variables:
   ```
   EMAIL_PROVIDER=brevo
   BREVO_API_KEY=your_key_here
   BREVO_FROM_EMAIL=uzair.shaikh.01kb@gmail.com
   ```

That's it! Your email system will automatically use Brevo.

---

## 📞 **Need Help?**

If you're having trouble setting up any provider, check their documentation:
- SendGrid: [docs.sendgrid.com](https://docs.sendgrid.com)
- Brevo: [developers.brevo.com](https://developers.brevo.com)
- Mailgun: [documentation.mailgun.com](https://documentation.mailgun.com)
- SMTP2GO: [www.smtp2go.com/docs](https://www.smtp2go.com/docs)
- Resend: [resend.com/docs](https://resend.com/docs)

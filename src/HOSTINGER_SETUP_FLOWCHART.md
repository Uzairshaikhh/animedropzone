# 🔧 Hostinger Email Setup - Visual Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Your Website (Frontend)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Customer Places Order → Admin Panel → Signup Verification│  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────┘
                              │ Triggers
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│          Supabase Edge Functions (Backend Logic)                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  make-server-95a96d8e Function (Deno + Node.js)         │  │
│  │  - Receives order/signup event                          │  │
│  │  - Reads HOSTINGER_SMTP_USER env variable              │  │
│  │  - Reads HOSTINGER_SMTP_PASS env variable              │  │
│  │  - Reads EMAIL_PROVIDER env variable                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────┘
                              │ Sends email via
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│               Hostinger SMTP Server                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  smtp.hostinger.com:587                                 │  │
│  │  Authenticates with:                                     │  │
│  │  - Username: noreply@yourdomain.com                      │  │
│  │  - Password: [your-email-password]                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────┘
                              │ Relays to
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Customer's Email Inbox                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  📧 Order Confirmation Email from                       │  │
│  │     noreply@yourdomain.com                             │  │
│  │  Subject: Your Order #12345 is Confirmed               │  │
│  │  Body: Order details, tracking info, etc.              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Setup Sequence Diagram

```
┌────────────┐         ┌──────────────┐         ┌─────────────────┐
│  Hostinger │         │  Supabase    │         │  Your Website   │
│  Dashboard │         │  Dashboard   │         │  Admin Panel    │
└─────┬──────┘         └──────┬───────┘         └────────┬────────┘
      │                       │                         │
      │ 1. Create email account                         │
      │    noreply@yourdomain.com                      │
      │ ✓ Account created                              │
      │                       │                         │
      │                       │ 2. Add SMTP secrets     │
      │                       │ HOSTINGER_SMTP_USER     │
      │                       │ HOSTINGER_SMTP_PASS     │
      │                       │ EMAIL_PROVIDER         │
      │                       │ ✓ Secrets saved         │
      │                       │                         │
      │                       │ 3. Redeploy function    │
      │                       │ ✓ Deployed              │
      │                       │                         │
      │                       │                         │ 4. Check Status
      │                       │                         │ (calls email-config)
      │                       │ 5. Verify config        │
      │                       │    (reads secrets)      │
      │                       │ ✓ Configured            │
      │                       │←─────────────────────────│
      │                       │                         │
      │                       │                         │ 6. Send Test Email
      │                       │ 7. Send test email      │ (clicks button)
      │                       │    (calls test-email)   │
      │                       │ 8. Connect to SMTP      │
      │ ←──────────────────────────────────────────────│
      │ SMTP auth verify      │                         │
      │ (user/pass check)     │                         │
      │ ✓ Auth success        │                         │
      │ ←──────────────────────────────────────────────│
      │ Send test message     │                         │
      │ to test email address │                         │
      │ ✓ Email sent          │                         │
      │                       │ 9. Return result        │
      │                       │←─────────────────────────│
      │                       │                         │
      │                       │                         │ 10. Show success
      │                       │                         │    ✅ Email working!
      │                       │                         │
```

---

## Key Components

### 1. **Hostinger Email Account**

```
Created in Hostinger Dashboard
├─ Email: noreply@yourdomain.com
├─ Password: [Strong password - 16+ chars]
└─ Status: Active ✅
```

### 2. **Supabase Environment Secrets**

```
Stored in Edge Function Secrets
├─ HOSTINGER_SMTP_USER = noreply@yourdomain.com
├─ HOSTINGER_SMTP_PASS = [email password]
├─ EMAIL_PROVIDER = hostinger
└─ ADMIN_EMAIL = admin@yourdomain.com (optional)
```

### 3. **Email Flow in Code**

```
sendEmail(to, subject, html)
    ├─ Reads EMAIL_PROVIDER env var
    ├─ Routes to sendViaHostinger()
    │   ├─ Reads HOSTINGER_SMTP_USER
    │   ├─ Reads HOSTINGER_SMTP_PASS
    │   ├─ Connects to smtp.hostinger.com:587
    │   ├─ Authenticates with user/pass
    │   ├─ Sends email to recipient
    │   └─ Returns success/error
    └─ Returns result to caller
```

---

## Email Sending Examples

### Order Confirmation Email

```
FROM: noreply@yourdomain.com
TO:   customer@example.com
SUBJECT: Order #12345 Confirmed
BODY: HTML formatted email with:
      - Order number
      - Items ordered
      - Total price
      - Tracking info
      - Delivery estimate
```

### Admin Notification Email

```
FROM: noreply@yourdomain.com
TO:   admin@yourdomain.com
SUBJECT: New Order Alert - #12345
BODY: Admin notification with:
      - Customer name & contact
      - Items ordered
      - Order value
      - Payment status
      - Notes/requests
```

### Signup Verification Email

```
FROM: noreply@yourdomain.com
TO:   newuser@example.com
SUBJECT: Verify Your Email Address
BODY: Verification email with:
      - Verification link
      - Expiration time
      - Account details
```

---

## Troubleshooting Flowchart

```
Email Not Sending?
│
├─ Check Supabase Logs
│  │
│  ├─ Error: "Unauthenticated"
│  │  └─ Verify email/password in secrets
│  │
│  ├─ Error: "Connection Failed"
│  │  └─ Verify SMTP host/port
│  │
│  └─ Error: Other
│     └─ Check full error message
│
├─ Email Account Issues?
│  │
│  ├─ Account not active in Hostinger?
│  │  └─ Create/activate in Hostinger
│  │
│  ├─ Wrong email address?
│  │  └─ Update HOSTINGER_SMTP_USER secret
│  │
│  └─ Wrong password?
│     └─ Update HOSTINGER_SMTP_PASS secret
│
├─ Function Issues?
│  │
│  ├─ Secrets not updated?
│  │  └─ Redeploy the function
│  │
│  └─ Old version running?
│     └─ Force redeploy
│
└─ Email Received but in Spam?
   │
   └─ DNS/SPF issues
      ├─ Verify domain DNS records
      ├─ Add SPF record
      └─ Add DKIM record
```

---

## Success Indicators ✅

When everything is working:

1. **Status Shows**: "Email system configured"
2. **Test email**: Arrives within seconds
3. **Order emails**: Automatically sent to customers
4. **Admin emails**: Received at admin address
5. **Webmail access**: Can check sent folder in Hostinger webmail

---

## Next Steps After Setup

Once emails are working:

1. ✅ Test with real orders
2. ✅ Check order confirmation delivery
3. ✅ Verify admin notifications arrive
4. ✅ Test custom clothing quote emails
5. ✅ Monitor Supabase logs for errors
6. ✅ Set up email templates (optional)
7. ✅ Configure additional features

---

**Diagram Created**: December 2025
**Last Updated**: For Hostinger SMTP Integration

# ✅ Email Fix - Use SMTP2GO or Brevo (Supabase Compatible)

## The Problem

Direct SMTP to Hostinger doesn't work in Supabase because of Deno compatibility issues.

## The Solution

Use a **FREE** email relay service instead:

---

## Option 1: SMTP2GO (Recommended - Easier Setup)

### Step 1: Create Free Account

1. Go to: https://www.smtp2go.com/
2. Sign up (free tier: **1000 emails/month**)
3. Confirm email

### Step 2: Get API Key

1. Login to SMTP2GO dashboard
2. Click **Settings** (left sidebar)
3. Click **API Tokens**
4. Click **Create Token**
5. Copy the API key

### Step 3: Add to Supabase

1. Go to: https://supabase.com/dashboard
2. Settings ⚙️ → Edge Functions → `make-server-95a96d8e`
3. Click **Configuration** tab
4. Click **+ New Secret**
5. Add this:
   ```
   Name: SMTP2GO_API_KEY
   Value: [paste your API key from SMTP2GO]
   Click Save
   ```

### Step 4: Done!

Wait 2-3 minutes for Supabase redeploy, then test with an order.

---

## Option 2: Brevo (Alternative)

### Step 1: Create Free Account

1. Go to: https://www.brevo.com/
2. Sign up (free tier: **300 emails/day**)
3. Confirm email

### Step 2: Get API Key

1. Login to Brevo dashboard
2. Click **Settings** (left sidebar)
3. Click **API**
4. Copy your **API v3 key**

### Step 3: Add to Supabase

1. Go to: https://supabase.com/dashboard
2. Settings ⚙️ → Edge Functions → `make-server-95a96d8e`
3. Click **Configuration** tab
4. Click **+ New Secret**
5. Add this:
   ```
   Name: BREVO_API_KEY
   Value: [paste your API key from Brevo]
   Click Save
   ```

### Step 4: Done!

Wait 2-3 minutes for Supabase redeploy, then test with an order.

---

## Email Flow Now (Fixed)

```
Customer places order
       ↓
Your website API calls sendEmail()
       ↓
Email service checks for SMTP2GO_API_KEY or BREVO_API_KEY
       ↓
Uses relay service (compatible with Supabase Deno)
       ↓
Relay service connects to your Hostinger email
       ↓
Email sent to customer ✅
Email sent to admin ✅
```

---

## Which One Should I Choose?

| Feature            | SMTP2GO    | Brevo               |
| ------------------ | ---------- | ------------------- |
| **Free Limit**     | 1000/month | 300/day             |
| **Setup Time**     | 2 minutes  | 2 minutes           |
| **Reliability**    | Excellent  | Excellent           |
| **For Testing**    | ✅ Good    | ✅ Good             |
| **For Production** | ✅ Good    | ✅ Better (300/day) |

**Recommendation:** Start with **SMTP2GO** (easier). If you need more, use **Brevo**.

---

## Testing After Setup

1. Go to: https://animedropzone.com/shop
2. Add product → Checkout
3. Complete order with your email
4. Wait 1-2 minutes
5. Check inbox for confirmation email

**Success if:**

- ✅ You receive order confirmation
- ✅ Admin receives order notification
- ✅ Both within 1-2 minutes

---

## Troubleshooting

**Still no email?**

1. Check Supabase logs (Edge Functions → Logs)
2. Look for: `✅ Email sent successfully` or error messages
3. Make sure secret is saved (shows as dots in Supabase)

**API Key wrong?**

1. Go back to SMTP2GO/Brevo
2. Regenerate new API key
3. Update in Supabase
4. Wait 2-3 minutes

---

## What's Changed

**Before:** Tried to use direct SMTP (failed due to Deno incompatibility)
**Now:** Uses SMTP2GO/Brevo relay service (works perfectly with Supabase)

The relay service handles all the SMTP details for you!

---

**Total time to fix:** 5-10 minutes  
**Next step:** Choose SMTP2GO or Brevo and follow setup above

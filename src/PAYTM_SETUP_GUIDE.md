# 🎯 Paytm Payment Gateway Integration Guide

## Step 1: Create Paytm Business Account

1. Visit: https://business.paytm.com/
2. Sign up as a merchant
3. Complete KYC verification (takes 24-48 hours)
4. Get approved for Payment Gateway

## Step 2: Get Paytm Credentials

After approval, you'll get:

- **Merchant ID** (MID)
- **Merchant Key** (SECRET_KEY)

**Location:** Settings → API Keys (or Merchant Setup)

### Example:

```
MID: merchant1234567890
SECRET_KEY: abcd@1234xyz
```

## Step 3: Set Environment Variables

Create `.env` file in your project root:

```bash
# Paytm Configuration
VITE_PAYTM_MID=merchant1234567890
VITE_PAYTM_SECRET_KEY=abcd@1234xyz
VITE_PAYTM_WEBSITE=WEBSTAGING  # Use WEBPROD for production
VITE_PAYTM_CHANNEL_ID=WEB
VITE_PAYTM_INDUSTRY_TYPE_ID=Retail
VITE_PAYTM_CALLBACK_URL=https://animedropzone.com/payment-callback
```

### For Development (Test Mode):

```bash
VITE_PAYTM_WEBSITE=WEBSTAGING
# Use test merchant ID from Paytm
```

### For Production:

```bash
VITE_PAYTM_WEBSITE=WEBPROD
# Use live merchant ID
```

## Step 4: Server-Side Setup (Supabase Function)

We need a backend function to:

1. Generate Paytm checksum
2. Verify payment response

**File:** `src/supabase/functions/paytm-payment/index.ts`

### Create the function:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const PAYTM_MID = Deno.env.get("PAYTM_MID") || "merchant1234567890";
const PAYTM_SECRET_KEY = Deno.env.get("PAYTM_SECRET_KEY") || "secret";

// Generate SHA256 checksum
function generateChecksum(params: any, key: string): string {
  const paramString = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return generateSHA256Checksum(paramString + key);
}

function generateSHA256Checksum(str: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = crypto.subtle.digest("SHA-256", data);
  return hashBuffer.then((buffer) => {
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  });
}

// Initialize Payment
export async function handlePaymentInit(req: Request) {
  const { orderId, amount, customerId, email, phone } = await req.json();

  const params = {
    MID: PAYTM_MID,
    WEBSITE: "WEBSTAGING",
    CHANNEL_ID: "WEB",
    INDUSTRY_TYPE_ID: "Retail",
    ORDER_ID: orderId,
    CUST_ID: customerId,
    EMAIL: email,
    MOBILE_NO: phone,
    TXN_AMOUNT: amount.toFixed(2),
    CALLBACK_URL: "https://your-domain.com/payment-callback",
  };

  const checksum = await generateChecksum(params, PAYTM_SECRET_KEY);

  return {
    ...params,
    CHECKSUMHASH: checksum,
  };
}

serve(async (req) => {
  if (req.method === "POST") {
    try {
      const response = await handlePaymentInit(req);
      return new Response(JSON.stringify(response), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return new Response("Not Found", { status: 404 });
});
```

## Step 5: Frontend Integration

The Paytm integration has been updated in `CheckoutModal.tsx`:

### Payment Flow:

1. **User clicks "Pay with Paytm"**
2. Checkout Modal calls `handlePaytmPayment()`
3. Order details sent to Supabase function
4. Paytm checksum generated on backend
5. Paytm payment form submitted
6. User redirected to Paytm gateway
7. Customer completes payment
8. Paytm redirects to callback URL
9. Order created in database
10. Success confirmation shown

## Step 6: Test Paytm Integration

### Test Credentials:

```
Card: 4111 1111 1111 1111
CVV: 123
Expiry: Any future date
OTP: 123456
```

### Test Amount:

- Any amount between ₹1 to ₹100,000

### Test in Staging Mode:

1. Use `VITE_PAYTM_WEBSITE=WEBSTAGING`
2. Go to checkout
3. Select Paytm
4. Click "Pay ₹XXX with Paytm"
5. Use test card details
6. Complete payment

## Step 7: Deploy to Production

### Update Environment Variables:

1. Go to Hostinger cPanel → Environment Manager
2. Update:

   ```
   VITE_PAYTM_MID=your_production_mid
   VITE_PAYTM_SECRET_KEY=your_production_key
   VITE_PAYTM_WEBSITE=WEBPROD
   ```

3. Rebuild and deploy:
   ```bash
   npm run build
   git add .
   git commit -m "Setup production Paytm payment gateway"
   git push
   ```

## Common Issues & Solutions

### Issue 1: Checksum Mismatch

**Solution:** Ensure secret key is exactly correct (case-sensitive)

### Issue 2: Payment Redirect Not Working

**Solution:** Verify CALLBACK_URL matches your domain

### Issue 3: Order Not Created After Payment

**Solution:** Check callback function in Supabase logs

### Issue 4: "Invalid MID" Error

**Solution:** Ensure MID is from approved merchant account

## Support

- **Paytm Documentation:** https://paytm.com/business/payments
- **Paytm Support:** https://support.paytm.com
- **Test Environment:** https://securegw-stage.paytm.in/

## Next Steps

1. ✅ Set up Paytm business account
2. ✅ Get MID and SECRET_KEY
3. ✅ Add environment variables
4. ✅ Deploy Supabase function
5. ✅ Test in staging mode
6. ✅ Deploy to production

---

**Status:** Ready for integration  
**Last Updated:** Dec 16, 2025

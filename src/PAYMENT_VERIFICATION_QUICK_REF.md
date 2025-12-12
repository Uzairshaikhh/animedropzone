# ⚡ Payment Verification - Quick Reference

## 🎯 At a Glance

**What:** Manual verification system for Razorpay & Paytm payments  
**Why:** Ensure payments are actually received before processing orders  
**Who:** Admin only  
**When:** Within 24 hours of order placement  

---

## 🔄 Workflow (30 seconds)

```
1. New Order Alert → Admin Panel
        ↓
2. See "Payment Verification Required" box
        ↓
3. Check Razorpay/Paytm Dashboard
        ↓
4. Payment Found? → ✅ Verify → Process Order
   Payment Not Found? → ❌ Cancel → Customer Notified
```

---

## 📋 Two Actions Only

### ✅ Payment Received

**When to click:**
- Found payment in dashboard
- Status = "Captured" or "Success"  
- Amount matches order
- All details correct

**What happens:**
- Order marked "Verified"
- Timestamp recorded
- Process order normally

---

### ❌ Payment Not Received

**When to click:**
- Payment not in dashboard
- Status = "Failed"
- Amount doesn't match
- Suspected fraud

**What happens:**
- Enter cancellation reason
- Order cancelled
- Customer auto-notified (email + WhatsApp)
- Admin notified

---

## 🔍 How to Check Payment

### Razorpay (30 seconds)

1. Open: https://dashboard.razorpay.com/
2. Click: Payments
3. Search: Payment ID (e.g., `rzp_abc123`)
4. Check: Status = "Captured" ✅
5. Verify: Amount matches

### Paytm (30 seconds)

1. Open: https://dashboard.paytm.com/
2. Click: Transactions
3. Search: Payment ID or Amount
4. Check: Status = "Success" ✅
5. Verify: Amount matches

---

## ⚠️ Decision Tree

```
Payment verification needed?
        ↓
    Check Dashboard
        ↓
   ┌────┴────┐
   ↓         ↓
  FOUND    NOT FOUND
   ↓         ↓
Status?    Wait 1hr?
   ↓         ↓
Captured  Still Missing?
   ↓         ↓
Amount    Check Again?
Matches?      ↓
   ↓      Still Missing?
  YES        ↓
   ↓       CANCEL
VERIFY
```

---

## 🚨 Common Scenarios

### Scenario 1: Normal Order ✅
```
Payment ID: rzp_abc123
Dashboard: ✅ Found
Status: Captured
Amount: ₹2,500 ✅ Matches

ACTION: Click "Verify Payment Received"
TIME: 30 seconds
```

### Scenario 2: Payment Failed ❌
```
Payment ID: rzp_xyz789
Dashboard: ❌ Not Found
Customer: "I paid!"

ACTION: Wait 1 hour → Check again → Still missing?
        → Click "Cancel Order"
REASON: "Payment not received in Razorpay dashboard"
TIME: 2 minutes
```

### Scenario 3: Amount Mismatch ⚠️
```
Order Total: ₹2,500
Dashboard Payment: ₹2,400

ACTION: Check order breakdown → Coupon applied?
        → If yes: Verify
        → If no: Contact customer
TIME: 5 minutes
```

---

## 💬 Customer Response Templates

### Payment Not Found

```
Hi [Name],

I checked our Razorpay dashboard but couldn't find 
your payment (ID: [Payment ID]).

Could you please provide:
1. Payment screenshot
2. Transaction ID from your bank

This will help us verify and process your order 
immediately.

Response time: 2 hours
```

### Payment Screenshot Received

```
Hi [Name],

Thank you for the screenshot! Let me verify this 
with our payment gateway and get back to you within 
1 hour.

If payment is confirmed, I'll process your order 
right away!
```

---

## ⏱️ Time Guidelines

| Task | Time |
|------|------|
| Check payment dashboard | 30 sec |
| Verify payment | 1 min |
| Cancel order | 2 min |
| Respond to customer | 5 min |
| Total per order | 2-5 min |

---

## 🎯 Daily Checklist

**Morning (9 AM):**
- [ ] Check orders from last 24 hours
- [ ] Verify all Razorpay payments
- [ ] Verify all Paytm payments
- [ ] Cancel failed payment orders
- [ ] Process verified orders

**Evening (6 PM):**
- [ ] Review unverified orders
- [ ] Follow up on pending cases
- [ ] Check customer inquiries

**Time:** 15-30 minutes daily

---

## 🔑 Key Points

✅ **Always check dashboard before clicking**  
✅ **Verify within 24 hours**  
✅ **Payment ID must match exactly**  
✅ **Amount must match order total**  
✅ **Customer auto-notified on cancellation**  

❌ **Never verify without checking dashboard**  
❌ **Never process unverified payments**  
❌ **Never cancel without dashboard confirmation**  
❌ **Never ignore customer payment proofs**  

---

## 📱 Contact

**Payment Issues:**
- Razorpay: 1800-102-7777
- Paytm: business.paytm.com/support

**Admin Email:**
- anime.drop.zone.00@gmail.com

**Dashboard Links:**
- Razorpay: dashboard.razorpay.com
- Paytm: dashboard.paytm.com

---

## 🆘 Quick Help

**Q: Payment ID not found?**
A: Wait 1 hour, check again, then cancel if still missing

**Q: Customer has screenshot?**
A: Verify in dashboard first, then decide

**Q: Amount mismatch?**
A: Check order breakdown for coupons/discounts

**Q: High-value order?**
A: Verify immediately, double-check everything

**Q: Can I undo cancellation?**
A: No, create new order if needed

---

## 🎓 Remember

```
┌─────────────────────────────────────┐
│ GOLDEN RULE                         │
├─────────────────────────────────────┤
│                                     │
│  NO DASHBOARD CHECK                 │
│         ↓                           │
│  NO VERIFICATION                    │
│                                     │
│  ALWAYS verify in payment gateway   │
│  BEFORE clicking any button         │
│                                     │
└─────────────────────────────────────┘
```

---

**Version:** 1.0  
**Last Updated:** Dec 12, 2024  
**Print this page** for quick reference!

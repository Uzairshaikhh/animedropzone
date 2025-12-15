# CartContext Implementation - Quick Test Guide

## How to Test Locally

The app is currently running at **http://localhost:3000/**

### Test 1: Cart Persistence Across Navigation

1. Go to Home page (http://localhost:3000/)
2. Click on any category (e.g., "Figures")
3. Add a product to cart → **Cart should auto-open**
4. Note the product in your cart
5. Click "Home" or browser back button
6. **Cart should still show the product** ✅
7. Click the category again
8. Add another product → **Cart should show both products** ✅

### Test 2: Auto-Open from Different Pages

1. Go to Store page (Category page)
2. Scroll down and find a product
3. Click "Add to Cart" → **Cart should automatically open** ✅
4. Close cart (click X)
5. Go to Product Details page (click any product image)
6. Click "Add to Cart" → **Cart should automatically open again** ✅

### Test 3: Cart Persistence After Browser Refresh

1. Add 2-3 products to cart
2. Refresh page (Cmd+R or Ctrl+R)
3. **Cart items should still be there** ✅
4. Open browser DevTools > Application > Local Storage
5. Look for key: `animedropzone_cart`
6. **Should see your cart items as JSON** ✅

### Test 4: Cart Survives Complete Browser Restart

1. Add some products to cart
2. Close browser completely
3. Reopen browser and navigate to http://localhost:3000/
4. **Cart items should still be there** ✅

### Test 5: Cart Updates Work Correctly

1. Add a product to cart
2. Open cart
3. Increase quantity (click + button)
4. Navigate to another page
5. Navigate back
6. **Quantity should still be increased** ✅
7. Remove the product
8. Navigate to another page
9. Navigate back
10. **Product should be removed from cart** ✅

### Test 6: Clear on Checkout

1. Add products to cart
2. Click "Checkout"
3. Login (or create account)
4. Fill in address and payment info
5. Complete payment (use test card: 4111 1111 1111 1111)
6. Order placed successfully
7. **Cart should be empty** ✅
8. Go back to shop and add products
9. **New products should add to empty cart** ✅

## Expected Behavior

### Cart Auto-Opens When:

- ✅ Adding from Store page
- ✅ Adding from Category page
- ✅ Adding from Product Details page
- ✅ Adding from Wishlist

### Cart Persists When:

- ✅ Navigating between pages
- ✅ Refreshing page
- ✅ Closing and reopening browser
- ✅ Closing and reopening browser tab

### Cart Clears When:

- ✅ Completing a successful checkout
- ✅ User manually clicks "Clear Cart" (if implemented)

### Cart Data Syncs:

- ✅ Immediately in localStorage
- ✅ Across all pages in real-time
- ✅ Across multiple browser tabs (same domain)

## Checking localStorage in Browser

1. Open DevTools (F12 or Cmd+Option+I)
2. Go to "Application" tab
3. Expand "Local Storage" on left
4. Click "http://localhost:3000"
5. Look for `animedropzone_cart` key
6. Value should be a JSON array like:

```json
[
  {
    "id": "prod-123",
    "name": "Dragon Ball Figure",
    "price": 1299,
    "quantity": 2,
    "image": "...",
    "category": "figures"
  },
  {
    "id": "prod-456",
    "name": "Naruto Poster",
    "price": 299,
    "quantity": 1,
    "image": "...",
    "category": "posters"
  }
]
```

## Common Test Scenarios

### Scenario 1: Mobile User Experience

- Cart should work on mobile devices
- Auto-open should work on touch devices
- Swipe to close cart should work

### Scenario 2: Multi-Tab Sync

- Open app in 2 browser tabs
- Add product in Tab 1
- **Tab 2 might not update automatically** (StorageEvent only fires between tabs)
- Refresh Tab 2 → **Cart items appear** ✅

### Scenario 3: Fast Navigation

- Add product
- Immediately navigate to another page
- **Cart should not lose data** ✅

### Scenario 4: Logout & Login

- Add products to cart
- Logout
- Login again
- **Cart items should still be there** ✅
- Checkout as new user with same products

## Troubleshooting

### Cart Items Not Persisting?

1. Check browser localStorage is enabled
2. Open DevTools and check `animedropzone_cart` key
3. Reload page to see if items reappear
4. Check browser console for errors (F12 > Console tab)

### Cart Not Auto-Opening?

1. Check console for JavaScript errors
2. Verify `setIsCartOpen(true)` is being called
3. Check if cart component has `isCartOpen` prop
4. Try refreshing page and adding product again

### Multiple Carts Appearing?

1. This shouldn't happen with CartContext
2. Clear all localStorage and refresh page
3. Report issue if persists

## Performance Notes

✅ **What's Good**

- localStorage is fast and persistent
- Cart context updates instantly
- No server calls needed for cart operations
- Page navigation is smooth

⚠️ **What to Watch**

- localStorage has ~5-10MB limit (cart only uses ~1KB)
- Syncing between tabs happens on StorageEvent
- Cart data is stored locally and not synced to server

## Next Steps After Testing

1. ✅ Test all scenarios above
2. ✅ Verify cart works on mobile
3. ✅ Deploy to production (Hostinger)
4. ✅ Monitor production for any issues
5. ✅ Gather user feedback

---

**Current Build**: Commit `5201ed7` - "Add comprehensive CartContext implementation documentation"
**Status**: Ready for production testing
**Last Updated**: December 2024

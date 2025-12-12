# 🔐 Admin Panel Access Guide

## 🎯 **How to Access Your Admin Panel**

Your admin panel is **completely hidden** from regular users. Only you (the admin) can access it using the secret URL below.

---

## 🌐 **Secret Admin URL**

### **Local Development:**
```
http://localhost:5173/secret-admin-panel-7b2cbf
```

### **Production (After Deployment):**
```
https://your-domain.com/secret-admin-panel-7b2cbf
```

---

## 🔑 **Login Credentials**

When you access the admin panel, you'll see a login screen. Use these credentials:

**User ID:** `admin`  
**Password:** `admin123`

> ⚠️ **IMPORTANT:** Change these default credentials immediately after first login by updating the server code!

---

## 🛡️ **Security Features**

### ✅ **What's Protected:**

1. **Hidden URL** - No visible links to admin panel anywhere on the website
2. **Login Required** - Must enter username and password
3. **Session-Based** - Stay logged in during your session
4. **Direct Access Only** - Can only be accessed by typing the exact URL

### 🔒 **Security Tips:**

1. **Bookmark the URL** - Save it in your browser bookmarks for easy access
2. **Don't Share** - Never share the admin URL with customers
3. **Use Incognito** - When testing, use incognito mode to verify users can't access it
4. **Change Credentials** - Update the default admin credentials (see below)

---

## 🔧 **How to Change Admin Credentials**

To change your admin username and password:

1. Open the file: `/supabase/functions/server/index.tsx`
2. Search for the login endpoint (around line 119)
3. Find this code:
```typescript
// Admin login endpoint
app.post('/make-server-95a96d8e/admin/login', async (c) => {
  try {
    const { userId, password } = await c.req.json();

    // Check credentials (change these!)
    if (userId === 'admin' && password === 'admin123') {
      return c.json({ success: true });
    }
```

4. Change `'admin'` and `'admin123'` to your desired credentials:
```typescript
if (userId === 'your-new-username' && password === 'your-new-secure-password') {
```

5. Save the file (the server will auto-reload)

---

## 🚀 **Quick Access Methods**

### **Method 1: Browser Bookmark**
1. Go to the secret admin URL
2. Press `Ctrl+D` (Windows) or `Cmd+D` (Mac)
3. Save bookmark with a secret name like "Dashboard" or "Control Panel"

### **Method 2: Browser Home Page**
Set your browser's home page to the admin URL so it opens automatically

### **Method 3: Mobile Shortcut**
On mobile, add the URL to your home screen for quick access

---

## 🎨 **How to Change the Secret URL**

Want a different secret URL? Here's how:

1. Open `/App.tsx`
2. Find this line:
```tsx
<Route path="/secret-admin-panel-7b2cbf" element={<AdminPage />} />
```

3. Change it to anything you want:
```tsx
<Route path="/my-custom-secret-admin" element={<AdminPage />} />
```

Your new admin URL will be:
```
https://your-domain.com/my-custom-secret-admin
```

---

## 📱 **Admin Panel Features**

Once logged in, you can manage:

- ✅ **Products** - Add, edit, delete products
- ✅ **Orders** - View and update order status
- ✅ **Payments** - Track payments and record COD collections
- ✅ **Coupons** - Create and manage discount codes
- ✅ **Custom Clothing** - Manage custom clothing requests
- ✅ **Support Tickets** - Respond to customer inquiries
- ✅ **Categories** - Manage product categories
- ✅ **Wallpapers** - Update hero section wallpapers
- ✅ **Email Setup** - Configure email notifications

---

## 🆘 **Troubleshooting**

### **Can't Access Admin Panel?**
- ✅ Make sure you're using the correct secret URL
- ✅ Clear browser cache and cookies
- ✅ Try incognito/private browsing mode
- ✅ Check for typos in the URL

### **Login Not Working?**
- ✅ Verify credentials are correct (default: `admin` / `admin123`)
- ✅ Check browser console for errors (F12 → Console tab)
- ✅ Make sure server is running

### **Logged Out Unexpectedly?**
- ✅ Login session expires when you close the browser
- ✅ Just log in again using the same credentials

---

## ⚡ **Pro Tips**

1. **Use Strong Password** - Change default credentials to something secure
2. **Different Devices** - You can access admin panel from any device
3. **Multiple Tabs** - You can open admin panel in multiple browser tabs
4. **Auto-Save** - Most changes save automatically, but watch for confirmation messages
5. **Test Changes** - After making changes, check the main website to verify

---

## 🎯 **Summary**

Your admin panel is now **completely hidden** from users! Here's what you need to remember:

✅ **Access URL:** `https://your-domain.com/secret-admin-panel-7b2cbf`  
✅ **Username:** `admin`  
✅ **Password:** `admin123`  
✅ **Bookmark It:** Save the URL in your browser  
✅ **Keep It Secret:** Don't share the URL with anyone  

**That's it! Your admin panel is secure and hidden from the public!** 🎉

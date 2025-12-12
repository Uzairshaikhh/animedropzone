# 📁 AnimeDrop Zone - Complete Project Structure

## ✅ Organized & Production-Ready

---

## 📊 Project Overview

```
animedropzone/
├── 🎨 Frontend (Client-Side)
├── ⚙️ Backend (Server-Side)
├── 🔧 Configuration Files
├── 📚 Documentation
└── 🌐 Public Assets
```

---

## 🎨 FRONTEND STRUCTURE

### **React Components & Pages**

```
📁 Frontend Files
├── App.tsx                           # Main app entry point
│
├── 📁 components/                    # Reusable components
│   ├── 🛍️ Store Components
│   │   ├── Navbar.tsx               # Navigation bar
│   │   ├── Hero.tsx                 # Hero section
│   │   ├── CategoryCard.tsx         # Category display
│   │   ├── ProductCard.tsx          # Product display
│   │   ├── Footer.tsx               # Footer
│   │   └── Logo.tsx                 # Site logo
│   │
│   ├── 🛒 Shopping Components
│   │   ├── Cart.tsx                 # Shopping cart
│   │   ├── Wishlist.tsx             # Wishlist feature
│   │   ├── CheckoutModal.tsx        # Checkout process
│   │   └── OrderSuccessModal.tsx    # Order confirmation
│   │
│   ├── 👤 User Components
│   │   ├── UserAuth.tsx             # Login/Signup
│   │   ├── UserManagement.tsx       # User admin panel
│   │   └── LoyaltyProgram.tsx       # Loyalty rewards
│   │
│   ├── 🎫 Product Features
│   │   ├── ProductDetailModal.tsx   # Product details
│   │   ├── ProductReviews.tsx       # Review system
│   │   ├── ProductRecommendations.tsx # AI recommendations
│   │   └── SubcategoryModal.tsx     # Subcategory selection
│   │
│   ├── 👔 Custom Products
│   │   ├── CustomClothingModal.tsx  # Custom clothing orders
│   │   └── CustomClothingManagement.tsx # Admin management
│   │
│   ├── 🎫 Coupons & Discounts
│   │   └── CouponManagement.tsx     # Coupon admin
│   │
│   ├── 💳 Payment Components
│   │   ├── PaymentIntegration.tsx   # Payment gateway
│   │   ├── PaymentManagement.tsx    # Payment verification
│   │   └── PaymentSettingsManagement.tsx # Payment config
│   │
│   ├── 🔔 Notifications
│   │   └── Toast.tsx                # Toast notifications
│   │
│   ├── 📧 Email & Newsletter
│   │   ├── NewsletterSubscribe.tsx  # Newsletter signup
│   │   ├── NewsletterManagement.tsx # Newsletter admin
│   │   └── EmailSetup.tsx           # Email configuration
│   │
│   ├── 📞 Support & Contact
│   │   ├── ContactUs.tsx            # Contact form
│   │   ├── AboutUs.tsx              # About section
│   │   └── AdminSupport.tsx         # Support ticket admin
│   │
│   ├── 📊 Admin Panel Components
│   │   ├── AdminPanel.tsx           # Main admin panel
│   │   ├── AdminLogin.tsx           # Admin authentication
│   │   ├── Analytics.tsx            # Analytics dashboard
│   │   ├── InventoryAlerts.tsx      # Low stock alerts
│   │   ├── BulkOperations.tsx       # Bulk product operations
│   │   ├── AdvancedSearch.tsx       # Advanced search
│   │   ├── CategoryManagement.tsx   # Category admin
│   │   ├── WallpaperManagement.tsx  # Hero wallpaper admin
│   │   ├── LegalContentManagement.tsx # Legal pages admin
│   │   └── ReturnManagement.tsx     # Returns admin
│   │
│   ├── 🎨 UI Components (shadcn/ui)
│   │   └── 📁 ui/                   # Reusable UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── toast.tsx
│   │       └── ... (30+ components)
│   │
│   ├── 🎭 Visual Effects
│   │   ├── FloatingParticles.tsx    # Particle effects
│   │   ├── CherryBlossomTree.tsx    # Cherry blossom animation
│   │   └── Favicon.tsx              # Dynamic favicon
│   │
│   └── 🖼️ Figma Components
│       └── ImageWithFallback.tsx    # Image component
│
├── 📁 pages/                         # Page components
│   ├── Store.tsx                     # Main store page
│   ├── ProductPage.tsx               # Individual product page
│   ├── CategoryPage.tsx              # Category listing page
│   ├── Admin.tsx                     # Admin panel page
│   ├── MyOrders.tsx                  # Customer orders page
│   ├── MyProfileEnhanced.tsx         # User profile page
│   ├── TrackOrder.tsx                # Order tracking page
│   ├── PrivacyPolicy.tsx             # Privacy policy page
│   ├── TermsOfService.tsx            # Terms of service page
│   ├── ForgotPassword.tsx            # Password reset request
│   ├── ResetPassword.tsx             # Password reset form
│   ├── ApproveQuote.tsx              # Custom quote approval
│   ├── EmailTest.tsx                 # Email testing page
│   ├── ServerTest.tsx                # Server testing page
│   └── TestQuoteEmail.tsx            # Quote email testing
│
├── 📁 contexts/                      # React contexts
│   └── ToastContext.tsx              # Toast notification context
│
├── 📁 utils/                         # Utility functions
│   └── 📁 supabase/
│       ├── client.ts                 # Supabase client
│       └── info.tsx                  # Supabase config
│
└── 📁 styles/                        # Styling
    └── globals.css                   # Global styles & Tailwind
```

---

## ⚙️ BACKEND STRUCTURE

### **Supabase Edge Functions**

```
📁 Backend Files
└── 📁 supabase/
    └── 📁 functions/
        └── 📁 server/                # Main server directory
            ├── index.tsx             # 🌐 Main server entry point
            │   ├── Routes:
            │   │   ├── GET  /make-server-95a96d8e/health
            │   │   ├── POST /make-server-95a96d8e/orders
            │   │   ├── GET  /make-server-95a96d8e/orders
            │   │   ├── POST /make-server-95a96d8e/coupons
            │   │   ├── GET  /make-server-95a96d8e/legal-content
            │   │   └── ... (all API routes)
            │
            ├── kv_store.tsx          # 🔒 Key-Value database utils
            │   └── Protected file - DO NOT EDIT
            │
            ├── email-service.tsx     # 📧 Email service
            │   ├── Send order confirmations
            │   ├── Send signup emails
            │   ├── Send support notifications
            │   └── Hostinger SMTP integration
            │
            └── payments.tsx          # 💳 Payment processing
                ├── Razorpay integration
                ├── Paytm integration
                └── Payment verification
```

### **Server Architecture**

```
Frontend (Browser)
        ↓
    [API Call]
        ↓
Supabase Edge Function
        ↓
Hono Web Server (index.tsx)
        ↓
    ┌─────────────┬──────────────┐
    ↓             ↓              ↓
kv_store.tsx  email-service  payments.tsx
    ↓             ↓              ↓
Database      Email API      Payment API
```

---

## 🔧 CONFIGURATION FILES

### **Root Level Config**

```
📁 Configuration Files
├── netlify.toml                      # 🌐 Netlify deployment config
│   ├── Build settings
│   ├── Redirect rules
│   └── Security headers
│
├── package.json                      # 📦 NPM dependencies
├── tsconfig.json                     # 🔧 TypeScript config
├── vite.config.ts                    # ⚡ Vite build config
├── tailwind.config.js                # 🎨 Tailwind CSS config
└── .gitignore                        # 🚫 Git ignore rules
```

---

## 🌐 PUBLIC ASSETS

### **Public Directory**

```
📁 public/                            # Static assets
├── _redirects                        # 🔄 Netlify SPA routing
├── favicon.ico                       # 🎯 Site favicon (if exists)
├── robots.txt                        # 🤖 SEO robots file (if exists)
└── ... (other static files)
```

**Important:** Vite automatically copies everything from `/public` to `/dist` during build.

---

## 📚 DOCUMENTATION FILES

### **Root Level Documentation**

```
📁 Documentation (Root)
├── 📖 Setup & Deployment
│   ├── NETLIFY_DEPLOYMENT_GUIDE.md
│   ├── NETLIFY_QUICK_FIX.md
│   ├── NETLIFY_VISUAL_GUIDE.md
│   ├── PRODUCTION_READINESS_CHECKLIST.md
│   └── PROJECT_STRUCTURE.md         # ← This file
│
├── 💳 Payment System
│   ├── PAYMENT_VERIFICATION_GUIDE.md
│   ├── PAYMENT_INTEGRATION_GUIDE.md
│   ├── COMPLETE_PAYMENT_INTEGRATION_SUMMARY.md
│   └── PAYMENT_CHANGES_COMPLETE.md
│
├── 📧 Email System
│   ├── HOSTINGER_EMAIL_SETUP.md
│   ├── EMAIL_SETUP_GUIDE.md
│   ├── MAILERSEND_CUSTOM_DOMAIN_SETUP.md
│   └── ELASTIC_EMAIL_REMOVAL.md
│
├── 📱 WhatsApp Integration
│   ├── WHATSAPP_NOTIFICATIONS_GUIDE.md
│   ├── WHATSAPP_QUICK_SUMMARY.md
│   └── WHATSAPP_UPDATED_SIMPLE.md
│
├── 🛒 Checkout & Orders
│   ├── CHECKOUT_IMPROVEMENTS_SUMMARY.md
│   ├── CUSTOMER_CHECKOUT_GUIDE.md
│   └── ORDER_SUCCESS_MODAL_DOCS.md
│
├── 🔐 Admin Panel
│   ├── ADMIN_PANEL_REFERENCE.md
│   ├── ADMIN_PANEL_VISUAL_GUIDE.md
│   ├── ADMIN_SECURITY_SUMMARY.md
│   └── QUICK_ADMIN_ACCESS.md
│
├── ⚡ Features
│   ├── ADVANCED_FEATURES_SUMMARY.md
│   ├── LEGAL_CONTENT_MANAGEMENT_SYSTEM.md
│   ├── TOAST_NOTIFICATIONS_SUMMARY.md
│   └── FAVICON_DOCUMENTATION.md
│
└── 🧪 Testing & Fixes
    ├── TESTING_GUIDE.md
    ├── FIXES_SUMMARY.md
    └── ALL_FIXES_TODAY.md
```

---

## 🚀 BUILD & DEPLOY FLOW

### **Development → Production**

```
1. Development (Local)
   ├── npm run dev
   ├── Vite dev server starts
   ├── Hot reload enabled
   └── Access: http://localhost:5173

2. Build (Generate Production Files)
   ├── npm run build
   ├── Vite compiles TypeScript → JavaScript
   ├── Tailwind CSS processes styles
   ├── Files copied from /public to /dist
   └── Output: /dist directory

3. Deploy (Netlify)
   ├── git push origin main
   ├── Netlify detects push
   ├── Runs: npm run build
   ├── Publishes: /dist directory
   ├── Applies: netlify.toml config
   ├── Applies: /public/_redirects rules
   └── Site live: https://your-site.netlify.app
```

---

## 📂 File Organization Rules

### **Frontend Files:**

✅ **Location:** Root level (App.tsx, components/, pages/, styles/)  
✅ **Purpose:** User interface, client-side logic  
✅ **Runs on:** Browser  
✅ **Can import:** Other frontend files, utils, contexts  
❌ **Cannot import:** Backend files (supabase/functions/server/)

### **Backend Files:**

✅ **Location:** /supabase/functions/server/  
✅ **Purpose:** API routes, database operations, email sending  
✅ **Runs on:** Supabase Edge (Deno runtime)  
✅ **Can import:** Other backend files in same directory  
❌ **Cannot import:** Frontend components  
❌ **Cannot import:** Files outside /supabase/functions/server/

### **Protected Files (DO NOT EDIT):**

```
🔒 /supabase/functions/server/kv_store.tsx
🔒 /utils/supabase/info.tsx
🔒 /components/figma/ImageWithFallback.tsx
```

---

## 🗂️ Where Things Go

### **Adding New Features:**

| Feature Type | Location | Example |
|--------------|----------|---------|
| New page | `/pages/` | `NewPage.tsx` |
| New component | `/components/` | `NewFeature.tsx` |
| New API route | `/supabase/functions/server/index.tsx` | Add route in main server |
| New utility | `/utils/` | `helpers.ts` |
| New style | `/styles/globals.css` | Add CSS |
| Static asset | `/public/` | `logo.png` |
| Documentation | Root | `FEATURE_GUIDE.md` |

### **File Naming Conventions:**

```
✅ Components: PascalCase.tsx
   Example: ProductCard.tsx, CheckoutModal.tsx

✅ Pages: PascalCase.tsx
   Example: Store.tsx, Admin.tsx

✅ Utils: camelCase.ts or kebab-case.ts
   Example: helpers.ts, api-client.ts

✅ Styles: kebab-case.css
   Example: globals.css, custom-styles.css

✅ Docs: SCREAMING_SNAKE_CASE.md
   Example: SETUP_GUIDE.md, API_REFERENCE.md
```

---

## 🌐 Netlify Deployment Files

### **Critical Files for Netlify:**

```
1. /netlify.toml
   └── Build & redirect configuration

2. /public/_redirects
   └── SPA routing fallback

3. package.json
   └── Dependencies & build scripts

4. Environment Variables (Set in Netlify Dashboard)
   ├── VITE_SUPABASE_URL
   ├── VITE_SUPABASE_ANON_KEY
   └── VITE_RAZORPAY_KEY_ID
```

### **Deployment Checklist:**

- [x] `netlify.toml` exists in root
- [x] `_redirects` exists in `/public`
- [x] Build command: `npm run build`
- [x] Publish directory: `dist`
- [ ] Environment variables set in Netlify
- [ ] Git repository connected

---

## 🔄 Data Flow

### **Frontend → Backend → Database**

```
1. User Action (Frontend)
   └── Example: Add to cart, checkout, place order

2. API Call (Frontend)
   └── fetch('https://project.supabase.co/functions/v1/make-server-95a96d8e/route')

3. Server Processing (Backend)
   └── index.tsx receives request
       └── Processes data
           └── Calls kv_store.tsx for database
               └── Returns response

4. Update UI (Frontend)
   └── Display result to user
```

---

## 📊 Database Structure

### **Key-Value Store:**

```
Table: kv_store_95a96d8e

Used for storing:
├── 🛍️ Products
├── 📦 Orders
├── 👤 User data (via Supabase Auth)
├── 🎫 Coupons
├── 📂 Categories
├── 🖼️ Wallpapers
├── 📧 Newsletter subscribers
├── 🎫 Support tickets
├── ⭐ Reviews
├── 💳 Payment settings
└── ... (all app data)

Access via:
└── /supabase/functions/server/kv_store.tsx
    ├── get(key)
    ├── set(key, value)
    ├── mget(keys)
    ├── mset(entries)
    ├── del(key)
    └── getByPrefix(prefix)
```

---

## 🎯 Environment Variables

### **Frontend (.env or Netlify Dashboard):**

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_live_xxx or rzp_test_xxx
```

### **Backend (Supabase Dashboard → Edge Functions → Secrets):**

```env
# Supabase (Auto-provided)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email Service (Hostinger)
HOSTINGER_EMAIL=your-email@domain.com
HOSTINGER_PASSWORD=your-app-password

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Other
ADMIN_EMAIL=your-admin@email.com
FRONTEND_URL=https://your-site.netlify.app
```

---

## 🧪 Testing Structure

### **Test Files (If Exists):**

```
📁 tests/ (optional)
├── unit/
│   ├── components.test.tsx
│   └── utils.test.ts
│
├── integration/
│   └── api.test.ts
│
└── e2e/
    └── checkout.test.ts
```

---

## 🎨 Styling Architecture

### **Tailwind CSS + Custom Styles:**

```
/styles/globals.css
├── @tailwind base
├── @tailwind components
├── @tailwind utilities
├── Custom CSS variables (colors, spacing)
├── Typography defaults
└── Component-specific styles

Theme:
├── Primary: Purple (#9333ea)
├── Secondary: Pink
├── Accent: Black
└── Background: Gradient purple/black
```

---

## 📦 Dependencies Overview

### **Main Libraries:**

```json
{
  "dependencies": {
    "react": "Latest",
    "react-router-dom": "Routing",
    "motion": "Animations (Framer Motion)",
    "lucide-react": "Icons",
    "recharts": "Charts (analytics)",
    "@supabase/supabase-js": "Database client",
    "tailwindcss": "Styling",
    "vite": "Build tool"
  }
}
```

---

## 🔐 Security Considerations

### **Protected Data:**

```
✅ Never commit to Git:
   ├── .env (local environment variables)
   ├── .env.local
   ├── node_modules/
   └── dist/

✅ Store securely:
   ├── API keys → Environment variables
   ├── Passwords → Never in code
   └── Secrets → Supabase/Netlify dashboard

❌ Never expose:
   ├── SUPABASE_SERVICE_ROLE_KEY (backend only)
   ├── Email passwords
   ├── Payment secret keys
   └── Twilio auth tokens
```

---

## 🎯 Quick Reference

### **Common Commands:**

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Deployment
git add .                # Stage changes
git commit -m "message"  # Commit changes
git push                 # Deploy to Netlify (auto)

# Netlify CLI (optional)
netlify deploy --prod    # Manual deploy
netlify open             # Open dashboard
```

### **Important URLs:**

```
Development:  http://localhost:5173
Production:   https://your-site.netlify.app
Admin Panel:  /secret-admin-panel-7b2cbf
```

---

## ✅ Project Structure Summary

```
✅ Frontend: React components, pages, styles (root level)
✅ Backend: Supabase Edge Functions (supabase/functions/server/)
✅ Config: netlify.toml, package.json (root level)
✅ Public: Static assets, _redirects (public/)
✅ Docs: Comprehensive guides (root level)
✅ Database: Supabase PostgreSQL + KV Store
✅ Deployment: Netlify (automatic from Git)
✅ Email: Hostinger SMTP
✅ WhatsApp: Twilio API
✅ Payments: Razorpay + Paytm + COD
```

---

## 🎉 You're All Set!

Your project is properly organized with:
- ✅ Clear frontend/backend separation
- ✅ Proper configuration files
- ✅ Comprehensive documentation
- ✅ Production-ready structure
- ✅ Scalable architecture

**Happy coding!** 🚀

---

**Last Updated:** December 12, 2024  
**Version:** 3.0  
**Status:** ✅ Production Ready  
**Structure:** ✅ Fully Organized

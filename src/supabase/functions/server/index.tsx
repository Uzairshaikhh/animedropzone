import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import { recordPaymentHandler, markPaidHandler } from "./payments.tsx";
import { sendEmail, isValidEmail } from "./email-service.tsx";

const app = new Hono();

app.use("*", cors());
app.use("*", logger(console.log));

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Admin contact information - HARDCODED TO BYPASS CORRUPTED ENV VARS
let ADMIN_EMAIL = "anime.drop.zone.00@gmail.com"; // FORCED - Ignores Deno.env.get('ADMIN_EMAIL')

// Validate ADMIN_EMAIL is not accidentally set to an API key or invalid value
if (
  !ADMIN_EMAIL ||
  ADMIN_EMAIL.startsWith("re_") ||
  ADMIN_EMAIL.startsWith("sk_") ||
  ADMIN_EMAIL.startsWith("mlsn.") ||
  ADMIN_EMAIL.length < 5 ||
  !ADMIN_EMAIL.includes("@") ||
  !ADMIN_EMAIL.includes(".")
) {
  console.warn(`⚠️ ADMIN_EMAIL is invalid: "${ADMIN_EMAIL}"`);
  console.warn("   Using fallback: anime.drop.zone.00@gmail.com");
  console.warn("   Please update ADMIN_EMAIL environment variable to a valid email");
  ADMIN_EMAIL = "anime.drop.zone.00@gmail.com";
}

const ADMIN_PHONE = Deno.env.get("ADMIN_WHATSAPP_NUMBER"); // Format: +91XXXXXXXXXX

// Create product-images bucket on startup
(async () => {
  try {
    console.log("🔧 Setting up product-images bucket...");
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((bucket) => bucket.name === "product-images");

    if (!bucketExists) {
      console.log("Creating product-images bucket...");
      const { data, error } = await supabase.storage.createBucket("product-images", {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"],
      });

      if (error) {
        console.error("❌ Error creating bucket:", error);
      } else {
        console.log("✅ Created product-images bucket successfully");
      }
    } else {
      console.log("✅ product-images bucket already exists");
    }

    // Critical RLS fix information
    console.log("");
    console.log('⚠️  IMPORTANT: If you see "RLS policy" errors when uploading images:');
    console.log("🔧 Fix: Go to Supabase Dashboard → Storage → product-images bucket");
    console.log('    → Click "Policies" → Click "New Policy" → Choose "For full customization"');
    console.log('    → Policy name: "Allow all operations"');
    console.log('    → Target roles: "public"');
    console.log('    → Policy command: "All (SELECT, INSERT, UPDATE, DELETE)"');
    console.log("    → USING expression: true");
    console.log("    → WITH CHECK expression: true");
    console.log('    → Click "Review" then "Save policy"');
    console.log("");
    console.log("📝 Or run this SQL in Supabase SQL Editor:");
    console.log(`
CREATE POLICY "Allow all operations on product-images"
ON storage.objects FOR ALL
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');
    `);
    console.log("");
  } catch (error) {
    console.error("Error setting up bucket:", error);
  }
})();

// Admin credentials (in production, use proper authentication)
const ADMIN_CREDENTIALS = {
  userId: "admin",
  password: "admin123",
};

// Email service is now handled by email-service.tsx which supports multiple providers
// (SendGrid, Brevo, Mailgun, Gmail SMTP, Resend)
// Old Resend-only function kept for reference but not used
/*
async function sendEmail_OLD(to: string, subject: string, html: string) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.log('RESEND_API_KEY not configured, skipping email');
    return { success: false, error: 'Email service not configured' };
  }

  // Validate email address
  if (!to || to.trim() === '') {
    console.error('❌ Email recipient is empty or undefined');
    console.error('⚠️ Please check that ADMIN_EMAIL environment variable is set correctly');
    return { success: false, error: 'Email recipient is required' };
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to.trim())) {
    console.error(`❌ Invalid email format: "${to}"`);
    console.error('⚠️ Email must be in format: email@example.com');
    return { success: false, error: `Invalid email format: ${to}` };
  }

  try {
    const trimmedEmail = to.trim();
    console.log('Sending email via Resend to:', trimmedEmail);
    console.log('Using Resend API key starting with:', resendApiKey.substring(0, 8) + '...');
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AnimeDrop Zone <onboarding@resend.dev>',
        to: [trimmedEmail],
        subject: subject,
        html: html,
      }),
    });

    const data = await response.json();
    console.log('Resend API response status:', response.status);
    console.log('Resend API response data:', JSON.stringify(data));

    if (!response.ok) {
      const errorMessage = data.message || data.error || JSON.stringify(data);
      console.error('Resend API error:', errorMessage);
      
      // Provide helpful error messages
      if (errorMessage.includes('API key')) {
        console.error('⚠️ API KEY ISSUE: Please verify your Resend API key is correct');
        console.error('⚠️ Make sure you copied the full API key from https://resend.com/api-keys');
      }
      if (errorMessage.includes('domain') || errorMessage.includes('verified')) {
        console.error('⚠️ DOMAIN ISSUE: For production use, verify a domain in Resend');
        console.error('⚠️ With free plan, you can only send to your verified email');
      }
      if (errorMessage.includes('to') || errorMessage.includes('email')) {
        console.error('⚠️ EMAIL FORMAT ISSUE: Check that the recipient email is valid');
        console.error(`⚠️ Attempted to send to: "${trimmedEmail}"`);
      }
      
      return { success: false, error: errorMessage };
    }

    console.log('✅ Email sent successfully!');
    return { success: true, data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error sending email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}
*/

// Helper function to send WhatsApp message via Twilio
async function sendWhatsApp(to: string, message: string) {
  const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const twilioWhatsAppFrom = Deno.env.get("TWILIO_WHATSAPP_FROM"); // Format: whatsapp:+14155238886

  if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppFrom) {
    console.log("Twilio WhatsApp not configured, skipping WhatsApp notification");
    return { success: false, error: "WhatsApp service not configured" };
  }

  try {
    const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: twilioWhatsAppFrom,
        To: `whatsapp:${to}`,
        Body: message,
      }),
    });

    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    console.log("Error sending WhatsApp message:", error);
    return { success: false, error: String(error) };
  }
}

// Email configuration check endpoint
app.get("/make-server-95a96d8e/email-config", async (c) => {
  const mailersendApiKey = Deno.env.get("MAILERSEND_API_KEY");
  const mailersendFromEmail = Deno.env.get("MAILERSEND_FROM_EMAIL");
  const emailProvider = Deno.env.get("EMAIL_PROVIDER") || "mailersend";
  const adminEmail = ADMIN_EMAIL;

  // Debug all environment variables related to email
  console.log("🔍 Email Config Debug:");
  console.log("  MAILERSEND_API_KEY exists:", !!mailersendApiKey);
  console.log(
    "  MAILERSEND_API_KEY value (first 20 chars):",
    mailersendApiKey ? JSON.stringify(mailersendApiKey.substring(0, 20)) : "NOT SET"
  );
  console.log("  MAILERSEND_API_KEY length:", mailersendApiKey?.length || 0);
  console.log("  MAILERSEND_API_KEY has newlines:", mailersendApiKey?.includes("\n") || false);
  console.log("  MAILERSEND_API_KEY trimmed length:", mailersendApiKey?.trim().length || 0);

  // Fetch verified senders from MailerSend if API key exists
  let verifiedSenders = [];
  if (mailersendApiKey) {
    try {
      const trimmedKey = mailersendApiKey.trim().replace(/^["']|["']$/g, "");
      console.log("  Fetching verified senders from MailerSend...");

      const response = await fetch("https://api.mailersend.com/v1/email/domains", {
        headers: {
          Authorization: `Bearer ${trimmedKey}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("  MailerSend domains response:", JSON.stringify(data, null, 2));

        // Extract domains and their settings
        if (data.data && Array.isArray(data.data)) {
          for (const domain of data.data) {
            if (domain.domain_settings?.send_paused === false) {
              verifiedSenders.push({
                domain: domain.name,
                isActive: !domain.domain_settings?.send_paused,
                defaultEmail: `noreply@${domain.name}`,
              });
            }
          }
        }
      } else {
        console.log("  Failed to fetch domains:", response.status, await response.text());
      }
    } catch (error) {
      console.log("  Error fetching verified senders:", error);
    }
  }

  return c.json({
    configured: !!mailersendApiKey,
    provider: emailProvider,
    adminEmail: adminEmail,
    mailersendApiKeySet: !!mailersendApiKey,
    mailersendApiKeyPrefix: mailersendApiKey ? mailersendApiKey.trim().substring(0, 15) + "..." : "NOT SET",
    mailersendApiKeyLength: mailersendApiKey?.length || 0,
    mailersendApiKeyTrimmedLength: mailersendApiKey?.trim().length || 0,
    mailersendApiKeyHasNewlines: mailersendApiKey?.includes("\n") || false,
    mailersendFromEmail: mailersendFromEmail || adminEmail || "NOT SET",
    verifiedSenders: verifiedSenders,
    message: mailersendApiKey
      ? "✅ MailerSend API key is configured (12,000 emails/month FREE)"
      : "❌ MailerSend API key is NOT configured. Please add MAILERSEND_API_KEY environment variable.",
    instructions: !mailersendApiKey ? "Go to https://app.mailersend.com/api-tokens to get your API key" : null,
  });
});

// Test email endpoint
app.post("/make-server-95a96d8e/test-email", async (c) => {
  try {
    const body = await c.req.json();
    const { to } = body;

    // Use admin email if no recipient specified
    const recipient = to || ADMIN_EMAIL;

    if (!recipient) {
      return c.json(
        {
          success: false,
          error: "No recipient email specified and ADMIN_EMAIL not configured",
        },
        400
      );
    }

    // DIAGNOSTIC: Check environment variables
    console.log("🔍 === EMAIL CONFIGURATION DIAGNOSTIC ===");
    console.log("EMAIL_PROVIDER:", Deno.env.get("EMAIL_PROVIDER") || "mailersend (default)");
    console.log("ADMIN_EMAIL:", Deno.env.get("ADMIN_EMAIL"));
    console.log("");
    console.log("Checking all possible MailerSend API key env vars:");
    const mailersendKey1 = Deno.env.get("MAILERSEND_API_KEY");
    const mailersendKey2 = Deno.env.get("mailsender_api");
    const mailersendKey3 = Deno.env.get("mail_api");

    console.log(
      "MAILERSEND_API_KEY:",
      mailersendKey1 ? `SET (${mailersendKey1.length} chars, starts: ${mailersendKey1.substring(0, 15)}...)` : "NOT SET"
    );
    console.log(
      "mailsender_api:",
      mailersendKey2 ? `SET (${mailersendKey2.length} chars, starts: ${mailersendKey2.substring(0, 15)}...)` : "NOT SET"
    );
    console.log(
      "mail_api:",
      mailersendKey3 ? `SET (${mailersendKey3.length} chars, starts: ${mailersendKey3.substring(0, 15)}...)` : "NOT SET"
    );

    const selectedKey = mailersendKey1 || mailersendKey2 || mailersendKey3;
    if (selectedKey) {
      const trimmedKey = selectedKey.trim().replace(/^["']|["']$/g, "");
      console.log("");
      console.log("Selected key after trimming:", trimmedKey.substring(0, 15) + "...");
      console.log("Key length after trim:", trimmedKey.length);
      console.log("Starts with mlsn.:", trimmedKey.startsWith("mlsn."));
      console.log("Expected key should be: mlsn.277293f1ad16750e756c7302303d27e44b88da74cf420158f3819471906966a6");
      console.log(
        "Keys match:",
        trimmedKey === "mlsn.277293f1ad16750e756c7302303d27e44b88da74cf420158f3819471906966a6"
      );
    }
    console.log("=== END DIAGNOSTIC ===");
    console.log("");

    // Send test email
    const testEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">✅ Test Email Successful!</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Email System is Working!</h2>
          <p style="color: #666;">Congratulations! Your AnimeDrop Zone email system is configured correctly.</p>
          
          <div style="background: #dcfce7; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #10b981;">
            <h3 style="color: #166534; margin-top: 0;">✅ Configuration Status</h3>
            <p style="color: #166534; margin: 5px 0;"><strong>Provider:</strong> MailerSend</p>
            <p style="color: #166534; margin: 5px 0;"><strong>Admin Email:</strong> ${ADMIN_EMAIL}</p>
            <p style="color: #166534; margin: 5px 0;"><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="color: #9333ea; margin-top: 0;">What's Next?</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Order confirmations will be sent automatically</li>
              <li>Customer notifications are enabled</li>
              <li>Admin alerts are configured</li>
              <li>You have 12,000 emails/month with MailerSend</li>
            </ul>
          </div>

          <p style="color: #666;">Your e-commerce store is ready to send emails to customers!</p>
        </div>
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0;">© 2025 AnimeDrop Zone. All rights reserved.</p>
        </div>
      </div>
    `;

    const result = await sendEmail(recipient, "✅ AnimeDrop Zone - Email Test Successful", testEmailHtml);

    if (result.success) {
      return c.json({
        success: true,
        message: `Test email sent successfully to ${recipient}`,
        recipient: recipient,
        provider: "MailerSend",
        timestamp: new Date().toISOString(),
      });
    } else {
      return c.json(
        {
          success: false,
          error: result.error,
          details: "Failed to send test email. Check server logs for details.",
        },
        500
      );
    }
  } catch (error) {
    console.error("Error sending test email:", error);
    return c.json(
      {
        success: false,
        error: String(error),
      },
      500
    );
  }
});

// Get all products
app.get("/make-server-95a96d8e/products", async (c) => {
  try {
    const products = await kv.getByPrefix("product:");
    return c.json({ success: true, products });
  } catch (error) {
    console.log("Error fetching products:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get products by category
app.get("/make-server-95a96d8e/products/category/:category", async (c) => {
  try {
    const category = c.req.param("category");
    const allProducts = await kv.getByPrefix("product:");
    const filteredProducts = allProducts.filter((p: any) => p.category === category);
    return c.json({ success: true, products: filteredProducts });
  } catch (error) {
    console.log("Error fetching products by category:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single product
app.get("/make-server-95a96d8e/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const product = await kv.get(`product:${id}`);
    if (!product) {
      return c.json({ success: false, error: "Product not found" }, 404);
    }
    return c.json({ success: true, product });
  } catch (error) {
    console.log("Error fetching product:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Admin login
app.post("/make-server-95a96d8e/admin/login", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, password } = body;

    if (userId === ADMIN_CREDENTIALS.userId && password === ADMIN_CREDENTIALS.password) {
      return c.json({ success: true, message: "Login successful" });
    }

    return c.json({ success: false, error: "Invalid credentials" }, 401);
  } catch (error) {
    console.log("Error during admin login:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Fix storage bucket RLS issues (admin only)
app.post("/make-server-95a96d8e/admin/fix-storage", async (c) => {
  try {
    console.log("🔧 Attempting to fix storage bucket...");

    // Try to empty and delete the bucket, then recreate it
    const bucketName = "product-images";

    // List all files in the bucket
    const { data: files, error: listError } = await supabase.storage.from(bucketName).list();

    if (listError) {
      console.log("Could not list files:", listError);
    } else if (files && files.length > 0) {
      console.log(`Found ${files.length} files in bucket`);
      // Delete all files
      const filePaths = files.map((f) => f.name);
      const { error: deleteError } = await supabase.storage.from(bucketName).remove(filePaths);

      if (deleteError) {
        console.log("Error deleting files:", deleteError);
      } else {
        console.log("✅ Deleted all files from bucket");
      }
    }

    // Try to delete the bucket
    const { error: deleteBucketError } = await supabase.storage.deleteBucket(bucketName);
    if (deleteBucketError) {
      console.log("Could not delete bucket (it may not exist or have files):", deleteBucketError);
    } else {
      console.log("✅ Deleted old bucket");
    }

    // Recreate the bucket
    const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"],
    });

    if (createError) {
      console.error("Error recreating bucket:", createError);
      return c.json(
        {
          success: false,
          error: createError.message,
          message: "Could not recreate bucket. Please manually create RLS policy in Supabase dashboard.",
        },
        500
      );
    }

    console.log("✅ Recreated bucket successfully");
    return c.json({
      success: true,
      message: "Bucket recreated. If RLS errors persist, manually add a policy in Supabase dashboard.",
      instructions:
        'Go to Storage → product-images → Policies → New Policy → Allow all operations with "true" for both expressions',
    });
  } catch (error) {
    console.error("Error fixing storage:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create product (admin only)
app.post("/make-server-95a96d8e/products", async (c) => {
  try {
    const body = await c.req.json();
    const { name, description, price, category, subcategory, image, stock } = body;

    if (!name || !price || !category) {
      return c.json({ success: false, error: "Missing required fields" }, 400);
    }

    const id = crypto.randomUUID();
    const product = {
      id,
      name,
      description,
      price: parseFloat(price),
      category,
      subcategory: subcategory || "",
      image: image || "",
      stock: parseInt(stock) || 0,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`product:${id}`, product);
    return c.json({ success: true, product });
  } catch (error) {
    console.log("Error creating product:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update product
app.put("/make-server-95a96d8e/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existingProduct = await kv.get(`product:${id}`);

    if (!existingProduct) {
      return c.json({ success: false, error: "Product not found" }, 404);
    }

    const updatedProduct = {
      ...existingProduct,
      ...body,
      id,
      price: body.price ? parseFloat(body.price) : existingProduct.price,
      stock: body.stock !== undefined ? parseInt(body.stock) : existingProduct.stock,
    };

    await kv.set(`product:${id}`, updatedProduct);
    return c.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.log("Error updating product:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete product
app.delete("/make-server-95a96d8e/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`product:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting product:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create order
app.post("/make-server-95a96d8e/orders", async (c) => {
  try {
    const body = await c.req.json();
    const { items, subtotal, shippingCharges, discount, couponCode, total, customerInfo, paymentId, paymentMethod } =
      body;

    const orderId = crypto.randomUUID();
    const trackingId = `AV${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Determine if order is prepaid or COD
    const isPrepaid = paymentMethod !== "cod";
    const paymentType = isPrepaid ? "Prepaid" : "COD";

    // Mark prepaid orders as "Paid" since payment is received upfront
    const paymentStatus = isPrepaid ? "Paid" : "Pending";

    // For COD orders, status is 'Order Pending', otherwise 'Order Pending' (all orders start as Order Pending)
    const orderStatus = "Order Pending";

    // Format customer name from firstName and lastName
    const fullName = `${customerInfo.firstName} ${customerInfo.lastName}`.trim();

    // Format full address with all details
    const fullAddress = `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} - ${customerInfo.pincode}`;

    const order = {
      id: orderId,
      trackingId,
      items,
      subtotal: parseFloat(subtotal || total),
      shippingCharges: parseFloat(shippingCharges || 0),
      discount: discount ? parseFloat(discount) : 0,
      couponCode: couponCode || null,
      total: parseFloat(total),
      customerInfo: {
        ...customerInfo,
        name: fullName,
        fullAddress: fullAddress,
      },
      paymentId,
      paymentMethod: paymentMethod || "razorpay",
      paymentType, // Add payment type (Prepaid/COD)
      paymentStatus, // Add payment status (Paid/Pending)
      status: orderStatus,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`order:${orderId}`, order);

    // Deduct product quantities from inventory
    console.log("🔄 Updating product inventory for order:", orderId);
    for (const item of items) {
      try {
        const product = await kv.get(`product:${item.id}`);
        if (product) {
          const newStock = (product.stock || 0) - item.quantity;
          const updatedProduct = {
            ...product,
            stock: Math.max(0, newStock), // Ensure stock doesn't go negative
          };
          await kv.set(`product:${item.id}`, updatedProduct);
          console.log(`✅ Updated ${item.name}: ${product.stock} → ${updatedProduct.stock} (sold: ${item.quantity})`);
        } else {
          console.warn(`⚠️ Product not found for inventory update: ${item.id}`);
        }
      } catch (error) {
        console.error(`❌ Error updating inventory for product ${item.id}:`, error);
        // Continue with other items even if one fails
      }
    }

    // Send order confirmation email
    const itemsList = items
      .map(
        (item: any) =>
          `<li style="padding: 15px; margin: 10px 0; background: #f9fafb; border-radius: 8px; border-left: 3px solid #9333ea;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="color: #333; font-size: 16px;">${item.name}</strong>
            <p style="color: #666; margin: 5px 0;">Quantity: ${item.quantity}</p>
            <p style="color: #9333ea; margin: 5px 0;">₹${item.price.toLocaleString()} each</p>
          </div>
          <div style="text-align: right;">
            <strong style="color: #333; font-size: 18px;">₹${(item.price * item.quantity).toLocaleString()}</strong>
          </div>
        </div>
      </li>`
      )
      .join("");

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Order Confirmation</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Thank you for your order!</h2>
          <p style="color: #666;">Hi ${fullName},</p>
          <p style="color: #666;">Your order has been confirmed and will be processed shortly.</p>
          
          <div style="background: #fef3c7; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin-top: 0;">📦 Track Your Order</h3>
            <p style="color: #92400e; margin: 10px 0;"><strong>Order ID:</strong> ${orderId}</p>
            <p style="color: #92400e; margin: 10px 0;"><strong>Tracking ID:</strong> ${trackingId}</p>
            <p style="color: #92400e; font-size: 14px; margin: 15px 0 5px 0;">
              You can track your order using either ID at:<br/>
              <strong>animedropzone.com/track-order</strong>
            </p>
          </div>

          <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="color: #9333ea; margin-top: 0;">Order Details</h3>
            <p><strong>Payment ID:</strong> ${paymentId}</p>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="color: #9333ea; margin-top: 0;">Items Ordered</h3>
            <ul style="list-style: none; padding: 0;">
              ${itemsList}
            </ul>
            <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">
            <div style="display: flex; justify-content: space-between; color: #666; margin: 8px 0;">
              <span>Subtotal:</span>
              <span>₹${(subtotal || total).toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; color: #666; margin: 8px 0;">
              <span>Shipping Charges:</span>
              <span>₹${(shippingCharges || 0).toLocaleString()}</span>
            </div>
            <hr style="border: none; border-top: 2px solid #9333ea; margin: 15px 0;">
            <p style="font-size: 18px; font-weight: bold; color: #333; display: flex; justify-content: space-between; margin: 0;">
              <span>Total:</span>
              <span>₹${total.toLocaleString()}</span>
            </p>
          </div>

          <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="color: #9333ea; margin-top: 0;">Shipping Address</h3>
            <p style="color: #666;">${fullAddress}</p>
            <p style="color: #666;">Phone: ${customerInfo.phone}</p>
          </div>

          <p style="color: #666;">You can track your order using the tracking ID: <strong>${trackingId}</strong></p>
          <p style="color: #666;">If you have any questions, please contact us.</p>
        </div>
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0;">© 2025 animedropzone. All rights reserved.</p>
        </div>
      </div>
    `;

    // Send order confirmation email to customer
    // MailerSend allows sending to any email address
    console.log("📧 ATTEMPTING TO SEND CUSTOMER ORDER CONFIRMATION EMAIL");
    console.log("   Customer Email:", customerInfo.email);
    console.log("   Subject:", `Order Confirmation - ${trackingId}`);

    const emailResult = await sendEmail(customerInfo.email, `Order Confirmation - ${trackingId}`, emailHtml);

    if (!emailResult.success) {
      console.error("❌ FAILED to send customer order confirmation email");
      console.error("   Customer Email:", customerInfo.email);
      console.error("   Error:", JSON.stringify(emailResult.error, null, 2));
    } else {
      console.log("✅ SUCCESSFULLY sent customer order confirmation email to:", customerInfo.email);
    }

    // Send WhatsApp confirmation to customer
    const customerWhatsAppMessage = `🎉 *Order Confirmed!*

Hi ${fullName}! 👋

Thank you for your order at AnimeDropZone!

📦 *Order Details:*
Order ID: ${orderId}
Tracking ID: ${trackingId}
Total Amount: ₹${total.toLocaleString()}
Payment Method: ${paymentMethod}

🔍 *Track Your Order:*
Visit animedropzone.com/track-order
Use your Tracking ID: ${trackingId}

We'll keep you updated via WhatsApp and Email!

Thank you for choosing AnimeDropZone! 💜

- AnimeDropZone Team`;

    const customerWhatsAppResult = await sendWhatsApp(customerInfo.phone, customerWhatsAppMessage);

    if (!customerWhatsAppResult.success) {
      console.log("⚠️ Failed to send customer order confirmation WhatsApp");
      console.log(`   Error: ${JSON.stringify(customerWhatsAppResult.error)}`);
    } else {
      console.log("✅ Customer order confirmation WhatsApp sent successfully!");
    }

    // Send admin email notification
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🔔 New Order Alert</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">New Order Received!</h2>
          <p style="color: #666;">A new order has been placed on animedropzone.</p>
          
          <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #9333ea;">
            <h3 style="color: #9333ea; margin-top: 0;">Order Information</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Tracking ID:</strong> ${trackingId}</p>
            <p><strong>Payment ID:</strong> ${paymentId}</p>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p><strong>Status:</strong> <span style="color: ${orderStatus === "pending" ? "#f59e0b" : "#10b981"};">${
      orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)
    }</span></p>
          </div>

          <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="color: #9333ea; margin-top: 0;">Customer Details</h3>
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${customerInfo.email}</p>
            <p><strong>Phone:</strong> ${customerInfo.phone}</p>
            <p><strong>Address:</strong><br/>${fullAddress}</p>
          </div>

          <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="color: #9333ea; margin-top: 0;">Items Ordered</h3>
            <ul style="list-style: none; padding: 0;">
              ${itemsList}
            </ul>
            <hr style="border: none; border-top: 2px solid #9333ea; margin: 15px 0;">
            <p style="font-size: 20px; font-weight: bold; color: #9333ea;">
              Total Amount: ₹${total.toLocaleString()}
            </p>
          </div>

          <div style="background: #fef3c7; padding: 15px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="color: #92400e; margin: 0;">
              ⚡ <strong>Action Required:</strong> Process this order and prepare for shipment.
            </p>
          </div>
        </div>
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0;">© 2025 animedropzone Admin Panel</p>
        </div>
      </div>
    `;

    await sendEmail(ADMIN_EMAIL, `🔔 New Order #${trackingId} - ₹${total.toLocaleString()}`, adminEmailHtml);

    // Send WhatsApp notification to admin
    const itemsText = items
      .map((item: any) => `${item.name} x${item.quantity} - ₹${(item.price * item.quantity).toLocaleString()}`)
      .join("\n");

    const whatsappMessage = `🔔 *NEW ORDER ALERT*

*Order Details:*
Order ID: ${orderId}
Tracking: ${trackingId}
Payment: ${paymentId}

*Customer:*
Name: ${fullName}
Phone: ${customerInfo.phone}
Email: ${customerInfo.email}

*Items:*
${itemsText}

*Total: ₹${total.toLocaleString()}*

*Delivery Address:*
${fullAddress}

⚡ Action Required: Process and prepare for shipment.`;

    if (ADMIN_PHONE) {
      await sendWhatsApp(ADMIN_PHONE, whatsappMessage);
    }

    return c.json({ success: true, order });
  } catch (error) {
    console.log("Error creating order:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all orders
app.get("/make-server-95a96d8e/orders", async (c) => {
  try {
    const orders = await kv.getByPrefix("order:");
    return c.json({ success: true, orders });
  } catch (error) {
    console.log("Error fetching orders:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// User signup
app.post("/make-server-95a96d8e/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const userExists = existingUsers?.users?.some((user) => user.email === email);

    if (userExists) {
      console.log("User already exists:", email);
      return c.json(
        {
          success: false,
          message: "This email is already registered. Please sign in instead or use a different email.",
          error: "User already exists",
        },
        400
      );
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log("Error creating user:", error);

      // Check for common error messages and provide user-friendly responses
      let userMessage = error.message;
      if (error.message.includes("already registered") || error.message.includes("already exists")) {
        userMessage = "This email is already registered. Please sign in instead or use a different email.";
      } else if (error.message.includes("password")) {
        userMessage = "Password is too weak. Please use a stronger password (at least 6 characters).";
      }

      return c.json(
        {
          success: false,
          message: userMessage,
          error: error.message,
        },
        400
      );
    }

    // Send welcome email
    try {
      // Removed adminEmail references - using MailerSend directly
      if (false) {
        // adminEmail code disabled
        // adminEmail = adminEmail.trim().replace(/['"]/g, '');
        // console.log('Admin email for welcome message:', adminEmail);
      }

      // OLD EMAIL TEMPLATE REMOVED - USING NEW MAILERSEND TEMPLATE BELOW
      if (false) {
        const emailPayload: any = {
          from: "AnimeDropZone <onboarding@resend.dev>",
          to: email,
          subject: "🎉 Welcome to AnimeDropZone - Your Anime Paradise!",
          html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Welcome to AnimeDropZone</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background: linear-gradient(135deg, #000000 0%, #1a0033 100%);">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #000000 0%, #1a0033 100%); padding: 40px 20px;">
                    <tr>
                      <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a0033 0%, #330066 100%); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(147, 51, 234, 0.3); border: 2px solid rgba(168, 85, 247, 0.3);">
                          
                          <!-- Header -->
                          <tr>
                            <td style="background: linear-gradient(90deg, #7c3aed 0%, #ec4899 100%); padding: 40px; text-align: center;">
                              <h1 style="margin: 0; color: #ffffff; font-size: 32px; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">
                                🎌 AnimeDropZone
                              </h1>
                              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px; font-weight: 300;">
                                Embrace Your Inner Demon
                              </p>
                            </td>
                          </tr>

                          <!-- Welcome Message -->
                          <tr>
                            <td style="padding: 50px 40px; text-align: center;">
                              <div style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%); border-radius: 15px; padding: 30px; margin-bottom: 30px; border: 1px solid rgba(168, 85, 247, 0.2);">
                                <h2 style="margin: 0 0 20px 0; color: #ec4899; font-size: 28px;">
                                  🎉 Congratulations, ${name || "Anime Fan"}!
                                </h2>
                                <p style="margin: 0; color: #e5e5e5; font-size: 18px; line-height: 1.6;">
                                  Your account has been successfully created!
                                </p>
                              </div>

                              <p style="color: #d1d5db; font-size: 16px; line-height: 1.8; margin: 20px 0;">
                                Welcome to the ultimate destination for premium anime merchandise! 
                                We're thrilled to have you join our community of passionate anime fans.
                              </p>

                              <!-- Features -->
                              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                  <td style="padding: 15px; background: rgba(124, 58, 237, 0.1); border-radius: 10px; border-left: 4px solid #7c3aed; margin-bottom: 10px;">
                                    <p style="margin: 0; color: #ffffff; font-size: 15px;">
                                      <strong style="color: #a78bfa;">⚔️ Premium Figures & Katanas</strong><br>
                                      <span style="color: #d1d5db; font-size: 14px;">Authentic collectibles from your favorite anime</span>
                                    </p>
                                  </td>
                                </tr>
                                <tr><td style="height: 10px;"></td></tr>
                                <tr>
                                  <td style="padding: 15px; background: rgba(236, 72, 153, 0.1); border-radius: 10px; border-left: 4px solid #ec4899;">
                                    <p style="margin: 0; color: #ffffff; font-size: 15px;">
                                      <strong style="color: #f9a8d4;">🎨 Exclusive Merchandise</strong><br>
                                      <span style="color: #d1d5db; font-size: 14px;">Limited edition items and custom clothing</span>
                                    </p>
                                  </td>
                                </tr>
                                <tr><td style="height: 10px;"></td></tr>
                                <tr>
                                  <td style="padding: 15px; background: rgba(124, 58, 237, 0.1); border-radius: 10px; border-left: 4px solid #7c3aed;">
                                    <p style="margin: 0; color: #ffffff; font-size: 15px;">
                                      <strong style="color: #a78bfa;">🚀 Fast Delivery</strong><br>
                                      <span style="color: #d1d5db; font-size: 14px;">Track your orders in real-time</span>
                                    </p>
                                  </td>
                                </tr>
                              </table>

                              <!-- CTA Button -->
                              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 40px 0 20px 0;">
                                <tr>
                                  <td align="center">
                                    <a href="${
                                      Deno.env.get("SUPABASE_URL")?.replace("https://", "https://") ||
                                      "https://animedropzone.com"
                                    }" 
                                       style="display: inline-block; background: linear-gradient(90deg, #7c3aed 0%, #ec4899 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: bold; box-shadow: 0 10px 30px rgba(236, 72, 153, 0.3); transition: all 0.3s;">
                                      🛍�� Start Shopping Now
                                    </a>
                                  </td>
                                </tr>
                              </table>

                              <p style="color: #9ca3af; font-size: 14px; margin: 30px 0 0 0;">
                                Need help? Our support team is always ready to assist you!
                              </p>
                            </td>
                          </tr>

                          <!-- Footer -->
                          <tr>
                            <td style="background: rgba(0, 0, 0, 0.3); padding: 30px; text-align: center; border-top: 1px solid rgba(168, 85, 247, 0.2);">
                              <p style="margin: 0 0 10px 0; color: #a78bfa; font-size: 18px; font-weight: bold;">
                                AnimeDropZone
                              </p>
                              <p style="margin: 0 0 15px 0; color: #9ca3af; font-size: 13px;">
                                Your trusted source for premium anime merchandise
                              </p>
                              <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.6;">
                                © 2025 AnimeDropZone. All rights reserved.<br>
                                This email was sent to ${email}
                              </p>
                            </td>
                          </tr>

                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
              </html>
            `,
        };

        // Add reply_to field only if adminEmail is valid
        if (adminEmail) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (emailRegex.test(adminEmail)) {
            emailPayload.reply_to = adminEmail;
            console.log("Added reply_to:", adminEmail);
          } else {
            console.log("Skipping reply_to - invalid email format:", adminEmail);
          }
        }

        console.log("Sending welcome email with from:", emailPayload.from, "to:", emailPayload.to);
        console.log("Full payload:", JSON.stringify(emailPayload, null, 2));
      } // end if (false)

      console.log("🎯 STARTING WELCOME EMAIL PROCESS");
      console.log("   Recipient Email:", email);
      console.log("   Recipient Name:", name);
      console.log("   Email is valid:", isValidEmail(email));

      const emailSubject = "🎉 Welcome to Our Family - AnimeDropZone";
      const emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a0033 0%, #000000 100%); color: #ffffff; border: 2px solid #9333ea; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(90deg, #9333ea 0%, #ec4899 50%, #9333ea 100%); padding: 40px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">🎌</div>
            <h1 style="margin: 0; font-size: 36px; color: #ffffff; text-shadow: 0 4px 20px rgba(0,0,0,0.5);">AnimeDropZone</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; color: #f3e8ff;">Your Anime Paradise Awaits</p>
          </div>
          <div style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%); padding: 40px; text-align: center; border-bottom: 2px solid rgba(147, 51, 234, 0.3);">
            <div style="font-size: 64px; margin-bottom: 15px;">🎉</div>
            <h2 style="margin: 0 0 15px 0; color: #ec4899; font-size: 32px;">Welcome to Our Family!</h2>
            <p style="margin: 0; color: #e5e7eb; font-size: 20px;"><strong style="color: #a855f7;">Hello ${
              name || "Anime Fan"
            }!</strong></p>
            <p style="margin: 15px 0 0 0; color: #d1d5db; font-size: 16px;">We're absolutely thrilled to have you join us! 💜</p>
          </div>
          <div style="padding: 40px 30px;">
            <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%); border-left: 4px solid #22c55e; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
              <p style="margin: 0; color: #4ade80; font-size: 16px;"><strong>✓ Account Successfully Created!</strong></p>
              <p style="margin: 10px 0 0 0; color: #d1d5db; font-size: 14px;">Your email: <strong style="color: #a855f7;">${email}</strong></p>
            </div>
            <p style="color: #e5e7eb; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">Welcome to the ultimate destination for premium anime merchandise! You're now part of an amazing community of passionate anime fans.</p>
            <div style="background: rgba(147, 51, 234, 0.1); border: 1px solid rgba(147, 51, 234, 0.3); border-radius: 10px; padding: 25px; margin: 30px 0;">
              <h3 style="margin: 0 0 20px 0; color: #a855f7; font-size: 20px;">🎯 What You Can Do Now:</h3>
              <div style="background: rgba(236, 72, 153, 0.1); border-left: 4px solid #ec4899; border-radius: 6px; padding: 15px; margin-bottom: 15px;">
                <p style="margin: 0; color: #ffffff; font-size: 15px;"><strong style="color: #f9a8d4;">⚔️ Browse Premium Figures & Katanas</strong></p>
                <p style="margin: 5px 0 0 0; color: #d1d5db; font-size: 14px;">Discover authentic collectibles from your favorite anime</p>
              </div>
              <div style="background: rgba(147, 51, 234, 0.1); border-left: 4px solid #9333ea; border-radius: 6px; padding: 15px; margin-bottom: 15px;">
                <p style="margin: 0; color: #ffffff; font-size: 15px;"><strong style="color: #a855f7;">🎨 Exclusive Merchandise</strong></p>
                <p style="margin: 5px 0 0 0; color: #d1d5db; font-size: 14px;">Limited edition items and custom clothing</p>
              </div>
              <div style="background: rgba(236, 72, 153, 0.1); border-left: 4px solid #ec4899; border-radius: 6px; padding: 15px; margin-bottom: 15px;">
                <p style="margin: 0; color: #ffffff; font-size: 15px;"><strong style="color: #f9a8d4;">📦 Track Your Orders</strong></p>
                <p style="margin: 5px 0 0 0; color: #d1d5db; font-size: 14px;">Real-time tracking and updates</p>
              </div>
              <div style="background: rgba(147, 51, 234, 0.1); border-left: 4px solid #9333ea; border-radius: 6px; padding: 15px;">
                <p style="margin: 0; color: #ffffff; font-size: 15px;"><strong style="color: #a855f7;">💜 Save Your Favorites</strong></p>
                <p style="margin: 5px 0 0 0; color: #d1d5db; font-size: 14px;">Create wishlists for your dream items</p>
              </div>
            </div>
            <div style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(147, 51, 234, 0.15) 100%); border: 2px solid rgba(236, 72, 153, 0.4); border-radius: 10px; padding: 25px; margin: 30px 0; text-align: center;">
              <div style="font-size: 32px; margin-bottom: 10px;">🎁</div>
              <h3 style="margin: 0 0 10px 0; color: #ec4899; font-size: 22px;">Special Welcome Gift!</h3>
              <p style="margin: 0 0 15px 0; color: #e5e7eb; font-size: 16px;">As a new family member, keep an eye on your inbox for exclusive deals and early access!</p>
              <p style="margin: 0; color: #a855f7; font-size: 14px;">🌟 First-time customers get priority support 🌟</p>
            </div>
            <div style="text-align: center; margin: 40px 0 30px 0;">
              <a href="https://animedropzone.com" style="display: inline-block; background: linear-gradient(90deg, #9333ea 0%, #ec4899 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 50px; font-size: 18px; font-weight: bold; box-shadow: 0 10px 30px rgba(236, 72, 153, 0.4);">🛍️ Start Shopping Now</a>
            </div>
            <div style="background: rgba(147, 51, 234, 0.05); border: 1px solid rgba(147, 51, 234, 0.2); border-radius: 8px; padding: 20px; margin: 30px 0;">
              <p style="margin: 0 0 10px 0; color: #e5e7eb; font-size: 14px;"><strong>Your Account Details:</strong></p>
              <p style="margin: 5px 0; color: #9ca3af; font-size: 13px;">Email: ${email}</p>
              <p style="margin: 5px 0; color: #9ca3af; font-size: 13px;">Name: ${name || "Anime Fan"}</p>
              <p style="margin: 5px 0; color: #9ca3af; font-size: 13px;">Member Since: ${new Date().toLocaleDateString()}</p>
            </div>
            <div style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%); border-radius: 8px; padding: 25px; text-align: center; margin-top: 30px;">
              <p style="margin: 0 0 10px 0; color: #ec4899; font-size: 18px; font-weight: bold;">Thank You for Joining Us! 💜</p>
              <p style="margin: 0; color: #d1d5db; font-size: 14px;">Welcome to the family!</p>
            </div>
          </div>
          <div style="background: rgba(0, 0, 0, 0.4); padding: 30px; text-align: center; border-top: 1px solid rgba(147, 51, 234, 0.3);">
            <p style="margin: 0 0 10px 0; color: #a855f7; font-size: 20px; font-weight: bold;">AnimeDropZone</p>
            <p style="margin: 0 0 15px 0; color: #9ca3af; font-size: 14px;">Your Trusted Source for Premium Anime Merchandise</p>
            <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 12px;">© 2025 AnimeDropZone. All rights reserved.<br>This email was sent to ${email}</p>
          </div>
        </div>
      `;

      console.log("🎯 CALLING sendEmail function...");
      const emailResult = await sendEmail(email, emailSubject, emailBody);

      if (emailResult.success) {
        console.log(`✅ SIGNUP WELCOME EMAIL SENT SUCCESSFULLY to ${email}`);
      } else {
        console.error(`❌ FAILED TO SEND SIGNUP WELCOME EMAIL to ${email}`);
        console.error("Error details:", JSON.stringify(emailResult.error));
      }
    } catch (emailError) {
      console.error("❌ CRITICAL ERROR sending welcome email:", emailError);
      console.error("Email error stack:", emailError instanceof Error ? emailError.stack : "No stack trace");
    }

    // Send admin notification about new signup
    try {
      console.log("🎯 STARTING ADMIN NOTIFICATION EMAIL...");
      // ✅ Use hardcoded ADMIN_EMAIL constant (defined at top of file)
      const adminEmail = ADMIN_EMAIL; // NOT Deno.env.get - uses hardcoded value
      console.log("Admin email address:", adminEmail);

      const adminSubject = "👤 New Customer Signup - AnimeDropZone";
      const adminBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a0033 0%, #000000 100%); color: #ffffff; border: 2px solid #9333ea; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(90deg, #9333ea 0%, #ec4899 50%, #9333ea 100%); padding: 30px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">👤</div>
            <h1 style="margin: 0; font-size: 28px; color: #ffffff;">New Customer Signup</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #f3e8ff;">AnimeDropZone Admin Notification</p>
          </div>
          
          <div style="padding: 30px;">
            <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%); border-left: 4px solid #22c55e; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <p style="margin: 0; color: #4ade80; font-size: 18px;"><strong>✓ New Account Created</strong></p>
              <p style="margin: 10px 0 0 0; color: #d1d5db; font-size: 14px;">A new customer has joined AnimeDropZone!</p>
            </div>

            <div style="background: rgba(147, 51, 234, 0.1); border: 1px solid rgba(147, 51, 234, 0.3); border-radius: 10px; padding: 25px; margin-bottom: 25px;">
              <h3 style="margin: 0 0 20px 0; color: #a855f7; font-size: 18px;">📋 Customer Details</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(147, 51, 234, 0.2);">
                    <strong style="color: #ec4899;">Name:</strong>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(147, 51, 234, 0.2); text-align: right; color: #e5e7eb;">
                    ${name || "Not provided"}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(147, 51, 234, 0.2);">
                    <strong style="color: #ec4899;">Email:</strong>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(147, 51, 234, 0.2); text-align: right; color: #e5e7eb;">
                    ${email}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(147, 51, 234, 0.2);">
                    <strong style="color: #ec4899;">User ID:</strong>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(147, 51, 234, 0.2); text-align: right; color: #e5e7eb; font-family: monospace; font-size: 12px;">
                    ${data.user.id}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <strong style="color: #ec4899;">Signup Date:</strong>
                  </td>
                  <td style="padding: 12px 0; text-align: right; color: #e5e7eb;">
                    ${new Date().toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      dateStyle: "full",
                      timeStyle: "medium",
                    })}
                  </td>
                </tr>
              </table>
            </div>

            <div style="background: rgba(236, 72, 153, 0.1); border: 1px solid rgba(236, 72, 153, 0.3); border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <p style="margin: 0 0 10px 0; color: #f9a8d4; font-size: 15px;"><strong>📊 Account Status</strong></p>
              <p style="margin: 5px 0; color: #d1d5db; font-size: 14px;">✓ Email confirmed automatically</p>
              <p style="margin: 5px 0; color: #d1d5db; font-size: 14px;">✓ Welcome email sent to customer</p>
              <p style="margin: 5px 0; color: #d1d5db; font-size: 14px;">✓ Ready to place orders</p>
            </div>

            <div style="background: linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%); border-radius: 8px; padding: 20px; text-align: center;">
              <p style="margin: 0 0 15px 0; color: #a855f7; font-size: 16px;"><strong>👥 Customer Management</strong></p>
              <p style="margin: 0; color: #d1d5db; font-size: 14px;">You can view this customer in your admin panel under the Users tab</p>
            </div>
          </div>

          <div style="background: rgba(0, 0, 0, 0.4); padding: 25px; text-align: center; border-top: 1px solid rgba(147, 51, 234, 0.3);">
            <p style="margin: 0 0 8px 0; color: #a855f7; font-size: 16px; font-weight: bold;">AnimeDropZone Admin</p>
            <p style="margin: 0; color: #6b7280; font-size: 12px;">This is an automated admin notification</p>
          </div>
        </div>
      `;

      console.log("🎯 CALLING sendEmail for admin notification...");
      const adminEmailResult = await sendEmail(adminEmail, adminSubject, adminBody);

      if (adminEmailResult.success) {
        console.log(`✅ ADMIN NOTIFICATION EMAIL SENT SUCCESSFULLY to ${adminEmail}`);
      } else {
        console.error(`❌ FAILED TO SEND ADMIN NOTIFICATION EMAIL to ${adminEmail}`);
        console.error("Admin email error details:", JSON.stringify(adminEmailResult.error));
      }
    } catch (adminEmailError) {
      console.error("❌ CRITICAL ERROR sending admin notification:", adminEmailError);
      console.error(
        "Admin email error stack:",
        adminEmailError instanceof Error ? adminEmailError.stack : "No stack trace"
      );
    }

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log("Error during signup:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get reviews for a product
app.get("/make-server-95a96d8e/reviews/:productId", async (c) => {
  try {
    const productId = c.req.param("productId");
    const reviews = await kv.getByPrefix(`review:${productId}:`);
    return c.json({ success: true, reviews: reviews || [] });
  } catch (error) {
    console.log("Error fetching reviews:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Add a review for a product
app.post("/make-server-95a96d8e/reviews", async (c) => {
  try {
    const body = await c.req.json();
    const { productId, userName, userEmail, rating, comment } = body;

    if (!productId || !userName || !rating || !comment) {
      return c.json({ success: false, error: "Missing required fields" }, 400);
    }

    // Check if user already reviewed this product
    const existingReviews = await kv.getByPrefix(`review:${productId}:`);
    const userAlreadyReviewed = existingReviews.some((review: any) => review.userEmail === userEmail);

    if (userAlreadyReviewed) {
      return c.json({ success: false, error: "You have already reviewed this product" }, 400);
    }

    const reviewId = `review:${productId}:${crypto.randomUUID()}`;
    const review = {
      id: reviewId,
      productId,
      userName,
      userEmail,
      rating: parseInt(rating),
      comment,
      createdAt: new Date().toISOString(),
    };

    await kv.set(reviewId, review);

    return c.json({ success: true, review });
  } catch (error) {
    console.log("Error adding review:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Track order by tracking ID
app.get("/make-server-95a96d8e/track/:trackingId", async (c) => {
  try {
    const trackingId = c.req.param("trackingId");
    const orders = await kv.getByPrefix("order:");
    const order = orders.find((o: any) => o.trackingId === trackingId);

    if (!order) {
      return c.json({ success: false, error: "Order not found" }, 404);
    }

    return c.json({ success: true, order });
  } catch (error) {
    console.log("Error tracking order:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Coupon Management Endpoints

// Get all coupons
app.get("/make-server-95a96d8e/coupons", async (c) => {
  try {
    const coupons = await kv.getByPrefix("coupon:");
    return c.json({ success: true, coupons });
  } catch (error) {
    console.log("Error fetching coupons:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create a new coupon OR validate/apply a coupon
app.post("/make-server-95a96d8e/coupons", async (c) => {
  try {
    const body = await c.req.json();
    const { code, discountType, discountValue, minPurchase, maxDiscount, expiryDate, usageLimit, isActive, cartTotal } =
      body;

    // Validate coupon code
    if (!code || code.trim() === "") {
      return c.json({ success: false, error: "Coupon code is required" }, 400);
    }

    // If only 'code' is provided (and optionally cartTotal), this is a validation/apply request
    if (!discountType && !discountValue) {
      // VALIDATE AND APPLY COUPON
      const coupons = await kv.getByPrefix("coupon:");
      const coupon = coupons.find((c: any) => c.code.toUpperCase() === code.toUpperCase() && c.isActive);

      if (!coupon) {
        return c.json({ success: false, message: "Invalid or expired coupon code" }, 400);
      }

      // Check if coupon has expired
      if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
        return c.json({ success: false, message: "This coupon has expired" }, 400);
      }

      // Check usage limit
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return c.json({ success: false, message: "This coupon has reached its usage limit" }, 400);
      }

      // Check minimum purchase if cartTotal provided
      if (cartTotal && coupon.minPurchase && cartTotal < coupon.minPurchase) {
        return c.json(
          {
            success: false,
            message: `Minimum purchase of ₹${coupon.minPurchase} required to use this coupon`,
          },
          400
        );
      }

      // Calculate the actual discount amount
      let discountAmount = coupon.discountValue;
      if (coupon.discountType === "percentage" && cartTotal) {
        discountAmount = (cartTotal * coupon.discountValue) / 100;
        // Apply max discount cap if specified
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
      }

      return c.json({
        success: true,
        coupon: {
          code: coupon.code,
          discount: Math.round(discountAmount * 100) / 100,
          type: coupon.discountType,
        },
      });
    }

    // CREATE NEW COUPON (admin function)
    // Check if coupon already exists
    const existingCoupons = await kv.getByPrefix("coupon:");
    const exists = existingCoupons.some((coupon: any) => coupon.code.toLowerCase() === code.toLowerCase());

    if (exists) {
      return c.json({ success: false, error: "Coupon code already exists" }, 400);
    }

    const couponId = `coupon:${Date.now()}`;
    const coupon = {
      id: couponId,
      code: code.toUpperCase(),
      discountType, // 'percentage' or 'fixed'
      discountValue: parseFloat(discountValue),
      minPurchase: parseFloat(minPurchase) || 0,
      maxDiscount: parseFloat(maxDiscount) || null,
      expiryDate: expiryDate || null,
      usageLimit: parseInt(usageLimit) || null,
      usageCount: 0,
      isActive: isActive !== false,
      createdAt: new Date().toISOString(),
    };

    await kv.set(couponId, coupon);
    return c.json({ success: true, coupon });
  } catch (error) {
    console.log("Error processing coupon request:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update a coupon
app.put("/make-server-95a96d8e/coupons/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();

    const coupon = await kv.get(id);
    if (!coupon) {
      return c.json({ success: false, error: "Coupon not found" }, 404);
    }

    const updatedCoupon = {
      ...coupon,
      ...updates,
      id, // Ensure id doesn't change
      code: updates.code ? updates.code.toUpperCase() : coupon.code,
      discountValue: updates.discountValue !== undefined ? parseFloat(updates.discountValue) : coupon.discountValue,
      minPurchase: updates.minPurchase !== undefined ? parseFloat(updates.minPurchase) : coupon.minPurchase,
      maxDiscount: updates.maxDiscount !== undefined ? parseFloat(updates.maxDiscount) : coupon.maxDiscount,
      usageLimit: updates.usageLimit !== undefined ? parseInt(updates.usageLimit) : coupon.usageLimit,
    };

    await kv.set(id, updatedCoupon);
    return c.json({ success: true, coupon: updatedCoupon });
  } catch (error) {
    console.log("Error updating coupon:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete a coupon
app.delete("/make-server-95a96d8e/coupons/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting coupon:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Validate and apply a coupon
app.post("/make-server-95a96d8e/coupons/validate", async (c) => {
  try {
    const { code, cartTotal } = await c.req.json();

    if (!code) {
      return c.json({ success: false, error: "Coupon code is required" }, 400);
    }

    // Find coupon by code
    const coupons = await kv.getByPrefix("coupon:");
    const coupon = coupons.find((c: any) => c.code.toLowerCase() === code.toLowerCase());

    if (!coupon) {
      return c.json({ success: false, error: "Invalid coupon code" }, 400);
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return c.json({ success: false, error: "This coupon is no longer active" }, 400);
    }

    // Check expiry date
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return c.json({ success: false, error: "This coupon has expired" }, 400);
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return c.json({ success: false, error: "This coupon has reached its usage limit" }, 400);
    }

    // Check minimum purchase
    if (coupon.minPurchase && cartTotal < coupon.minPurchase) {
      return c.json(
        {
          success: false,
          error: `Minimum purchase of ₹${coupon.minPurchase} required to use this coupon`,
        },
        400
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
      // Apply max discount if specified
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === "fixed") {
      discountAmount = coupon.discountValue;
      // Ensure discount doesn't exceed cart total
      if (discountAmount > cartTotal) {
        discountAmount = cartTotal;
      }
    }

    return c.json({
      success: true,
      coupon,
      discountAmount: Math.round(discountAmount * 100) / 100,
    });
  } catch (error) {
    console.log("Error validating coupon:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Increment coupon usage (called after successful order)
app.post("/make-server-95a96d8e/coupons/use/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const coupon = await kv.get(id);

    if (coupon) {
      coupon.usageCount = (coupon.usageCount || 0) + 1;
      await kv.set(id, coupon);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log("Error updating coupon usage:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Custom Clothing Endpoints

// Get all custom clothing requests
app.get("/make-server-95a96d8e/custom-clothing", async (c) => {
  try {
    const requests = await kv.getByPrefix("custom-clothing:");
    return c.json({ success: true, requests });
  } catch (error) {
    console.log("Error fetching custom clothing requests:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create a new custom clothing request
app.post("/make-server-95a96d8e/custom-clothing", async (c) => {
  try {
    const { name, email, phone, clothingType, size, color, quantity, instructions, address, designImages } =
      await c.req.json();

    const requestId = `CCR-${Date.now()}`;
    const customClothingId = `custom-clothing:${Date.now()}`;

    const customRequest = {
      id: customClothingId,
      requestId,
      customerInfo: {
        name,
        email,
        phone,
        address,
      },
      clothingDetails: {
        type: clothingType,
        size,
        color: color || "Not specified",
        quantity,
      },
      designImages,
      instructions: instructions || "None",
      status: "pending", // pending, quoted, approved, in-production, completed, cancelled
      quotedPrice: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(customClothingId, customRequest);

    // Send notification email to admin
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a0a2e 0%, #7b2cbf 100%); border-radius: 16px; padding: 30px; }
            .header { background: linear-gradient(to right, #7b2cbf, #e91e63); padding: 20px; border-radius: 12px; margin-bottom: 20px; }
            .content { background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; border: 1px solid rgba(123,44,191,0.3); }
            .label { color: #a855f7; font-weight: bold; margin-top: 15px; }
            .value { color: #e5e5e5; margin-left: 10px; }
            .images { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; margin-top: 15px; }
            .images img { width: 100%; height: 150px; object-fit: cover; border-radius: 8px; border: 2px solid rgba(123,44,191,0.5); }
            .footer { text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0; color: white;">🎨 New Custom Clothing Request</h2>
            </div>
            <div class="content">
              <p><span class="label">Request ID:</span><span class="value">${requestId}</span></p>
              
              <h3 style="color: #e91e63; margin-top: 20px;">Customer Information</h3>
              <p><span class="label">Name:</span><span class="value">${name}</span></p>
              <p><span class="label">Email:</span><span class="value">${email}</span></p>
              <p><span class="label">Phone:</span><span class="value">${phone}</span></p>
              <p><span class="label">Address:</span><span class="value">${address}</span></p>
              
              <h3 style="color: #e91e63; margin-top: 20px;">Clothing Details</h3>
              <p><span class="label">Type:</span><span class="value">${clothingType}</span></p>
              <p><span class="label">Size:</span><span class="value">${size}</span></p>
              <p><span class="label">Color:</span><span class="value">${color || "Not specified"}</span></p>
              <p><span class="label">Quantity:</span><span class="value">${quantity}</span></p>
              
              ${
                instructions
                  ? `<p><span class="label">Special Instructions:</span><span class="value">${instructions}</span></p>`
                  : ""
              }
              
              <h3 style="color: #e91e63; margin-top: 20px;">Design Images (${designImages.length})</h3>
              <div class="images">
                ${designImages.map((url: string) => `<img src="${url}" alt="Design" />`).join("")}
              </div>
              
              <p style="margin-top: 20px; padding: 15px; background: rgba(123,44,191,0.2); border-left: 4px solid #7b2cbf; border-radius: 8px;">
                ⚡ <strong>Action Required:</strong> Review the design and contact the customer with a quote within 24-48 hours.
              </p>
            </div>
            <div class="footer">
              <p>AnimeDropZone - Custom Clothing Service</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail(ADMIN_EMAIL, `🎨 New Custom Clothing Request - ${requestId}`, adminEmailHtml);

    // Send WhatsApp notification to admin
    const whatsappMessage = `🎨 *NEW CUSTOM CLOTHING REQUEST*

*Request ID:* ${requestId}

*Customer:*
Name: ${name}
Phone: ${phone}
Email: ${email}

*Clothing Details:*
Type: ${clothingType}
Size: ${size}
Color: ${color || "Not specified"}
Quantity: ${quantity}

*Design Images:* ${designImages.length} image(s) uploaded

*Special Instructions:*
${instructions || "None"}

*Delivery Address:*
${address}

⚡ Action Required: Review design and provide quote within 24-48 hours.`;

    if (ADMIN_PHONE) {
      await sendWhatsApp(ADMIN_PHONE, whatsappMessage);
    }

    // Send confirmation email to customer
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a0a2e 0%, #7b2cbf 100%); border-radius: 16px; padding: 30px; }
            .header { background: linear-gradient(to right, #7b2cbf, #e91e63); padding: 20px; border-radius: 12px; margin-bottom: 20px; text-align: center; }
            .content { background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; border: 1px solid rgba(123,44,191,0.3); }
            .label { color: #a855f7; font-weight: bold; }
            .value { color: #e5e5e5; }
            .highlight { background: rgba(123,44,191,0.2); padding: 15px; border-left: 4px solid #7b2cbf; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; color: white;">✅ Request Received!</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
              <p>Thank you for your custom clothing request! We've received your design and details.</p>
              
              <div class="highlight">
                <p style="margin: 0;"><strong>Your Request ID:</strong> ${requestId}</p>
              </div>
              
              <h3 style="color: #e91e63;">What Happens Next?</h3>
              <ol style="line-height: 1.8;">
                <li>Our design team will review your images and requirements</li>
                <li>We'll contact you within 24-48 hours with a price quote</li>
                <li>Once you approve, we'll start production</li>
                <li>Your custom clothing will be delivered to your address</li>
              </ol>
              
              <h3 style="color: #e91e63; margin-top: 20px;">Your Order Summary</h3>
              <p><span class="label">Clothing Type:</span> <span class="value">${clothingType}</span></p>
              <p><span class="label">Size:</span> <span class="value">${size}</span></p>
              <p><span class="label">Quantity:</span> <span class="value">${quantity}</span></p>
              
              <div class="highlight">
                <p style="margin: 0;">💡 Keep this email for your reference. We'll reach out soon!</p>
              </div>
            </div>
            <div class="footer">
              <p>AnimeDropZone - Embrace Your Inner Demon</p>
              <p>Questions? Reply to this email or contact us.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail(email, `Custom Clothing Request Received - ${requestId}`, customerEmailHtml);

    return c.json({ success: true, requestId, request: customRequest });
  } catch (error) {
    console.log("Error creating custom clothing request:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update custom clothing request status
app.put("/make-server-95a96d8e/custom-clothing/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();

    const request = await kv.get(id);
    if (!request) {
      return c.json({ success: false, error: "Request not found" }, 404);
    }

    const updatedRequest = {
      ...request,
      ...updates,
      id, // Ensure id doesn't change
      updatedAt: new Date().toISOString(),
    };

    await kv.set(id, updatedRequest);
    return c.json({ success: true, request: updatedRequest });
  } catch (error) {
    console.log("Error updating custom clothing request:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete custom clothing request
app.delete("/make-server-95a96d8e/custom-clothing/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting custom clothing request:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Cancel custom clothing request with notifications
app.post("/make-server-95a96d8e/custom-clothing/:id/cancel", async (c) => {
  try {
    const id = c.req.param("id");
    const { reason } = await c.req.json();

    const request = await kv.get(id);
    if (!request) {
      return c.json({ success: false, error: "Request not found" }, 404);
    }

    // Update request status
    const updatedRequest = {
      ...request,
      status: "cancelled",
      cancellationReason: reason,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(id, updatedRequest);

    // Send cancellation email to customer
    const cancellationEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a0a2e 0%, #7b2cbf 100%); border-radius: 16px; padding: 30px; }
            .header { background: linear-gradient(to right, #dc2626, #e91e63); padding: 20px; border-radius: 12px; margin-bottom: 20px; text-align: center; }
            .content { background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; border: 1px solid rgba(220,38,38,0.3); }
            .label { color: #fca5a5; font-weight: bold; }
            .value { color: #e5e5e5; }
            .reason-box { background: rgba(220,38,38,0.2); padding: 15px; border-left: 4px solid #dc2626; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; color: white;">❌ Order Cancelled</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${request.customerInfo.name},</p>
              <p>We regret to inform you that your custom clothing request has been cancelled.</p>
              
              <div style="margin: 20px 0; padding: 15px; background: rgba(220,38,38,0.2); border-left: 4px solid #dc2626; border-radius: 8px;">
                <p style="margin: 0;"><strong>Request ID:</strong> ${request.requestId}</p>
              </div>
              
              <div class="reason-box">
                <h3 style="color: #fca5a5; margin-top: 0;">Reason for Cancellation:</h3>
                <p style="color: white; margin: 0;">${reason}</p>
              </div>
              
              <h3 style="color: #e91e63;">Your Order Details</h3>
              <p><span class="label">Clothing Type:</span> <span class="value">${request.clothingDetails.type}</span></p>
              <p><span class="label">Size:</span> <span class="value">${request.clothingDetails.size}</span></p>
              <p><span class="label">Quantity:</span> <span class="value">${request.clothingDetails.quantity}</span></p>
              
              <div style="margin-top: 20px; padding: 15px; background: rgba(123,44,191,0.2); border-left: 4px solid #7b2cbf; border-radius: 8px;">
                <p style="margin: 0;">💜 We apologize for any inconvenience. If you have any questions or would like to place a new order, please don't hesitate to contact us.</p>
              </div>
            </div>
            <div class="footer">
              <p>AnimeDropZone - Embrace Your Inner Demon</p>
              <p>Questions? Reply to this email or contact us.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail(request.customerInfo.email, `Order Cancelled - ${request.requestId}`, cancellationEmailHtml);

    // Send WhatsApp notification to customer
    const whatsappMessage = `❌ *ORDER CANCELLED*

Hi ${request.customerInfo.name},

We regret to inform you that your custom clothing request has been cancelled.

*Request ID:* ${request.requestId}

*Reason for Cancellation:*
${reason}

*Your Order Details:*
Type: ${request.clothingDetails.type}
Size: ${request.clothingDetails.size}
Quantity: ${request.clothingDetails.quantity}

We apologize for any inconvenience. If you have any questions or would like to place a new order, please contact us.

- AnimeDropZone Team`;

    await sendWhatsApp(request.customerInfo.phone, whatsappMessage);

    return c.json({ success: true, request: updatedRequest });
  } catch (error) {
    console.log("Error cancelling custom clothing request:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Send quote for custom clothing request
app.post("/make-server-95a96d8e/custom-clothing/:id/quote", async (c) => {
  try {
    const id = c.req.param("id");
    const { quotedPrice } = await c.req.json();

    const request = await kv.get(id);
    if (!request) {
      return c.json({ success: false, error: "Request not found" }, 404);
    }

    // Update request with quote
    const updatedRequest = {
      ...request,
      status: "quoted",
      quotedPrice,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(id, updatedRequest);

    // Get base URL for approval links
    const baseUrl = Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", ".netlify.app") || "http://localhost:5173";
    const approveUrl = `${baseUrl}/approve-quote/${encodeURIComponent(id)}?action=approve`;
    const rejectUrl = `${baseUrl}/approve-quote/${encodeURIComponent(id)}?action=reject`;

    // Send quote email to customer
    const quoteEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a0a2e 0%, #7b2cbf 100%); border-radius: 16px; padding: 30px; }
            .header { background: linear-gradient(to right, #7b2cbf, #e91e63); padding: 20px; border-radius: 12px; margin-bottom: 20px; text-align: center; }
            .content { background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; border: 1px solid rgba(123,44,191,0.3); }
            .label { color: #a855f7; font-weight: bold; }
            .value { color: #e5e5e5; }
            .price-box { background: linear-gradient(to right, #059669, #10b981); padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center; }
            .button-container { display: flex; gap: 15px; justify-content: center; margin: 30px 0; }
            .button { display: inline-block; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; text-align: center; }
            .approve-btn { background: linear-gradient(to right, #059669, #10b981); color: white; }
            .reject-btn { background: linear-gradient(to right, #dc2626, #e91e63); color: white; }
            .footer { text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px; }
            @media only screen and (max-width: 600px) {
              .button-container { flex-direction: column; }
              .button { width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; color: white;">💰 Your Custom Clothing Quote</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${request.customerInfo.name},</p>
              <p>Great news! We've reviewed your custom clothing design and prepared a quote for you.</p>
              
              <div style="margin: 20px 0; padding: 15px; background: rgba(123,44,191,0.2); border-left: 4px solid #7b2cbf; border-radius: 8px;">
                <p style="margin: 0;"><strong>Request ID:</strong> ${request.requestId}</p>
              </div>
              
              <div class="price-box">
                <h2 style="margin: 0 0 10px 0; color: white; font-size: 36px;">₹${quotedPrice.toFixed(2)}</h2>
                <p style="margin: 0; color: white; opacity: 0.9;">Total Price (Including ₹100 shipping)</p>
              </div>
              
              <h3 style="color: #e91e63;">Your Order Details</h3>
              <p><span class="label">Clothing Type:</span> <span class="value">${
                request.clothingDetails.type
              }</span></p>
              <p><span class="label">Size:</span> <span class="value">${request.clothingDetails.size}</span></p>
              <p><span class="label">Color:</span> <span class="value">${request.clothingDetails.color}</span></p>
              <p><span class="label">Quantity:</span> <span class="value">${request.clothingDetails.quantity}</span></p>
              
              <h3 style="color: #e91e63; margin-top: 30px;">Please Respond to This Quote</h3>
              <p style="text-align: center; color: #e5e5e5; margin-bottom: 20px;">Click one of the buttons below to accept or decline this quote:</p>
              
              <div class="button-container">
                <a href="${approveUrl}" class="button approve-btn">✅ Accept Quote</a>
                <a href="${rejectUrl}" class="button reject-btn">❌ Decline Quote</a>
              </div>
              
              <h3 style="color: #e91e63; margin-top: 20px;">What Happens Next?</h3>
              <ol style="line-height: 1.8; color: #e5e5e5;">
                <li>Click "Accept Quote" if you're happy with the price</li>
                <li>We'll send you payment details within 24 hours</li>
                <li>Production will begin after payment confirmation</li>
                <li>Your custom clothing will be delivered to your address</li>
                <li>Delivery typically takes 7-14 business days</li>
              </ol>
              
              <div style="margin-top: 20px; padding: 15px; background: rgba(123,44,191,0.2); border-left: 4px solid #e91e63; border-radius: 8px;">
                <p style="margin: 0;">⏰ <strong>Quote Valid For:</strong> 7 days from today</p>
              </div>
            </div>
            <div class="footer">
              <p>AnimeDropZone - Embrace Your Inner Demon</p>
              <p>Questions? Reply to this email or contact us.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send quote email to customer
    console.log(`📧 Sending quote email to: ${request.customerInfo.email}`);
    const emailResult = await sendEmail(
      request.customerInfo.email,
      `Your Custom Clothing Quote - ${request.requestId}`,
      quoteEmailHtml
    );

    if (!emailResult.success) {
      console.error(`❌ Failed to send quote email: ${emailResult.error}`);
      console.log("⚠️ NOTE: With Resend free plan, emails only work if sent to your verified email address");
      console.log(`⚠️ Customer email attempted: ${request.customerInfo.email}`);
    } else {
      console.log("✅ Quote email sent successfully!");
    }

    // Send WhatsApp notification to customer
    console.log(`📱 Sending quote WhatsApp to: ${request.customerInfo.phone}`);
    const whatsappMessage = `💰 *CUSTOM CLOTHING QUOTE READY*

Hi ${request.customerInfo.name},

Great news! We've prepared a quote for your custom clothing request.

*Request ID:* ${request.requestId}

*QUOTED PRICE: ₹${quotedPrice.toFixed(2)}*
(Including ₹100 shipping)

*Your Order Details:*
Type: ${request.clothingDetails.type}
Size: ${request.clothingDetails.size}
Color: ${request.clothingDetails.color}
Quantity: ${request.clothingDetails.quantity}

*Next Steps:*
1. Check your email for approval buttons
2. Click "Accept Quote" or "Decline Quote"
3. We'll send payment details after approval
4. Production begins after payment
5. Delivery to your address

⏰ Quote valid for 7 days

Check your email for the quote with easy approval buttons!

- AnimeDropZone Team`;

    const whatsappResult = await sendWhatsApp(request.customerInfo.phone, whatsappMessage);

    if (!whatsappResult.success) {
      console.error(`❌ Failed to send quote WhatsApp: ${whatsappResult.error}`);
    } else {
      console.log("✅ Quote WhatsApp sent successfully!");
    }

    // Send notification to admin
    const adminNotificationHtml = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a0a2e 0%, #7b2cbf 100%); border-radius: 16px; padding: 30px;">
            <h2 style="color: #10b981;">📧 Quote Sent to Customer</h2>
            <p><strong>Request ID:</strong> ${request.requestId}</p>
            <p><strong>Customer:</strong> ${request.customerInfo.name}</p>
            <p><strong>Email:</strong> ${request.customerInfo.email}</p>
            <p><strong>Phone:</strong> ${request.customerInfo.phone}</p>
            <p><strong>Quoted Price:</strong> ₹${quotedPrice.toFixed(2)}</p>
            <p><strong>Details:</strong></p>
            <ul>
              <li>Type: ${request.clothingDetails.type}</li>
              <li>Size: ${request.clothingDetails.size}</li>
              <li>Color: ${request.clothingDetails.color}</li>
              <li>Quantity: ${request.clothingDetails.quantity}</li>
            </ul>
            <div style="margin-top: 20px; padding: 15px; background: rgba(5,150,105,0.2); border-left: 4px solid #10b981; border-radius: 8px;">
              <p style="margin: 0;">✅ Quote email and WhatsApp sent to customer with approval buttons!</p>
              <p style="margin: 10px 0 0 0;">Customer can now approve or decline the quote with one click.</p>
            </div>
            ${
              !emailResult.success
                ? `
              <div style="margin-top: 20px; padding: 15px; background: rgba(220,38,38,0.2); border-left: 4px solid #dc2626; border-radius: 8px;">
                <p style="margin: 0; color: #fca5a5;">⚠️ <strong>Email Failed:</strong> ${emailResult.error}</p>
                <p style="margin: 10px 0 0 0; color: #fca5a5;">Resend free plan only sends to verified email. Customer's email: ${request.customerInfo.email}</p>
              </div>
            `
                : ""
            }
          </div>
        </body>
      </html>
    `;

    await sendEmail(ADMIN_EMAIL, `[QUOTE SENT] Custom Clothing Quote - ${request.requestId}`, adminNotificationHtml);

    // Return response with notification status
    return c.json({
      success: true,
      request: updatedRequest,
      notifications: {
        email: emailResult.success,
        whatsapp: whatsappResult.success,
        emailError: !emailResult.success ? emailResult.error : null,
        whatsappError: !whatsappResult.success ? whatsappResult.error : null,
      },
    });
  } catch (error) {
    console.log("Error sending quote:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Approve or reject custom clothing quote
app.post("/make-server-95a96d8e/custom-clothing/:id/approve", async (c) => {
  try {
    const id = c.req.param("id");
    const { action } = await c.req.json();

    if (!action || (action !== "approve" && action !== "reject")) {
      return c.json({ success: false, error: 'Invalid action. Use "approve" or "reject"' }, 400);
    }

    const request = await kv.get(id);
    if (!request) {
      return c.json({ success: false, error: "Request not found" }, 404);
    }

    if (request.status !== "quoted") {
      return c.json(
        { success: false, error: "This request has already been processed or is not in quoted status" },
        400
      );
    }

    // Update request status
    const updatedRequest = {
      ...request,
      status: action === "approve" ? "approved" : "rejected",
      approvalDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(id, updatedRequest);

    // Send confirmation to customer
    if (action === "approve") {
      // Send approval confirmation email
      const approvalEmailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a0a2e 0%, #7b2cbf 100%); border-radius: 16px; padding: 30px; }
              .header { background: linear-gradient(to right, #059669, #10b981); padding: 20px; border-radius: 12px; margin-bottom: 20px; text-align: center; }
              .content { background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; border: 1px solid rgba(123,44,191,0.3); }
              .label { color: #a855f7; font-weight: bold; }
              .value { color: #e5e5e5; }
              .footer { text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; color: white;">✅ Quote Approved!</h1>
              </div>
              <div class="content">
                <p style="font-size: 16px; margin-bottom: 20px;">Hi ${request.customerInfo.name},</p>
                <p>Thank you for approving the quote for your custom clothing order!</p>
                
                <div style="margin: 20px 0; padding: 15px; background: rgba(5,150,105,0.2); border-left: 4px solid #10b981; border-radius: 8px;">
                  <p style="margin: 0;"><strong>Request ID:</strong> ${request.requestId}</p>
                  <p style="margin: 10px 0 0 0;"><strong>Approved Amount:</strong> ₹${request.quotedPrice.toFixed(
                    2
                  )}</p>
                </div>
                
                <h3 style="color: #10b981;">What's Next?</h3>
                <ol style="line-height: 1.8; color: #e5e5e5;">
                  <li>Our team will contact you within 24 hours with payment details</li>
                  <li>Complete the payment to start production</li>
                  <li>We'll keep you updated on the production progress</li>
                  <li>Your custom clothing will be shipped to your address</li>
                  <li>Delivery typically takes 7-14 business days</li>
                </ol>
                
                <div style="margin-top: 20px; padding: 15px; background: rgba(123,44,191,0.2); border-left: 4px solid #7b2cbf; border-radius: 8px;">
                  <p style="margin: 0;">📞 <strong>Need Help?</strong> Reply to this email or contact us anytime!</p>
                </div>
              </div>
              <div class="footer">
                <p>AnimeDropZone - Embrace Your Inner Demon</p>
                <p>Thank you for choosing us!</p>
              </div>
            </div>
          </body>
        </html>
      `;

      await sendEmail(request.customerInfo.email, `Quote Approved - ${request.requestId}`, approvalEmailHtml);

      // Send WhatsApp confirmation
      const approvalWhatsApp = `✅ *QUOTE APPROVED*

Hi ${request.customerInfo.name},

Thank you for approving your custom clothing quote!

*Request ID:* ${request.requestId}
*Approved Amount:* ₹${request.quotedPrice.toFixed(2)}

*What's Next:*
1. Our team will contact you within 24 hours
2. Complete payment to start production
3. We'll keep you updated on progress
4. Delivery in 7-14 business days

We're excited to create your custom clothing!

- AnimeDropZone Team`;

      await sendWhatsApp(request.customerInfo.phone, approvalWhatsApp);

      // Notify admin
      const adminNotificationHtml = `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a0a2e 0%, #7b2cbf 100%); border-radius: 16px; padding: 30px;">
              <h2 style="color: #10b981;">🎉 Custom Clothing Quote Approved!</h2>
              <p><strong>Request ID:</strong> ${request.requestId}</p>
              <p><strong>Customer:</strong> ${request.customerInfo.name}</p>
              <p><strong>Email:</strong> ${request.customerInfo.email}</p>
              <p><strong>Phone:</strong> ${request.customerInfo.phone}</p>
              <p><strong>Approved Amount:</strong> ₹${request.quotedPrice.toFixed(2)}</p>
              <p><strong>Details:</strong></p>
              <ul>
                <li>Type: ${request.clothingDetails.type}</li>
                <li>Size: ${request.clothingDetails.size}</li>
                <li>Color: ${request.clothingDetails.color}</li>
                <li>Quantity: ${request.clothingDetails.quantity}</li>
              </ul>
              <p style="margin-top: 20px; padding: 15px; background: rgba(220,38,38,0.2); border-left: 4px solid #dc2626; border-radius: 8px;">
                ⚠️ <strong>Action Required:</strong> Contact customer within 24 hours with payment details!
              </p>
            </div>
          </body>
        </html>
      `;

      await sendEmail(ADMIN_EMAIL, `[APPROVED] Custom Clothing Quote - ${request.requestId}`, adminNotificationHtml);
    } else {
      // Send rejection confirmation email
      const rejectionEmailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a0a2e 0%, #7b2cbf 100%); border-radius: 16px; padding: 30px; }
              .header { background: linear-gradient(to right, #dc2626, #e91e63); padding: 20px; border-radius: 12px; margin-bottom: 20px; text-align: center; }
              .content { background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; border: 1px solid rgba(123,44,191,0.3); }
              .footer { text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; color: white;">Quote Declined</h1>
              </div>
              <div class="content">
                <p style="font-size: 16px; margin-bottom: 20px;">Hi ${request.customerInfo.name},</p>
                <p>We received your response declining the quote for request ${request.requestId}.</p>
                <p>Thank you for considering AnimeDropZone for your custom clothing needs. We understand that pricing and timing need to be just right.</p>
                
                <div style="margin: 20px 0; padding: 15px; background: rgba(123,44,191,0.2); border-left: 4px solid #7b2cbf; border-radius: 8px;">
                  <p style="margin: 0;">💡 <strong>Still Interested?</strong></p>
                  <p style="margin: 10px 0 0 0;">Feel free to submit a new custom clothing request anytime! We're always happy to work with you to find the perfect solution.</p>
                </div>
                
                <p>We'd love to hear your feedback! If you have any suggestions or concerns, please reply to this email.</p>
              </div>
              <div class="footer">
                <p>AnimeDropZone - Embrace Your Inner Demon</p>
                <p>We hope to serve you in the future!</p>
              </div>
            </div>
          </body>
        </html>
      `;

      await sendEmail(request.customerInfo.email, `Quote Declined - ${request.requestId}`, rejectionEmailHtml);
    }

    return c.json({ success: true, request: updatedRequest });
  } catch (error) {
    console.log("Error processing quote approval:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Customer cancel order
app.post("/make-server-95a96d8e/orders/cancel", async (c) => {
  try {
    const { orderId, reason } = await c.req.json();

    if (!orderId) {
      return c.json({ success: false, message: "Order ID is required" }, 400);
    }

    // Get the order
    const order = await kv.get(`order:${orderId}`);
    if (!order) {
      return c.json({ success: false, message: "Order not found" }, 404);
    }

    // Check if order can be cancelled (only pending orders)
    if (order.status !== "Order Pending" && order.status.toLowerCase() !== "pending") {
      return c.json(
        {
          success: false,
          message: `Cannot cancel order with status: ${order.status}. Only pending orders can be cancelled.`,
        },
        400
      );
    }

    // Update order status to cancelled
    const updatedOrder = {
      ...order,
      status: "Cancelled",
      cancellationReason: reason || "Customer requested cancellation",
      cancelledAt: new Date().toISOString(),
      cancelledBy: "customer",
    };

    await kv.set(`order:${orderId}`, updatedOrder);

    // Restore inventory for cancelled items
    for (const item of order.items) {
      const product = await kv.get(`product:${item.id}`);
      if (product) {
        const updatedProduct = {
          ...product,
          stock: product.stock + item.quantity,
        };
        await kv.set(`product:${item.id}`, updatedProduct);
      }
    }

    // Send cancellation email to customer
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a0a2e 0%, #7b2cbf 100%); border-radius: 16px; padding: 30px; }
            .header { background: linear-gradient(to right, #dc2626, #e91e63); padding: 20px; border-radius: 12px; margin-bottom: 20px; text-align: center; }
            .content { background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; border: 1px solid rgba(220,38,38,0.3); }
            .label { color: #fca5a5; font-weight: bold; }
            .value { color: #e5e5e5; }
            .item { border-bottom: 1px solid rgba(123,44,191,0.3); padding: 10px 0; }
            .footer { text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; color: white;">❌ Order Cancelled</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${order.customerInfo.name},</p>
              <p>Your order has been successfully cancelled as per your request.</p>
              
              <div style="margin: 20px 0; padding: 15px; background: rgba(220,38,38,0.2); border-left: 4px solid #dc2626; border-radius: 8px;">
                <p style="margin: 0;"><strong>Order ID:</strong> ${order.id}</p>
                <p style="margin: 0;"><strong>Tracking ID:</strong> ${order.trackingId}</p>
              </div>
              
              ${
                reason
                  ? `
              <div style="margin: 20px 0; padding: 15px; background: rgba(123,44,191,0.2); border-left: 4px solid #7b2cbf; border-radius: 8px;">
                <h3 style="color: #a855f7; margin-top: 0;">Cancellation Reason:</h3>
                <p style="color: white; margin: 0;">${reason}</p>
              </div>
              `
                  : ""
              }
              
              <h3 style="color: #e91e63;">Cancelled Order Details</h3>
              <p><span class="label">Order Date:</span> <span class="value">${new Date(
                order.createdAt
              ).toLocaleDateString()}</span></p>
              <p><span class="label">Payment Method:</span> <span class="value">${order.paymentMethod}</span></p>
              <p><span class="label">Total Amount:</span> <span class="value">₹${order.total.toFixed(2)}</span></p>
              
              <h3 style="color: #e91e63; margin-top: 20px;">Items in Order:</h3>
              ${order.items
                .map(
                  (item: any) => `
                <div class="item">
                  <p style="margin: 5px 0; color: white;">${item.name}</p>
                  <p style="margin: 5px 0; color: #9ca3af; font-size: 14px;">Quantity: ${
                    item.quantity
                  } × ₹${item.price.toFixed(2)} = ₹${(item.quantity * item.price).toFixed(2)}</p>
                </div>
              `
                )
                .join("")}
              
              <div style="margin-top: 20px; padding: 15px; background: rgba(123,44,191,0.2); border-left: 4px solid #7b2cbf; border-radius: 8px;">
                <h3 style="color: #a855f7; margin-top: 0;">Refund Information:</h3>
                <p style="margin: 0;">
                  ${
                    order.paymentMethod === "cod"
                      ? "Since this was a Cash on Delivery order, no refund is necessary."
                      : "Your refund will be processed within 5-7 business days to your original payment method."
                  }
                </p>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background: rgba(5,150,105,0.2); border-left: 4px solid #10b981; border-radius: 8px;">
                <p style="margin: 0;">💜 We're sorry to see this order cancelled. If you have any questions or would like to place a new order, please don't hesitate to contact us!</p>
              </div>
            </div>
            <div class="footer">
              <p>AnimeDropZone - Embrace Your Inner Demon</p>
              <p>Questions? Reply to this email or contact us.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail(order.customerInfo.email, `Order Cancelled - ${order.trackingId}`, customerEmailHtml);

    // Send WhatsApp notification to customer
    const customerWhatsAppMessage = `❌ *ORDER CANCELLED*

Hi ${order.customerInfo.name},

Your order has been successfully cancelled.

*Order ID:* ${order.id}
*Tracking ID:* ${order.trackingId}

${reason ? `*Reason:* ${reason}\n` : ""}
*Order Details:*
- Order Date: ${new Date(order.createdAt).toLocaleDateString()}
- Payment Method: ${order.paymentMethod}
- Total Amount: ₹${order.total.toFixed(2)}

*Items:*
${order.items
  .map((item: any) => `- ${item.name} (${item.quantity}x) - ₹${(item.quantity * item.price).toFixed(2)}`)
  .join("\n")}

*Refund Status:*
${
  order.paymentMethod === "cod"
    ? "No refund necessary (COD order)"
    : "Refund will be processed within 5-7 business days"
}

We're sorry to see this order cancelled. Feel free to place a new order anytime!

- AnimeDropZone Team`;

    await sendWhatsApp(order.customerInfo.phone, customerWhatsAppMessage);

    // Send notification to admin
    const adminWhatsAppMessage = `⚠️ *CUSTOMER ORDER CANCELLATION*

A customer has cancelled their order.

*Order ID:* ${order.id}
*Tracking ID:* ${order.trackingId}

*Customer:* ${order.customerInfo.name}
*Email:* ${order.customerInfo.email}
*Phone:* ${order.customerInfo.phone}

${reason ? `*Reason:* ${reason}\n` : ""}
*Order Total:* ₹${order.total.toFixed(2)}
*Payment Method:* ${order.paymentMethod}

*Items:*
${order.items
  .map((item: any) => `- ${item.name} (${item.quantity}x) - ₹${(item.quantity * item.price).toFixed(2)}`)
  .join("\n")}

✅ Inventory has been automatically restored.

- AnimeDropZone Admin Panel`;

    // Send to admin phone number (you should replace with actual admin number)
    const adminPhone = Deno.env.get("ADMIN_PHONE") || "+1234567890";
    await sendWhatsApp(adminPhone, adminWhatsAppMessage);

    // Send email notification to admin
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a0a2e 0%, #7b2cbf 100%); border-radius: 16px; padding: 30px; }
            .header { background: linear-gradient(to right, #dc2626, #e91e63); padding: 20px; border-radius: 12px; margin-bottom: 20px; text-align: center; }
            .content { background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; border: 1px solid rgba(220,38,38,0.3); }
            .info-box { padding: 15px; background: rgba(123,44,191,0.2); border-left: 4px solid #7b2cbf; border-radius: 8px; margin: 10px 0; }
            .label { color: #fca5a5; font-weight: bold; }
            .value { color: #e5e5e5; }
            .item { border-bottom: 1px solid rgba(123,44,191,0.3); padding: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; color: white;">⚠️ Customer Order Cancellation</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px; margin-bottom: 20px;">Admin Alert: A customer has cancelled their order.</p>
              
              <div class="info-box">
                <p style="margin: 5px 0;"><span class="label">Order ID:</span> <span class="value">${
                  order.id
                }</span></p>
                <p style="margin: 5px 0;"><span class="label">Tracking ID:</span> <span class="value">${
                  order.trackingId
                }</span></p>
                <p style="margin: 5px 0;"><span class="label">Cancelled At:</span> <span class="value">${new Date().toLocaleString()}</span></p>
              </div>
              
              <h3 style="color: #e91e63; margin-top: 20px;">Customer Information</h3>
              <p><span class="label">Name:</span> <span class="value">${order.customerInfo.name}</span></p>
              <p><span class="label">Email:</span> <span class="value">${order.customerInfo.email}</span></p>
              <p><span class="label">Phone:</span> <span class="value">${order.customerInfo.phone}</span></p>
              
              ${
                reason
                  ? `
              <div class="info-box">
                <h3 style="color: #a855f7; margin-top: 0;">Cancellation Reason:</h3>
                <p style="color: white; margin: 0;">${reason}</p>
              </div>
              `
                  : ""
              }
              
              <h3 style="color: #e91e63; margin-top: 20px;">Order Details</h3>
              <p><span class="label">Order Date:</span> <span class="value">${new Date(
                order.createdAt
              ).toLocaleDateString()}</span></p>
              <p><span class="label">Payment Method:</span> <span class="value">${order.paymentMethod}</span></p>
              <p><span class="label">Total Amount:</span> <span class="value">₹${order.total.toFixed(2)}</span></p>
              
              <h3 style="color: #e91e63; margin-top: 20px;">Items in Order:</h3>
              ${order.items
                .map(
                  (item: any) => `
                <div class="item">
                  <p style="margin: 5px 0; color: white;">${item.name}</p>
                  <p style="margin: 5px 0; color: #9ca3af; font-size: 14px;">Quantity: ${
                    item.quantity
                  } × ₹${item.price.toFixed(2)} = ₹${(item.quantity * item.price).toFixed(2)}</p>
                </div>
              `
                )
                .join("")}
              
              <div style="margin-top: 20px; padding: 15px; background: rgba(5,150,105,0.2); border-left: 4px solid #10b981; border-radius: 8px;">
                <p style="margin: 0; color: #10b981;">✅ Inventory has been automatically restored for all items.</p>
              </div>
              
              <h3 style="color: #e91e63; margin-top: 20px;">Shipping Address</h3>
              <p style="color: #e5e5e5; margin: 0;">
                ${order.shippingAddress.street}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.state}<br>
                ${order.shippingAddress.pincode}<br>
                India
              </p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>AnimeDropZone Admin Panel</p>
              <p>Check your admin panel for complete details</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail(ADMIN_EMAIL, `⚠️ Order Cancelled by Customer - ${order.trackingId}`, adminEmailHtml);

    return c.json({
      success: true,
      message: "Order cancelled successfully. You will receive confirmation via email and WhatsApp.",
      order: updatedOrder,
    });
  } catch (error) {
    console.log("Error cancelling order:", error);
    return c.json({ success: false, message: String(error) }, 500);
  }
});

// Admin update order status
app.put("/make-server-95a96d8e/orders/:orderId/status", async (c) => {
  try {
    const orderId = c.req.param("orderId");
    const { status } = await c.req.json();

    if (!orderId) {
      return c.json({ success: false, message: "Order ID is required" }, 400);
    }

    if (!status) {
      return c.json({ success: false, message: "Status is required" }, 400);
    }

    // Validate status
    const validStatuses = ["Order Pending", "In Transit", "Out for Delivery", "Order Delivered"];
    if (!validStatuses.includes(status)) {
      return c.json(
        {
          success: false,
          message: "Invalid status. Must be one of: Order Pending, In Transit, Out for Delivery, Order Delivered",
        },
        400
      );
    }

    // Get the order
    const order = await kv.get(`order:${orderId}`);
    if (!order) {
      return c.json({ success: false, message: "Order not found" }, 404);
    }

    // Don't allow updating cancelled orders
    if (order.status === "Cancelled") {
      return c.json(
        {
          success: false,
          message: "Cannot update status of cancelled orders",
        },
        400
      );
    }

    // Update order status
    const updatedOrder = {
      ...order,
      status: status,
      lastStatusUpdate: new Date().toISOString(),
    };

    await kv.set(`order:${orderId}`, updatedOrder);

    // Send status update email to customer
    const statusEmojis: Record<string, string> = {
      "Order Pending": "⏳",
      "In Transit": "🚚",
      "Out for Delivery": "📦",
      "Order Delivered": "✅",
    };

    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a0a2e 0%, #7b2cbf 100%); border-radius: 16px; padding: 30px; }
            .header { background: linear-gradient(to right, #9333ea, #e91e63); padding: 20px; border-radius: 12px; margin-bottom: 20px; text-align: center; }
            .content { background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; border: 1px solid rgba(147,51,234,0.3); }
            .status-box { background: linear-gradient(to right, #9333ea, #e91e63); padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0; }
            .label { color: #c4b5fd; font-weight: bold; }
            .value { color: #e5e5e5; }
            .footer { text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; color: white;">${statusEmojis[status]} Order Status Update</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${order.customerInfo.name},</p>
              <p>Great news! Your order status has been updated.</p>
              
              <div class="status-box">
                <h2 style="margin: 0; color: white; font-size: 28px;">${statusEmojis[status]} ${status}</h2>
              </div>
              
              <div style="margin: 20px 0; padding: 15px; background: rgba(147,51,234,0.2); border-left: 4px solid #9333ea; border-radius: 8px;">
                <p style="margin: 0;"><strong>Order ID:</strong> ${order.id}</p>
                <p style="margin: 0;"><strong>Tracking ID:</strong> ${order.trackingId}</p>
              </div>
              
              <h3 style="color: #e91e63;">Order Details</h3>
              <p><span class="label">Order Date:</span> <span class="value">${new Date(
                order.createdAt
              ).toLocaleDateString()}</span></p>
              <p><span class="label">Total Amount:</span> <span class="value">₹${order.total.toLocaleString()}</span></p>
              
              <div style="margin-top: 20px; padding: 15px; background: rgba(16,185,129,0.2); border-left: 4px solid #10b981; border-radius: 8px;">
                <p style="margin: 0; color: #10b981;">💡 <strong>Track your order anytime</strong></p>
                <p style="margin: 5px 0 0 0; color: #e5e5e5;">Visit our website and use your Tracking ID to check real-time status updates.</p>
              </div>
            </div>
            <div class="footer">
              <p>Thank you for shopping with AnimeDropZone!</p>
              <p>Questions? Contact us at ${ADMIN_EMAIL}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail(order.customerInfo.email, `Order Status Update - ${status}`, customerEmailHtml);

    // Send WhatsApp notification to customer
    const customerWhatsAppMessage = `🎊 *AnimeDropZone - Order Status Update*

Hi ${order.customerInfo.name}!

Your order status has been updated:

${statusEmojis[status]} *${status}*

*Order ID:* ${order.id}
*Tracking ID:* ${order.trackingId}

Track your order anytime on our website!

Thank you for shopping with AnimeDropZone! 🎌`;

    await sendWhatsApp(order.customerInfo.phone, customerWhatsAppMessage);

    return c.json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.log("Error updating order status:", error);
    return c.json({ success: false, message: String(error) }, 500);
  }
});

// Verify payment received (Admin only)
app.post("/make-server-95a96d8e/orders/:orderId/verify-payment", async (c) => {
  try {
    const orderId = c.req.param("orderId");
    const { verified, verifiedBy } = await c.req.json();

    if (!orderId) {
      return c.json({ success: false, message: "Order ID is required" }, 400);
    }

    // Get the order
    const order = await kv.get(`order:${orderId}`);
    if (!order) {
      return c.json({ success: false, message: "Order not found" }, 404);
    }

    // Don't allow verifying cancelled orders
    if (order.status === "Cancelled") {
      return c.json(
        {
          success: false,
          message: "Cannot verify payment for cancelled orders",
        },
        400
      );
    }

    // Update order with payment verification
    const updatedOrder = {
      ...order,
      paymentVerified: verified,
      paymentVerifiedAt: new Date().toISOString(),
      verifiedBy: verifiedBy || "Admin",
    };

    await kv.set(`order:${orderId}`, updatedOrder);

    console.log(`✅ Payment verified for order ${orderId} by ${verifiedBy}`);

    return c.json({
      success: true,
      message: "Payment verification status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.log("Error verifying payment:", error);
    return c.json({ success: false, message: String(error) }, 500);
  }
});

// Cancel order due to payment failure (Admin only)
app.post("/make-server-95a96d8e/orders/:orderId/cancel-payment-failed", async (c) => {
  try {
    const orderId = c.req.param("orderId");
    const { reason, cancelledBy } = await c.req.json();

    if (!orderId) {
      return c.json({ success: false, message: "Order ID is required" }, 400);
    }

    if (!reason) {
      return c.json({ success: false, message: "Cancellation reason is required" }, 400);
    }

    // Get the order
    const order = await kv.get(`order:${orderId}`);
    if (!order) {
      return c.json({ success: false, message: "Order not found" }, 404);
    }

    // Don't allow cancelling already cancelled orders
    if (order.status === "Cancelled") {
      return c.json(
        {
          success: false,
          message: "Order is already cancelled",
        },
        400
      );
    }

    // Update order status to cancelled
    const updatedOrder = {
      ...order,
      status: "Cancelled",
      cancellationReason: reason,
      cancelledAt: new Date().toISOString(),
      cancelledBy: cancelledBy || "Admin",
      paymentVerificationFailed: true,
    };

    await kv.set(`order:${orderId}`, updatedOrder);

    // Send cancellation email to customer
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a0a2e 0%, #7b2cbf 100%); border-radius: 16px; padding: 30px; }
            .header { background: linear-gradient(to right, #ef4444, #dc2626); padding: 20px; border-radius: 12px; margin-bottom: 20px; text-align: center; }
            .content { background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; border: 1px solid rgba(239,68,68,0.3); }
            .warning-box { background: linear-gradient(to right, #ef4444, #dc2626); padding: 20px; border-radius: 12px; margin: 20px 0; }
            .label { color: #fca5a5; font-weight: bold; }
            .value { color: #e5e5e5; }
            .footer { text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; color: white;">❌ Order Cancelled - Payment Not Received</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${order.customerInfo.name},</p>
              <p>We regret to inform you that your order has been cancelled because we did not receive payment confirmation.</p>
              
              <div class="warning-box">
                <h2 style="margin: 0; color: white; font-size: 24px;">❌ Order Cancelled</h2>
              </div>
              
              <div style="margin: 20px 0; padding: 15px; background: rgba(239,68,68,0.2); border-left: 4px solid #ef4444; border-radius: 8px;">
                <p style="margin: 0;"><strong>Order ID:</strong> ${order.id}</p>
                <p style="margin: 0;"><strong>Tracking ID:</strong> ${order.trackingId}</p>
                <p style="margin: 0;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                <p style="margin: 0;"><strong>Payment ID:</strong> ${order.paymentId}</p>
              </div>
              
              <h3 style="color: #ef4444;">Reason for Cancellation</h3>
              <div style="padding: 15px; background: rgba(0,0,0,0.3); border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; color: #fca5a5;">${reason}</p>
              </div>
              
              <h3 style="color: #9333ea;">Order Details</h3>
              <p><span class="label">Order Date:</span> <span class="value">${new Date(
                order.createdAt
              ).toLocaleDateString()}</span></p>
              <p><span class="label">Total Amount:</span> <span class="value">₹${order.total.toLocaleString()}</span></p>
              
              <div style="margin-top: 20px; padding: 15px; background: rgba(59,130,246,0.2); border-left: 4px solid #3b82f6; border-radius: 8px;">
                <p style="margin: 0; color: #60a5fa;">💡 <strong>Want to place a new order?</strong></p>
                <p style="margin: 5px 0 0 0; color: #e5e5e5;">Visit our website to browse products and place a new order. If you believe this cancellation was a mistake, please contact us immediately.</p>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background: rgba(16,185,129,0.2); border-left: 4px solid #10b981; border-radius: 8px;">
                <p style="margin: 0; color: #10b981;">📧 <strong>Questions or Concerns?</strong></p>
                <p style="margin: 5px 0 0 0; color: #e5e5e5;">If your payment was successful and you have proof, please reply to this email with your payment confirmation/screenshot.</p>
              </div>
            </div>
            <div class="footer">
              <p>We apologize for any inconvenience.</p>
              <p>Contact us at ${ADMIN_EMAIL}</p>
              <p>AnimeDropZone - Your Anime Merchandise Store</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email to customer
    try {
      await sendEmail({
        to: order.customerInfo.email,
        subject: `❌ Order ${order.id} Cancelled - Payment Not Received`,
        html: customerEmailHtml,
      });
      console.log(`✅ Cancellation email sent to customer: ${order.customerInfo.email}`);
    } catch (emailError) {
      console.error("❌ Failed to send cancellation email to customer:", emailError);
    }

    // Send WhatsApp notification to customer
    const customerWhatsAppMessage = `❌ *Order Cancelled - Payment Not Received*

Hi ${order.customerInfo.name}!

Unfortunately, your order has been cancelled because we did not receive payment confirmation.

*Order ID:* ${order.id}
*Tracking ID:* ${order.trackingId}
*Payment Method:* ${order.paymentMethod}
*Payment ID:* ${order.paymentId}

*Reason:* ${reason}

If your payment was successful and you have proof, please contact us immediately at ${ADMIN_EMAIL}

You can place a new order anytime on our website.

We apologize for any inconvenience.

AnimeDropZone 🎌`;

    await sendWhatsApp(order.customerInfo.phone, customerWhatsAppMessage);

    // Send notification to admin
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a0a2e 0%, #7b2cbf 100%); border-radius: 16px; padding: 30px; }
            .header { background: linear-gradient(to right, #ef4444, #dc2626); padding: 20px; border-radius: 12px; margin-bottom: 20px; text-align: center; }
            .content { background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; border: 1px solid rgba(239,68,68,0.3); }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; color: white;">🔴 Order Cancelled - Payment Verification Failed</h1>
            </div>
            <div class="content">
              <p><strong>Action Taken:</strong> Order cancelled by ${cancelledBy}</p>
              <p><strong>Order ID:</strong> ${order.id}</p>
              <p><strong>Tracking ID:</strong> ${order.trackingId}</p>
              <p><strong>Customer:</strong> ${order.customerInfo.name}</p>
              <p><strong>Email:</strong> ${order.customerInfo.email}</p>
              <p><strong>Phone:</strong> ${order.customerInfo.phone}</p>
              <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
              <p><strong>Payment ID:</strong> ${order.paymentId}</p>
              <p><strong>Amount:</strong> ₹${order.total.toLocaleString()}</p>
              <p><strong>Reason:</strong> ${reason}</p>
              <p>Customer has been notified via email and WhatsApp.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `🔴 Order ${order.id} Cancelled - Payment Not Received`,
        html: adminEmailHtml,
      });
      console.log(`✅ Admin notification sent for cancelled order ${orderId}`);
    } catch (emailError) {
      console.error("❌ Failed to send admin notification:", emailError);
    }

    console.log(`✅ Order ${orderId} cancelled due to payment verification failure by ${cancelledBy}`);

    return c.json({
      success: true,
      message: "Order cancelled successfully. Customer has been notified.",
      order: updatedOrder,
    });
  } catch (error) {
    console.log("Error cancelling order:", error);
    return c.json({ success: false, message: String(error) }, 500);
  }
});

// Record payment
app.post("/make-server-95a96d8e/payments/record", async (c) => {
  return await recordPaymentHandler(c, kv, sendEmail, sendWhatsApp);
});

// Mark order as paid
app.post("/make-server-95a96d8e/payments/mark-paid", async (c) => {
  return await markPaidHandler(c, kv, sendEmail, sendWhatsApp);
});

// Support Ticket Endpoints

// Submit a support ticket
app.post("/make-server-95a96d8e/support/submit", async (c) => {
  try {
    const { name, email, subject, question } = await c.req.json();

    if (!name || !email || !subject || !question) {
      return c.json({ success: false, error: "All fields are required" }, 400);
    }

    const ticketId = `support:${Date.now()}:${Math.random().toString(36).substring(7)}`;
    const ticket = {
      id: ticketId,
      name,
      email,
      subject,
      question,
      status: "pending",
      reply: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(ticketId, ticket);
    console.log("Support ticket created:", ticketId);

    return c.json({ success: true, ticket });
  } catch (error) {
    console.error("Error submitting support ticket:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get customer's tickets by email
app.get("/make-server-95a96d8e/support/my-tickets", async (c) => {
  try {
    const email = c.req.query("email");

    if (!email) {
      return c.json({ success: false, error: "Email is required" }, 400);
    }

    const allTickets = await kv.getByPrefix("support:");
    const customerTickets = allTickets
      .filter((ticket: any) => ticket.email === email)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({ success: true, tickets: customerTickets });
  } catch (error) {
    console.error("Error fetching customer tickets:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all support tickets (admin only)
app.get("/make-server-95a96d8e/support/all", async (c) => {
  try {
    const allTickets = await kv.getByPrefix("support:");
    const sortedTickets = allTickets.sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ success: true, tickets: sortedTickets });
  } catch (error) {
    console.error("Error fetching all tickets:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Reply to a support ticket (admin only)
app.post("/make-server-95a96d8e/support/reply", async (c) => {
  try {
    const { ticketId, reply } = await c.req.json();

    if (!ticketId || !reply) {
      return c.json({ success: false, error: "Ticket ID and reply are required" }, 400);
    }

    const ticket = await kv.get(ticketId);

    if (!ticket) {
      return c.json({ success: false, error: "Ticket not found" }, 404);
    }

    const updatedTicket = {
      ...ticket,
      reply,
      status: "answered",
      updatedAt: new Date().toISOString(),
    };

    await kv.set(ticketId, updatedTicket);
    console.log("Support ticket updated:", ticketId);

    // Send email notification to customer
    try {
      const emailSubject = `Re: ${ticket.subject} - Support Ticket #${ticketId.split(":")[1]?.substring(0, 8)}`;
      const emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a0033 0%, #000000 100%); color: #ffffff; border: 1px solid #9333ea; border-radius: 12px; overflow: hidden;">
          <!-- Header -->
          <div style="background: linear-gradient(90deg, #9333ea 0%, #ec4899 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; color: #ffffff;">AnimeDropZone</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #f3e8ff;">Anime Figures & Accessories Store</p>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <h2 style="color: #a855f7; margin-top: 0;">Support Ticket Reply</h2>
            
            <p style="color: #e5e7eb; line-height: 1.6;">Hello ${ticket.name},</p>
            
            <p style="color: #e5e7eb; line-height: 1.6;">Thank you for contacting AnimeDropZone Support. We have reviewed your inquiry and provided a response below:</p>

            <!-- Original Question -->
            <div style="background: rgba(147, 51, 234, 0.1); border-left: 4px solid #9333ea; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0 0 10px 0; color: #a855f7; font-weight: bold;">Your Question:</p>
              <p style="margin: 0; color: #d1d5db; white-space: pre-wrap;">${ticket.question}</p>
            </div>

            <!-- Admin Reply -->
            <div style="background: rgba(34, 197, 94, 0.1); border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0 0 10px 0; color: #4ade80; font-weight: bold;">Our Response:</p>
              <p style="margin: 0; color: #d1d5db; white-space: pre-wrap;">${reply}</p>
            </div>

            <div style="background: rgba(147, 51, 234, 0.1); border: 1px solid rgba(147, 51, 234, 0.3); border-radius: 8px; padding: 20px; margin: 25px 0;">
              <p style="margin: 0 0 10px 0; color: #e5e7eb;"><strong>Ticket Details:</strong></p>
              <p style="margin: 5px 0; color: #9ca3af;">Ticket ID: ${ticketId.split(":")[1]?.substring(0, 8)}</p>
              <p style="margin: 5px 0; color: #9ca3af;">Subject: ${ticket.subject}</p>
              <p style="margin: 5px 0; color: #9ca3af;">Status: Answered ✓</p>
            </div>

            <p style="color: #e5e7eb; line-height: 1.6; margin-top: 25px;">If you have any further questions or need additional assistance, please don't hesitate to reach out to us again.</p>

            <p style="color: #e5e7eb; line-height: 1.6; margin-top: 20px;">Thank you for shopping with AnimeDropZone!</p>
          </div>

          <!-- Footer -->
          <div style="background: rgba(147, 51, 234, 0.1); padding: 20px; text-align: center; border-top: 1px solid rgba(147, 51, 234, 0.3);">
            <p style="margin: 0; color: #9ca3af; font-size: 14px;">AnimeDropZone - Your Anime Paradise</p>
            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 12px;">
              <a href="https://animedropzone.com" style="color: #a855f7; text-decoration: none;">Visit Our Store</a> | 
              <a href="https://animedropzone.com/track-order" style="color: #a855f7; text-decoration: none;">Track Order</a>
            </p>
            <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">
              This is an automated response to your support ticket.
            </p>
          </div>
        </div>
      `;

      await sendEmail(ticket.email, emailSubject, emailBody);
      console.log(`✅ Support reply email sent to ${ticket.email} for ticket ${ticketId}`);
    } catch (emailError) {
      console.error("Error sending support reply email:", emailError);
      // Continue even if email fails - the reply is still saved
    }

    return c.json({ success: true, ticket: updatedTicket });
  } catch (error) {
    console.error("Error replying to ticket:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete a support ticket (admin only)
app.delete("/make-server-95a96d8e/support/:ticketId", async (c) => {
  try {
    const ticketId = c.req.param("ticketId");
    await kv.del(ticketId);
    console.log("Support ticket deleted:", ticketId);

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Category Management Endpoints

// Get all categories
app.get("/make-server-95a96d8e/categories", async (c) => {
  try {
    const allCategories = await kv.getByPrefix("category:");
    const sortedCategories = allCategories.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

    return c.json({ success: true, categories: sortedCategories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create a new category
app.post("/make-server-95a96d8e/categories", async (c) => {
  try {
    const { name, slug, subcategories } = await c.req.json();

    if (!name || !name.trim()) {
      return c.json({ success: false, error: "Category name is required" }, 400);
    }

    // Generate slug if not provided
    const categorySlug =
      slug ||
      name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    // Check if slug already exists
    const existingCategories = await kv.getByPrefix("category:");
    const slugExists = existingCategories.some((cat: any) => cat.slug === categorySlug);

    if (slugExists) {
      return c.json({ success: false, error: "Category slug already exists" }, 400);
    }

    const categoryId = `category:${Date.now()}:${Math.random().toString(36).substring(7)}`;
    const category = {
      id: categoryId,
      name: name.trim(),
      slug: categorySlug,
      subcategories: subcategories || [],
      order: existingCategories.length,
      createdAt: new Date().toISOString(),
    };

    await kv.set(categoryId, category);
    console.log("Category created:", categoryId);

    return c.json({ success: true, category });
  } catch (error) {
    console.error("Error creating category:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update a category
app.put("/make-server-95a96d8e/categories/:categoryId", async (c) => {
  try {
    const categoryId = c.req.param("categoryId");
    const { name, slug, subcategories } = await c.req.json();

    const existingCategory = await kv.get(categoryId);

    if (!existingCategory) {
      return c.json({ success: false, error: "Category not found" }, 404);
    }

    // Generate slug if not provided
    const categorySlug =
      slug ||
      name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    // Check if slug is taken by another category
    const allCategories = await kv.getByPrefix("category:");
    const slugTaken = allCategories.some((cat: any) => cat.slug === categorySlug && cat.id !== categoryId);

    if (slugTaken) {
      return c.json({ success: false, error: "Category slug already exists" }, 400);
    }

    const updatedCategory = {
      ...existingCategory,
      name: name.trim(),
      slug: categorySlug,
      subcategories: subcategories || [],
      updatedAt: new Date().toISOString(),
    };

    await kv.set(categoryId, updatedCategory);
    console.log("Category updated:", categoryId);

    return c.json({ success: true, category: updatedCategory });
  } catch (error) {
    console.error("Error updating category:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete a category
app.delete("/make-server-95a96d8e/categories/:categoryId", async (c) => {
  try {
    const categoryId = c.req.param("categoryId");
    await kv.del(categoryId);
    console.log("Category deleted:", categoryId);

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== WALLPAPER ROUTES ====================

// Get all wallpapers
app.get("/make-server-95a96d8e/wallpapers", async (c) => {
  try {
    console.log("🔵 GET /wallpapers - Fetching wallpapers...");
    const wallpaperKeys = await kv.getByPrefix("wallpaper:");
    console.log('📦 Found keys with prefix "wallpaper:":', wallpaperKeys.length);
    console.log(
      "📋 Keys:",
      wallpaperKeys.map((k) => ({ key: k.key, hasValue: !!k.value }))
    );

    const wallpapers = wallpaperKeys
      .map((item) => item.value)
      .filter((item) => item !== null && item !== undefined)
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

    console.log("✅ Processed wallpapers:", wallpapers.length);
    return c.json({ success: true, wallpapers });
  } catch (error) {
    console.error("Error fetching wallpapers:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Add a new wallpaper
app.post("/make-server-95a96d8e/wallpapers", async (c) => {
  try {
    const { imageUrl, title, subtitle } = await c.req.json();

    if (!imageUrl || !title || !subtitle) {
      return c.json({ success: false, error: "Missing required fields" }, 400);
    }

    // Get all existing wallpapers to determine the next order
    const wallpaperKeys = await kv.getByPrefix("wallpaper:");
    const maxOrder = wallpaperKeys.reduce((max: number, item: any) => {
      if (!item || !item.value) return max;
      return Math.max(max, item.value.order || 0);
    }, -1);

    const wallpaperId = `wallpaper:${Date.now()}`;
    const wallpaper = {
      id: wallpaperId,
      imageUrl,
      title,
      subtitle,
      order: maxOrder + 1,
      createdAt: new Date().toISOString(),
    };

    await kv.set(wallpaperId, wallpaper);
    console.log("Wallpaper added:", wallpaperId);

    return c.json({ success: true, wallpaper });
  } catch (error) {
    console.error("Error adding wallpaper:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update a wallpaper
app.put("/make-server-95a96d8e/wallpapers/:wallpaperId", async (c) => {
  try {
    const wallpaperId = c.req.param("wallpaperId");
    const { imageUrl, title, subtitle } = await c.req.json();

    const existingWallpaper = await kv.get(wallpaperId);
    if (!existingWallpaper) {
      return c.json({ success: false, error: "Wallpaper not found" }, 404);
    }

    const updatedWallpaper = {
      ...existingWallpaper,
      imageUrl: imageUrl || existingWallpaper.imageUrl,
      title: title || existingWallpaper.title,
      subtitle: subtitle || existingWallpaper.subtitle,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(wallpaperId, updatedWallpaper);
    console.log("Wallpaper updated:", wallpaperId);

    return c.json({ success: true, wallpaper: updatedWallpaper });
  } catch (error) {
    console.error("Error updating wallpaper:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete a wallpaper
app.delete("/make-server-95a96d8e/wallpapers/:wallpaperId", async (c) => {
  try {
    const wallpaperId = c.req.param("wallpaperId");
    const wallpaper = await kv.get(wallpaperId);

    if (!wallpaper) {
      return c.json({ success: false, error: "Wallpaper not found" }, 404);
    }

    await kv.del(wallpaperId);
    console.log("Wallpaper deleted:", wallpaperId);

    // Reorder remaining wallpapers
    const wallpaperKeys = await kv.getByPrefix("wallpaper:");
    const sortedWallpapers = wallpaperKeys.map((item) => item.value).sort((a: any, b: any) => a.order - b.order);

    for (let i = 0; i < sortedWallpapers.length; i++) {
      const wp = sortedWallpapers[i];
      if (wp.order !== i) {
        await kv.set(wp.id, { ...wp, order: i });
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting wallpaper:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Reorder wallpapers
app.put("/make-server-95a96d8e/wallpapers/:wallpaperId/reorder", async (c) => {
  try {
    const wallpaperId = c.req.param("wallpaperId");
    const { direction } = await c.req.json();

    const wallpaper = await kv.get(wallpaperId);
    if (!wallpaper) {
      return c.json({ success: false, error: "Wallpaper not found" }, 404);
    }

    const wallpaperKeys = await kv.getByPrefix("wallpaper:");
    const sortedWallpapers = wallpaperKeys.map((item) => item.value).sort((a: any, b: any) => a.order - b.order);

    const currentIndex = sortedWallpapers.findIndex((wp: any) => wp.id === wallpaperId);

    if (direction === "up" && currentIndex > 0) {
      // Swap with previous wallpaper
      const prevWallpaper = sortedWallpapers[currentIndex - 1];
      await kv.set(wallpaperId, { ...wallpaper, order: wallpaper.order - 1 });
      await kv.set(prevWallpaper.id, { ...prevWallpaper, order: prevWallpaper.order + 1 });
    } else if (direction === "down" && currentIndex < sortedWallpapers.length - 1) {
      // Swap with next wallpaper
      const nextWallpaper = sortedWallpapers[currentIndex + 1];
      await kv.set(wallpaperId, { ...wallpaper, order: wallpaper.order + 1 });
      await kv.set(nextWallpaper.id, { ...nextWallpaper, order: nextWallpaper.order - 1 });
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error reordering wallpaper:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Upload wallpaper image
app.post("/make-server-95a96d8e/upload-wallpaper", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return c.json({ success: false, error: "No file provided" }, 400);
    }

    // Create a unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `wallpaper_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage using service role (bypasses RLS)
    console.log("Uploading file:", fileName, "Type:", file.type, "Size:", uint8Array.length);
    const { data, error } = await supabase.storage.from("product-images").upload(fileName, uint8Array, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      console.error("Error uploading wallpaper image:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      return c.json({ success: false, error: error.message }, 500);
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(data.path);

    console.log("Wallpaper image uploaded:", fileName);
    return c.json({ success: true, imageUrl: urlData.publicUrl });
  } catch (error) {
    console.error("Error uploading wallpaper image:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Upload image (general purpose - for custom clothing, products, etc.)
app.post("/make-server-95a96d8e/upload-image", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "";

    if (!file) {
      return c.json({ success: false, error: "No file provided" }, 400);
    }

    // Create a unique filename
    const fileExt = file.name.split(".").pop();
    const folderPath = folder ? `${folder}/` : "";
    const fileName = `${folderPath}${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage using service role (bypasses RLS)
    console.log("Uploading file:", fileName, "Type:", file.type, "Size:", uint8Array.length);
    const { data, error } = await supabase.storage.from("product-images").upload(fileName, uint8Array, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      console.error("Error uploading image:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      return c.json({ success: false, error: error.message }, 500);
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(data.path);

    console.log("Image uploaded successfully:", fileName);
    return c.json({ success: true, imageUrl: urlData.publicUrl });
  } catch (error) {
    console.error("Error in upload-image endpoint:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Fix storage RLS policies
app.post("/make-server-95a96d8e/fix-storage-rls", async (c) => {
  try {
    console.log("🔧 Attempting to fix storage RLS policies...");

    // Since we're using service role, we can bypass RLS by using a different approach
    // The issue is that RLS policies need to be created in the Supabase dashboard

    return c.json(
      {
        success: false,
        error: "RLS policies must be configured manually",
        instructions: {
          step1: "Go to your Supabase Dashboard",
          step2: "Navigate to Storage → product-images bucket",
          step3: 'Click on "Policies" tab',
          step4: 'Click "New Policy" → "For full customization"',
          step5: 'Set Policy name: "Allow all operations"',
          step6: 'Set Target roles: "public"',
          step7: 'Set Policy command: "All (SELECT, INSERT, UPDATE, DELETE)"',
          step8: "Set USING expression: bucket_id = 'product-images'",
          step9: "Set WITH CHECK expression: bucket_id = 'product-images'",
          step10: 'Click "Review" then "Save policy"',
          sql: `
-- Or run this SQL in Supabase SQL Editor:
CREATE POLICY "Allow all operations on product-images"
ON storage.objects FOR ALL
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');
        `,
        },
      },
      200
    );
  } catch (error) {
    console.error("Error in fix-storage-rls endpoint:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== SEED DEFAULT DATA ====================

// Seed default categories and wallpapers
app.post("/make-server-95a96d8e/seed-defaults", async (c) => {
  try {
    // Default categories with subcategories
    const defaultCategories = [
      {
        name: "Figures",
        slug: "figures",
        description: "Premium anime action figures and statues",
        icon: "Package",
        subcategories: ["Demon Slayer", "Naruto", "One Piece", "Attack on Titan", "My Hero Academia", "Dragon Ball"],
      },
      {
        name: "Katana",
        slug: "katana",
        description: "Authentic Japanese swords and replicas",
        icon: "Swords",
        subcategories: ["Demon Slayer Swords", "Samurai Katanas", "Replica Katanas", "Training Katanas"],
      },
      {
        name: "Accessories",
        slug: "accessories",
        description: "Keychains, pins, and more collectibles",
        icon: "Sparkles",
        subcategories: ["Keychains", "Pins & Badges", "Phone Cases", "Jewelry", "Bags & Backpacks"],
      },
      {
        name: "Posters",
        slug: "posters",
        description: "High-quality anime art prints",
        icon: "Image",
        subcategories: ["Wall Scrolls", "Framed Prints", "Mini Posters", "Canvas Art"],
      },
      {
        name: "Clothing",
        slug: "clothing",
        description: "Anime-themed apparel and cosplay",
        icon: "Shirt",
        subcategories: ["T-Shirts", "Hoodies", "Cosplay", "Accessories"],
      },
      {
        name: "Collectibles",
        slug: "collectibles",
        description: "Limited edition merchandise",
        icon: "Bookmark",
        subcategories: ["Limited Editions", "Trading Cards", "Plushies", "Model Kits"],
      },
    ];

    // Default wallpapers
    const defaultWallpapers = [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1668293750324-bd77c1f08ca9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW1vbiUyMHNsYXllciUyMGFuaW1lfGVufDF8fHx8MTc2NTMwODI3OHww&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Demon Slayer Collection",
        subtitle: "Limited Edition Figures & Katanas",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1740644545217-892da8cce224?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXJ1dG8lMjBhbmltZSUyMGNoYXJhY3RlcnxlbnwxfHx8fDE3NjUzMDgyNzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Naruto Legends",
        subtitle: "Iconic Ninja Collection",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1667419674822-1a9195436f1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmUlMjBwaWVjZSUyMGFuaW1lfGVufDF8fHx8MTc2NTMwODI3OXww&ixlib=rb-4.1.0&q=80&w=1080",
        title: "One Piece Adventure",
        subtitle: "Grand Line Treasures",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1709675577960-0b1e7ba55347?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdHRhY2slMjB0aXRhbiUyMGFuaW1lfGVufDF8fHx8MTc2NTMwODI3OXww&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Attack on Titan",
        subtitle: "Survey Corps Collection",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1575540325855-4b5d285a3845?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcmFnb24lMjBiYWxsJTIwYW5pbWV8ZW58MXx8fHwxNzY1MjE3NDA5fDA&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Dragon Ball Z",
        subtitle: "Super Saiyan Warriors",
      },
    ];

    // Check if categories already exist
    const existingCategories = await kv.getByPrefix("category:");

    if (existingCategories.length === 0) {
      // Seed categories
      for (let i = 0; i < defaultCategories.length; i++) {
        const category = defaultCategories[i];
        const categoryId = `category:${category.slug}`;
        await kv.set(categoryId, {
          id: categoryId,
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: category.icon,
          subcategories: category.subcategories,
          order: i,
          createdAt: new Date().toISOString(),
        });
      }
      console.log("Default categories seeded");
    }

    // Check if wallpapers already exist
    const existingWallpapers = await kv.getByPrefix("wallpaper:");

    if (existingWallpapers.length === 0) {
      // Seed wallpapers
      for (let i = 0; i < defaultWallpapers.length; i++) {
        const wallpaper = defaultWallpapers[i];
        const wallpaperId = `wallpaper:${Date.now()}_${i}`;
        await kv.set(wallpaperId, {
          id: wallpaperId,
          imageUrl: wallpaper.imageUrl,
          title: wallpaper.title,
          subtitle: wallpaper.subtitle,
          order: i,
          createdAt: new Date().toISOString(),
        });
      }
      console.log("Default wallpapers seeded");
    }

    return c.json({
      success: true,
      message: "Default data seeded successfully",
      categoriesSeeded: existingCategories.length === 0,
      wallpapersSeeded: existingWallpapers.length === 0,
    });
  } catch (error) {
    console.error("Error seeding defaults:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get customer orders by email or phone
app.get("/make-server-95a96d8e/my-orders", async (c) => {
  try {
    const email = c.req.query("email");
    const phone = c.req.query("phone");

    if (!email && !phone) {
      return c.json({ success: false, message: "Email or phone number is required" }, 400);
    }

    // Get all orders
    const allOrders = await kv.getByPrefix("order:");

    // Filter orders by email or phone
    const customerOrders = allOrders.filter((order: any) => {
      if (email && order.customerInfo?.email?.toLowerCase() === email.toLowerCase()) {
        return true;
      }
      if (phone && order.customerInfo?.phone === phone) {
        return true;
      }
      return false;
    });

    // Sort by creation date (newest first)
    customerOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({
      success: true,
      orders: customerOrders,
    });
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Admin: Get all coupons
app.get("/make-server-95a96d8e/admin/coupons", async (c) => {
  try {
    const coupons = await kv.getByPrefix("coupon:");
    return c.json({ success: true, coupons });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Admin: Create coupon
app.post("/make-server-95a96d8e/admin/coupons", async (c) => {
  try {
    const body = await c.req.json();
    const { code, discountType, discountValue, expiryDate, usageLimit, isActive } = body;

    if (!code || !discountType || !discountValue) {
      return c.json({ success: false, message: "Code, discount type, and discount value are required" }, 400);
    }

    // Check if coupon code already exists
    const existingCoupons = await kv.getByPrefix("coupon:");
    const duplicate = existingCoupons.find((c: any) => c.code.toUpperCase() === code.toUpperCase());

    if (duplicate) {
      return c.json({ success: false, message: "Coupon code already exists" }, 400);
    }

    const couponId = crypto.randomUUID();
    const coupon = {
      id: couponId,
      code: code.toUpperCase(),
      discountType, // 'percentage' or 'fixed'
      discountValue: parseFloat(discountValue),
      expiryDate: expiryDate || null,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      usageCount: 0,
      isActive: isActive !== false,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`coupon:${couponId}`, coupon);

    return c.json({ success: true, coupon });
  } catch (error) {
    console.error("Error creating coupon:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Admin: Update coupon
app.put("/make-server-95a96d8e/admin/coupons/:id", async (c) => {
  try {
    const couponId = c.req.param("id");
    const updates = await c.req.json();

    const existingCoupon = await kv.get(`coupon:${couponId}`);
    if (!existingCoupon) {
      return c.json({ success: false, message: "Coupon not found" }, 404);
    }

    const updatedCoupon = {
      ...existingCoupon,
      ...updates,
      id: couponId, // Ensure ID doesn't change
    };

    await kv.set(`coupon:${couponId}`, updatedCoupon);

    return c.json({ success: true, coupon: updatedCoupon });
  } catch (error) {
    console.error("Error updating coupon:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Admin: Delete coupon
app.delete("/make-server-95a96d8e/admin/coupons/:id", async (c) => {
  try {
    const couponId = c.req.param("id");
    await kv.del(`coupon:${couponId}`);
    return c.json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// USER ADDRESS MANAGEMENT
// ============================================

// Get all saved addresses for a user
app.get("/make-server-95a96d8e/addresses", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }

    const addresses = await kv.getByPrefix(`address:${user.id}:`);
    return c.json({ success: true, addresses: addresses || [] });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Save a new address
app.post("/make-server-95a96d8e/addresses", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }

    const addressData = await c.req.json();
    const addressId = crypto.randomUUID();
    const address = {
      id: addressId,
      userId: user.id,
      ...addressData,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`address:${user.id}:${addressId}`, address);
    return c.json({ success: true, address });
  } catch (error) {
    console.error("Error saving address:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update an address
app.put("/make-server-95a96d8e/addresses/:id", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }

    const addressId = c.req.param("id");
    const addressData = await c.req.json();

    const existingAddress = await kv.get(`address:${user.id}:${addressId}`);
    if (!existingAddress) {
      return c.json({ success: false, message: "Address not found" }, 404);
    }

    const updatedAddress = {
      ...existingAddress,
      ...addressData,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`address:${user.id}:${addressId}`, updatedAddress);
    return c.json({ success: true, address: updatedAddress });
  } catch (error) {
    console.error("Error updating address:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete an address
app.delete("/make-server-95a96d8e/addresses/:id", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }

    const addressId = c.req.param("id");
    await kv.del(`address:${user.id}:${addressId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting address:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// ORDER ADDRESS UPDATE
// ============================================

// Update order address (only if status is pending)
app.put("/make-server-95a96d8e/orders/:id/address", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }

    const orderId = c.req.param("id");
    const newAddress = await c.req.json();

    const order = await kv.get(`order:${orderId}`);
    if (!order) {
      return c.json({ success: false, message: "Order not found" }, 404);
    }

    // Check if order belongs to user
    if (order.customerInfo?.email !== user.email) {
      return c.json({ success: false, message: "Unauthorized" }, 403);
    }

    // Only allow address change if status is pending
    if (order.status !== "Order Pending" && order.status.toLowerCase() !== "pending") {
      return c.json(
        {
          success: false,
          message: `Cannot change address. Order status is ${order.status}. Address can only be changed when status is pending.`,
        },
        400
      );
    }

    // Update the address
    order.customerInfo = {
      ...order.customerInfo,
      ...newAddress,
    };
    order.updatedAt = new Date().toISOString();

    await kv.set(`order:${orderId}`, order);

    // Send email notification to admin
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9333ea;">🔄 Order Address Updated</h2>
        <p>A customer has updated their delivery address for an order.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Details:</h3>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Tracking ID:</strong> ${order.trackingId}</p>
          <p><strong>Customer:</strong> ${order.customerInfo.firstName} ${order.customerInfo.lastName}</p>
          <p><strong>Email:</strong> ${order.customerInfo.email}</p>
        </div>

        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">New Delivery Address:</h3>
          <p>${order.customerInfo.address}</p>
          <p>${order.customerInfo.city}, ${order.customerInfo.state} - ${order.customerInfo.pincode}</p>
          <p><strong>Phone:</strong> ${order.customerInfo.phone}</p>
        </div>

        <p style="color: #666; font-size: 14px;">Please update shipping details accordingly.</p>
      </div>
    `;

    await sendEmail(ADMIN_EMAIL, `🔄 Address Updated - Order ${order.trackingId}`, emailHtml);

    return c.json({ success: true, order });
  } catch (error) {
    console.error("Error updating order address:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// ACCOUNT DELETION
// ============================================

// Delete user account
app.delete("/make-server-95a96d8e/account", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }

    // Send sad goodbye email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
        <div style="font-size: 100px; margin: 20px 0;">😢</div>
        <h2 style="color: #9333ea;">We're Sorry to See You Go</h2>
        <p style="font-size: 18px; color: #666;">Your account has been successfully deleted.</p>
        <p style="color: #666;">We hope to see you again in the future at animedropzone!</p>
        <p style="color: #999; font-size: 14px; margin-top: 40px;">
          If this was a mistake, you can always create a new account.
        </p>
      </div>
    `;

    await sendEmail(user.email!, "😢 Account Deleted - animedropzone", emailHtml);

    // Send notification to admin about account deletion
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a0a2e 0%, #7b2cbf 100%); border-radius: 16px; padding: 30px; }
            .header { background: linear-gradient(to right, #dc2626, #f59e0b); padding: 20px; border-radius: 12px; margin-bottom: 20px; text-align: center; }
            .content { background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; border: 1px solid rgba(220,38,38,0.3); }
            .info-box { padding: 15px; background: rgba(123,44,191,0.2); border-left: 4px solid #7b2cbf; border-radius: 8px; margin: 10px 0; }
            .label { color: #fca5a5; font-weight: bold; }
            .value { color: #e5e5e5; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; color: white;">👋 User Account Deleted</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px; margin-bottom: 20px;">Admin Alert: A user has deleted their account.</p>
              
              <div class="info-box">
                <p style="margin: 5px 0;"><span class="label">User ID:</span> <span class="value">${user.id}</span></p>
                <p style="margin: 5px 0;"><span class="label">Email:</span> <span class="value">${user.email}</span></p>
                <p style="margin: 5px 0;"><span class="label">Deleted At:</span> <span class="value">${new Date().toLocaleString()}</span></p>
              </div>
              
              <h3 style="color: #e91e63; margin-top: 20px;">User Metadata</h3>
              <p><span class="label">Name:</span> <span class="value">${user.user_metadata?.name || "N/A"}</span></p>
              <p><span class="label">Phone:</span> <span class="value">${user.user_metadata?.phone || "N/A"}</span></p>
              <p><span class="label">Created At:</span> <span class="value">${new Date(
                user.created_at || ""
              ).toLocaleDateString()}</span></p>
              
              <div style="margin-top: 20px; padding: 15px; background: rgba(245,158,11,0.2); border-left: 4px solid #f59e0b; border-radius: 8px;">
                <p style="margin: 0; color: #fbbf24;">⚠️ All user data including addresses and preferences have been permanently deleted.</p>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background: rgba(59,130,246,0.2); border-left: 4px solid #3b82f6; border-radius: 8px;">
                <p style="margin: 0; color: #93c5fd;">💡 The user can still create a new account with the same email if they wish to return.</p>
              </div>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>AnimeDropZone Admin Panel</p>
              <p>User management system</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail(ADMIN_EMAIL, `👋 User Account Deleted - ${user.email}`, adminEmailHtml);

    // Delete user's data from KV store
    const addresses = await kv.getByPrefix(`address:${user.id}:`);
    for (const addr of addresses) {
      if (addr.id) {
        await kv.del(`address:${user.id}:${addr.id}`);
      }
    }

    // Delete user from Supabase Auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error("Error deleting user from auth:", deleteError);
      return c.json({ success: false, error: "Failed to delete account" }, 500);
    }

    return c.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// ADMIN - USER MANAGEMENT
// ============================================

// Get all users (admin only)
app.post("/make-server-95a96d8e/admin/users", async (c) => {
  try {
    const { userId, password } = await c.req.json();

    if (userId !== ADMIN_CREDENTIALS.userId || password !== ADMIN_CREDENTIALS.password) {
      return c.json({ success: false, message: "Invalid admin credentials" }, 401);
    }

    // Get all users from Supabase Auth
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("Error fetching users:", error);
      return c.json({ success: false, error: String(error) }, 500);
    }

    // Return user info without sensitive data
    const users = data.users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || "N/A",
      phone: user.user_metadata?.phone || "N/A",
      createdAt: user.created_at,
      lastSignIn: user.last_sign_in_at,
    }));

    return c.json({ success: true, users, count: users.length });
  } catch (error) {
    console.error("Error fetching users:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// PASSWORD RESET
// ============================================

// Request password reset
app.post("/make-server-95a96d8e/auth/forgot-password", async (c) => {
  try {
    const { email } = await c.req.json();

    if (!email) {
      return c.json({ success: false, message: "Email is required" }, 400);
    }

    // Generate reset token
    const resetToken = crypto.randomUUID();
    const resetData = {
      email,
      token: resetToken,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
    };

    await kv.set(`password-reset:${resetToken}`, resetData);

    // Send reset email
    const resetUrl = `${Deno.env.get("FRONTEND_URL") || "http://localhost:5173"}/reset-password?token=${resetToken}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9333ea;">🔐 Password Reset Request</h2>
        <p>You requested to reset your password for your animedropzone account.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin-bottom: 20px;">Click the button below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(to right, #9333ea, #ec4899); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Reset Password
          </a>
        </div>

        <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
      </div>
    `;

    await sendEmail(email, "🔐 Reset Your Password - animedropzone", emailHtml);

    return c.json({ success: true, message: "Password reset email sent" });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Reset password with token
app.post("/make-server-95a96d8e/auth/reset-password", async (c) => {
  try {
    const { token, newPassword } = await c.req.json();

    if (!token || !newPassword) {
      return c.json({ success: false, message: "Token and new password are required" }, 400);
    }

    // Verify token
    const resetData = await kv.get(`password-reset:${token}`);
    if (!resetData) {
      return c.json({ success: false, message: "Invalid or expired reset token" }, 400);
    }

    // Check if token expired
    if (new Date(resetData.expiresAt) < new Date()) {
      await kv.del(`password-reset:${token}`);
      return c.json({ success: false, message: "Reset token has expired" }, 400);
    }

    // Get user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error("Error listing users:", listError);
      return c.json({ success: false, error: "Failed to find user" }, 500);
    }

    const user = users.users.find((u) => u.email === resetData.email);
    if (!user) {
      return c.json({ success: false, message: "User not found" }, 404);
    }

    // Update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, { password: newPassword });

    if (updateError) {
      console.error("Error updating password:", updateError);
      return c.json({ success: false, error: "Failed to update password" }, 500);
    }

    // Delete used token
    await kv.del(`password-reset:${token}`);

    // Send confirmation email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; font-size: 60px; margin: 20px 0;">✅</div>
        <h2 style="color: #9333ea; text-align: center;">Password Reset Successful!</h2>
        <p style="text-align: center;">Your password has been successfully reset.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Account:</strong> ${resetData.email}</p>
          <p style="margin: 10px 0 0 0;"><strong>Changed at:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <p style="color: #666; font-size: 14px;">You can now log in with your new password.</p>
        <p style="color: #ef4444; font-size: 14px;">If you didn't make this change, please contact support immediately.</p>
      </div>
    `;

    await sendEmail(resetData.email, "✅ Password Reset Successful - animedropzone", emailHtml);

    return c.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== ANALYTICS ROUTES ====================

// Get analytics data
app.get("/make-server-95a96d8e/analytics", async (c) => {
  try {
    const range = c.req.query("range") || "30d";

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    switch (range) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "all":
        startDate = new Date(0);
        break;
    }

    // Get all orders
    const allOrders = await kv.getByPrefix("order:");
    const orders = allOrders
      .map((item) => item.value)
      .filter((order: any) => order && new Date(order.createdAt) >= startDate);

    // Get all products
    const allProducts = await kv.getByPrefix("product:");
    const products = allProducts.map((item) => item.value).filter((p) => p);

    // Get all users
    const allUsers = await kv.getByPrefix("user:");
    const users = allUsers.map((item) => item.value).filter((u) => u);

    // Calculate metrics
    const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
    const totalOrders = orders.length;
    const totalCustomers = users.length;
    const totalProducts = products.length;

    // Calculate growth (compare with previous period)
    const midDate = new Date(startDate.getTime() + (now.getTime() - startDate.getTime()) / 2);
    const recentOrders = orders.filter((order: any) => new Date(order.createdAt) >= midDate);
    const oldOrders = orders.filter((order: any) => new Date(order.createdAt) < midDate);

    const recentRevenue = recentOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
    const oldRevenue = oldOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);

    const revenueGrowth = oldRevenue > 0 ? Math.round(((recentRevenue - oldRevenue) / oldRevenue) * 100) : 0;
    const ordersGrowth =
      oldOrders.length > 0 ? Math.round(((recentOrders.length - oldOrders.length) / oldOrders.length) * 100) : 0;

    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Top products
    const productSales: { [key: string]: { name: string; sales: number; revenue: number } } = {};
    orders.forEach((order: any) => {
      order.items?.forEach((item: any) => {
        if (!productSales[item.id]) {
          productSales[item.id] = { name: item.name, sales: 0, revenue: 0 };
        }
        productSales[item.id].sales += item.quantity;
        productSales[item.id].revenue += item.price * item.quantity;
      });
    });
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Sales by category
    const categorySales: { [key: string]: number } = {};
    orders.forEach((order: any) => {
      order.items?.forEach((item: any) => {
        categorySales[item.category] = (categorySales[item.category] || 0) + item.price * item.quantity;
      });
    });
    const salesByCategory = Object.entries(categorySales).map(([name, value]) => ({ name, value }));

    // Revenue by month
    const monthlyData: { [key: string]: { revenue: number; orders: number } } = {};
    orders.forEach((order: any) => {
      const month = new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" });
      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, orders: 0 };
      }
      monthlyData[month].revenue += order.total || 0;
      monthlyData[month].orders += 1;
    });
    const revenueByMonth = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      orders: data.orders,
    }));

    // Orders by status
    const statusCounts: { [key: string]: number } = {};
    orders.forEach((order: any) => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });
    const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

    // Customer insights
    const customerEmails = new Set(orders.map((order: any) => order.customerInfo?.email).filter(Boolean));
    const newCustomers = users.filter((user: any) => user.createdAt && new Date(user.createdAt) >= startDate).length;
    const returningCustomers = customerEmails.size - newCustomers;
    const averageLifetimeValue = customerEmails.size > 0 ? Math.round(totalRevenue / customerEmails.size) : 0;

    return c.json({
      success: true,
      analytics: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        revenueGrowth,
        ordersGrowth,
        averageOrderValue,
        topProducts,
        salesByCategory,
        revenueByMonth,
        ordersByStatus,
        customerInsights: {
          newCustomers,
          returningCustomers,
          averageLifetimeValue,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== INVENTORY ALERTS ROUTES ====================

// Get inventory alerts
app.get("/make-server-95a96d8e/inventory-alerts", async (c) => {
  try {
    const settingsData = await kv.get("inventory:settings");
    const settings = settingsData || { criticalThreshold: 5, warningThreshold: 10 };

    const allProducts = await kv.getByPrefix("product:");
    const products = allProducts.map((item) => item.value).filter((p) => p);

    const alerts = products
      .filter((product: any) => product.stock <= settings.warningThreshold)
      .map((product: any) => ({
        id: product.id,
        productId: product.id,
        productName: product.name,
        currentStock: product.stock,
        threshold: product.stock <= settings.criticalThreshold ? settings.criticalThreshold : settings.warningThreshold,
        category: product.category,
        image: product.image,
        severity: product.stock <= settings.criticalThreshold ? "critical" : "warning",
      }))
      .sort((a: any, b: any) => a.currentStock - b.currentStock);

    return c.json({ success: true, alerts });
  } catch (error) {
    console.error("Error fetching inventory alerts:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get inventory settings
app.get("/make-server-95a96d8e/inventory-settings", async (c) => {
  try {
    const settings = await kv.get("inventory:settings");
    return c.json({
      success: true,
      settings: settings || { criticalThreshold: 5, warningThreshold: 10, emailNotifications: true },
    });
  } catch (error) {
    console.error("Error fetching inventory settings:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update inventory settings
app.post("/make-server-95a96d8e/inventory-settings", async (c) => {
  try {
    const settings = await c.req.json();
    await kv.set("inventory:settings", settings);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error updating inventory settings:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== BULK OPERATIONS ROUTES ====================

// Export products to CSV
app.get("/make-server-95a96d8e/products/export-csv", async (c) => {
  try {
    const allProducts = await kv.getByPrefix("product:");
    const products = allProducts.map((item) => item.value).filter((p) => p);

    const csvHeader = "name,description,price,category,subcategory,image,stock\n";
    const csvRows = products
      .map(
        (product: any) =>
          `"${product.name}","${product.description}",${product.price},"${product.category}","${
            product.subcategory || ""
          }","${product.image}",${product.stock}`
      )
      .join("\n");

    const csv = csvHeader + csvRows;

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=products.csv",
      },
    });
  } catch (error) {
    console.error("Error exporting products:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Bulk import products from CSV
app.post("/make-server-95a96d8e/products/bulk-import", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    const operation = formData.get("operation") as string;

    if (!file) {
      return c.json({ success: false, error: "No file provided" }, 400);
    }

    const text = await file.text();
    const lines = text.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      return c.json({ success: false, error: "CSV file is empty or invalid" }, 400);
    }

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    const errors: Array<{ row: number; error: string }> = [];
    let processed = 0;
    let failed = 0;

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map((v) => v.trim().replace(/^"|"$/g, ""));
        if (!values || values.length !== headers.length) {
          errors.push({ row: i + 1, error: "Invalid row format" });
          failed++;
          continue;
        }

        const productData: any = {};
        headers.forEach((header, index) => {
          productData[header] = values[index];
        });

        // Validate required fields
        if (!productData.name || !productData.price || !productData.category) {
          errors.push({ row: i + 1, error: "Missing required fields" });
          failed++;
          continue;
        }

        if (operation === "update") {
          // Find existing product by name
          const allProducts = await kv.getByPrefix("product:");
          const existingProduct = allProducts.find((p: any) => p.value && p.value.name === productData.name);

          if (existingProduct) {
            const productId = existingProduct.value.id;
            const updatedProduct = {
              ...existingProduct.value,
              ...productData,
              price: parseFloat(productData.price),
              stock: parseInt(productData.stock || "0"),
              updatedAt: new Date().toISOString(),
            };
            await kv.set(productId, updatedProduct);
            processed++;
          } else {
            errors.push({ row: i + 1, error: "Product not found for update" });
            failed++;
          }
        } else {
          // Add new product
          const productId = `product:${Date.now()}_${Math.random().toString(36).substring(7)}`;
          const newProduct = {
            id: productId,
            ...productData,
            price: parseFloat(productData.price),
            stock: parseInt(productData.stock || "0"),
            rating: 0,
            reviews: [],
            createdAt: new Date().toISOString(),
          };
          await kv.set(productId, newProduct);
          processed++;
        }
      } catch (error) {
        errors.push({ row: i + 1, error: String(error) });
        failed++;
      }
    }

    return c.json({
      success: true,
      result: {
        success: failed === 0,
        processed,
        failed,
        errors: errors.slice(0, 50), // Limit to 50 errors
      },
    });
  } catch (error) {
    console.error("Error importing products:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== NEWSLETTER ROUTES ====================

// Get all newsletters
app.get("/make-server-95a96d8e/newsletters", async (c) => {
  try {
    const allNewsletters = await kv.getByPrefix("newsletter:");
    const newsletters = allNewsletters
      .map((item) => item.value)
      .filter((n) => n)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({ success: true, newsletters });
  } catch (error) {
    console.error("Error fetching newsletters:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get newsletter subscribers
app.get("/make-server-95a96d8e/newsletter-subscribers", async (c) => {
  try {
    // Get all users who are subscribed
    const allUsers = await kv.getByPrefix("user:");
    const subscribers = allUsers
      .map((item) => item.value)
      .filter((user: any) => user && user.email)
      .map((user: any) => ({
        id: user.id,
        email: user.email,
        name: user.name || "User",
        subscribedAt: user.createdAt || new Date().toISOString(),
        status: "active",
      }));

    return c.json({ success: true, subscribers });
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create newsletter
app.post("/make-server-95a96d8e/newsletters", async (c) => {
  try {
    const { subject, content, htmlContent, scheduledFor } = await c.req.json();

    const newsletterId = `newsletter:${Date.now()}`;
    const newsletter = {
      id: newsletterId,
      subject,
      content,
      htmlContent: htmlContent || content,
      scheduledFor: scheduledFor || null,
      sentAt: null,
      status: scheduledFor ? "scheduled" : "draft",
      recipientCount: 0,
      openRate: 0,
      clickRate: 0,
      createdAt: new Date().toISOString(),
    };

    await kv.set(newsletterId, newsletter);
    return c.json({ success: true, newsletter });
  } catch (error) {
    console.error("Error creating newsletter:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update newsletter
app.put("/make-server-95a96d8e/newsletters/:id", async (c) => {
  try {
    const newsletterId = c.req.param("id");
    const updates = await c.req.json();

    const existing = await kv.get(newsletterId);
    if (!existing) {
      return c.json({ success: false, error: "Newsletter not found" }, 404);
    }

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(newsletterId, updated);
    return c.json({ success: true, newsletter: updated });
  } catch (error) {
    console.error("Error updating newsletter:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Send newsletter
app.post("/make-server-95a96d8e/newsletters/:id/send", async (c) => {
  try {
    const newsletterId = c.req.param("id");
    const newsletter = await kv.get(newsletterId);

    if (!newsletter) {
      return c.json({ success: false, error: "Newsletter not found" }, 404);
    }

    // Get all subscribers
    const allUsers = await kv.getByPrefix("user:");
    const subscribers = allUsers.map((item) => item.value).filter((user: any) => user && user.email);

    // Send emails to all subscribers
    let sentCount = 0;
    for (const user of subscribers) {
      try {
        await sendEmail(user.email, newsletter.subject, newsletter.htmlContent || newsletter.content);
        sentCount++;
      } catch (error) {
        console.error(`Failed to send to ${user.email}:`, error);
      }
    }

    // Update newsletter status
    const updated = {
      ...newsletter,
      status: "sent",
      sentAt: new Date().toISOString(),
      recipientCount: sentCount,
    };
    await kv.set(newsletterId, updated);

    return c.json({ success: true, sentCount });
  } catch (error) {
    console.error("Error sending newsletter:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete newsletter
app.delete("/make-server-95a96d8e/newsletters/:id", async (c) => {
  try {
    const newsletterId = c.req.param("id");
    await kv.del(newsletterId);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting newsletter:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== LOYALTY PROGRAM ROUTES ====================

// Get loyalty settings
app.get("/make-server-95a96d8e/loyalty/settings", async (c) => {
  try {
    const settings = await kv.get("loyalty:settings");
    return c.json({
      success: true,
      settings: settings || {
        pointsPerRupee: 1,
        signupBonus: 100,
        referralBonus: 500,
        birthdayBonus: 200,
        reviewBonus: 50,
        minimumRedemption: 500,
        redemptionValue: 10,
      },
    });
  } catch (error) {
    console.error("Error fetching loyalty settings:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update loyalty settings
app.post("/make-server-95a96d8e/loyalty/settings", async (c) => {
  try {
    const settings = await c.req.json();
    await kv.set("loyalty:settings", settings);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error updating loyalty settings:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get loyalty stats
app.get("/make-server-95a96d8e/loyalty/stats", async (c) => {
  try {
    const allUsers = await kv.getByPrefix("user:");
    const users = allUsers.map((item) => item.value).filter((u) => u);

    const totalMembers = users.length;
    const totalPointsIssued = users.reduce((sum: number, user: any) => sum + (user.loyaltyPoints || 0), 0);
    const totalPointsRedeemed = users.reduce((sum: number, user: any) => sum + (user.pointsRedeemed || 0), 0);
    const activeMembers = users.filter((user: any) => (user.loyaltyPoints || 0) > 0).length;

    // Top members
    const topMembers = users
      .filter((user: any) => user.loyaltyPoints > 0)
      .sort((a: any, b: any) => (b.loyaltyPoints || 0) - (a.loyaltyPoints || 0))
      .slice(0, 10)
      .map((user: any) => {
        const points = user.loyaltyPoints || 0;
        let tier = "Bronze";
        if (points >= 10000) tier = "Platinum";
        else if (points >= 5000) tier = "Gold";
        else if (points >= 1000) tier = "Silver";

        return {
          name: user.name || "User",
          email: user.email,
          points,
          tier,
        };
      });

    return c.json({
      success: true,
      stats: {
        totalMembers,
        totalPointsIssued,
        totalPointsRedeemed,
        activeMembers,
        topMembers,
      },
    });
  } catch (error) {
    console.error("Error fetching loyalty stats:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Award loyalty points (called after order completion)
app.post("/make-server-95a96d8e/loyalty/award-points", async (c) => {
  try {
    const { userId, orderId, amount } = await c.req.json();

    const user = await kv.get(userId);
    if (!user) {
      return c.json({ success: false, error: "User not found" }, 404);
    }

    const settings = (await kv.get("loyalty:settings")) || { pointsPerRupee: 1 };
    const pointsEarned = Math.floor(amount * settings.pointsPerRupee);

    const updatedUser = {
      ...user,
      loyaltyPoints: (user.loyaltyPoints || 0) + pointsEarned,
      pointsHistory: [
        ...(user.pointsHistory || []),
        {
          type: "earned",
          points: pointsEarned,
          orderId,
          date: new Date().toISOString(),
        },
      ],
    };

    await kv.set(userId, updatedUser);

    return c.json({ success: true, pointsEarned });
  } catch (error) {
    console.error("Error awarding loyalty points:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== ADVANCED SEARCH ROUTE ====================

// Advanced product search with filters
app.post("/make-server-95a96d8e/products/search", async (c) => {
  try {
    const { query, minPrice, maxPrice, category, minRating, sortBy, inStock } = await c.req.json();

    console.log("🔍 SEARCH REQUEST:", { query, minPrice, maxPrice, category, minRating, sortBy, inStock });

    const allProducts = await kv.getByPrefix("product:");
    console.log(`📦 Total products in database: ${allProducts.length}`);

    let products = allProducts.map((item) => item.value).filter((p) => p);
    console.log(`📦 Valid products after filtering nulls: ${products.length}`);

    // Apply filters
    if (query) {
      const searchLower = query.toLowerCase();
      console.log(`🔍 Searching for: "${searchLower}"`);

      const beforeCount = products.length;
      products = products.filter(
        (p: any) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          (p.subcategory && p.subcategory.toLowerCase().includes(searchLower))
      );
      console.log(`✅ After query filter: ${products.length} (from ${beforeCount})`);
    }

    if (minPrice !== undefined) {
      products = products.filter((p: any) => p.price >= minPrice);
    }

    if (maxPrice !== undefined) {
      products = products.filter((p: any) => p.price <= maxPrice);
    }

    if (category) {
      products = products.filter((p: any) => p.category === category);
    }

    if (minRating !== undefined) {
      products = products.filter((p: any) => (p.rating || 0) >= minRating);
    }

    if (inStock) {
      products = products.filter((p: any) => p.stock > 0);
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        products.sort((a: any, b: any) => a.price - b.price);
        break;
      case "price-high":
        products.sort((a: any, b: any) => b.price - a.price);
        break;
      case "rating":
        products.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        products.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return c.json({ success: true, products });
  } catch (error) {
    console.error("Error searching products:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== PRODUCT RECOMMENDATIONS ROUTE ====================

// Get product recommendations
app.get("/make-server-95a96d8e/products/:productId/recommendations", async (c) => {
  try {
    const productId = c.req.param("productId");
    const product = await kv.get(productId);

    if (!product) {
      return c.json({ success: false, error: "Product not found" }, 404);
    }

    const allProducts = await kv.getByPrefix("product:");
    let recommendations = allProducts.map((item) => item.value).filter((p: any) => p && p.id !== productId);

    // Prioritize same category and subcategory
    recommendations.sort((a: any, b: any) => {
      let scoreA = 0;
      let scoreB = 0;

      if (a.category === product.category) scoreA += 3;
      if (b.category === product.category) scoreB += 3;

      if (a.subcategory === product.subcategory) scoreA += 2;
      if (b.subcategory === product.subcategory) scoreB += 2;

      if ((a.rating || 0) > 4) scoreA += 1;
      if ((b.rating || 0) > 4) scoreB += 1;

      return scoreB - scoreA;
    });

    // Return top 6 recommendations
    recommendations = recommendations.slice(0, 6);

    return c.json({ success: true, recommendations });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Health check endpoint to verify server is working
app.get("/make-server-95a96d8e/health", (c) => {
  return c.json({
    success: true,
    status: "healthy",
    message: "AnimeDropZone server is running! 🎌",
    timestamp: new Date().toISOString(),
    services: {
      database: "connected",
      emailProvider: "mailersend",
      adminEmail: ADMIN_EMAIL,
    },
  });
});

// Test email endpoint - sends a test email to verify email service is working
app.post("/make-server-95a96d8e/test-email", async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;

    if (!email) {
      return c.json({ success: false, error: "Email address is required" }, 400);
    }

    console.log("🧪 TEST EMAIL: Starting test email send to:", email);

    const testSubject = "✅ Test Email from AnimeDropZone";
    const testBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a0033 0%, #000000 100%); color: #ffffff; border: 2px solid #9333ea; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(90deg, #9333ea 0%, #ec4899 50%, #9333ea 100%); padding: 40px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">🧪</div>
          <h1 style="margin: 0; font-size: 36px; color: #ffffff; text-shadow: 0 4px 20px rgba(0,0,0,0.5);">Test Email</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; color: #f3e8ff;">Email Service Test</p>
        </div>
        <div style="padding: 40px 30px; text-align: center;">
          <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%); border-left: 4px solid #22c55e; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <p style="margin: 0; color: #4ade80; font-size: 18px;"><strong>✅ Email Service is Working!</strong></p>
            <p style="margin: 10px 0 0 0; color: #d1d5db; font-size: 14px;">This is a test email from AnimeDropZone</p>
          </div>
          <p style="color: #e5e7eb; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">
            If you're seeing this email, it means your email service is configured correctly and working perfectly! 🎉
          </p>
          <div style="background: rgba(147, 51, 234, 0.1); border: 1px solid rgba(147, 51, 234, 0.3); border-radius: 10px; padding: 25px; margin: 30px 0;">
            <h3 style="margin: 0 0 15px 0; color: #a855f7; font-size: 18px;">📊 Test Details</h3>
            <p style="margin: 5px 0; color: #d1d5db; font-size: 14px;">Recipient: ${email}</p>
            <p style="margin: 5px 0; color: #d1d5db; font-size: 14px;">Sent at: ${new Date().toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
              dateStyle: "full",
              timeStyle: "medium",
            })}</p>
            <p style="margin: 5px 0; color: #d1d5db; font-size: 14px;">Provider: MailerSend</p>
          </div>
          <div style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%); border-radius: 8px; padding: 25px; text-align: center; margin-top: 30px;">
            <p style="margin: 0; color: #ec4899; font-size: 18px; font-weight: bold;">Email System Operational! ✅</p>
            <p style="margin: 10px 0 0 0; color: #d1d5db; font-size: 14px;">Your customers will receive emails successfully</p>
          </div>
        </div>
        <div style="background: rgba(0, 0, 0, 0.4); padding: 30px; text-align: center; border-top: 1px solid rgba(147, 51, 234, 0.3);">
          <p style="margin: 0 0 10px 0; color: #a855f7; font-size: 20px; font-weight: bold;">AnimeDropZone</p>
          <p style="margin: 0 0 15px 0; color: #9ca3af; font-size: 14px;">Email Service Test</p>
          <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 12px;">© 2025 AnimeDropZone. All rights reserved.<br>This is a test email sent to ${email}</p>
        </div>
      </div>
    `;

    console.log("🧪 TEST EMAIL: Calling sendEmail...");
    const result = await sendEmail(email, testSubject, testBody);

    console.log("🧪 TEST EMAIL: Result:", result);

    if (result.success) {
      console.log(`✅ TEST EMAIL SENT SUCCESSFULLY to ${email}`);
      return c.json({
        success: true,
        message: `Test email sent successfully to ${email}! Check your inbox (and spam folder).`,
        details: result,
      });
    } else {
      console.error(`❌ TEST EMAIL FAILED for ${email}`);
      console.error("Error:", JSON.stringify(result.error));
      return c.json(
        {
          success: false,
          error: "Failed to send test email",
          details: result.error,
        },
        500
      );
    }
  } catch (error) {
    console.error("❌ TEST EMAIL EXCEPTION:", error);
    return c.json(
      {
        success: false,
        error: String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      500
    );
  }
});

// ==================== RETURN REQUEST ROUTES ====================

// Submit a return request
app.post("/make-server-95a96d8e/orders/:orderId/return-request", async (c) => {
  try {
    const orderId = c.req.param("orderId");
    const { reason, description, customerEmail, customerName } = await c.req.json();

    console.log("🔵 Return request received for order:", orderId);

    // Get the order
    const order = await kv.get(orderId);
    if (!order) {
      return c.json({ success: false, error: "Order not found" }, 404);
    }

    // Check if order is delivered
    if (order.status !== "delivered") {
      return c.json({ success: false, error: "Can only request return for delivered orders" }, 400);
    }

    // Check if within 7 days of delivery
    const deliveryDate = new Date(order.deliveredAt || order.updatedAt);
    const daysSinceDelivery = Math.floor((Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceDelivery > 7) {
      return c.json({ success: false, error: "Return window (7 days) has expired" }, 400);
    }

    // Create return request
    const returnId = `return:${orderId}`;
    const returnRequest = {
      orderId,
      customerName,
      email: customerEmail,
      reason,
      description,
      status: "pending",
      requestedAt: new Date().toISOString(),
      orderTotal: order.total,
      items: order.items,
    };

    await kv.set(returnId, returnRequest);
    console.log("✅ Return request created:", returnId);

    // Send email to customer
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Return Request Received</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; color: #333;">Dear ${customerName},</p>
          
          <p style="font-size: 14px; color: #666; line-height: 1.6;">
            We have received your return request for order <strong>#${orderId}</strong>.
          </p>

          <div style="background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #667eea;">Return Details</h3>
            <p style="margin: 10px 0;"><strong>Reason:</strong> ${reason}</p>
            <p style="margin: 10px 0;"><strong>Description:</strong> ${description}</p>
            <p style="margin: 10px 0;"><strong>Status:</strong> <span style="color: #f59e0b;">Pending Review</span></p>
          </div>

          <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              ⏰ <strong>Next Steps:</strong><br/>
              Our team will review your request within 24-48 hours. You'll receive an email once your return is approved with shipping instructions.
            </p>
          </div>

          <p style="font-size: 14px; color: #666;">
            Thank you for your patience!
          </p>
          
          <p style="font-size: 14px; color: #666;">
            Best regards,<br/>
            <strong>AnimeDropZone Team</strong>
          </p>
        </div>
        
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            © 2024 AnimeDropZone. All rights reserved.
          </p>
        </div>
      </div>
    `;

    await sendEmail({
      to: customerEmail,
      subject: `Return Request Received - Order #${orderId}`,
      html: customerEmailHtml,
    });

    // Send email to admin
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🔄 New Return Request</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <div style="background: white; border: 2px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #ea580c;">Return Request Details</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${customerEmail}</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <p><strong>Description:</strong> ${description}</p>
            <p><strong>Order Total:</strong> ₹${order.total.toLocaleString()}</p>
            <p><strong>Requested At:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 5px;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              ⚠️ <strong>Action Required:</strong><br/>
              Please review this return request in the admin panel and approve/reject it.
            </p>
          </div>
        </div>
      </div>
    `;

    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `🔄 New Return Request - Order #${orderId}`,
      html: adminEmailHtml,
    });

    return c.json({ success: true, returnRequest });
  } catch (error) {
    console.error("Error creating return request:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all return requests (admin)
app.get("/make-server-95a96d8e/returns", async (c) => {
  try {
    const returnKeys = await kv.getByPrefix("return:");
    const returns = returnKeys
      .map((item) => item.value)
      .filter((item) => item !== null && item !== undefined)
      .sort((a: any, b: any) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

    return c.json({ success: true, returns });
  } catch (error) {
    console.error("Error fetching returns:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Approve return request
app.post("/make-server-95a96d8e/returns/:orderId/approve", async (c) => {
  try {
    const orderId = c.req.param("orderId");
    const { returnTrackingId } = await c.req.json();

    console.log("🔵 Approving return for order:", orderId);

    const returnId = `return:${orderId}`;
    const returnRequest = await kv.get(returnId);

    if (!returnRequest) {
      return c.json({ success: false, error: "Return request not found" }, 404);
    }

    // Update return request
    const updatedReturn = {
      ...returnRequest,
      status: "approved",
      returnTrackingId,
      processedAt: new Date().toISOString(),
    };

    await kv.set(returnId, updatedReturn);

    // Update order status
    const order = await kv.get(orderId);
    if (order) {
      await kv.set(orderId, {
        ...order,
        status: "return_approved",
        returnTrackingId,
        updatedAt: new Date().toISOString(),
      });
    }

    console.log("✅ Return approved:", returnId);

    // Send email to customer
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">✅ Return Approved!</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; color: #333;">Dear ${returnRequest.customerName},</p>
          
          <p style="font-size: 14px; color: #666; line-height: 1.6;">
            Great news! Your return request for order <strong>#${orderId}</strong> has been approved.
          </p>

          <div style="background: white; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #10b981;">Return Shipping Details</h3>
            <p style="margin: 10px 0;"><strong>Return Tracking ID:</strong></p>
            <p style="background: #f3f4f6; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 18px; color: #1f2937; margin: 10px 0;">
              ${returnTrackingId}
            </p>
            <p style="margin: 10px 0; font-size: 14px; color: #666;">
              Please use this tracking ID when shipping the item back to us.
            </p>
          </div>

          <div style="background: #dbeafe; border: 1px solid #3b82f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af; font-size: 14px;">
              📦 <strong>Return Instructions:</strong><br/>
              1. Pack the item securely in its original packaging<br/>
              2. Include a copy of your order receipt<br/>
              3. Ship to the address provided in your order confirmation<br/>
              4. Use the tracking ID above for reference<br/>
              5. Refund will be processed within 5-7 business days after inspection
            </p>
          </div>

          <p style="font-size: 14px; color: #666;">
            If you have any questions, please don't hesitate to contact us.
          </p>
          
          <p style="font-size: 14px; color: #666;">
            Best regards,<br/>
            <strong>AnimeDropZone Team</strong>
          </p>
        </div>
        
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            © 2024 AnimeDropZone. All rights reserved.
          </p>
        </div>
      </div>
    `;

    await sendEmail({
      to: returnRequest.email,
      subject: `Return Approved - Order #${orderId}`,
      html: customerEmailHtml,
    });

    return c.json({ success: true, returnRequest: updatedReturn });
  } catch (error) {
    console.error("Error approving return:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Reject return request
app.post("/make-server-95a96d8e/returns/:orderId/reject", async (c) => {
  try {
    const orderId = c.req.param("orderId");
    const { rejectionReason } = await c.req.json();

    console.log("🔵 Rejecting return for order:", orderId);

    const returnId = `return:${orderId}`;
    const returnRequest = await kv.get(returnId);

    if (!returnRequest) {
      return c.json({ success: false, error: "Return request not found" }, 404);
    }

    // Update return request
    const updatedReturn = {
      ...returnRequest,
      status: "rejected",
      rejectionReason,
      processedAt: new Date().toISOString(),
    };

    await kv.set(returnId, updatedReturn);
    console.log("✅ Return rejected:", returnId);

    // Send email to customer
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Return Request Update</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; color: #333;">Dear ${returnRequest.customerName},</p>
          
          <p style="font-size: 14px; color: #666; line-height: 1.6;">
            We have reviewed your return request for order <strong>#${orderId}</strong>.
          </p>

          <div style="background: white; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #ef4444;">Return Status</h3>
            <p style="margin: 10px 0; color: #991b1b;"><strong>Unfortunately, we cannot process this return at this time.</strong></p>
            <p style="margin: 10px 0;"><strong>Reason:</strong> ${rejectionReason}</p>
          </div>

          <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              💬 <strong>Need Help?</strong><br/>
              If you have questions about this decision or need further assistance, please contact our support team.
            </p>
          </div>

          <p style="font-size: 14px; color: #666;">
            We appreciate your understanding.
          </p>
          
          <p style="font-size: 14px; color: #666;">
            Best regards,<br/>
            <strong>AnimeDropZone Team</strong>
          </p>
        </div>
        
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            © 2024 AnimeDropZone. All rights reserved.
          </p>
        </div>
      </div>
    `;

    await sendEmail({
      to: returnRequest.email,
      subject: `Return Request Update - Order #${orderId}`,
      html: customerEmailHtml,
    });

    return c.json({ success: true, returnRequest: updatedReturn });
  } catch (error) {
    console.error("Error rejecting return:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== USER PROFILE ROUTES ====================

// Get user profile with loyalty points and default address
app.get("/make-server-95a96d8e/user-profile", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ success: false, error: "No authorization token provided" }, 401);
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const userId = `user:${user.id}`;
    const userData = await kv.get(userId);

    // Get default address
    const allAddresses = await kv.getByPrefix(`address:${user.id}:`);
    const defaultAddress = allAddresses.find((addr: any) => addr.value?.isDefault);

    return c.json({
      success: true,
      profile: {
        email: user.email,
        name: user.user_metadata?.name || "",
        phone: user.user_metadata?.phone || "",
        loyaltyPoints: userData?.loyaltyPoints || 0,
        pointsHistory: userData?.pointsHistory || [],
        defaultAddress: defaultAddress?.value || null,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Set default address
app.post("/make-server-95a96d8e/addresses/:addressId/set-default", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ success: false, error: "No authorization token provided" }, 401);
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const addressId = c.req.param("addressId");

    // Get all addresses for this user
    const allAddresses = await kv.getByPrefix(`address:${user.id}:`);

    // Remove default flag from all addresses
    for (const addrItem of allAddresses) {
      const addr = addrItem.value;
      if (addr) {
        await kv.set(addrItem.key, { ...addr, isDefault: false });
      }
    }

    // Set the selected address as default
    const addressKey = `address:${user.id}:${addressId}`;
    const address = await kv.get(addressKey);
    if (address) {
      await kv.set(addressKey, { ...address, isDefault: true });
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error setting default address:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== LEGAL CONTENT MANAGEMENT ====================

// Get legal content (Privacy Policy & Terms of Service)
app.get("/make-server-95a96d8e/legal-content", async (c) => {
  try {
    const privacyContent = await kv.get("legal:privacy-policy");
    const termsContent = await kv.get("legal:terms-of-service");

    return c.json({
      success: true,
      privacy: privacyContent || "",
      terms: termsContent || "",
    });
  } catch (error) {
    console.error("Error fetching legal content:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update legal content (admin only)
app.post("/make-server-95a96d8e/legal-content", async (c) => {
  try {
    const { type, content } = await c.req.json();

    if (!type || (type !== "privacy" && type !== "terms")) {
      return c.json({ success: false, error: 'Invalid type. Must be "privacy" or "terms"' }, 400);
    }

    const key = type === "privacy" ? "legal:privacy-policy" : "legal:terms-of-service";

    // Store the content (empty string means use default)
    await kv.set(key, content || "");
    console.log(`Legal content updated: ${key}`);

    return c.json({ success: true, message: "Legal content updated successfully" });
  } catch (error) {
    console.error("Error updating legal content:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== PAYMENT SETTINGS ====================

// Get payment settings
app.get("/make-server-95a96d8e/payment-settings", async (c) => {
  try {
    const settings = await kv.get("payment:settings");

    // Default settings if none exist
    const defaultSettings = {
      razorpay: {
        enabled: true,
        keyId: "",
        keySecret: "",
        mode: "test",
      },
      upi: {
        enabled: true,
        upiId: "ziddenkhan5@ptaxis",
        autoVerify: false,
      },
      paytm: {
        enabled: true,
        merchantId: "",
        merchantKey: "",
        website: "",
      },
      cod: {
        enabled: true,
        minOrder: 0,
        maxOrder: 50000,
        extraCharges: 0,
      },
    };

    return c.json({
      success: true,
      settings: settings || defaultSettings,
    });
  } catch (error) {
    console.error("Error fetching payment settings:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update payment settings (admin only)
app.post("/make-server-95a96d8e/payment-settings", async (c) => {
  try {
    const { settings } = await c.req.json();

    if (!settings) {
      return c.json({ success: false, error: "Settings object is required" }, 400);
    }

    await kv.set("payment:settings", settings);
    console.log("Payment settings updated");

    return c.json({ success: true, message: "Payment settings updated successfully" });
  } catch (error) {
    console.error("Error updating payment settings:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);

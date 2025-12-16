// Email service - Hostinger SMTP only
// Simple, focused, production-ready

const EMAIL_PROVIDER = "hostinger";

// Email validation function
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// Hostinger SMTP Configuration - ONLY PROVIDER
async function sendViaHostinger(to: string, subject: string, html: string) {
  // Get credentials from environment variables
  const hostingerEmail = Deno.env.get("HOSTINGER_SMTP_USER"); // noreply@animedropzone.com
  const hostingerPassword = Deno.env.get("HOSTINGER_SMTP_PASS"); // Your email password
  const hostingerHost = Deno.env.get("HOSTINGER_SMTP_HOST") || "smtp.hostinger.com";
  const hostingerPort = Deno.env.get("HOSTINGER_SMTP_PORT") || "465"; // 465 for SSL, 587 for TLS

  if (!hostingerEmail || !hostingerPassword) {
    console.error("❌ Hostinger credentials NOT configured");
    console.error("");
    console.error("⚠️ SETUP REQUIRED - Add these to Supabase Edge Functions Secrets:");
    console.error("");
    console.error("1. HOSTINGER_SMTP_USER = noreply@animedropzone.com");
    console.error("2. HOSTINGER_SMTP_PASS = your-email-password");
    console.error("");
    console.error("Steps:");
    console.error("1. Go to https://supabase.com/dashboard");
    console.error("2. Settings ⚙️ → Edge Functions");
    console.error("3. Click function: make-server-95a96d8e");
    console.error("4. Click Configuration/Secrets tab");
    console.error("5. Add the 2 variables above");
    console.error("6. Click Save");
    console.error("");
    return {
      success: false,
      error:
        "Hostinger SMTP credentials not configured. Please add HOSTINGER_SMTP_USER and HOSTINGER_SMTP_PASS to Supabase Edge Function secrets.",
    };
  }

  // Validate email addresses
  if (!isValidEmail(to)) {
    console.error(`❌ Invalid TO email format: "${to}"`);
    return { success: false, error: `Invalid recipient email format: ${to}` };
  }

  if (!isValidEmail(hostingerEmail)) {
    console.error(`❌ Invalid FROM email format: "${hostingerEmail}"`);
    return { success: false, error: `Invalid sender email format: ${hostingerEmail}` };
  }

  console.log("🔍 Hostinger SMTP Configuration:");
  console.log("  SMTP Host:", hostingerHost);
  console.log("  SMTP Port:", hostingerPort);
  console.log("  From Email:", hostingerEmail);
  console.log("  To Email:", to);
  console.log("  Subject:", subject);

  try {
    // Import Deno SMTP client
    const { SmtpClient } = await import("https://deno.land/x/smtp@v0.7.0/mod.ts");

    const client = new SmtpClient();

    // Connect to Hostinger SMTP with TLS
    await client.connectTLS({
      hostname: hostingerHost,
      port: parseInt(hostingerPort),
      username: hostingerEmail,
      password: hostingerPassword,
    });

    console.log("✅ Connected to Hostinger SMTP server");

    // Send email
    await client.send({
      from: hostingerEmail,
      to: to,
      subject: subject,
      content: html,
      html: html,
    });

    console.log("✅ Email sent successfully via Hostinger SMTP");

    // Close connection
    await client.close();

    return { success: true };
  } catch (error) {
    console.error("❌ Hostinger SMTP error:", error);
    console.error("   Error details:", String(error));
    console.error("");

    // Provide helpful error messages based on error type
    const errorStr = String(error).toLowerCase();

    if (
      errorStr.includes("authentication") ||
      errorStr.includes("auth") ||
      errorStr.includes("535") ||
      errorStr.includes("invalid")
    ) {
      console.error("⚠️ AUTHENTICATION FAILED:");
      console.error("   1. Verify email address is correct:");
      console.error("      HOSTINGER_SMTP_USER should be: noreply@animedropzone.com");
      console.error("   2. Verify email password is correct");
      console.error("   3. Go to Hostinger Control Panel → Email Accounts");
      console.error("   4. Find noreply@animedropzone.com");
      console.error("   5. Check or reset the password");
      console.error("   6. Make sure IMAP/SMTP is ENABLED");
      console.error("   7. Update HOSTINGER_SMTP_PASS in Supabase with correct password");
      console.error("");
    }

    if (errorStr.includes("connection") || errorStr.includes("econnrefused") || errorStr.includes("timeout")) {
      console.error("⚠️ CONNECTION FAILED:");
      console.error("   1. Check SMTP host: smtp.hostinger.com");
      console.error("   2. Check SMTP port: 465 (SSL) or 587 (TLS)");
      console.error("   3. Verify your server can reach Hostinger SMTP");
      console.error("   4. Check Hostinger email account is active");
      console.error("");
    }

    if (errorStr.includes("tls")) {
      console.error("⚠️ TLS/SSL ERROR:");
      console.error("   1. Port 465 is for SSL (should work by default)");
      console.error("   2. If that fails, try port 587 for TLS:");
      console.error("      Add HOSTINGER_SMTP_PORT = 587 to Supabase");
      console.error("");
    }

    return { success: false, error: String(error) };
  }
}

// Main email sending function - routes to Hostinger only
export async function sendEmail(to: string, subject: string, html: string) {
  // Validate email address
  if (!isValidEmail(to)) {
    console.error(`❌ Invalid email format: "${to}"`);
    console.error(`   Subject: ${subject}`);
    console.error(`   ⚠️ This email address is invalid and cannot be used.`);
    return { success: false, error: `Invalid email format: ${to}` };
  }

  console.log(`📧 Sending email via HOSTINGER to: ${to}`);

  try {
    // Send via Hostinger (only provider)
    const result = await sendViaHostinger(to, subject, html);

    if (result.success) {
      console.log(`✅ Email sent successfully to ${to}`);
    } else {
      console.error(`❌ Failed to send email to ${to}`);
      console.error(`   Error: ${JSON.stringify(result.error)}`);
    }

    return result;
  } catch (error) {
    console.error("❌ Email send error:", error);
    return { success: false, error: String(error) };
  }
}

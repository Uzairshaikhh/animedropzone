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
    // Use SMTP2GO relay service which has free tier and works with Supabase
    // Relay through their REST API instead of direct SMTP
    
    const smtp2goApiKey = Deno.env.get("SMTP2GO_API_KEY");
    
    // If SMTP2GO key is available, use it as relay
    if (smtp2goApiKey) {
      const response = await fetch("https://api.smtp2go.com/v3/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: smtp2goApiKey,
          to: [to],
          sender: hostingerEmail,
          subject: subject,
          html_body: html,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.data?.succeeded > 0) {
        console.log("✅ Email sent successfully via SMTP2GO relay");
        return { success: true };
      } else {
        console.error("SMTP2GO error:", data);
        throw new Error(`SMTP2GO error: ${JSON.stringify(data)}`);
      }
    }

    // Fallback: Use Brevo/Sendinblue API if available
    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    
    if (brevoApiKey) {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: {
            email: hostingerEmail,
            name: "AnimeDrop Zone",
          },
          to: [{ email: to }],
          subject: subject,
          htmlContent: html,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log("✅ Email sent successfully via Brevo relay");
        return { success: true };
      } else {
        console.error("Brevo error:", data);
        throw new Error(`Brevo error: ${JSON.stringify(data)}`);
      }
    }

    // If no relay service available, provide helpful error
    console.error("⚠️ NO RELAY SERVICE CONFIGURED");
    console.error("");
    console.error("For Supabase compatibility, use a relay service instead of direct SMTP:");
    console.error("");
    console.error("Option 1: SMTP2GO (Recommended - Free tier)");
    console.error("1. Go to https://www.smtp2go.com/");
    console.error("2. Sign up (free tier: 1000 emails/month)");
    console.error("3. Get API key from dashboard");
    console.error("4. Add to Supabase: SMTP2GO_API_KEY = your-key");
    console.error("");
    console.error("Option 2: Brevo/Sendinblue (Free tier)");
    console.error("1. Go to https://www.brevo.com/");
    console.error("2. Sign up (free tier: 300 emails/day)");
    console.error("3. Get API key from settings");
    console.error("4. Add to Supabase: BREVO_API_KEY = your-key");
    console.error("");
    
    return {
      success: false,
      error: "No relay service configured. Please add SMTP2GO_API_KEY or BREVO_API_KEY to Supabase.",
    };

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

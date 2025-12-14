// Email service that supports multiple providers
// Supports: MailerSend, Hostinger SMTP, Gmail SMTP, SendGrid, Brevo, Mailgun, and Resend

const EMAIL_PROVIDER = Deno.env.get("EMAIL_PROVIDER")?.toLowerCase() || "mailersend";

// Email validation function
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// MailerSend Configuration (BEST FREE TIER: 12,000 emails/month)
async function sendViaMailerSend(to: string, subject: string, html: string) {
  // Check multiple possible environment variable names (some might be misnamed)
  let mailersendApiKey =
    Deno.env.get("MAILERSEND_API_KEY") || Deno.env.get("mailsender_api") || Deno.env.get("mail_api");

  // Trim whitespace and remove quotes if present
  if (mailersendApiKey) {
    mailersendApiKey = mailersendApiKey.trim().replace(/^["']|["']$/g, "");
  }

  // Get from email - use a valid default for the test domain
  let fromEmail =
    Deno.env.get("MAILERSEND_FROM_EMAIL") || Deno.env.get("mail_sender") || "info@test-zkq340endq0gd796.mlsender.net";

  // Trim and validate from email
  if (fromEmail) {
    fromEmail = fromEmail.trim().replace(/^[\\\"']|[\\\"']$/g, "");
  }

  // Validate from email format
  if (!isValidEmail(fromEmail)) {
    console.error(`❌ Invalid FROM email format: "${fromEmail}"`);
    console.error("⚠️ Please check MAILERSEND_FROM_EMAIL environment variable");
    console.error("   Expected: A valid email address like info@yourdomain.com");
    console.error("   Current value:", fromEmail);
    // Use fallback
    fromEmail = "info@test-zkq340endq0gd796.mlsender.net";
    console.log("   Using fallback FROM email:", fromEmail);
  }

  // Validate recipient email format
  if (!isValidEmail(to)) {
    console.error(`❌ Invalid TO email format: "${to}"`);
    return { success: false, error: `Invalid recipient email format: ${to}` };
  }

  // Debug logging
  console.log("🔍 MailerSend Configuration Debug:");
  console.log("  Checking env vars: MAILERSEND_API_KEY, mailsender_api, mail_api");
  console.log("  MAILERSEND_API_KEY:", Deno.env.get("MAILERSEND_API_KEY") ? "SET" : "NOT SET");
  console.log("  mailsender_api:", Deno.env.get("mailsender_api") ? "SET" : "NOT SET");
  console.log("  mail_api:", Deno.env.get("mail_api") ? "SET" : "NOT SET");
  console.log("  Selected API Key exists:", !!mailersendApiKey);
  console.log("  API Key length:", mailersendApiKey?.length || 0);
  console.log("  API Key prefix:", mailersendApiKey ? mailersendApiKey.substring(0, 10) + "..." : "NOT SET");
  console.log("  API Key starts with mlsn:", mailersendApiKey?.startsWith("mlsn.") || false);
  console.log("  MAILERSEND_FROM_EMAIL env:", Deno.env.get("MAILERSEND_FROM_EMAIL") || "NOT SET");
  console.log("  mail_sender env:", Deno.env.get("mail_sender") || "NOT SET");
  console.log("  From Email (final):", fromEmail);

  if (!mailersendApiKey) {
    console.log("❌ MailerSend API key not configured in any env var");
    return { success: false, error: "MailerSend not configured. Please add MAILERSEND_API_KEY." };
  }

  if (!mailersendApiKey.startsWith("mlsn.")) {
    console.log('⚠️ WARNING: API key does not start with "mlsn." - this may not be a valid MailerSend key');
    console.log("   Expected format: mlsn.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
    console.log("   Actual key starts with:", mailersendApiKey.substring(0, 10));
  }

  try {
    const requestBody = {
      from: {
        email: fromEmail,
        name: "AnimeDrop Zone",
      },
      to: [
        {
          email: to,
        },
      ],
      subject: subject,
      html: html,
    };

    console.log("📤 Sending request to MailerSend API...");
    console.log("   Request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch("https://api.mailersend.com/v1/email", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mailersendApiKey}`,
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log("📥 MailerSend API Response Status:", response.status);
    console.log("📥 MailerSend API Response:", responseText);

    if (response.ok || response.status === 202) {
      console.log("✅ Email sent via MailerSend");
      return { success: true };
    } else {
      console.error("❌ MailerSend error:", responseText);

      // Parse error response
      let errorDetails = responseText;
      try {
        const errorJson = JSON.parse(responseText);
        errorDetails = errorJson;
      } catch (e) {
        // responseText is not JSON
      }

      // Provide helpful error messages
      if (responseText.includes("Unauthenticated")) {
        console.error("⚠️ AUTHENTICATION FAILED:");
        console.error("   Error:", responseText);
        console.error("");
        console.error("   🔧 TROUBLESHOOTING STEPS:");
        console.error("");
        console.error("   1. Verify API Key is Active:");
        console.error("      - Go to https://app.mailersend.com/");
        console.error("      - Navigate to Settings → API Tokens");
        console.error("      - Check if your API key is listed and active");
        console.error("      - If not found, generate a NEW API key");
        console.error("");
        console.error("   2. Update API Key in Supabase:");
        console.error("      - Go to Supabase Dashboard");
        console.error("      - Project Settings → Edge Functions → Secrets");
        console.error("      - Update MAILERSEND_API_KEY with new key");
        console.error("      - Click Save");
        console.error("");
        console.error("   3. Verify MailerSend Account:");
        console.error("      - Go to https://app.mailersend.com/email-verification");
        console.error("      - Verify your email address if not done");
        console.error("      - Complete account setup");
        console.error("");
        console.error("   4. Check Domain Status:");
        console.error("      - Go to https://app.mailersend.com/domains");
        console.error("      - Verify at least one domain is active");
        console.error("      - Use the verified domain email as FROM address");
        console.error("");
        console.error("   5. Alternative: Switch Email Provider:");
        console.error('      - Set EMAIL_PROVIDER to "resend" or "brevo"');
        console.error("      - Add corresponding API key");
        console.error("");
        console.error("   📧 Customer Email:", to);
        console.error("");
      }

      // Handle trial account recipient limit error
      if (responseText.includes("trial account unique recipients limit") || responseText.includes("#MS42225")) {
        console.error("⚠️ MAILERSEND TRIAL ACCOUNT LIMIT REACHED:");
        console.error("   Error: You have reached the trial account unique recipients limit.");
        console.error("   ");
        console.error("   🔧 IMMEDIATE SOLUTIONS:");
        console.error("   ");
        console.error("   Option 1: Verify Your Domain (Removes Trial Limits)");
        console.error("   1. Go to https://app.mailersend.com/domains");
        console.error('   2. Click "Add Domain"');
        console.error("   3. Add your domain (e.g., animedropzone.com)");
        console.error("   4. Follow DNS verification steps");
        console.error("   5. Once verified, you get 12,000 emails/month FREE");
        console.error("   ");
        console.error("   Option 2: Use Alternative Email Provider");
        console.error("   1. Set EMAIL_PROVIDER environment variable to one of:");
        console.error('      - "resend" (3,000 emails/month FREE)');
        console.error('      - "sendgrid" (100 emails/day FREE)');
        console.error('      - "brevo" (300 emails/day FREE)');
        console.error("   2. Add corresponding API key");
        console.error("   ");
        console.error("   Option 3: Upgrade MailerSend Account");
        console.error("   - Go to https://app.mailersend.com/settings/billing");
        console.error("   - Choose a paid plan for unlimited recipients");
        console.error("   ");
        console.error("   📧 For now, emails will fail until limit is addressed.");

        return {
          success: false,
          error: "MailerSend trial limit reached. Please verify your domain or use an alternative email provider.",
          errorCode: "TRIAL_LIMIT_REACHED",
          details: errorDetails,
        };
      }

      return { success: false, error: responseText };
    }
  } catch (error) {
    console.error("MailerSend send error:", error);
    return { success: false, error: String(error) };
  }
}

// Hostinger SMTP Configuration
async function sendViaHostinger(to: string, subject: string, html: string) {
  const hostingerEmail = Deno.env.get("noreply@animedropzone.com"); // Your full email address (e.g., noreply@yourdomain.com)
  const hostingerPassword = Deno.env.get("Pepyfog@2"); // Your email password
  const hostingerHost = Deno.env.get("HOSTINGER_SMTP_HOST") || "smtp.hostinger.com";
  const hostingerPort = Deno.env.get("HOSTINGER_SMTP_PORT") || "465"; // 465 for SSL, 587 for TLS

  if (!hostingerEmail || !hostingerPassword) {
    console.log("❌ Hostinger credentials not configured");
    console.log("   Required environment variables:");
    console.log("   - HOSTINGER_EMAIL: Your full email address");
    console.log("   - HOSTINGER_PASSWORD: Your email password");
    return { success: false, error: "Hostinger not configured. Please add HOSTINGER_EMAIL and HOSTINGER_PASSWORD." };
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

  try {
    // For Deno, we'll use a third-party SMTP service that can relay through Hostinger
    // Or we can use the SMTP protocol directly

    // Using SMTP2GO as a relay with custom SMTP settings
    // Alternatively, we can use nodemailer equivalent for Deno

    // For now, let's use a direct SMTP approach with Deno
    // We'll need to import SMTP library for Deno
    const { SmtpClient } = await import("https://deno.land/x/smtp@v0.7.0/mod.ts");

    const client = new SmtpClient();

    // Connect based on port
    const useSSL = hostingerPort === "465";

    await client.connectTLS({
      hostname: hostingerHost,
      port: parseInt(hostingerPort),
      username: hostingerEmail,
      password: hostingerPassword,
    });

    console.log("✅ Connected to Hostinger SMTP server");

    await client.send({
      from: hostingerEmail,
      to: to,
      subject: subject,
      content: html,
      html: html,
    });

    console.log("✅ Email sent via Hostinger SMTP");

    await client.close();

    return { success: true };
  } catch (error) {
    console.error("❌ Hostinger SMTP error:", error);
    console.error("   Error details:", String(error));

    // Provide helpful error messages
    if (String(error).includes("authentication") || String(error).includes("auth") || String(error).includes("535")) {
      console.error("⚠️ HOSTINGER AUTHENTICATION FAILED:");
      console.error("   1. Check your email address is correct");
      console.error("   2. Check your email password is correct");
      console.error("   3. Make sure IMAP/SMTP is enabled in Hostinger Email settings");
      console.error("   4. Try resetting your email password in Hostinger panel");
    }

    if (String(error).includes("connection") || String(error).includes("ECONNREFUSED")) {
      console.error("⚠️ HOSTINGER CONNECTION FAILED:");
      console.error("   1. Check SMTP host is correct: smtp.hostinger.com");
      console.error("   2. Check SMTP port (465 for SSL, 587 for TLS)");
      console.error("   3. Verify your server can reach Hostinger SMTP server");
    }

    return { success: false, error: String(error) };
  }
}

// Gmail SMTP Configuration
async function sendViaGmail(to: string, subject: string, html: string) {
  const gmailUser = Deno.env.get("GMAIL_USER"); // Your Gmail address
  const gmailAppPassword = Deno.env.get("GMAIL_APP_PASSWORD"); // Gmail App Password (not regular password)

  if (!gmailUser || !gmailAppPassword) {
    console.log("Gmail credentials not configured");
    return { success: false, error: "Gmail not configured" };
  }

  try {
    // Using Deno's built-in SMTP client would require additional setup
    // Instead, we'll use a REST API approach with Gmail API or nodemailer-like library

    // For simplicity, using a third-party SMTP API service
    const response = await fetch("https://api.smtp2go.com/v3/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: Deno.env.get("SMTP2GO_API_KEY"), // Free tier: 1000 emails/month
        to: [to],
        sender: gmailUser,
        subject: subject,
        html_body: html,
      }),
    });

    const data = await response.json();

    if (response.ok && data.data?.succeeded > 0) {
      console.log("✅ Email sent via SMTP2GO (Gmail)");
      return { success: true, data };
    } else {
      console.error("SMTP2GO error:", data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.error("Gmail send error:", error);
    return { success: false, error: String(error) };
  }
}

// SendGrid Configuration
async function sendViaSendGrid(to: string, subject: string, html: string) {
  const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");
  const fromEmail = Deno.env.get("SENDGRID_FROM_EMAIL") || "noreply@animedropzone.com"; // ✅ Fixed: Don't use corrupted ADMIN_EMAIL

  if (!sendgridApiKey) {
    console.log("SendGrid API key not configured");
    return { success: false, error: "SendGrid not configured" };
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sendgridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
          },
        ],
        from: {
          email: fromEmail,
          name: "AnimeDrop Zone",
        },
        subject: subject,
        content: [
          {
            type: "text/html",
            value: html,
          },
        ],
      }),
    });

    if (response.ok || response.status === 202) {
      console.log("✅ Email sent via SendGrid");
      return { success: true };
    } else {
      const error = await response.text();
      console.error("SendGrid error:", error);
      return { success: false, error };
    }
  } catch (error) {
    console.error("SendGrid send error:", error);
    return { success: false, error: String(error) };
  }
}

// Brevo (Sendinblue) Configuration
async function sendViaBrevo(to: string, subject: string, html: string) {
  const brevoApiKey = Deno.env.get("BREVO_API_KEY");
  const fromEmail = Deno.env.get("BREVO_FROM_EMAIL") || "noreply@animedropzone.com"; // ✅ Fixed: Don't use corrupted ADMIN_EMAIL

  if (!brevoApiKey) {
    console.log("Brevo API key not configured");
    return { success: false, error: "Brevo not configured" };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          email: fromEmail,
          name: "AnimeDrop Zone",
        },
        to: [
          {
            email: to,
          },
        ],
        subject: subject,
        htmlContent: html,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Email sent via Brevo");
      return { success: true, data };
    } else {
      console.error("Brevo error:", data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.error("Brevo send error:", error);
    return { success: false, error: String(error) };
  }
}

// Mailgun Configuration
async function sendViaMailgun(to: string, subject: string, html: string) {
  const mailgunApiKey = Deno.env.get("MAILGUN_API_KEY");
  const mailgunDomain = Deno.env.get("MAILGUN_DOMAIN");
  const fromEmail = Deno.env.get("MAILGUN_FROM_EMAIL") || `noreply@${mailgunDomain}`;

  if (!mailgunApiKey || !mailgunDomain) {
    console.log("Mailgun not configured");
    return { success: false, error: "Mailgun not configured" };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("from", `AnimeDrop Zone <${fromEmail}>`);
    formData.append("to", to);
    formData.append("subject", subject);
    formData.append("html", html);

    const response = await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`api:${mailgunApiKey}`)}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Email sent via Mailgun");
      return { success: true, data };
    } else {
      console.error("Mailgun error:", data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.error("Mailgun send error:", error);
    return { success: false, error: String(error) };
  }
}

// Resend Configuration (existing)
async function sendViaResend(to: string, subject: string, html: string) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  if (!resendApiKey) {
    console.log("Resend API key not configured");
    return { success: false, error: "Resend not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "AnimeDrop Zone <onboarding@resend.dev>",
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Email sent via Resend");
      return { success: true, data };
    } else {
      console.error("Resend error:", data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.error("Resend send error:", error);
    return { success: false, error: String(error) };
  }
}

// Main email sending function that routes to the correct provider
export async function sendEmail(to: string, subject: string, html: string) {
  // Validate email address
  if (!isValidEmail(to)) {
    console.error(`❌ Invalid email format: "${to}"`);
    console.error(`   Subject: ${subject}`);
    console.error(`   ⚠️ This email address is invalid and cannot be used.`);
    return { success: false, error: `Invalid email format: ${to}` };
  }

  console.log(`📧 Sending email via ${EMAIL_PROVIDER.toUpperCase()} to: ${to}`);

  try {
    let result;

    switch (EMAIL_PROVIDER.toLowerCase()) {
      case "mailersend":
        result = await sendViaMailerSend(to, subject, html);
        break;
      case "hostinger":
        result = await sendViaHostinger(to, subject, html);
        break;
      case "gmail":
        result = await sendViaGmail(to, subject, html);
        break;
      case "sendgrid":
        result = await sendViaSendGrid(to, subject, html);
        break;
      case "brevo":
      case "sendinblue":
        result = await sendViaBrevo(to, subject, html);
        break;
      case "mailgun":
        result = await sendViaMailgun(to, subject, html);
        break;
      case "resend":
        result = await sendViaResend(to, subject, html);
        break;
      default:
        result = await sendViaMailerSend(to, subject, html);
        break;
    }

    // AUTOMATIC FALLBACK: If primary provider fails, try MailerSend
    if (!result.success && EMAIL_PROVIDER.toLowerCase() !== "mailersend") {
      console.log(`⚠️ Primary provider failed, attempting fallback to MailerSend...`);
      result = await sendViaMailerSend(to, subject, html);

      if (result.success) {
        console.log(`✅ Email successfully sent via FALLBACK (MailerSend)`);
      }
    }

    if (result.success) {
      console.log(`✅ Email sent successfully to ${to}`);
    } else {
      console.error(`❌ Failed to send email: ${JSON.stringify(result.error)}`);
    }

    return result;
  } catch (error) {
    console.error("Email send error:", error);

    // Final fallback attempt
    console.log(`⚠️ Error occurred, attempting final fallback to MailerSend...`);
    try {
      const fallbackResult = await sendViaMailerSend(to, subject, html);
      if (fallbackResult.success) {
        console.log(`✅ Email successfully sent via EMERGENCY FALLBACK (MailerSend)`);
        return fallbackResult;
      }
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
    }

    return { success: false, error: String(error) };
  }
}

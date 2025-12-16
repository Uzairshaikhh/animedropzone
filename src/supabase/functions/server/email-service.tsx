// Email service - SMTP2GO API relay (Supabase compatible)
// Uses REST API instead of direct SMTP to avoid Deno compatibility issues
// v2: Force redeploy

// Email validation function
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// SMTP2GO API relay function
async function sendViaSMTP2GO(to: string, subject: string, html: string) {
  const smtp2goApiKey = Deno.env.get("SMTP2GO_API_KEY");

  if (!smtp2goApiKey) {
    console.error("❌ SMTP2GO_API_KEY NOT configured");
    console.error("");
    console.error("⚠️ SETUP REQUIRED - Add SMTP2GO API key to Supabase Edge Functions:");
    console.error("");
    console.error("Steps:");
    console.error("1. Sign up at https://www.smtp2go.com (free: 1000 emails/month)");
    console.error("2. Get API key from Settings → API Tokens");
    console.error("3. Go to https://supabase.com/dashboard");
    console.error("4. Settings ⚙️ → Edge Functions → make-server-95a96d8e");
    console.error("5. Click Configuration tab → Add New Secret");
    console.error("6. Name: SMTP2GO_API_KEY");
    console.error("7. Value: [your API key]");
    console.error("8. Click Save and wait 2-3 minutes for redeploy");
    console.error("");
    return {
      success: false,
      error: "SMTP2GO_API_KEY not configured. Please add it to Supabase Edge Function secrets.",
    };
  }

  // Validate email addresses
  if (!isValidEmail(to)) {
    console.error(`❌ Invalid TO email format: "${to}"`);
    return { success: false, error: `Invalid recipient email format: ${to}` };
  }

  const fromEmail = "noreply@animedropzone.com";

  console.log("🔍 SMTP2GO Configuration:");
  console.log("  API Key: ****" + smtp2goApiKey.slice(-4));
  console.log("  From Email:", fromEmail);
  console.log("  To Email:", to);
  console.log("  Subject:", subject);

  try {
    // Call SMTP2GO API
    const response = await fetch("https://api.smtp2go.com/v3/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: smtp2goApiKey,
        to: [to],
        sender: fromEmail,
        subject: subject,
        html_body: html,
      }),
    });

    const responseData = await response.json();

    if (response.ok && responseData.request_id) {
      console.log("✅ Email sent successfully via SMTP2GO");
      console.log("   Request ID:", responseData.request_id);
      return { success: true };
    } else {
      console.error("❌ SMTP2GO API error:", responseData);
      const errorMessage = responseData.error || JSON.stringify(responseData);
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    console.error("❌ SMTP2GO request error:", error);
    console.error("   Error details:", String(error));
    console.error("");

    // Provide helpful error messages based on error type
    const errorStr = String(error).toLowerCase();

    if (errorStr.includes("authentication") || errorStr.includes("401") || errorStr.includes("unauthorized")) {
      console.error("⚠️ API KEY INVALID:");
      console.error("   1. Go to https://www.smtp2go.com/settings/tokens");
      console.error("   2. Create a new API token or copy existing one");
      console.error("   3. Go to Supabase Dashboard → Settings → Edge Functions");
      console.error("   4. Find make-server-95a96d8e → Configuration tab");
      console.error("   5. Update SMTP2GO_API_KEY with correct value");
      console.error("   6. Wait 2-3 minutes for redeploy");
      console.error("");
    }

    return { success: false, error: String(error) };
  }
}

// Main email sending function
export async function sendEmail(to: string, subject: string, html: string) {
  // Validate email address
  if (!isValidEmail(to)) {
    console.error(`❌ Invalid email format: "${to}"`);
    console.error(`   Subject: ${subject}`);
    console.error(`   ⚠️ This email address is invalid and cannot be used.`);
    return { success: false, error: `Invalid email format: ${to}` };
  }

  console.log(`📧 Sending email via SMTP2GO to: ${to}`);

  try {
    // Send via SMTP2GO
    const result = await sendViaSMTP2GO(to, subject, html);

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

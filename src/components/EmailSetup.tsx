import { Mail, CheckCircle, AlertCircle, ExternalLink, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

export function EmailSetup() {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const checkEmailConfig = async () => {
    setChecking(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/email-config`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      const data = await response.json();
      setStatus(data);
      // Auto-hide instructions if configured
      if (data.hostingerSmtpConfigured || data.mailersendApiKeySet) {
        setShowInstructions(false);
      }
    } catch (error) {
      console.error("Error checking email config:", error);
      setStatus({ error: "Failed to check email configuration" });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkEmailConfig();
  }, []);

  const isConfigured = status?.hostingerSmtpConfigured || status?.mailersendApiKeySet;

  const sendTestEmail = async () => {
    setSendingTest(true);
    setTestResult(null);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/test-email`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      console.error("Error sending test email:", error);
      setTestResult({ success: false, error: "Failed to send test email" });
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-6 h-6 text-purple-400" />
          <h3 className="text-white text-xl">Email Configuration - Hostinger</h3>
        </div>

        {status && (
          <div className="space-y-4">
            {/* Status Card */}
            <div
              className={`border rounded-lg p-4 ${
                isConfigured ? "bg-green-900/20 border-green-500/30" : "bg-yellow-900/20 border-yellow-500/30"
              }`}
            >
              <div className="flex items-start gap-3">
                {isConfigured ? (
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={isConfigured ? "text-green-400" : "text-yellow-400"}>
                    {status.message || "Checking configuration..."}
                  </p>
                  {status.provider && (
                    <p className="text-gray-400 text-sm mt-1">Provider: {status.provider.toUpperCase()}</p>
                  )}
                  {status.hostingerSmtpHost && (
                    <p className="text-gray-400 text-sm">SMTP Host: {status.hostingerSmtpHost}</p>
                  )}
                  {status.hostingerSmtpPort && (
                    <p className="text-gray-400 text-sm">SMTP Port: {status.hostingerSmtpPort}</p>
                  )}
                  {status.hostingerFromEmail && (
                    <p className="text-gray-400 text-sm">From Email: {status.hostingerFromEmail}</p>
                  )}
                  {status.adminEmail && <p className="text-gray-400 text-sm">Admin Email: {status.adminEmail}</p>}
                  {status.hostingerSmtpUser && (
                    <p className="text-gray-400 text-sm font-mono">SMTP User: {status.hostingerSmtpUser}</p>
                  )}
                  {!status.hostingerSmtpConfigured && (
                    <div className="mt-3 p-3 bg-red-900/30 border border-red-500/30 rounded text-sm space-y-1">
                      <p className="text-red-400">
                        ❌ Hostinger SMTP settings are NOT configured in Figma Make secrets
                      </p>
                      <p className="text-gray-400 text-xs">Click the 🔑 KEY icon in the top toolbar to add them</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Success Message */}
            {isConfigured && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-400">
                  ✅ Email system is ready! All order confirmations, custom clothing quotes, and notifications will be
                  sent automatically.
                </p>
                <p className="text-gray-400 text-sm mt-2">📧 Using Hostinger SMTP • Professional email delivery</p>
                <button
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="mt-3 text-purple-400 hover:text-purple-300 text-sm underline"
                >
                  {showInstructions ? "Hide Instructions" : "Show Instructions"}
                </button>
              </div>
            )}

            {/* Setup Instructions */}
            {!isConfigured || showInstructions ? (
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 space-y-4">
                <div>
                  <h4 className="text-white mb-3 flex items-center gap-2">
                    <span>📧 Quick Setup - Hostinger Email</span>
                  </h4>
                  
                  {/* Quick Start Card */}
                  <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/50 rounded-lg p-4 mb-4">
                    <p className="text-purple-200 text-sm font-medium mb-3">⚡ Complete these 3 steps:</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <span className="bg-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
                        <span>Create email account in Hostinger (noreply@yourdomain.com)</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <span className="bg-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                        <span>Add SMTP secrets to Supabase Edge Functions</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <span className="bg-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
                        <span>Redeploy function and test</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-purple-500/30 pt-4">
                  <h5 className="text-white mb-3 text-sm font-medium">📋 Required Secrets for Supabase:</h5>
                  <div className="space-y-2">
                    <div className="bg-black/40 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-1">Secret 1: Your Email Address</p>
                      <div className="flex gap-2">
                        <span className="text-green-400 flex-shrink-0">Name:</span>
                        <code className="text-gray-300">HOSTINGER_SMTP_USER</code>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-green-400 flex-shrink-0">Value:</span>
                        <code className="text-purple-300">noreply@yourdomain.com</code>
                      </div>
                    </div>
                    
                    <div className="bg-black/40 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-1">Secret 2: Email Password</p>
                      <div className="flex gap-2">
                        <span className="text-green-400 flex-shrink-0">Name:</span>
                        <code className="text-gray-300">HOSTINGER_SMTP_PASS</code>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-green-400 flex-shrink-0">Value:</span>
                        <code className="text-purple-300">[Your email password]</code>
                      </div>
                    </div>
                    
                    <div className="bg-black/40 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-1">Secret 3: Email Provider</p>
                      <div className="flex gap-2">
                        <span className="text-green-400 flex-shrink-0">Name:</span>
                        <code className="text-gray-300">EMAIL_PROVIDER</code>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-green-400 flex-shrink-0">Value:</span>
                        <code className="text-purple-300">hostinger</code>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-xs mt-3">
                    💡 How to add secrets: Go to <strong>Supabase Dashboard</strong> → <strong>Project Settings</strong> → <strong>Edge Functions</strong> → <strong>Secrets</strong>
                  </p>
                </div>

                {/* Detailed Instructions */}
                <div className="border-t border-purple-500/30 pt-4">
                  <h5 className="text-white mb-3 text-sm font-medium">📖 Detailed Setup Instructions:</h5>
                  <ol className="space-y-3 text-sm text-gray-300">
                  <li className="flex items-start gap-2 bg-black/20 p-3 rounded-lg">
                    <span className="text-purple-400 flex-shrink-0">2.</span>
                    <div className="flex-1">
                      <p className="mb-2">Go to Email Accounts in your Hostinger dashboard</p>
                      <p className="text-gray-400 text-xs">Create or manage your email accounts there</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 bg-black/20 p-3 rounded-lg">
                    <span className="text-purple-400 flex-shrink-0">3.</span>
                    <div className="flex-1">
                      <p className="mb-2">Get your SMTP settings from Hostinger:</p>
                      <div className="bg-black/40 rounded p-3 space-y-2 text-xs">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-400">SMTP Host:</p>
                            <p className="text-purple-300 font-mono">smtp.hostinger.com</p>
                          </div>
                          <div>
                            <p className="text-gray-400">SMTP Port:</p>
                            <p className="text-purple-300 font-mono">587 (TLS)</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-400">IMAP Host:</p>
                            <p className="text-purple-300 font-mono">imap.hostinger.com</p>
                          </div>
                          <div>
                            <p className="text-gray-400">IMAP Port:</p>
                            <p className="text-purple-300 font-mono">993 (SSL)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 bg-purple-900/30 border border-purple-500/50 p-4 rounded-lg">
                    <span className="text-purple-400 flex-shrink-0">4.</span>
                    <div className="flex-1">
                      <p className="text-white mb-3">🔑 Add to Figma Make Secrets:</p>
                      <div className="space-y-3">
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Click the 🔑 KEY ICON in the toolbar above</p>
                          <div className="bg-black/40 rounded p-2 space-y-2">
                            <div className="text-xs">
                              <span className="text-gray-400">Name:</span>
                              <span className="ml-2 font-mono text-green-400">EMAIL_PROVIDER</span>
                            </div>
                            <div className="text-xs">
                              <span className="text-gray-400">Value:</span>
                              <span className="ml-2 font-mono text-purple-300">hostinger</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Add SMTP settings:</p>
                          <div className="bg-black/40 rounded p-2 space-y-2">
                            <div className="text-xs">
                              <span className="text-gray-400">Name:</span>
                              <span className="ml-2 font-mono text-green-400">HOSTINGER_SMTP_HOST</span>
                            </div>
                            <div className="text-xs">
                              <span className="text-gray-400">Value:</span>
                              <span className="ml-2 font-mono text-purple-300">smtp.hostinger.com</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="bg-black/40 rounded p-2 space-y-2">
                            <div className="text-xs">
                              <span className="text-gray-400">Name:</span>
                              <span className="ml-2 font-mono text-green-400">HOSTINGER_SMTP_PORT</span>
                            </div>
                            <div className="text-xs">
                              <span className="text-gray-400">Value:</span>
                              <span className="ml-2 font-mono text-purple-300">587</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Your email credentials:</p>
                          <div className="bg-black/40 rounded p-2 space-y-2">
                            <div className="text-xs">
                              <span className="text-gray-400">Name:</span>
                              <span className="ml-2 font-mono text-green-400">HOSTINGER_SMTP_USER</span>
                            </div>
                            <div className="text-xs">
                              <span className="text-gray-400">Value:</span>
                              <span className="ml-2 font-mono text-purple-300">your-email@yourdomain.com</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="bg-black/40 rounded p-2 space-y-2">
                            <div className="text-xs">
                              <span className="text-gray-400">Name:</span>
                              <span className="ml-2 font-mono text-green-400">HOSTINGER_SMTP_PASS</span>
                            </div>
                            <div className="text-xs">
                              <span className="text-gray-400">Value:</span>
                              <span className="ml-2 font-mono text-purple-300">[Your email password]</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">From email address:</p>
                          <div className="bg-black/40 rounded p-2 space-y-2">
                            <div className="text-xs">
                              <span className="text-gray-400">Name:</span>
                              <span className="ml-2 font-mono text-green-400">HOSTINGER_FROM_EMAIL</span>
                            </div>
                            <div className="text-xs">
                              <span className="text-gray-400">Value:</span>
                              <span className="ml-2 font-mono text-purple-300">noreply@yourdomain.com</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Where to receive admin notifications:</p>
                          <div className="bg-black/40 rounded p-2 space-y-2">
                            <div className="text-xs">
                              <span className="text-gray-400">Name:</span>
                              <span className="ml-2 font-mono text-green-400">ADMIN_EMAIL</span>
                            </div>
                            <div className="text-xs">
                              <span className="text-gray-400">Value:</span>
                              <span className="ml-2 font-mono text-purple-300">admin@yourdomain.com</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 bg-green-900/20 border border-green-500/30 p-3 rounded-lg">
                    <span className="text-purple-400 flex-shrink-0">5.</span>
                    <div className="flex-1">
                      <p className="text-green-400">Click "Check Status" below to verify ✅</p>
                    </div>
                  </li>
                </ol>

                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    💡 <strong>Pro Tip:</strong> Hostinger email includes webmail access, so you can check emails
                    directly in your browser at mail.yourdomain.com
                  </p>
                </div>
              </div>
            ) : null}

            {/* Check Status Button */}
            <button
              onClick={checkEmailConfig}
              disabled={checking}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {checking ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Checking Configuration...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  {isConfigured ? "Refresh Status" : "Check Status"}
                </>
              )}
            </button>

            {/* Send Test Email Button */}
            {isConfigured ? (
              <button
                onClick={sendTestEmail}
                disabled={sendingTest}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-3"
              >
                {sendingTest ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending Test Email...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Test Email
                  </>
                )}
              </button>
            ) : null}

            {/* Test Email Result */}
            {testResult ? (
              <div
                className={`border rounded-lg p-4 ${
                  testResult.success ? "bg-green-900/20 border-green-500/30" : "bg-red-900/20 border-red-500/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  {testResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={testResult.success ? "text-green-400" : "text-red-400"}>
                      {testResult.message || "Sending test email..."}
                    </p>
                    {testResult.error ? (
                      <p className="text-gray-400 text-sm mt-1">Error: {testResult.error}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

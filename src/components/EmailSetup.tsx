import { Mail, CheckCircle, AlertCircle, ExternalLink, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function EmailSetup() {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const checkEmailConfig = async () => {
    setChecking(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/email-config`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      setStatus(data);
      // Auto-hide instructions if configured
      if (data.mailersendApiKeySet) {
        setShowInstructions(false);
      }
    } catch (error) {
      console.error('Error checking email config:', error);
      setStatus({ error: 'Failed to check email configuration' });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkEmailConfig();
  }, []);

  const isConfigured = status?.mailersendApiKeySet;

  const sendTestEmail = async () => {
    setSendingTest(true);
    setTestResult(null);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/test-email`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      );
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      console.error('Error sending test email:', error);
      setTestResult({ success: false, error: 'Failed to send test email' });
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-6 h-6 text-purple-400" />
          <h3 className="text-white text-xl">Email Configuration - MailerSend</h3>
        </div>

        {status && (
          <div className="space-y-4">
            {/* Status Card */}
            <div className={`border rounded-lg p-4 ${
              isConfigured 
                ? 'bg-green-900/20 border-green-500/30' 
                : 'bg-yellow-900/20 border-yellow-500/30'
            }`}>
              <div className="flex items-start gap-3">
                {isConfigured ? (
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={isConfigured ? 'text-green-400' : 'text-yellow-400'}>
                    {status.message || 'Checking configuration...'}
                  </p>
                  {status.provider && (
                    <p className="text-gray-400 text-sm mt-1">
                      Provider: {status.provider.toUpperCase()}
                    </p>
                  )}
                  {status.mailersendFromEmail && (
                    <p className="text-gray-400 text-sm">
                      From Email: {status.mailersendFromEmail}
                    </p>
                  )}
                  {status.adminEmail && (
                    <p className="text-gray-400 text-sm">
                      Admin Email: {status.adminEmail}
                    </p>
                  )}
                  {status.mailersendApiKeyPrefix && status.mailersendApiKeyPrefix !== 'NOT SET...' && (
                    <p className="text-gray-400 text-sm font-mono">
                      API Key: {status.mailersendApiKeyPrefix}
                    </p>
                  )}
                  {status.mailersendApiKeyPrefix && status.mailersendApiKeyPrefix !== 'NOT SET...' && (
                    <div className="mt-2 text-xs space-y-1">
                      <p className="text-gray-500">
                        Length: {status.mailersendApiKeyLength} chars {status.mailersendApiKeyHasNewlines && <span className="text-red-400">(⚠️ contains newlines!)</span>}
                      </p>
                      {status.mailersendApiKeyTrimmedLength !== status.mailersendApiKeyLength && (
                        <p className="text-yellow-400">
                          ⚠️ Has extra whitespace - trimmed length: {status.mailersendApiKeyTrimmedLength}
                        </p>
                      )}
                    </div>
                  )}
                  {!status.mailersendApiKeySet && (
                    <div className="mt-3 p-3 bg-red-900/30 border border-red-500/30 rounded text-sm space-y-1">
                      <p className="text-red-400">❌ MAILERSEND_API_KEY is NOT set in Figma Make secrets</p>
                      <p className="text-gray-400 text-xs">Click the 🔑 KEY icon in the top toolbar to add it</p>
                    </div>
                  )}
                  {status.verifiedSenders && status.verifiedSenders.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-900/30 border border-blue-500/30 rounded text-sm space-y-2">
                      <p className="text-blue-400 font-medium">✉️ Verified Sender Emails in MailerSend:</p>
                      {status.verifiedSenders.map((sender: any, index: number) => (
                        <div key={index} className="text-xs space-y-1 bg-black/30 p-2 rounded">
                          <p className="text-gray-400">Domain: <span className="text-green-400 font-mono">{sender.domain}</span></p>
                          <p className="text-gray-400">Use this email: <span className="text-purple-400 font-mono">{sender.defaultEmail}</span></p>
                          <p className="text-gray-400">Status: <span className="text-green-400">Active ✓</span></p>
                        </div>
                      ))}
                      <p className="text-yellow-400 text-xs mt-2">
                        💡 Add MAILERSEND_FROM_EMAIL secret with one of the emails above
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Success Message */}
            {isConfigured && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-400">
                  ✅ Email system is ready! All order confirmations, custom clothing quotes, and notifications will be sent automatically.
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  📊 Free Tier: 12,000 emails per month (~400 emails/day)
                </p>
                <button
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="mt-3 text-purple-400 hover:text-purple-300 text-sm underline"
                >
                  {showInstructions ? 'Hide Instructions' : 'Show Instructions'}
                </button>
              </div>
            )}

            {/* Setup Instructions */}
            {(!isConfigured || showInstructions) && (
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                <h4 className="text-white mb-3">📧 MailerSend Setup Guide</h4>
                <div className="mb-4 p-3 bg-black/30 rounded-lg">
                  <p className="text-purple-300 text-sm">
                    🎉 MailerSend offers the BEST free tier: <span className="text-green-400">12,000 emails/month</span>
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    No credit card required • Email verification only
                  </p>
                </div>
                <ol className="space-y-3 text-sm text-gray-300">
                  <li className="flex items-start gap-2 bg-black/20 p-3 rounded-lg">
                    <span className="text-purple-400 flex-shrink-0">1.</span>
                    <div className="flex-1">
                      <span>Create a free account at </span>
                      <a 
                        href="https://www.mailersend.com/signup" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-1"
                      >
                        MailerSend
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 bg-black/20 p-3 rounded-lg">
                    <span className="text-purple-400 flex-shrink-0">2.</span>
                    <div className="flex-1">
                      <p className="mb-2">MailerSend will provide you with a test domain:</p>
                      <div className="bg-purple-900/30 border border-purple-500/30 rounded px-3 py-2 font-mono text-purple-300 text-sm">
                        test-zkq340endq0gd796.mlsender.net
                      </div>
                      <p className="text-gray-400 text-xs mt-2">
                        ✅ Test domains work immediately - no verification needed!
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        📧 Admin notifications will be sent to: anime.drop.zone.00@gmail.com
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 bg-black/20 p-3 rounded-lg">
                    <span className="text-purple-400 flex-shrink-0">3.</span>
                    <div className="flex-1">
                      <span>Go to </span>
                      <a 
                        href="https://app.mailersend.com/api-tokens" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-1"
                      >
                        API Tokens
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <span> in your MailerSend dashboard</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 bg-black/20 p-3 rounded-lg">
                    <span className="text-purple-400 flex-shrink-0">4.</span>
                    <div className="flex-1">
                      <p className="mb-2">Click "Create New Token" and select:</p>
                      <ul className="list-disc list-inside text-gray-400 text-xs space-y-1 ml-2">
                        <li>Token name: "AnimeDrop Zone"</li>
                        <li>Scope: "Full Access" (or at least "Email sending")</li>
                      </ul>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 bg-black/20 p-3 rounded-lg">
                    <span className="text-purple-400 flex-shrink-0">5.</span>
                    <div className="flex-1">
                      <p className="mb-2">Copy the API token (starts with "mlsn.")</p>
                      <div className="bg-black/40 border border-yellow-500/30 rounded px-3 py-2 text-xs text-yellow-300">
                        ⚠️ Save it now! You won't be able to see it again.
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 bg-purple-900/30 border border-purple-500/50 p-4 rounded-lg">
                    <span className="text-purple-400 flex-shrink-0">6.</span>
                    <div className="flex-1">
                      <p className="text-white mb-3">🔑 Add to Figma Make Secrets:</p>
                      <div className="space-y-3">
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Click the 🔑 KEY ICON in the toolbar above</p>
                          <div className="bg-black/40 rounded p-2 space-y-2">
                            <div className="text-xs">
                              <span className="text-gray-400">Name:</span>
                              <span className="ml-2 font-mono text-green-400">MAILERSEND_API_KEY</span>
                            </div>
                            <div className="text-xs">
                              <span className="text-gray-400">Value:</span>
                              <span className="ml-2 font-mono text-gray-300">[Paste your mlsn.xxxxx token]</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Add another secret:</p>
                          <div className="bg-black/40 rounded p-2 space-y-2">
                            <div className="text-xs">
                              <span className="text-gray-400">Name:</span>
                              <span className="ml-2 font-mono text-green-400">MAILERSEND_FROM_EMAIL</span>
                            </div>
                            <div className="text-xs">
                              <span className="text-gray-400">Value:</span>
                              <span className="ml-2 font-mono text-purple-300">noreply@test-zkq340endq0gd796.mlsender.net</span>
                            </div>
                          </div>
                          <p className="text-gray-400 text-xs mt-2">
                            💡 Using your MailerSend test domain
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Add one more secret:</p>
                          <div className="bg-black/40 rounded p-2 space-y-2">
                            <div className="text-xs">
                              <span className="text-gray-400">Name:</span>
                              <span className="ml-2 font-mono text-green-400">EMAIL_PROVIDER</span>
                            </div>
                            <div className="text-xs">
                              <span className="text-gray-400">Value:</span>
                              <span className="ml-2 font-mono text-purple-300">mailersend</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">And finally:</p>
                          <div className="bg-black/40 rounded p-2 space-y-2">
                            <div className="text-xs">
                              <span className="text-gray-400">Name:</span>
                              <span className="ml-2 font-mono text-green-400">ADMIN_EMAIL</span>
                            </div>
                            <div className="text-xs">
                              <span className="text-gray-400">Value:</span>
                              <span className="ml-2 font-mono text-purple-300">anime.drop.zone.00@gmail.com</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 bg-green-900/20 border border-green-500/30 p-3 rounded-lg">
                    <span className="text-purple-400 flex-shrink-0">7.</span>
                    <div className="flex-1">
                      <p className="text-green-400">Click "Check Status" below to verify ✅</p>
                    </div>
                  </li>
                </ol>

                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    💡 <strong>Pro Tip:</strong> MailerSend also provides email templates, analytics, and webhooks if you need advanced features later.
                  </p>
                </div>
              </div>
            )}

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
                  {isConfigured ? 'Refresh Status' : 'Check Status'}
                </>
              )}
            </button>

            {/* Send Test Email Button */}
            {isConfigured && (
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
            )}

            {/* Test Email Result */}
            {testResult && (
              <div className={`border rounded-lg p-4 ${
                testResult.success
                  ? 'bg-green-900/20 border-green-500/30'
                  : 'bg-red-900/20 border-red-500/30'
              }`}>
                <div className="flex items-start gap-3">
                  {testResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p
                      className={
                        testResult.success ? 'text-green-400' : 'text-red-400'
                      }
                    >
                      {testResult.message || 'Sending test email...'}
                    </p>
                    {testResult.error && (
                      <p className="text-gray-400 text-sm mt-1">
                        Error: {testResult.error}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
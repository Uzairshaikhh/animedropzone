import { Mail, CheckCircle, AlertCircle, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

export function EmailSetup() {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const checkEmailConfig = async () => {
    setChecking(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/email-config`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await response.json();
      setStatus(data);
    } catch (error) {
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
        headers: { Authorization: `Bearer ${publicAnonKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
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
          <h3 className="text-white text-xl">Email Configuration</h3>
        </div>

        {status ? (
          <div className="space-y-4">
            <div className={`border rounded-lg p-4 ${isConfigured ? "bg-green-900/20 border-green-500/30" : "bg-yellow-900/20 border-yellow-500/30"}`}>
              <div className="flex items-start gap-3">
                {isConfigured ? (
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={isConfigured ? "text-green-400" : "text-yellow-400"}>{status.message || "Checking configuration..."}</p>
                  {status?.provider ? <p className="text-gray-400 text-sm mt-1">Provider: {status.provider.toUpperCase()}</p> : null}
                </div>
              </div>
            </div>

            <button onClick={checkEmailConfig} disabled={checking} className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
              {checking ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Checking...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Check Status
                </>
              )}
            </button>

            {isConfigured ? (
              <button onClick={sendTestEmail} disabled={sendingTest} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-3">
                {sendingTest ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Test Email
                  </>
                )}
              </button>
            ) : null}

            {testResult ? (
              <div className={`border rounded-lg p-4 ${testResult.success ? "bg-green-900/20 border-green-500/30" : "bg-red-900/20 border-red-500/30"}`}>
                <div className="flex items-start gap-3">
                  {testResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={testResult.success ? "text-green-400" : "text-red-400"}>{testResult.message || "Test email sent"}</p>
                    {testResult.error ? <p className="text-gray-400 text-sm mt-1">Error: {testResult.error}</p> : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-gray-400">Loading email configuration...</p>
        )}
      </div>
    </div>
  );
}

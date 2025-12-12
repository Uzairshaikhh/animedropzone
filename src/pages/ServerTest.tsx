import { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ArrowLeft, Check, X, Loader, Mail, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ServerTestPage() {
  const navigate = useNavigate();
  const [emailInput, setEmailInput] = useState('');
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [emailTestResult, setEmailTestResult] = useState<any>(null);
  const [loading, setLoading] = useState({
    health: false,
    email: false,
  });

  const testServerHealth = async () => {
    setLoading({ ...loading, health: true });
    setHealthStatus(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/health`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      setHealthStatus({ success: true, data });
    } catch (error) {
      setHealthStatus({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setLoading({ ...loading, health: false });
    }
  };

  const sendTestEmail = async () => {
    if (!emailInput) {
      setEmailTestResult({ success: false, error: 'Please enter an email address' });
      return;
    }

    setLoading({ ...loading, email: true });
    setEmailTestResult(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/test-email`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: emailInput }),
        }
      );

      const data = await response.json();
      setEmailTestResult(data);
    } catch (error) {
      setEmailTestResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setLoading({ ...loading, email: false });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl mb-4">🔧 Server Health Check</h1>
            <p className="text-gray-400">Test if the server and email service are working properly</p>
          </div>

          {/* Health Check Section */}
          <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Server className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl">Server Status</h2>
            </div>

            <button
              onClick={testServerHealth}
              disabled={loading.health}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 py-3 rounded-lg transition-all flex items-center justify-center gap-2 mb-4"
            >
              {loading.health ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Testing Server...
                </>
              ) : (
                <>
                  <Server className="w-5 h-5" />
                  Check Server Health
                </>
              )}
            </button>

            {healthStatus && (
              <div className={`p-4 rounded-lg border ${
                healthStatus.success 
                  ? 'bg-green-900/20 border-green-500/30' 
                  : 'bg-red-900/20 border-red-500/30'
              }`}>
                {healthStatus.success ? (
                  <>
                    <div className="flex items-center gap-2 text-green-400 mb-3">
                      <Check className="w-5 h-5" />
                      <strong>Server is Running!</strong>
                    </div>
                    <div className="text-sm space-y-2 text-gray-300">
                      <p><strong>Status:</strong> {healthStatus.data.status}</p>
                      <p><strong>Message:</strong> {healthStatus.data.message}</p>
                      <p><strong>Timestamp:</strong> {new Date(healthStatus.data.timestamp).toLocaleString()}</p>
                      <div>
                        <p className="mb-1"><strong>Services:</strong></p>
                        <ul className="ml-4 space-y-1">
                          <li>• Database: {healthStatus.data.services.database}</li>
                          <li>• Email Provider: {healthStatus.data.services.emailProvider}</li>
                          <li>• Admin Email: {healthStatus.data.services.adminEmail}</li>
                        </ul>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-red-400 mb-2">
                      <X className="w-5 h-5" />
                      <strong>Server Error</strong>
                    </div>
                    <p className="text-sm text-gray-300">{healthStatus.error}</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Email Test Section */}
          <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl">Email Service Test</h2>
            </div>

            <p className="text-gray-400 mb-4">
              Send a test email to verify that the email service is working correctly.
              This will send a real email to the address you provide.
            </p>

            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter your email address"
                className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              onClick={sendTestEmail}
              disabled={loading.email || !emailInput}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 py-3 rounded-lg transition-all flex items-center justify-center gap-2 mb-4"
            >
              {loading.email ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Sending Test Email...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Send Test Email
                </>
              )}
            </button>

            {emailTestResult && (
              <div className={`p-4 rounded-lg border ${
                emailTestResult.success 
                  ? 'bg-green-900/20 border-green-500/30' 
                  : 'bg-red-900/20 border-red-500/30'
              }`}>
                {emailTestResult.success ? (
                  <>
                    <div className="flex items-center gap-2 text-green-400 mb-2">
                      <Check className="w-5 h-5" />
                      <strong>Email Sent Successfully!</strong>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{emailTestResult.message}</p>
                    <p className="text-xs text-gray-400">
                      ⚠️ Check your spam/junk folder if you don't see it in your inbox
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-red-400 mb-2">
                      <X className="w-5 h-5" />
                      <strong>Email Send Failed</strong>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">
                      {emailTestResult.error || 'Unknown error'}
                    </p>
                    {emailTestResult.details && (
                      <div className="mt-3 p-3 bg-black/30 rounded text-xs text-gray-400 overflow-auto">
                        <pre>{JSON.stringify(emailTestResult.details, null, 2)}</pre>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-purple-900/10 border border-purple-500/20 rounded-xl p-6">
            <h3 className="text-lg mb-3 text-purple-300">📋 How to Use This Test</h3>
            <ol className="space-y-2 text-sm text-gray-400 list-decimal list-inside">
              <li>First, click "Check Server Health" to verify the server is running</li>
              <li>If server is healthy, enter your email address in the field above</li>
              <li>Click "Send Test Email" to test the email service</li>
              <li>Check your inbox (and spam folder) for the test email</li>
              <li>If you receive the email, your email service is working correctly!</li>
            </ol>
            
            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-sm">
                <strong>⚠️ Note:</strong> If the test email fails, check the browser console (F12) 
                and Supabase Edge Function logs for detailed error messages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
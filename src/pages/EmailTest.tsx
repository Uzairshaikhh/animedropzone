import { useState } from "react";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { ArrowLeft, Check, X, Loader, Mail, User, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function EmailTestPage() {
  const navigate = useNavigate();
  const [testData, setTestData] = useState({
    customerEmail: "",
    customerName: "",
    customerPassword: "",
  });

  const [results, setResults] = useState<any>({
    basicTest: null,
    signupTest: null,
    adminTest: null,
  });

  const [loading, setLoading] = useState({
    basicTest: false,
    signupTest: false,
    adminTest: false,
  });

  // Test 1: Basic Email Service Test
  const runBasicEmailTest = async () => {
    if (!testData.customerEmail) {
      setResults({ ...results, basicTest: { success: false, error: "Please enter an email address" } });
      return;
    }

    setLoading({ ...loading, basicTest: true });
    setResults({ ...results, basicTest: null });

    try {
      console.log("🧪 TEST 1: Testing basic email service...");

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/test-email`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: testData.customerEmail }),
      });

      const data = await response.json();
      console.log("✅ Basic email test response:", data);
      setResults({ ...results, basicTest: data });
    } catch (error) {
      console.error("❌ Basic email test failed:", error);
      setResults({
        ...results,
        basicTest: {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });
    } finally {
      setLoading({ ...loading, basicTest: false });
    }
  };

  // Test 2: Signup Email Test (Customer Welcome + Admin Notification)
  const runSignupEmailTest = async () => {
    if (!testData.customerEmail || !testData.customerName || !testData.customerPassword) {
      setResults({
        ...results,
        signupTest: {
          success: false,
          error: "Please fill in all signup fields (email, name, password)",
        },
      });
      return;
    }

    setLoading({ ...loading, signupTest: true });
    setResults({ ...results, signupTest: null });

    try {
      console.log("🧪 TEST 2: Testing signup email flow...");
      console.log("📧 This will send:");
      console.log("   1. Welcome email to:", testData.customerEmail);
      console.log("   2. Admin notification to: anime.drop.zone.00@gmail.com");

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/signup`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testData.customerEmail,
          name: testData.customerName,
          password: testData.customerPassword,
        }),
      });

      const data = await response.json();
      console.log("✅ Signup response:", data);

      if (data.success) {
        setResults({
          ...results,
          signupTest: {
            success: true,
            message: `Account created successfully! Check these inboxes:\n1. ${testData.customerEmail} (Welcome email)\n2. anime.drop.zone.00@gmail.com (Admin notification)\n\n⚠️ Check spam folders if emails don't appear in inbox!`,
            data,
          },
        });
      } else {
        setResults({
          ...results,
          signupTest: {
            success: false,
            error: data.message || data.error || "Signup failed",
            data,
          },
        });
      }
    } catch (error) {
      console.error("❌ Signup test failed:", error);
      setResults({
        ...results,
        signupTest: {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });
    } finally {
      setLoading({ ...loading, signupTest: false });
    }
  };

  // Test 3: Direct Admin Email Test
  const runAdminEmailTest = async () => {
    setLoading({ ...loading, adminTest: true });
    setResults({ ...results, adminTest: null });

    try {
      console.log("🧪 TEST 3: Testing admin email directly...");

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/test-email`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "anime.drop.zone.00@gmail.com" }),
      });

      const data = await response.json();
      console.log("✅ Admin email test response:", data);
      setResults({ ...results, adminTest: data });
    } catch (error) {
      console.error("❌ Admin email test failed:", error);
      setResults({
        ...results,
        adminTest: {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });
    } finally {
      setLoading({ ...loading, adminTest: false });
    }
  };

  const runAllTests = async () => {
    console.log("🚀 RUNNING ALL EMAIL TESTS...");
    console.log("================================================");

    // Test 1: Basic email
    await runBasicEmailTest();

    // Wait 2 seconds between tests
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Test 2: Signup flow
    await runSignupEmailTest();

    // Wait 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Test 3: Admin email
    await runAdminEmailTest();

    console.log("================================================");
    console.log("✅ ALL TESTS COMPLETED");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl mb-4">📧 Email System Test</h1>
            <p className="text-gray-400">Comprehensive testing for customer and admin email delivery</p>
          </div>

          {/* Test Configuration */}
          <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 rounded-xl p-6 mb-6">
            <h2 className="text-2xl mb-4">🔧 Test Configuration</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="testCustomerEmail" className="block text-gray-300 mb-2">
                  Customer Email (for testing)
                </label>
                <input
                  id="testCustomerEmail"
                  name="testCustomerEmail"
                  type="email"
                  value={testData.customerEmail}
                  onChange={(e) => setTestData({ ...testData, customerEmail: e.target.value })}
                  placeholder="your-email@example.com"
                  className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">This email will receive test emails</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="testCustomerName" className="block text-gray-300 mb-2">
                    Customer Name
                  </label>
                  <input
                    id="testCustomerName"
                    name="testCustomerName"
                    type="text"
                    value={testData.customerName}
                    onChange={(e) => setTestData({ ...testData, customerName: e.target.value })}
                    placeholder="Test User"
                    className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label htmlFor="testPassword" className="block text-gray-300 mb-2">
                    Test Password
                  </label>
                  <input
                    id="testPassword"
                    name="testPassword"
                    type="password"
                    value={testData.customerPassword}
                    onChange={(e) => setTestData({ ...testData, customerPassword: e.target.value })}
                    placeholder="test123456"
                    className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                onClick={runAllTests}
                disabled={!testData.customerEmail || !testData.customerName || !testData.customerPassword}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 py-4 rounded-lg transition-all flex items-center justify-center gap-2 text-lg font-bold"
              >
                <Mail className="w-6 h-6" />
                Run All Email Tests
              </button>
            </div>
          </div>

          {/* Test 1: Basic Email Service */}
          <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-purple-400" />
                <div>
                  <h2 className="text-2xl">Test 1: Basic Email Service</h2>
                  <p className="text-sm text-gray-400">Tests if email service is configured correctly</p>
                </div>
              </div>
              <button
                onClick={runBasicEmailTest}
                disabled={loading.basicTest || !testData.customerEmail}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 px-6 py-2 rounded-lg transition-all flex items-center gap-2"
              >
                {loading.basicTest ? <Loader className="w-4 h-4 animate-spin" /> : "Test"}
              </button>
            </div>

            {results.basicTest && (
              <div
                className={`p-4 rounded-lg border ${
                  results.basicTest.success ? "bg-green-900/20 border-green-500/30" : "bg-red-900/20 border-red-500/30"
                }`}
              >
                {results.basicTest.success ? (
                  <>
                    <div className="flex items-center gap-2 text-green-400 mb-2">
                      <Check className="w-5 h-5" />
                      <strong>✅ Email Service Working!</strong>
                    </div>
                    <p className="text-sm text-gray-300">Test email sent to: {testData.customerEmail}</p>
                    <p className="text-xs text-yellow-400 mt-2">⚠️ Check your inbox and spam folder</p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-red-400 mb-2">
                      <X className="w-5 h-5" />
                      <strong>❌ Email Service Failed</strong>
                    </div>
                    <p className="text-sm text-gray-300">{results.basicTest.error}</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Test 2: Signup Email Flow */}
          <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <User className="w-6 h-6 text-purple-400" />
                <div>
                  <h2 className="text-2xl">Test 2: Signup Email Flow</h2>
                  <p className="text-sm text-gray-400">Tests customer welcome email + admin notification</p>
                </div>
              </div>
              <button
                onClick={runSignupEmailTest}
                disabled={
                  loading.signupTest || !testData.customerEmail || !testData.customerName || !testData.customerPassword
                }
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 px-6 py-2 rounded-lg transition-all flex items-center gap-2"
              >
                {loading.signupTest ? <Loader className="w-4 h-4 animate-spin" /> : "Test"}
              </button>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-300">
                <strong>📧 This test will send 2 emails:</strong>
              </p>
              <ul className="text-sm text-gray-300 ml-4 mt-2 space-y-1">
                <li>1. Welcome email → {testData.customerEmail || "[Customer Email]"}</li>
                <li>2. Admin notification → anime.drop.zone.00@gmail.com</li>
              </ul>
            </div>

            {results.signupTest && (
              <div
                className={`p-4 rounded-lg border ${
                  results.signupTest.success ? "bg-green-900/20 border-green-500/30" : "bg-red-900/20 border-red-500/30"
                }`}
              >
                {results.signupTest.success ? (
                  <>
                    <div className="flex items-center gap-2 text-green-400 mb-2">
                      <Check className="w-5 h-5" />
                      <strong>✅ Signup Flow Completed!</strong>
                    </div>
                    <p className="text-sm text-gray-300 whitespace-pre-line mb-3">{results.signupTest.message}</p>
                    <div className="bg-purple-900/30 border border-purple-500/30 rounded p-3 mt-3">
                      <p className="text-xs text-purple-300 mb-2">
                        <strong>What to check:</strong>
                      </p>
                      <ul className="text-xs text-gray-400 space-y-1">
                        <li>✉️ Customer inbox: {testData.customerEmail}</li>
                        <li>✉️ Admin inbox: anime.drop.zone.00@gmail.com</li>
                        <li>📁 Check spam/junk folders in both inboxes</li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-red-400 mb-2">
                      <X className="w-5 h-5" />
                      <strong>❌ Signup Flow Failed</strong>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{results.signupTest.error}</p>
                    {results.signupTest.data && (
                      <div className="mt-2 p-2 bg-black/30 rounded text-xs text-gray-400 overflow-auto max-h-40">
                        <pre>{JSON.stringify(results.signupTest.data, null, 2)}</pre>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Test 3: Admin Email Direct Test */}
          <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-purple-400" />
                <div>
                  <h2 className="text-2xl">Test 3: Admin Email Direct</h2>
                  <p className="text-sm text-gray-400">Tests sending email directly to admin</p>
                </div>
              </div>
              <button
                onClick={runAdminEmailTest}
                disabled={loading.adminTest}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 px-6 py-2 rounded-lg transition-all flex items-center gap-2"
              >
                {loading.adminTest ? <Loader className="w-4 h-4 animate-spin" /> : "Test"}
              </button>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-300">
                <strong>📧 Sends test email to:</strong> anime.drop.zone.00@gmail.com
              </p>
            </div>

            {results.adminTest && (
              <div
                className={`p-4 rounded-lg border ${
                  results.adminTest.success ? "bg-green-900/20 border-green-500/30" : "bg-red-900/20 border-red-500/30"
                }`}
              >
                {results.adminTest.success ? (
                  <>
                    <div className="flex items-center gap-2 text-green-400 mb-2">
                      <Check className="w-5 h-5" />
                      <strong>✅ Admin Email Sent!</strong>
                    </div>
                    <p className="text-sm text-gray-300">Test email sent to admin: anime.drop.zone.00@gmail.com</p>
                    <p className="text-xs text-yellow-400 mt-2">
                      ⚠️ Check anime.drop.zone.00@gmail.com inbox and spam folder
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-red-400 mb-2">
                      <X className="w-5 h-5" />
                      <strong>❌ Admin Email Failed</strong>
                    </div>
                    <p className="text-sm text-gray-300">{results.adminTest.error}</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-6">
            <h3 className="text-lg mb-3 text-purple-300">📋 Testing Instructions</h3>
            <ol className="space-y-3 text-sm text-gray-400 list-decimal list-inside">
              <li>
                <strong className="text-white">Fill in test data above</strong>
                <p className="ml-6 mt-1">Enter your email, a test name, and a password (min 6 chars)</p>
              </li>
              <li>
                <strong className="text-white">Click "Run All Email Tests"</strong>
                <p className="ml-6 mt-1">This will automatically run all 3 tests in sequence</p>
              </li>
              <li>
                <strong className="text-white">Check inboxes</strong>
                <p className="ml-6 mt-1">
                  • Your email inbox (customer welcome email)
                  <br />
                  • anime.drop.zone.00@gmail.com (admin notification)
                  <br />• Don't forget to check spam/junk folders!
                </p>
              </li>
              <li>
                <strong className="text-white">Check browser console and server logs</strong>
                <p className="ml-6 mt-1">
                  • Open browser console (F12) for detailed logs
                  <br />• Check Supabase Edge Function logs if emails fail
                </p>
              </li>
            </ol>

            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-sm">
                <strong>⚠️ Important:</strong> The signup test creates a real user account. If you run it multiple times
                with the same email, it will fail saying "user already exists". Use different email addresses for
                multiple tests.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

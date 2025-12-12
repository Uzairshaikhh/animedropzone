import { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Wallet, Banknote, Save, Eye, EyeOff, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function PaymentSettingsManagement() {
  const [settings, setSettings] = useState({
    razorpay: {
      enabled: true,
      keyId: '',
      keySecret: '',
      mode: 'test', // 'test' or 'live'
    },
    upi: {
      enabled: true,
      upiId: 'ziddenkhan5@ptaxis',
      autoVerify: false,
    },
    paytm: {
      enabled: true,
      merchantId: '',
      merchantKey: '',
      website: '',
    },
    cod: {
      enabled: true,
      minOrder: 0,
      maxOrder: 50000,
      extraCharges: 0,
    },
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showSecrets, setShowSecrets] = useState({
    razorpayKeyId: false,
    razorpayKeySecret: false,
    paytmMerchantKey: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/payment-settings`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      showMessage('error', 'Failed to load payment settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/payment-settings`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ settings }),
        }
      );

      const data = await response.json();
      if (data.success) {
        showMessage('success', 'Payment settings saved successfully!');
      } else {
        showMessage('error', data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving payment settings:', error);
      showMessage('error', 'Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  };

  const testRazorpay = async () => {
    if (!settings.razorpay.keyId) {
      alert('Please enter Razorpay Key ID first');
      return;
    }

    try {
      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: settings.razorpay.keyId,
          amount: 100, // ₹1 for testing
          currency: 'INR',
          name: 'AnimeDropZone Test',
          description: 'Test Payment',
          handler: function (response: any) {
            alert(`Test Successful!\n\nPayment ID: ${response.razorpay_payment_id}\n\nRazorpay is configured correctly!`);
          },
          modal: {
            ondismiss: function () {
              alert('Test cancelled');
            },
          },
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      };

      script.onerror = () => {
        alert('Failed to load Razorpay. Please check your internet connection.');
      };
    } catch (error) {
      console.error('Razorpay test error:', error);
      alert('Failed to test Razorpay. Please check your configuration.');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const toggleSecret = (key: keyof typeof showSecrets) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading payment settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-white mb-2">Payment Settings</h2>
          <p className="text-gray-400">Configure payment gateways and methods</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {/* Message Banner */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-900/20 border-green-500/30 text-green-400' 
            : 'bg-red-900/20 border-red-500/30 text-red-400'
        } flex items-center gap-2`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Razorpay Settings */}
      <div className="bg-purple-900/10 border border-purple-500/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white">Razorpay</h3>
              <p className="text-gray-400 text-sm">Cards, UPI, Wallets, NetBanking</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={testRazorpay}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              Test Payment
            </button>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.razorpay.enabled}
                onChange={(e) => setSettings({ ...settings, razorpay: { ...settings.razorpay, enabled: e.target.checked } })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Mode</label>
            <select
              value={settings.razorpay.mode}
              onChange={(e) => setSettings({ ...settings, razorpay: { ...settings.razorpay, mode: e.target.value as 'test' | 'live' } })}
              className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="test">Test Mode</option>
              <option value="live">Live Mode</option>
            </select>
            <p className="text-gray-400 text-sm mt-1">
              {settings.razorpay.mode === 'test' ? '⚠️ Test mode - Use test cards only' : '✅ Live mode - Real payments'}
            </p>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Key ID</label>
            <div className="flex gap-2">
              <input
                type={showSecrets.razorpayKeyId ? 'text' : 'password'}
                value={settings.razorpay.keyId}
                onChange={(e) => setSettings({ ...settings, razorpay: { ...settings.razorpay, keyId: e.target.value } })}
                placeholder="rzp_test_XXXXXXXXXXXX or rzp_live_XXXXXXXXXXXX"
                className="flex-1 bg-black/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => toggleSecret('razorpayKeyId')}
                className="px-4 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg hover:bg-purple-900/50 transition-colors"
              >
                {showSecrets.razorpayKeyId ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Key Secret (Optional - for webhooks)</label>
            <div className="flex gap-2">
              <input
                type={showSecrets.razorpayKeySecret ? 'text' : 'password'}
                value={settings.razorpay.keySecret}
                onChange={(e) => setSettings({ ...settings, razorpay: { ...settings.razorpay, keySecret: e.target.value } })}
                placeholder="Keep this secret!"
                className="flex-1 bg-black/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => toggleSecret('razorpayKeySecret')}
                className="px-4 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg hover:bg-purple-900/50 transition-colors"
              >
                {showSecrets.razorpayKeySecret ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
              </button>
            </div>
          </div>

          <div className="bg-blue-900/10 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-400 mb-2">Getting Razorpay Keys</h4>
            <ol className="text-gray-400 text-sm space-y-1">
              <li>1. Go to <a href="https://dashboard.razorpay.com/" target="_blank" className="text-blue-400 hover:underline">Razorpay Dashboard</a></li>
              <li>2. Navigate to Settings → API Keys</li>
              <li>3. Generate Test Keys or Live Keys</li>
              <li>4. Copy Key ID and paste above</li>
              <li>5. Click "Test Payment" to verify</li>
            </ol>
          </div>
        </div>
      </div>

      {/* UPI Settings */}
      <div className="bg-purple-900/10 border border-purple-500/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white">Direct UPI</h3>
              <p className="text-gray-400 text-sm">Zero transaction fees</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.upi.enabled}
              onChange={(e) => setSettings({ ...settings, upi: { ...settings.upi, enabled: e.target.checked } })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Your UPI ID</label>
            <input
              type="text"
              value={settings.upi.upiId}
              onChange={(e) => setSettings({ ...settings, upi: { ...settings.upi, upiId: e.target.value } })}
              placeholder="yourname@paytm"
              className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            />
            <p className="text-gray-400 text-sm mt-1">Customers will pay to this UPI ID</p>
          </div>

          <div className="flex items-center justify-between p-3 bg-purple-900/20 rounded-lg">
            <div>
              <p className="text-white text-sm">Auto-verify UPI payments</p>
              <p className="text-gray-400 text-xs">Requires bank API integration</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.upi.autoVerify}
                onChange={(e) => setSettings({ ...settings, upi: { ...settings.upi, autoVerify: e.target.checked } })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Paytm Settings */}
      <div className="bg-purple-900/10 border border-purple-500/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white">Paytm</h3>
              <p className="text-gray-400 text-sm">Wallet & UPI payments</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.paytm.enabled}
              onChange={(e) => setSettings({ ...settings, paytm: { ...settings.paytm, enabled: e.target.checked } })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Merchant ID</label>
            <input
              type="text"
              value={settings.paytm.merchantId}
              onChange={(e) => setSettings({ ...settings, paytm: { ...settings.paytm, merchantId: e.target.value } })}
              placeholder="Your Paytm Merchant ID"
              className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Merchant Key</label>
            <div className="flex gap-2">
              <input
                type={showSecrets.paytmMerchantKey ? 'text' : 'password'}
                value={settings.paytm.merchantKey}
                onChange={(e) => setSettings({ ...settings, paytm: { ...settings.paytm, merchantKey: e.target.value } })}
                placeholder="Keep this secret!"
                className="flex-1 bg-black/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => toggleSecret('paytmMerchantKey')}
                className="px-4 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg hover:bg-purple-900/50 transition-colors"
              >
                {showSecrets.paytmMerchantKey ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Website Name</label>
            <input
              type="text"
              value={settings.paytm.website}
              onChange={(e) => setSettings({ ...settings, paytm: { ...settings.paytm, website: e.target.value } })}
              placeholder="WEBSTAGING or DEFAULT"
              className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="bg-yellow-900/10 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="text-yellow-400 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Paytm Integration Status
            </h4>
            <p className="text-gray-400 text-sm">
              Full Paytm integration requires merchant onboarding. Contact Paytm business support to complete setup.
            </p>
          </div>
        </div>
      </div>

      {/* COD Settings */}
      <div className="bg-purple-900/10 border border-purple-500/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
              <Banknote className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white">Cash on Delivery</h3>
              <p className="text-gray-400 text-sm">Pay when you receive</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.cod.enabled}
              onChange={(e) => setSettings({ ...settings, cod: { ...settings.cod, enabled: e.target.checked } })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-300 mb-2">Minimum Order (₹)</label>
            <input
              type="number"
              value={settings.cod.minOrder}
              onChange={(e) => setSettings({ ...settings, cod: { ...settings.cod, minOrder: parseInt(e.target.value) || 0 } })}
              className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Maximum Order (₹)</label>
            <input
              type="number"
              value={settings.cod.maxOrder}
              onChange={(e) => setSettings({ ...settings, cod: { ...settings.cod, maxOrder: parseInt(e.target.value) || 50000 } })}
              className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Extra Charges (₹)</label>
            <input
              type="number"
              value={settings.cod.extraCharges}
              onChange={(e) => setSettings({ ...settings, cod: { ...settings.cod, extraCharges: parseInt(e.target.value) || 0 } })}
              className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}

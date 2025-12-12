import { useState, useEffect } from 'react';
import { CreditCard, Wallet, Smartphone, Banknote, CheckCircle, AlertCircle, Loader } from 'lucide-react';

// Razorpay TypeScript interface
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentIntegrationProps {
  amount: number; // Amount in INR
  currency?: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  onSuccess: (paymentData: PaymentResponse) => void;
  onFailure?: (error: any) => void;
  onClose?: () => void;
  description?: string;
  disabled?: boolean;
}

interface PaymentResponse {
  paymentId: string;
  paymentMethod: string;
  amount: number;
  status: 'success' | 'pending' | 'failed';
  transactionId?: string;
  upiApp?: string;
}

export function PaymentIntegration({
  amount,
  currency = 'INR',
  customerInfo,
  onSuccess,
  onFailure,
  onClose,
  description = 'Purchase from AnimeDropZone',
  disabled = false,
}: PaymentIntegrationProps) {
  const [selectedMethod, setSelectedMethod] = useState<'razorpay' | 'upi' | 'paytm' | 'cod'>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [upiTransactionId, setUpiTransactionId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('');
  const [showUpiDetails, setShowUpiDetails] = useState(false);
  const [error, setError] = useState('');

  const UPI_ID = 'ziddenkhan5@ptaxis'; // Your UPI ID
  const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

  // Payment methods configuration
  const paymentMethods = [
    {
      id: 'razorpay',
      name: 'Razorpay',
      description: 'Cards, UPI, Wallets, NetBanking',
      icon: CreditCard,
      color: 'from-blue-500 to-blue-600',
      available: true,
    },
    {
      id: 'upi',
      name: 'Direct UPI',
      description: 'Pay via any UPI app',
      icon: Smartphone,
      color: 'from-green-500 to-green-600',
      available: true,
    },
    {
      id: 'paytm',
      name: 'Paytm',
      description: 'Paytm Wallet & UPI',
      icon: Wallet,
      color: 'from-cyan-500 to-cyan-600',
      available: true,
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when you receive',
      icon: Banknote,
      color: 'from-orange-500 to-orange-600',
      available: true,
    },
  ];

  // UPI apps list
  const upiApps = [
    { id: 'gpay', name: 'Google Pay', color: 'bg-blue-500' },
    { id: 'phonepe', name: 'PhonePe', color: 'bg-purple-600' },
    { id: 'paytm', name: 'Paytm', color: 'bg-cyan-500' },
    { id: 'bhim', name: 'BHIM', color: 'bg-green-600' },
    { id: 'amazonpay', name: 'Amazon Pay', color: 'bg-orange-500' },
    { id: 'other', name: 'Other UPI App', color: 'bg-gray-600' },
  ];

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Razorpay Payment Handler
  const handleRazorpayPayment = async () => {
    if (!RAZORPAY_KEY) {
      setError('Razorpay is not configured. Please contact support.');
      if (onFailure) onFailure({ error: 'Razorpay key missing' });
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const options = {
        key: RAZORPAY_KEY,
        amount: Math.round(amount * 100), // Convert to paise
        currency: currency,
        name: 'AnimeDropZone',
        description: description,
        image: '/logo.png', // Your logo
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.phone,
        },
        theme: {
          color: '#9333ea', // Purple theme
        },
        handler: function (response: any) {
          const paymentData: PaymentResponse = {
            paymentId: response.razorpay_payment_id,
            paymentMethod: 'Razorpay',
            amount: amount,
            status: 'success',
          };
          onSuccess(paymentData);
          setIsProcessing(false);
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            if (onClose) onClose();
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        setError('Payment failed. Please try again.');
        if (onFailure) onFailure(response);
        setIsProcessing(false);
      });
      
      razorpay.open();
    } catch (error) {
      console.error('Razorpay error:', error);
      setError('Failed to initialize payment. Please try again.');
      if (onFailure) onFailure(error);
      setIsProcessing(false);
    }
  };

  // Direct UPI Payment Handler
  const handleUPIPayment = async () => {
    if (!selectedUpiApp) {
      setError('Please select a UPI app');
      return;
    }

    if (!upiTransactionId.trim()) {
      setError('Please enter transaction ID');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Simulate verification (in production, verify with your backend)
      await new Promise(resolve => setTimeout(resolve, 1000));

      const paymentData: PaymentResponse = {
        paymentId: `UPI-${selectedUpiApp}-${upiTransactionId}`,
        paymentMethod: `UPI (${selectedUpiApp})`,
        amount: amount,
        status: 'success',
        transactionId: upiTransactionId,
        upiApp: selectedUpiApp,
      };

      onSuccess(paymentData);
      setIsProcessing(false);
      setShowUpiDetails(false);
    } catch (error) {
      console.error('UPI payment error:', error);
      setError('UPI payment verification failed. Please try again.');
      if (onFailure) onFailure(error);
      setIsProcessing(false);
    }
  };

  // Paytm Payment Handler
  const handlePaytmPayment = async () => {
    setIsProcessing(true);
    setError('');

    try {
      // For production: Integrate Paytm Payment Gateway properly
      // This is a simplified flow for demonstration
      
      const confirmed = confirm(
        `Paytm Payment\n\nAmount: ₹${amount.toLocaleString()}\n\n` +
        'You will be redirected to Paytm to complete the payment.\n\n' +
        'Note: For production, complete Paytm integration is required.\n\n' +
        'Proceed with payment?'
      );

      if (!confirmed) {
        setIsProcessing(false);
        if (onClose) onClose();
        return;
      }

      // Simulate Paytm payment
      await new Promise(resolve => setTimeout(resolve, 1500));

      const paymentData: PaymentResponse = {
        paymentId: `PAYTM-${Date.now()}`,
        paymentMethod: 'Paytm',
        amount: amount,
        status: 'success',
      };

      onSuccess(paymentData);
      setIsProcessing(false);
    } catch (error) {
      console.error('Paytm payment error:', error);
      setError('Paytm payment failed. Please try again.');
      if (onFailure) onFailure(error);
      setIsProcessing(false);
    }
  };

  // Cash on Delivery Handler
  const handleCODPayment = async () => {
    setIsProcessing(true);
    setError('');

    try {
      const confirmed = confirm(
        `Cash on Delivery\n\nAmount to pay: ₹${amount.toLocaleString()}\n\n` +
        'Please keep exact cash ready when the delivery arrives.\n\n' +
        'Confirm order?'
      );

      if (!confirmed) {
        setIsProcessing(false);
        if (onClose) onClose();
        return;
      }

      const paymentData: PaymentResponse = {
        paymentId: `COD-${Date.now()}`,
        paymentMethod: 'Cash on Delivery',
        amount: amount,
        status: 'pending',
      };

      onSuccess(paymentData);
      setIsProcessing(false);
    } catch (error) {
      console.error('COD order error:', error);
      setError('Failed to place COD order. Please try again.');
      if (onFailure) onFailure(error);
      setIsProcessing(false);
    }
  };

  // Main payment handler
  const handlePayment = async () => {
    switch (selectedMethod) {
      case 'razorpay':
        await handleRazorpayPayment();
        break;
      case 'upi':
        if (!showUpiDetails) {
          setShowUpiDetails(true);
        } else {
          await handleUPIPayment();
        }
        break;
      case 'paytm':
        await handlePaytmPayment();
        break;
      case 'cod':
        await handleCODPayment();
        break;
    }
  };

  const copyUPIId = () => {
    navigator.clipboard.writeText(UPI_ID);
    alert('UPI ID copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div className="space-y-3">
        <h3 className="text-white mb-3">Select Payment Method</h3>
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;
          
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => {
                setSelectedMethod(method.id as any);
                setShowUpiDetails(false);
                setError('');
              }}
              disabled={!method.available || disabled}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-purple-500 bg-purple-900/30'
                  : 'border-purple-500/30 bg-purple-900/10 hover:border-purple-500/50'
              } ${!method.available || disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${method.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white">{method.name}</div>
                  <div className="text-gray-400 text-sm">{method.description}</div>
                </div>
                {isSelected && (
                  <CheckCircle className="w-6 h-6 text-purple-400" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* UPI Details Section */}
      {selectedMethod === 'upi' && showUpiDetails && (
        <div className="space-y-4 bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
          <div>
            <label className="block text-gray-300 mb-2">UPI ID</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={UPI_ID}
                readOnly
                className="flex-1 bg-black/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white"
              />
              <button
                type="button"
                onClick={copyUPIId}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Copy
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Select UPI App</label>
            <div className="grid grid-cols-2 gap-2">
              {upiApps.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => setSelectedUpiApp(app.id)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedUpiApp === app.id
                      ? 'border-purple-500 bg-purple-900/30'
                      : 'border-purple-500/30 bg-purple-900/10 hover:border-purple-500/50'
                  }`}
                >
                  <div className={`w-8 h-8 ${app.color} rounded-full mx-auto mb-2`}></div>
                  <div className="text-white text-sm text-center">{app.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Transaction ID / UTR Number</label>
            <input
              type="text"
              value={upiTransactionId}
              onChange={(e) => setUpiTransactionId(e.target.value)}
              placeholder="Enter transaction ID after payment"
              className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            />
            <p className="text-gray-400 text-sm mt-2">
              After paying via UPI, enter the transaction ID shown in your UPI app
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {/* Amount Display */}
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Amount to Pay:</span>
          <span className="text-2xl text-white">₹{amount.toLocaleString()}</span>
        </div>
      </div>

      {/* Pay Button */}
      <button
        type="button"
        onClick={handlePayment}
        disabled={isProcessing || disabled}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-lg transition-all flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            {selectedMethod === 'upi' && !showUpiDetails ? 'Continue to UPI Payment' : `Pay ₹${amount.toLocaleString()}`}
          </>
        )}
      </button>

      {/* Payment Method Info */}
      <div className="bg-blue-900/10 border border-blue-500/30 rounded-lg p-4">
        <h4 className="text-blue-400 mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Payment Information
        </h4>
        <ul className="text-gray-400 text-sm space-y-1">
          {selectedMethod === 'razorpay' && (
            <>
              <li>• Supports all major cards, UPI, wallets, and net banking</li>
              <li>• Secure payment gateway with instant confirmation</li>
              <li>• Refunds processed within 5-7 business days</li>
            </>
          )}
          {selectedMethod === 'upi' && (
            <>
              <li>• Pay via any UPI app (GPay, PhonePe, Paytm, etc.)</li>
              <li>• Manual verification of transaction ID required</li>
              <li>• Order confirmed after payment verification</li>
            </>
          )}
          {selectedMethod === 'paytm' && (
            <>
              <li>• Pay using Paytm wallet or linked bank account</li>
              <li>• Instant cashback and offers available</li>
              <li>• Secure and verified transactions</li>
            </>
          )}
          {selectedMethod === 'cod' && (
            <>
              <li>• Pay cash when you receive the product</li>
              <li>• Keep exact amount ready for delivery</li>
              <li>• Available for orders within India</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

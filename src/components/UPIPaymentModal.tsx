import { X, Copy, CheckCircle, Smartphone, QrCode } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import qrCodeImage from 'figma:asset/1e40af2fe5deeb0ca3b85cf1c72e6e481e9ea39e.png';

interface UPIPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  upiId: string;
  onConfirm: (upiTransactionId: string, upiApp: string) => void;
}

const UPI_APPS = [
  { id: 'paytm', name: 'Paytm', color: 'from-blue-500 to-cyan-500' },
  { id: 'gpay', name: 'Google Pay', color: 'from-green-500 to-teal-500' },
  { id: 'phonepe', name: 'PhonePe', color: 'from-purple-500 to-violet-500' },
  { id: 'bhim', name: 'BHIM UPI', color: 'from-orange-500 to-red-500' },
  { id: 'cred', name: 'CRED', color: 'from-indigo-500 to-purple-500' },
];

export function UPIPaymentModal({ isOpen, onClose, amount, upiId, onConfirm }: UPIPaymentModalProps) {
  const [step, setStep] = useState<'select' | 'qr' | 'manual'>('select');
  const [selectedApp, setSelectedApp] = useState('');
  const [manualUPI, setManualUPI] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [copiedUPI, setCopiedUPI] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  const handleCopy = (text: string, type: 'upi' | 'amount') => {
    navigator.clipboard.writeText(text);
    if (type === 'upi') {
      setCopiedUPI(true);
      setTimeout(() => setCopiedUPI(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  const handleConfirm = () => {
    if (!transactionId.trim()) {
      alert('Please enter the UPI transaction ID');
      return;
    }
    
    const upiMethod = step === 'qr' ? 'QR Code' : step === 'manual' ? `Manual UPI (${manualUPI})` : selectedApp;
    onConfirm(transactionId, upiMethod);
    
    // Reset state
    setStep('select');
    setSelectedApp('');
    setManualUPI('');
    setTransactionId('');
  };

  const handleUPIAppSelect = (appId: string) => {
    setSelectedApp(appId);
    // Generate UPI payment link
    const upiLink = `upi://pay?pa=${upiId}&pn=animedropzone&am=${amount}&cu=INR`;
    
    // Try to open the UPI app
    window.location.href = upiLink;
    
    // Show instructions
    setTimeout(() => {
      alert(
        `Opening ${UPI_APPS.find(a => a.id === appId)?.name}...\n\n` +
        `If the app didn't open:\n` +
        `1. Manually open your UPI app\n` +
        `2. Pay ₹${amount.toLocaleString()} to: ${upiId}\n` +
        `3. Return here and enter the transaction ID\n\n` +
        `Click OK to continue`
      );
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      
      <motion.div 
        className="relative bg-gradient-to-br from-black to-purple-900/30 border border-purple-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl shadow-purple-900/50"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex items-center justify-between p-6 border-b border-purple-500/30">
          <h2 className="text-white flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-purple-400" />
            UPI Payment - ₹{amount.toLocaleString()}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          <AnimatePresence mode="wait">
            {step === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h3 className="text-white mb-4">Choose Payment Method</h3>
                
                {/* UPI Apps */}
                <div className="mb-6">
                  <p className="text-gray-300 text-sm mb-3">Pay with UPI App</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {UPI_APPS.map((app) => (
                      <motion.button
                        key={app.id}
                        onClick={() => handleUPIAppSelect(app.id)}
                        className={`bg-gradient-to-r ${app.color} p-4 rounded-xl text-white hover:scale-105 transition-transform`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-sm">{app.name}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* QR Code Option */}
                <div className="mb-6">
                  <p className="text-gray-300 text-sm mb-3">Or scan QR code</p>
                  <motion.button
                    onClick={() => setStep('qr')}
                    className="w-full bg-purple-900/30 border-2 border-purple-500/30 hover:border-purple-500 p-4 rounded-xl transition-all flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <QrCode className="w-6 h-6 text-purple-400" />
                    <span className="text-white">Scan QR Code</span>
                  </motion.button>
                </div>

                {/* Manual UPI */}
                <div>
                  <p className="text-gray-300 text-sm mb-3">Or enter UPI ID manually</p>
                  <motion.button
                    onClick={() => setStep('manual')}
                    className="w-full bg-purple-900/30 border-2 border-purple-500/30 hover:border-purple-500 p-4 rounded-xl transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-white">Enter UPI ID Manually</span>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 'qr' && (
              <motion.div
                key="qr"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button
                  onClick={() => setStep('select')}
                  className="text-purple-400 hover:text-purple-300 mb-4 flex items-center gap-2"
                >
                  ← Back to options
                </button>

                <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-6 text-center">
                  <h3 className="text-white mb-4">Scan QR Code to Pay</h3>
                  
                  {/* QR Code Image */}
                  <div className="bg-white p-4 rounded-xl inline-block mb-4">
                    <img 
                      src={qrCodeImage} 
                      alt="UPI QR Code"
                      className="w-64 h-64 object-contain"
                    />
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="bg-black/30 border border-purple-500/30 rounded-lg p-4">
                      <p className="text-gray-400 text-xs mb-1">UPI ID</p>
                      <div className="flex items-center justify-between">
                        <p className="text-white">{upiId}</p>
                        <button
                          onClick={() => handleCopy(upiId, 'upi')}
                          className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm transition-colors flex items-center gap-1"
                        >
                          {copiedUPI ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="bg-black/30 border border-purple-500/30 rounded-lg p-4">
                      <p className="text-gray-400 text-xs mb-1">Amount to Pay</p>
                      <div className="flex items-center justify-between">
                        <p className="text-white text-2xl">₹{amount.toLocaleString()}</p>
                        <button
                          onClick={() => handleCopy(amount.toString(), 'amount')}
                          className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm transition-colors flex items-center gap-1"
                        >
                          {copiedAmount ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-left bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
                    <p className="text-yellow-200 text-sm mb-2">📱 How to pay:</p>
                    <ol className="text-yellow-200/80 text-sm space-y-1 list-decimal list-inside">
                      <li>Open any UPI app (Paytm, GPay, PhonePe, etc.)</li>
                      <li>Scan the QR code above</li>
                      <li>Verify amount: ₹{amount.toLocaleString()}</li>
                      <li>Complete the payment</li>
                      <li>Enter transaction ID below</li>
                    </ol>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2 text-left">UPI Transaction ID *</label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter 12-digit transaction ID"
                      className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 mb-4"
                    />
                    <button
                      onClick={handleConfirm}
                      disabled={!transactionId.trim()}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 py-3 rounded-lg transition-all"
                    >
                      Confirm Payment
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'manual' && (
              <motion.div
                key="manual"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button
                  onClick={() => setStep('select')}
                  className="text-purple-400 hover:text-purple-300 mb-4 flex items-center gap-2"
                >
                  ← Back to options
                </button>

                <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-6">
                  <h3 className="text-white mb-4">Manual UPI Payment</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="bg-black/30 border border-purple-500/30 rounded-lg p-4">
                      <p className="text-gray-400 text-xs mb-1">Pay to UPI ID</p>
                      <div className="flex items-center justify-between">
                        <p className="text-white break-all">{upiId}</p>
                        <button
                          onClick={() => handleCopy(upiId, 'upi')}
                          className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm transition-colors flex items-center gap-1 ml-2 flex-shrink-0"
                        >
                          {copiedUPI ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="bg-black/30 border border-purple-500/30 rounded-lg p-4">
                      <p className="text-gray-400 text-xs mb-1">Amount to Pay</p>
                      <p className="text-white text-2xl">₹{amount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
                    <p className="text-yellow-200 text-sm mb-2">📱 Payment Steps:</p>
                    <ol className="text-yellow-200/80 text-sm space-y-1 list-decimal list-inside">
                      <li>Open your UPI app</li>
                      <li>Enter or paste UPI ID: {upiId}</li>
                      <li>Enter amount: ₹{amount.toLocaleString()}</li>
                      <li>Complete the payment</li>
                      <li>Note the transaction ID</li>
                      <li>Enter details below</li>
                    </ol>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 mb-2">Your UPI ID (optional)</label>
                      <input
                        type="text"
                        value={manualUPI}
                        onChange={(e) => setManualUPI(e.target.value)}
                        placeholder="yourname@upi"
                        className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">UPI Transaction ID *</label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Enter 12-digit transaction ID"
                        className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <button
                      onClick={handleConfirm}
                      disabled={!transactionId.trim()}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 py-3 rounded-lg transition-all"
                    >
                      Confirm Payment
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
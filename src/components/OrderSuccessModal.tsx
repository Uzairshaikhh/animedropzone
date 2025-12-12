import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, Package, CreditCard, Truck, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    orderId: string;
    trackingId: string;
    paymentMethod: string;
    isPrepaid: boolean;
    subtotal: number;
    shippingCharges: number;
    discount: number;
    total: number;
  } | null;
}

export function OrderSuccessModal({ isOpen, onClose, data }: OrderSuccessModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!data) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleTrackOrder = () => {
    window.open('/track-order', '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-md bg-gradient-to-br from-black via-purple-950/30 to-black border border-purple-500/30 rounded-2xl shadow-[0_0_50px_rgba(147,51,234,0.3)] overflow-hidden"
          >
            {/* Animated background effect */}
            <div className="absolute inset-0 opacity-20">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            </div>

            {/* Sparkle particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-purple-400 rounded-full"
                initial={{
                  x: Math.random() * 400,
                  y: -20,
                  scale: 0,
                  opacity: 1,
                }}
                animate={{
                  y: 500,
                  scale: [0, 1, 0],
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />
            ))}

            {/* Content */}
            <div className="relative p-6">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Success icon with animation */}
              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                  className="relative"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="absolute inset-0 bg-green-500/30 rounded-full blur-xl"
                  />
                  <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-4">
                    <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
                  </div>
                </motion.div>
              </div>

              {/* Success message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-6"
              >
                <h2 className="text-2xl mb-2 bg-gradient-to-r from-white via-green-200 to-emerald-200 bg-clip-text text-transparent">
                  {data.isPrepaid ? '💳 Payment Successful!' : 'Order Placed Successfully!'}
                </h2>
                <p className="text-gray-400 text-sm">
                  {data.isPrepaid
                    ? 'Your payment has been confirmed. Thank you!'
                    : 'Please keep cash ready for delivery'}
                </p>
              </motion.div>

              {/* Order details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-3 mb-6"
              >
                {/* Order ID */}
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-purple-400" />
                      <span className="text-xs text-gray-400">Order ID</span>
                    </div>
                    <button
                      onClick={() => handleCopy(data.orderId, 'orderId')}
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      {copiedField === 'orderId' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-white mt-1 font-mono text-sm">{data.orderId}</p>
                </div>

                {/* Tracking ID */}
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-purple-400" />
                      <span className="text-xs text-gray-400">Tracking ID</span>
                    </div>
                    <button
                      onClick={() => handleCopy(data.trackingId, 'trackingId')}
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      {copiedField === 'trackingId' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-white mt-1 font-mono text-sm">{data.trackingId}</p>
                </div>
              </motion.div>

              {/* Payment summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/20 rounded-lg p-4 mb-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-300">Payment Summary</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Payment Method</span>
                    <span className="text-white">{data.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span className="text-white">₹{data.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping Charges</span>
                    <span className="text-white">₹{data.shippingCharges.toLocaleString()}</span>
                  </div>
                  {data.discount > 0 && (
                    <div className="flex justify-between text-gray-400">
                      <span>Discount</span>
                      <span className="text-green-400">₹{data.discount.toLocaleString()}</span>
                    </div>
                  )}
                  {data.isPrepaid && (
                    <div className="flex justify-between text-gray-400">
                      <span>Payment Status</span>
                      <span className="text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        PAID
                      </span>
                    </div>
                  )}
                  <div className="border-t border-purple-500/20 pt-2 mt-2 flex justify-between">
                    <span className="text-white">Total {data.isPrepaid ? 'Paid' : 'Amount'}</span>
                    <span className="text-white text-lg">₹{data.total.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-3"
              >
                <button
                  onClick={handleTrackOrder}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <Truck className="w-5 h-5 group-hover:animate-bounce" />
                  Track Your Order
                  <ExternalLink className="w-4 h-4" />
                </button>

                <button
                  onClick={onClose}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg transition-all duration-300 border border-white/20"
                >
                  Continue Shopping
                </button>
              </motion.div>

              {/* Email notification */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-4 text-center"
              >
                <p className="text-xs text-gray-500">
                  📧 Order confirmation sent to your email
                </p>
              </motion.div>
            </div>

            {/* Decorative glow at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500">
              <motion.div
                className="h-full bg-gradient-to-r from-transparent via-white to-transparent"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
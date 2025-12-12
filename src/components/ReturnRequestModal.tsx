import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Package, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ReturnRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onSuccess: () => void;
}

export function ReturnRequestModal({ isOpen, onClose, order, onSuccess }: ReturnRequestModalProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const returnReasons = [
    'Defective/Damaged Product',
    'Wrong Item Received',
    'Not as Described',
    'Size Issue',
    'Changed Mind',
    'Quality Issues',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason || !description.trim()) {
      alert('Please select a reason and provide details');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🔵 Submitting return request for order:', order.orderId);
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/orders/${order.orderId}/return-request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason,
          description,
          customerEmail: order.email,
          customerName: order.customerName,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ Return request submitted successfully');
        alert('Return request submitted successfully! You will receive an email confirmation.');
        onSuccess();
        onClose();
        setReason('');
        setDescription('');
      } else {
        console.error('❌ Failed to submit return request:', data);
        alert(`Failed to submit return request: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error submitting return request:', error);
      alert('Error submitting return request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-orange-600/20 p-3 rounded-lg">
                  <Package className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-2xl text-white">Request Return</h3>
                  <p className="text-gray-400 text-sm">Order #{order.orderId}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Info Alert */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-200">
                <p className="mb-2">Please note:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-300/80">
                  <li>Return requests are reviewed within 24-48 hours</li>
                  <li>You'll receive an email once your request is processed</li>
                  <li>Return shipping label will be provided upon approval</li>
                  <li>Refund will be processed after item inspection</li>
                </ul>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Return Reason */}
              <div>
                <label className="block text-white mb-2">
                  Return Reason <span className="text-red-400">*</span>
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-black/50 border border-purple-500/30 px-4 py-3 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  required
                >
                  <option value="">Select a reason</option>
                  {returnReasons.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-white mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide details about why you're returning this item..."
                  rows={5}
                  className="w-full bg-black/50 border border-purple-500/30 px-4 py-3 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none"
                  required
                />
                <p className="text-gray-400 text-sm mt-1">
                  {description.length}/500 characters
                </p>
              </div>

              {/* Order Details */}
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                <h4 className="text-white mb-3">Order Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Order Date:</span>
                    <span className="text-white">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Items:</span>
                    <span className="text-white">{order.items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Order Total:</span>
                    <span className="text-white">₹{order.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 px-6 py-3 rounded-lg disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Return Request'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

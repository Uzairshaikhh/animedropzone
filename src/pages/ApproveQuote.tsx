import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, XCircle, Loader, Shirt, Package } from 'lucide-react';
import { FloatingParticles } from '../components/FloatingParticles';
import { Logo } from '../components/Logo';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function ApproveQuote() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const action = searchParams.get('action');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [requestDetails, setRequestDetails] = useState<any>(null);

  useEffect(() => {
    handleApproval();
  }, [id, action]);

  const handleApproval = async () => {
    if (!id || !action || (action !== 'approve' && action !== 'reject')) {
      setStatus('error');
      setMessage('Invalid approval link. Please check your email and try again.');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/custom-clothing/${id}/approve`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setRequestDetails(data.request);
        if (action === 'approve') {
          setMessage('Quote approved successfully! We will contact you shortly with payment details and production timeline.');
        } else {
          setMessage('Quote rejected. Thank you for considering our service. Feel free to submit a new request anytime.');
        }
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to process your response. Please try again or contact support.');
      }
    } catch (error) {
      console.error('Error processing approval:', error);
      setStatus('error');
      setMessage('An error occurred while processing your response. Please contact support.');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <FloatingParticles />

      {/* Header */}
      <nav className="sticky top-0 z-50 bg-black border-b border-purple-900/30 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-20">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <Logo size="md" />
              <span className="text-2xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                animedropzone
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-5rem)] py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl w-full"
        >
          <div className="bg-gradient-to-br from-black to-purple-900/40 border border-purple-500/30 rounded-2xl p-8 md:p-12">
            {status === 'loading' && (
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block mb-6"
                >
                  <Loader className="w-16 h-16 text-purple-400" />
                </motion.div>
                <h1 className="text-white text-2xl md:text-3xl mb-4">
                  Processing Your Response...
                </h1>
                <p className="text-gray-400">
                  Please wait while we update your custom clothing request.
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="inline-block mb-6"
                >
                  {action === 'approve' ? (
                    <CheckCircle className="w-20 h-20 text-green-400" />
                  ) : (
                    <XCircle className="w-20 h-20 text-red-400" />
                  )}
                </motion.div>

                <h1 className="text-white text-2xl md:text-3xl mb-4">
                  {action === 'approve' ? 'Quote Approved! 🎉' : 'Quote Declined'}
                </h1>

                <p className="text-gray-300 text-lg mb-8">
                  {message}
                </p>

                {requestDetails && (
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6 mb-8 text-left">
                    <div className="flex items-center gap-2 mb-4 text-purple-400">
                      <Shirt className="w-5 h-5" />
                      <h3 className="font-semibold">Request Details</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-300">
                        <span className="text-purple-400">Request ID:</span> {requestDetails.requestId}
                      </p>
                      <p className="text-gray-300">
                        <span className="text-purple-400">Type:</span> {requestDetails.clothingDetails?.type}
                      </p>
                      <p className="text-gray-300">
                        <span className="text-purple-400">Size:</span> {requestDetails.clothingDetails?.size}
                      </p>
                      <p className="text-gray-300">
                        <span className="text-purple-400">Quantity:</span> {requestDetails.clothingDetails?.quantity}
                      </p>
                      {action === 'approve' && requestDetails.quotedPrice && (
                        <p className="text-gray-300 text-lg mt-4 pt-4 border-t border-purple-500/30">
                          <span className="text-purple-400">Quoted Price:</span>{' '}
                          <span className="text-green-400 font-semibold">₹{requestDetails.quotedPrice.toFixed(2)}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    onClick={() => navigate('/')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-3 rounded-lg transition-all flex items-center gap-2 justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Package className="w-5 h-5" />
                    Continue Shopping
                  </motion.button>
                  {action === 'reject' && (
                    <motion.button
                      onClick={() => navigate('/?custom-clothing=open')}
                      className="bg-purple-900/30 border border-purple-500/50 hover:bg-purple-900/50 px-8 py-3 rounded-lg transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Submit New Request
                    </motion.button>
                  )}
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="inline-block mb-6"
                >
                  <XCircle className="w-20 h-20 text-red-400" />
                </motion.div>

                <h1 className="text-white text-2xl md:text-3xl mb-4">
                  Something Went Wrong
                </h1>

                <p className="text-gray-300 text-lg mb-8">
                  {message}
                </p>

                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-8">
                  <p className="text-red-300 text-sm">
                    If you continue to experience issues, please contact our support team with your request ID.
                  </p>
                </div>

                <motion.button
                  onClick={() => navigate('/')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-3 rounded-lg transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Return to Home
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Shirt, X, Check, Clock, Package, XCircle, Eye, Mail, MessageCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface CustomClothingRequest {
  id: string;
  requestId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  clothingDetails: {
    type: string;
    size: string;
    color: string;
    quantity: number;
  };
  designImages: string[];
  instructions: string;
  status: 'pending' | 'quoted' | 'approved' | 'in-production' | 'completed' | 'cancelled';
  quotedPrice: number | null;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export function CustomClothingManagement() {
  const [requests, setRequests] = useState<CustomClothingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<CustomClothingRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [quotedPrice, setQuotedPrice] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/custom-clothing`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching custom clothing requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedRequest || !cancellationReason.trim()) {
      alert('Please provide a cancellation reason');
      return;
    }

    setProcessingAction(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/custom-clothing/${selectedRequest.id}/cancel`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reason: cancellationReason,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert('Order cancelled successfully! Customer has been notified via Email and WhatsApp.');
        setCancellationReason('');
        setIsCancelModalOpen(false);
        setIsDetailModalOpen(false);
        setSelectedRequest(null);
        fetchRequests();
      } else {
        alert(data.error || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleSendQuote = async () => {
    if (!selectedRequest || !quotedPrice.trim()) {
      alert('Please provide a quoted price');
      return;
    }

    setProcessingAction(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/custom-clothing/${selectedRequest.id}/quote`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quotedPrice: parseFloat(quotedPrice),
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        let notificationMsg = '✅ Quote sent successfully!\n\n';
        
        if (data.notifications) {
          notificationMsg += 'Notification Status:\n';
          
          if (data.notifications.email) {
            notificationMsg += '✅ Email sent to customer\n';
          } else {
            notificationMsg += `❌ Email failed: ${data.notifications.emailError}\n`;
            notificationMsg += '⚠️ NOTE: Resend free plan only sends to verified emails\n';
          }
          
          if (data.notifications.whatsapp) {
            notificationMsg += '✅ WhatsApp sent to customer\n';
          } else if (data.notifications.whatsappError) {
            notificationMsg += `❌ WhatsApp failed: ${data.notifications.whatsappError}\n`;
          }
          
          notificationMsg += '\n💡 Customer has approval buttons in email to accept/decline quote.';
        } else {
          notificationMsg += 'Customer has been notified via Email and WhatsApp with approval buttons!';
        }
        
        alert(notificationMsg);
        setQuotedPrice('');
        setIsQuoteModalOpen(false);
        setIsDetailModalOpen(false);
        setSelectedRequest(null);
        fetchRequests();
      } else {
        alert(data.error || 'Failed to send quote');
      }
    } catch (error) {
      console.error('Error sending quote:', error);
      alert('Failed to send quote. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/custom-clothing/${requestId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();
      if (data.success) {
        fetchRequests();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50';
      case 'quoted':
        return 'bg-blue-900/30 text-blue-400 border-blue-500/50';
      case 'approved':
        return 'bg-green-900/30 text-green-400 border-green-500/50';
      case 'in-production':
        return 'bg-purple-900/30 text-purple-400 border-purple-500/50';
      case 'completed':
        return 'bg-emerald-900/30 text-emerald-400 border-emerald-500/50';
      case 'cancelled':
        return 'bg-red-900/30 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-900/30 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'quoted':
      case 'approved':
        return <Check className="w-4 h-4" />;
      case 'in-production':
        return <Package className="w-4 h-4" />;
      case 'completed':
        return <Check className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 mt-4">Loading custom clothing requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-2xl flex items-center gap-3">
          <Shirt className="w-7 h-7 text-purple-400" />
          Custom Clothing Requests
        </h2>
        <div className="text-sm text-gray-400">
          Total Requests: {requests.length}
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-12 text-center">
          <Shirt className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400">No custom clothing requests yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white text-lg">{request.requestId}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs border flex items-center gap-1 ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      {request.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {new Date(request.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Customer</p>
                  <p className="text-white">{request.customerInfo.name}</p>
                  <p className="text-gray-400 text-sm">{request.customerInfo.email}</p>
                  <p className="text-gray-400 text-sm">{request.customerInfo.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Order Details</p>
                  <p className="text-white">
                    {request.clothingDetails.type} - Size {request.clothingDetails.size}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Color: {request.clothingDetails.color}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Quantity: {request.clothingDetails.quantity}
                  </p>
                </div>
              </div>

              {request.quotedPrice && (
                <div className="mb-4 bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                  <p className="text-green-400">
                    Quoted Price: ₹{request.quotedPrice.toFixed(2)}
                  </p>
                </div>
              )}

              {request.status === 'cancelled' && request.cancellationReason && (
                <div className="mb-4 bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-400 text-sm">
                    <strong>Cancellation Reason:</strong> {request.cancellationReason}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelectedRequest(request);
                    setIsDetailModalOpen(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>

                {request.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setIsQuoteModalOpen(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Send Quote
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setIsCancelModalOpen(true);
                      }}
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel Order
                    </button>
                  </>
                )}

                {request.status === 'quoted' && (
                  <button
                    onClick={() => handleUpdateStatus(request.id, 'approved')}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Mark as Approved
                  </button>
                )}

                {request.status === 'approved' && (
                  <button
                    onClick={() => handleUpdateStatus(request.id, 'in-production')}
                    className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Start Production
                  </button>
                )}

                {request.status === 'in-production' && (
                  <button
                    onClick={() => handleUpdateStatus(request.id, 'completed')}
                    className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-black to-purple-900/40 border border-purple-500/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-white text-xl">Request Details - {selectedRequest.requestId}</h2>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="hover:bg-white/10 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Design Images */}
              <div>
                <h3 className="text-white mb-3">Design Images ({selectedRequest.designImages.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedRequest.designImages.map((img, idx) => (
                    <a
                      key={idx}
                      href={img}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={img}
                        alt={`Design ${idx + 1}`}
                        className="w-full h-48 object-cover rounded-lg border border-purple-500/30 hover:border-purple-500 transition-colors"
                      />
                    </a>
                  ))}
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                <h3 className="text-white mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Name</p>
                    <p className="text-white">{selectedRequest.customerInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Email</p>
                    <p className="text-white">{selectedRequest.customerInfo.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Phone</p>
                    <p className="text-white">{selectedRequest.customerInfo.phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-400">Delivery Address</p>
                    <p className="text-white">{selectedRequest.customerInfo.address}</p>
                  </div>
                </div>
              </div>

              {/* Clothing Details */}
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                <h3 className="text-white mb-3">Clothing Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Type</p>
                    <p className="text-white">{selectedRequest.clothingDetails.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Size</p>
                    <p className="text-white">{selectedRequest.clothingDetails.size}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Color</p>
                    <p className="text-white">{selectedRequest.clothingDetails.color}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Quantity</p>
                    <p className="text-white">{selectedRequest.clothingDetails.quantity}</p>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              {selectedRequest.instructions && (
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                  <h3 className="text-white mb-2">Special Instructions</h3>
                  <p className="text-gray-300 text-sm">{selectedRequest.instructions}</p>
                </div>
              )}

              {/* Status & Pricing */}
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Status</p>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs border items-center gap-1 ${getStatusColor(selectedRequest.status)}`}>
                      {getStatusIcon(selectedRequest.status)}
                      {selectedRequest.status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-400">Quoted Price</p>
                    <p className="text-white">
                      {selectedRequest.quotedPrice ? `₹${selectedRequest.quotedPrice}` : 'Not quoted yet'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Created</p>
                    <p className="text-white">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {isCancelModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-black to-purple-900/40 border border-purple-500/30 rounded-2xl max-w-lg w-full">
            <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6" />
                <h2 className="text-white text-xl">Cancel Order</h2>
              </div>
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="hover:bg-white/10 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <p className="text-white mb-2">
                  Are you sure you want to cancel this order?
                </p>
                <p className="text-gray-400 text-sm">
                  Request ID: {selectedRequest.requestId}
                </p>
                <p className="text-gray-400 text-sm">
                  Customer: {selectedRequest.customerInfo.name}
                </p>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">
                  Cancellation Reason * (Will be sent to customer)
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  rows={4}
                  required
                  className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  placeholder="e.g., Sorry, we are currently out of stock for the requested clothing type. Please try again later or contact us for alternatives."
                />
              </div>

              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-400 text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Customer will be notified via Email
                </p>
                <p className="text-yellow-400 text-sm flex items-center gap-2 mt-1">
                  <MessageCircle className="w-4 h-4" />
                  Customer will be notified via WhatsApp
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsCancelModalOpen(false)}
                  disabled={processingAction}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 py-3 rounded-lg transition-colors"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={processingAction || !cancellationReason.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-900 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {processingAction ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      Cancel Order & Notify
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quote Modal */}
      {isQuoteModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-black to-purple-900/40 border border-purple-500/30 rounded-2xl max-w-lg w-full">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <Mail className="w-6 h-6" />
                <h2 className="text-white text-xl">Send Quote</h2>
              </div>
              <button
                onClick={() => setIsQuoteModalOpen(false)}
                className="hover:bg-white/10 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <p className="text-white mb-2">Request Details</p>
                <p className="text-gray-400 text-sm">Request ID: {selectedRequest.requestId}</p>
                <p className="text-gray-400 text-sm">Customer: {selectedRequest.customerInfo.name}</p>
                <p className="text-gray-400 text-sm">
                  {selectedRequest.clothingDetails.type} - {selectedRequest.clothingDetails.size} x{selectedRequest.clothingDetails.quantity}
                </p>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">
                  Quoted Price (₹) *
                </label>
                <input
                  type="number"
                  value={quotedPrice}
                  onChange={(e) => setQuotedPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  required
                  className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  placeholder="e.g., 1499.00"
                />
              </div>

              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-400 text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Quote will be sent via Email
                </p>
                <p className="text-green-400 text-sm flex items-center gap-2 mt-1">
                  <MessageCircle className="w-4 h-4" />
                  Quote will be sent via WhatsApp
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsQuoteModalOpen(false)}
                  disabled={processingAction}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendQuote}
                  disabled={processingAction || !quotedPrice.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {processingAction ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Send Quote & Notify
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

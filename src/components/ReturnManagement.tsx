import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Package, CheckCircle, XCircle, Clock, Search, Truck, Eye } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ReturnRequest {
  orderId: string;
  customerName: string;
  email: string;
  reason: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  returnTrackingId?: string;
  requestedAt: string;
  processedAt?: string;
  orderTotal: number;
  items: any[];
}

export function ReturnManagement() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      console.log('🔵 Fetching return requests...');
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/returns`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Returns fetched:', data.returns?.length || 0);
        setReturns(data.returns || []);
      }
    } catch (error) {
      console.error('❌ Error fetching returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (returnRequest: ReturnRequest) => {
    const tracking = prompt('Enter return tracking ID:');
    if (!tracking || tracking.trim() === '') {
      alert('Return tracking ID is required');
      return;
    }

    setIsProcessing(true);
    try {
      console.log('🔵 Approving return:', returnRequest.orderId);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/returns/${returnRequest.orderId}/approve`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ returnTrackingId: tracking }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ Return approved successfully');
        alert('Return request approved! Customer will receive an email with tracking details.');
        await fetchReturns();
      } else {
        console.error('❌ Failed to approve return:', data);
        alert(`Failed to approve return: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error approving return:', error);
      alert('Error approving return. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (returnRequest: ReturnRequest) => {
    const rejectionReason = prompt('Enter reason for rejection:');
    if (!rejectionReason || rejectionReason.trim() === '') {
      alert('Rejection reason is required');
      return;
    }

    if (!confirm('Are you sure you want to reject this return request?')) {
      return;
    }

    setIsProcessing(true);
    try {
      console.log('🔵 Rejecting return:', returnRequest.orderId);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/returns/${returnRequest.orderId}/reject`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ rejectionReason }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ Return rejected successfully');
        alert('Return request rejected. Customer will receive an email notification.');
        await fetchReturns();
      } else {
        console.error('❌ Failed to reject return:', data);
        alert(`Failed to reject return: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error rejecting return:', error);
      alert('Error rejecting return. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredReturns = returns.filter((ret) => {
    const matchesSearch = 
      ret.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || ret.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-3 py-1 bg-yellow-600/20 border border-yellow-500/50 rounded-full text-yellow-400 text-sm flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="px-3 py-1 bg-green-600/20 border border-green-500/50 rounded-full text-green-400 text-sm flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 bg-red-600/20 border border-red-500/50 rounded-full text-red-400 text-sm flex items-center gap-1">
            <XCircle className="w-4 h-4" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const pendingCount = returns.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl text-white mb-2">Return Requests</h2>
          <p className="text-gray-400">Manage customer return requests</p>
        </div>
        {pendingCount > 0 && (
          <div className="bg-yellow-600/20 border border-yellow-500/50 px-4 py-2 rounded-lg">
            <p className="text-yellow-400">
              <span className="font-bold">{pendingCount}</span> pending {pendingCount === 1 ? 'request' : 'requests'}
            </p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-purple-500/30 pl-10 pr-4 py-3 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-3 rounded-lg transition-all ${
                filterStatus === status
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/30'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Returns List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 mt-4">Loading returns...</p>
        </div>
      ) : filteredReturns.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-xl">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">
            {searchQuery || filterStatus !== 'all' ? 'No returns match your filters' : 'No return requests yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReturns.map((returnRequest, index) => (
            <motion.div
              key={returnRequest.orderId}
              className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white text-lg">Order #{returnRequest.orderId}</h3>
                    {getStatusBadge(returnRequest.status)}
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-400">
                      Customer: <span className="text-white">{returnRequest.customerName}</span>
                    </p>
                    <p className="text-gray-400">
                      Email: <span className="text-white">{returnRequest.email}</span>
                    </p>
                    <p className="text-gray-400">
                      Requested: <span className="text-white">
                        {new Date(returnRequest.requestedAt).toLocaleString()}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-4">
                <p className="text-purple-300 text-sm mb-1">Reason:</p>
                <p className="text-white mb-3">{returnRequest.reason}</p>
                <p className="text-purple-300 text-sm mb-1">Description:</p>
                <p className="text-gray-300 text-sm">{returnRequest.description}</p>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
                <span>Items: {returnRequest.items.length}</span>
                <span>•</span>
                <span>Total: ₹{returnRequest.orderTotal.toLocaleString()}</span>
              </div>

              {returnRequest.returnTrackingId && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-green-400" />
                  <div className="flex-1">
                    <p className="text-green-300 text-sm">Return Tracking ID:</p>
                    <p className="text-white font-mono">{returnRequest.returnTrackingId}</p>
                  </div>
                </div>
              )}

              {returnRequest.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(returnRequest)}
                    disabled={isProcessing}
                    className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve Return
                  </button>
                  <button
                    onClick={() => handleReject(returnRequest)}
                    disabled={isProcessing}
                    className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject Return
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { DollarSign, CheckCircle, X, History, Edit2, Plus } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Order {
  id: string;
  trackingId: string;
  items: any[];
  total: number;
  subtotal: number;
  shippingCharges: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    fullAddress?: string;
  };
  paymentId: string;
  paymentMethod: string;
  status: string;
  paymentStatus?: string;
  amountPaid?: number;
  amountDue?: number;
  paymentHistory?: PaymentHistoryEntry[];
  createdAt: string;
}

interface PaymentHistoryEntry {
  amount: number;
  date: string;
  method: string;
  note: string;
  recordedBy: string;
}

interface PaymentManagementProps {
  orders: Order[];
  onRefresh: () => void;
}

export function PaymentManagement({ orders, onRefresh }: PaymentManagementProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    amount: '',
    method: 'cash',
    note: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsProcessing(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/payments/record`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: selectedOrder.id,
            amount: parseFloat(paymentFormData.amount),
            method: paymentFormData.method,
            note: paymentFormData.note,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert('Payment recorded successfully!');
        setShowPaymentModal(false);
        setSelectedOrder(null);
        setPaymentFormData({ amount: '', method: 'cash', note: '' });
        onRefresh();
      } else {
        alert(data.message || 'Error recording payment');
      }
    } catch (error) {
      console.log('Error recording payment:', error);
      alert('Error recording payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkAsPaid = async (orderId: string) => {
    if (!confirm('Mark this order as fully paid?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/payments/mark-paid`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderId }),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert('Order marked as paid!');
        onRefresh();
      } else {
        alert(data.message || 'Error updating payment status');
      }
    } catch (error) {
      console.log('Error marking as paid:', error);
      alert('Error updating payment status. Please try again.');
    }
  };

  const getPaymentStatusBadge = (order: Order) => {
    const amountPaid = order.amountPaid || 0;
    const amountDue = order.amountDue !== undefined ? order.amountDue : order.total;

    if (order.paymentStatus === 'paid' || amountDue === 0) {
      return <span className="px-3 py-1 bg-green-900/30 border border-green-500/30 rounded-full text-green-400 text-sm">Fully Paid</span>;
    } else if (amountPaid > 0) {
      return <span className="px-3 py-1 bg-yellow-900/30 border border-yellow-500/30 rounded-full text-yellow-400 text-sm">Partially Paid</span>;
    } else if (order.paymentMethod === 'cod') {
      return <span className="px-3 py-1 bg-orange-900/30 border border-orange-500/30 rounded-full text-orange-400 text-sm">COD - Unpaid</span>;
    } else {
      return <span className="px-3 py-1 bg-red-900/30 border border-red-500/30 rounded-full text-red-400 text-sm">Unpaid</span>;
    }
  };

  // Calculate payment statistics
  const totalRevenue = orders.reduce((sum, order) => sum + (order.amountPaid || 0), 0);
  const totalDue = orders.reduce((sum, order) => sum + (order.amountDue !== undefined ? order.amountDue : order.total), 0);
  const paidOrdersCount = orders.filter(o => o.paymentStatus === 'paid' || (o.amountDue !== undefined && o.amountDue === 0)).length;

  return (
    <div>
      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <p className="text-2xl text-white">₹{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-8 h-8 text-red-400" />
            <div>
              <p className="text-gray-400 text-sm">Total Due</p>
              <p className="text-2xl text-white">₹{totalDue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-gray-400 text-sm">Paid Orders</p>
              <p className="text-2xl text-white">{paidOrdersCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-gray-400 text-sm">Total Orders</p>
              <p className="text-2xl text-white">{orders.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders with Payment Information */}
      <div className="space-y-4">
        <h3 className="text-white mb-4">Payment Management</h3>
        {orders.length === 0 ? (
          <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-12 text-center">
            <p className="text-gray-400 text-lg">No orders to manage payments for.</p>
          </div>
        ) : (
          orders.map((order) => {
            const amountPaid = order.amountPaid || 0;
            const amountDue = order.amountDue !== undefined ? order.amountDue : order.total;

            return (
              <div
                key={order.id}
                className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-xl p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-white mb-2">Order #{order.trackingId}</h4>
                    <p className="text-gray-400 text-sm mb-2">{order.customerInfo.name}</p>
                    <p className="text-gray-400 text-sm mb-2">{order.customerInfo.phone}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {getPaymentStatusBadge(order)}
                      <span className="text-gray-400 text-sm">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Total Amount</p>
                    <p className="text-2xl text-white mb-2">₹{order.total.toLocaleString()}</p>
                    <p className="text-green-400 text-sm">Paid: ₹{amountPaid.toLocaleString()}</p>
                    <p className="text-red-400 text-sm">Due: ₹{amountDue.toLocaleString()}</p>
                  </div>
                </div>

                {/* Payment History */}
                {order.paymentHistory && order.paymentHistory.length > 0 && (
                  <div className="mt-4 p-4 bg-purple-900/10 border border-purple-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <History className="w-4 h-4 text-purple-400" />
                      <h5 className="text-white">Payment History</h5>
                    </div>
                    <div className="space-y-2">
                      {order.paymentHistory.map((payment, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <div>
                            <span className="text-gray-300">{new Date(payment.date).toLocaleString()}</span>
                            <span className="text-gray-400 ml-3">via {payment.method}</span>
                            {payment.note && <span className="text-gray-500 ml-2">- {payment.note}</span>}
                          </div>
                          <span className="text-green-400">+₹{payment.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  {amountDue > 0 && (
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setPaymentFormData({ 
                          amount: amountDue.toString(), 
                          method: order.paymentMethod === 'cod' ? 'cash' : 'online', 
                          note: '' 
                        });
                        setShowPaymentModal(true);
                      }}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Record Payment
                    </button>
                  )}
                  {amountDue > 0 && (
                    <button
                      onClick={() => handleMarkAsPaid(order.id)}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark as Paid
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)}></div>
          <div className="relative bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl shadow-purple-900/50 m-4">
            <div className="flex items-center justify-between p-6 border-b border-purple-500/30">
              <h2 className="text-white">Record Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Order #{selectedOrder.trackingId}</p>
                <p className="text-white text-lg mb-2">{selectedOrder.customerInfo.name}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-400 text-sm">Total: ₹{selectedOrder.total.toLocaleString()}</p>
                    <p className="text-green-400 text-sm">Paid: ₹{(selectedOrder.amountPaid || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Amount Due</p>
                    <p className="text-2xl text-red-400">₹{(selectedOrder.amountDue !== undefined ? selectedOrder.amountDue : selectedOrder.total).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleRecordPayment} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Payment Amount (₹)</label>
                  <input
                    type="number"
                    value={paymentFormData.amount}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
                    required
                    min="0"
                    max={selectedOrder.amountDue !== undefined ? selectedOrder.amountDue : selectedOrder.total}
                    step="0.01"
                    className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Payment Method</label>
                  <select
                    value={paymentFormData.method}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, method: e.target.value })}
                    className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="online">Online Payment</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="bank-transfer">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Note (Optional)</label>
                  <textarea
                    value={paymentFormData.note}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, note: e.target.value })}
                    rows={2}
                    placeholder="Add any notes about this payment..."
                    className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 py-3 rounded-lg transition-all"
                  >
                    {isProcessing ? 'Recording...' : 'Record Payment'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

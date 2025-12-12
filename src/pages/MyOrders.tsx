import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowLeft, Calendar, CreditCard, MapPin, Mail, Phone, Eye, Search, Sparkles, ShoppingBag, Truck, CheckCircle, XCircle, Clock, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ReturnRequestModal } from '../components/ReturnRequestModal';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  trackingId: string;
  items: OrderItem[];
  subtotal: number;
  shippingCharges: number;
  discount?: number;
  couponCode?: string;
  total: number;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
  paymentId: string;
  paymentType?: string; // Prepaid or COD
  paymentStatus?: string; // Paid or Pending
  status: string;
  createdAt: string;
}

export function MyOrdersPage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [returnRequestOpen, setReturnRequestOpen] = useState(false);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState<Order | null>(null);

  const searchOrders = async () => {
    if (!email && !phone) {
      alert('Please enter either email or phone number');
      return;
    }

    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (email) queryParams.append('email', email);
      if (phone) queryParams.append('phone', phone);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/my-orders?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
        setSearched(true);
      } else {
        alert('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Error fetching orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'processing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'shipped':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'delivered':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-purple-500/20 bg-black/80 backdrop-blur-sm sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <motion.h1 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent flex items-center gap-2"
            >
              <Sparkles className="w-6 h-6 text-purple-400" />
              My Orders
            </motion.h1>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Search Section */}
        <AnimatePresence mode="wait">
          {!searched && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="bg-gradient-to-br from-purple-900/40 via-black to-pink-900/20 border border-purple-500/30 rounded-2xl p-8 backdrop-blur-sm shadow-2xl shadow-purple-500/10 relative overflow-hidden"
              >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
                
                <div className="relative z-10">
                  <motion.div 
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-3 mb-6"
                  >
                    <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
                      <Search className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl">Find Your Orders</h2>
                      <p className="text-sm text-gray-400">Track all your anime treasures</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-5"
                  >
                    <div>
                      <label className="block text-sm text-gray-300 mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-purple-400" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1" />
                      <span className="text-sm text-gray-500 px-3">OR</span>
                      <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1" />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-2 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-purple-400" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91XXXXXXXXXX"
                        onKeyDown={(e) => e.key === 'Enter' && searchOrders()}
                        className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={searchOrders}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="w-5 h-5" />
                          View My Orders
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Orders List */}
        <AnimatePresence mode="wait">
          {searched && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
              >
                <div>
                  <h2 className="text-3xl bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                    <ShoppingBag className="w-8 h-8 text-purple-400" />
                    Your Orders
                  </h2>
                  <p className="text-gray-400 mt-1">
                    {orders.length} {orders.length === 1 ? 'order' : 'orders'} found
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSearched(false);
                    setOrders([]);
                    setEmail('');
                    setPhone('');
                    setSelectedOrder(null);
                  }}
                  className="px-6 py-2.5 bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 rounded-lg transition-all flex items-center gap-2 group"
                >
                  <Search className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  Search Again
                </motion.button>
              </motion.div>

              {orders.length === 0 ? (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-20"
                >
                  <div className="relative inline-block">
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Package className="w-20 h-20 text-gray-700 mx-auto mb-6" />
                    </motion.div>
                    <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full" />
                  </div>
                  <p className="text-gray-300 text-xl mb-2">No orders found</p>
                  <p className="text-gray-500">Try a different email or phone number</p>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-br from-purple-900/30 via-black to-pink-900/20 border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all hover:shadow-xl hover:shadow-purple-500/10 relative overflow-hidden group"
                    >
                      {/* Decorative gradient on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="relative z-10">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                              <h3 className="text-xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Order #{order.trackingId}
                              </h3>
                              <motion.span 
                                whileHover={{ scale: 1.05 }}
                                className={`px-3 py-1.5 rounded-full text-xs border ${getStatusColor(order.status)} flex items-center gap-1.5 font-medium`}
                              >
                                {getStatusIcon(order.status)}
                                {order.status.toUpperCase()}
                              </motion.span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                              <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-purple-400" />
                                {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                              <span className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-purple-400" />
                                {order.paymentMethod.toUpperCase()}
                              </span>
                              {order.paymentType && (
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${order.paymentType === 'Prepaid' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                                  {order.paymentType}
                                </span>
                              )}
                              {order.paymentStatus && (
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${order.paymentStatus === 'Paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
                                  {order.paymentStatus === 'Paid' ? '✓ PAID' : 'PAYMENT PENDING'}
                                </span>
                              )}
                              <span className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-purple-400" />
                                {order.items.reduce((sum, item) => sum + item.quantity, 0)} item{order.items.reduce((sum, item) => sum + item.quantity, 0) !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                            className="px-5 py-2.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 hover:from-purple-600/30 hover:to-pink-600/30 rounded-lg transition-all flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            {selectedOrder?.id === order.id ? 'Hide Details' : 'View Details'}
                          </motion.button>
                        </div>

                        {/* Order Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                          <div className="bg-black/30 rounded-xl p-4 border border-purple-500/10">
                            <p className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                              <ShoppingBag className="w-4 h-4 text-purple-400" />
                              Order Items
                            </p>
                            <div className="space-y-2">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between text-sm">
                                  <span className="text-gray-300">{item.name}</span>
                                  <span className="text-gray-400">x {item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-xl p-4 border border-purple-500/20">
                            <p className="text-sm text-gray-400 mb-2">Total Amount</p>
                            <p className="text-3xl bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
                              ₹{order.total.toLocaleString('en-IN')}
                            </p>
                            {order.discount && order.discount > 0 && (
                              <motion.p 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-sm text-green-400 flex items-center gap-2"
                              >
                                <Sparkles className="w-4 h-4" />
                                Saved ₹{order.discount.toLocaleString('en-IN')} with {order.couponCode}
                              </motion.p>
                            )}
                          </div>
                        </div>

                        {/* Expanded Details */}
                        <AnimatePresence>
                          {selectedOrder?.id === order.id && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-purple-500/20 pt-6 mt-4 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <motion.div 
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-black/30 rounded-xl p-5 border border-purple-500/10"
                                  >
                                    <h4 className="text-sm text-gray-300 mb-3 flex items-center gap-2">
                                      <MapPin className="w-4 h-4 text-purple-400" />
                                      Delivery Address
                                    </h4>
                                    <div className="space-y-1 text-sm text-gray-400">
                                      <p className="text-white">{order.customerInfo.firstName} {order.customerInfo.lastName}</p>
                                      <p>{order.customerInfo.address}</p>
                                      <p>{order.customerInfo.city}, {order.customerInfo.state} - {order.customerInfo.pincode}</p>
                                    </div>
                                  </motion.div>
                                  <motion.div 
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-black/30 rounded-xl p-5 border border-purple-500/10"
                                  >
                                    <h4 className="text-sm text-gray-300 mb-3">Contact Information</h4>
                                    <div className="space-y-3 text-sm">
                                      <p className="flex items-center gap-2 text-gray-400">
                                        <Mail className="w-4 h-4 text-purple-400" />
                                        {order.customerInfo.email}
                                      </p>
                                      <p className="flex items-center gap-2 text-gray-400">
                                        <Phone className="w-4 h-4 text-purple-400" />
                                        {order.customerInfo.phone}
                                      </p>
                                    </div>
                                  </motion.div>
                                </div>

                                <motion.div 
                                  initial={{ y: 20, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  transition={{ delay: 0.3 }}
                                  className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-5 border border-purple-500/20"
                                >
                                  <h4 className="text-sm text-gray-300 mb-4 flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-purple-400" />
                                    Price Breakdown
                                  </h4>
                                  <div className="space-y-3 text-sm">
                                    <div className="flex justify-between text-gray-400">
                                      <span>Subtotal</span>
                                      <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                      <span>Shipping Charges</span>
                                      <span>₹{order.shippingCharges.toLocaleString('en-IN')}</span>
                                    </div>
                                    {order.discount && order.discount > 0 && (
                                      <div className="flex justify-between text-green-400">
                                        <span>Discount ({order.couponCode})</span>
                                        <span>-₹{order.discount.toLocaleString('en-IN')}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between text-lg border-t border-purple-500/30 pt-3">
                                      <span className="text-white">Total</span>
                                      <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                                        ₹{order.total.toLocaleString('en-IN')}
                                      </span>
                                    </div>
                                  </div>
                                </motion.div>

                                <motion.div 
                                  initial={{ y: 20, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  transition={{ delay: 0.4 }}
                                  className="pt-2"
                                >
                                  <Link
                                    to={`/track-order?id=${order.trackingId}`}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all shadow-lg shadow-purple-500/20 group"
                                  >
                                    <Truck className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    Track this order
                                  </Link>
                                </motion.div>

                                {order.status.toLowerCase() === 'delivered' && (
                                  <motion.div 
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="pt-2"
                                  >
                                    <button
                                      onClick={() => {
                                        setReturnRequestOpen(true);
                                        setSelectedReturnOrder(order);
                                      }}
                                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg transition-all shadow-lg shadow-red-500/20 group"
                                    >
                                      <RotateCcw className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                      Return this order
                                    </button>
                                  </motion.div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Return Request Modal */}
      <ReturnRequestModal
        isOpen={returnRequestOpen}
        onClose={() => {
          setReturnRequestOpen(false);
          setSelectedReturnOrder(null);
        }}
        order={selectedReturnOrder ? {
          orderId: selectedReturnOrder.id,
          trackingId: selectedReturnOrder.trackingId,
          email: selectedReturnOrder.customerInfo.email,
          customerName: `${selectedReturnOrder.customerInfo.firstName} ${selectedReturnOrder.customerInfo.lastName}`,
          total: selectedReturnOrder.total,
          items: selectedReturnOrder.items,
          createdAt: selectedReturnOrder.createdAt,
          deliveredAt: (selectedReturnOrder as any).deliveredAt,
          updatedAt: (selectedReturnOrder as any).updatedAt,
        } : null}
        onSuccess={() => {
          setReturnRequestOpen(false);
          setSelectedReturnOrder(null);
          // Refresh orders
          searchOrders();
        }}
      />
    </div>
  );
}
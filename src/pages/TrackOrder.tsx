import { useState } from "react";
import { Search, Package, CheckCircle, MapPin, XCircle, X } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { useToast } from "../contexts/ToastContext";

interface Order {
  id: string;
  trackingId: string;
  items: any[];
  total: number;
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
  createdAt: string;
}

export function TrackOrderPage() {
  const { error: showErrorToast } = useToast();
  const [trackingId, setTrackingId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  // Check if order is eligible for return (within 7 days of delivery)
  const isReturnEligible = (order: Order | null): boolean => {
    if (!order || order.status !== "Order Delivered") return false;

    const deliveryDate = new Date((order as any).deliveredAt || order.createdAt);
    const daysSinceDelivery = Math.floor((Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));

    return daysSinceDelivery <= 7;
  };

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);
    setIsLoading(true);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/orders`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        // Search by both Order ID and Tracking ID
        const foundOrder = data.orders.find((o: Order) => o.trackingId === trackingId || o.id === trackingId);
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError("Order not found. Please check your Order ID or Tracking ID.");
        }
      }
    } catch (error) {
      console.log("Error tracking order:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    setIsCancelling(true);
    setError("");

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/orders/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order?.id,
          reason: cancelReason,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Show sad toast for order cancellation
        showErrorToast(
          `😢 Order cancelled successfully. ${
            order?.paymentMethod !== "cod" ? "Refund will be processed in 5-7 days." : ""
          }`,
          6000
        );

        setOrder(null);
        setIsCancelModalOpen(false);
        setCancelReason("");
        setTrackingId("");
      } else {
        setError(data.message || "Failed to cancel order.");
      }
    } catch (error) {
      console.log("Error cancelling order:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />

      <main className="flex-1 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-white mb-4">Track Your Order</h1>
            <p className="text-gray-400">Enter your Order ID or Tracking ID to check your order status</p>
          </div>

          {/* Search Form */}
          <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-8 mb-8">
            <form onSubmit={handleTrackOrder} className="flex gap-4">
              <div className="flex-1 relative">
                <label htmlFor="trackingInput" className="sr-only">
                  Enter Order ID or Tracking ID
                </label>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="trackingInput"
                  name="trackingInput"
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  required
                  placeholder="Enter Order ID or Tracking ID"
                  className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 px-8 py-3 rounded-lg transition-all"
              >
                {isLoading ? "Searching..." : "Track Order"}
              </button>
            </form>

            {error && (
              <div className="mt-4 bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Order Details */}
          {order && (
            <div className="space-y-6">
              {/* Status Banner */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-center">
                <div className="flex justify-center mb-4">
                  {order.status === "Order Delivered" ? (
                    <CheckCircle className="w-16 h-16 text-white" />
                  ) : order.status === "Out for Delivery" ? (
                    <Package className="w-16 h-16 text-white" />
                  ) : order.status === "In Transit" ? (
                    <MapPin className="w-16 h-16 text-white" />
                  ) : order.status === "Cancelled" ? (
                    <XCircle className="w-16 h-16 text-white" />
                  ) : (
                    <Package className="w-16 h-16 text-white" />
                  )}
                </div>
                <h2 className="text-white mb-2">{order.status}</h2>
                <p className="text-purple-100">Tracking ID: {order.trackingId}</p>
              </div>

              {/* Order Information */}
              <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-8">
                <h3 className="text-white mb-6">Order Details</h3>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Order ID</p>
                    <p className="text-white">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Order Date</p>
                    <p className="text-white">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Payment ID</p>
                    <p className="text-white">{order.paymentId}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Payment Method</p>
                    <p className="text-white capitalize">{order.paymentMethod}</p>
                  </div>
                </div>

                <div className="border-t border-purple-900/30 pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-purple-400 mt-1" />
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Delivery Address</p>
                      <p className="text-white">{order.customerInfo.name}</p>
                      <p className="text-gray-300">{order.customerInfo.fullAddress || order.customerInfo.address}</p>
                      <p className="text-gray-300">{order.customerInfo.phone}</p>
                      <p className="text-gray-300">{order.customerInfo.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Ordered */}
              <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-8">
                <h3 className="text-white mb-6 flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-400" />
                  Items Ordered
                </h3>

                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-4 border-b border-purple-900/30 last:border-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-purple-900/20 rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-white">{item.name}</p>
                          <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white">₹{(item.price * item.quantity).toLocaleString()}</p>
                        <p className="text-gray-400 text-sm">₹{item.price.toLocaleString()} each</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-purple-900/30 mt-6 pt-6">
                  <div className="flex justify-between items-center">
                    <p className="text-white">Total Amount</p>
                    <p className="text-purple-400 text-2xl">₹{order.total.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Cancel Order Button */}
              {order.status === "Order Pending" && (
                <div className="text-center mt-6">
                  <button
                    onClick={() => setIsCancelModalOpen(true)}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-8 py-3 rounded-lg transition-all"
                  >
                    Cancel Order
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Cancel Order Modal */}
          {isCancelModalOpen && (
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
                    <p className="text-white mb-2">Are you sure you want to cancel this order?</p>
                    <p className="text-gray-400 text-sm">Order ID: {order?.id}</p>
                    <p className="text-gray-400 text-sm">Tracking ID: {order?.trackingId}</p>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">Reason for Cancellation (Optional)</label>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      rows={4}
                      className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                      placeholder="e.g., Changed my mind, found a better deal, ordered by mistake..."
                    />
                  </div>

                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                    <p className="text-yellow-400 text-sm">
                      ⚠️ You will receive cancellation confirmation via Email and WhatsApp
                    </p>
                    {order?.paymentMethod !== "cod" && (
                      <p className="text-yellow-400 text-sm mt-2">
                        💰 Refund will be processed within 5-7 business days
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsCancelModalOpen(false)}
                      disabled={isCancelling}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 py-3 rounded-lg transition-colors"
                    >
                      Keep Order
                    </button>
                    <button
                      onClick={handleCancelOrder}
                      disabled={isCancelling}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-900 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {isCancelling ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5" />
                          Confirm Cancellation
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

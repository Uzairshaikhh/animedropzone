import { X, CreditCard, Wallet, Banknote } from "lucide-react";
import { useState, useEffect } from "react";
import { Product } from "./ProductCard";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { OrderSuccessModal } from "./OrderSuccessModal";
import { useToast } from "../contexts/ToastContext";
import { supabase } from "../utils/supabase/client";

interface CartItem extends Product {
  quantity: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  onSuccess: () => void;
  user?: any;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function CheckoutModal({ isOpen, onClose, items, total, onSuccess, user }: CheckoutModalProps) {
  const { success } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "paytm" | "cod">("razorpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; type: string } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState<any>(null);

  const SHIPPING_CHARGES = 100;
  const subtotal = total;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const grandTotal = subtotal + SHIPPING_CHARGES - discount;

  const saveOrder = async (paymentId: string, method: string) => {
    try {
      const orderResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          subtotal: subtotal,
          shippingCharges: SHIPPING_CHARGES,
          discount: discount,
          couponCode: appliedCoupon?.code || null,
          total: grandTotal,
          customerInfo: formData,
          paymentId,
          paymentMethod: method,
        }),
      });

      const orderData = await orderResponse.json();
      if (orderData.success) {
        const isPrepaid = method !== "cod";

        // Save address to user profile for future use
        await saveAddressToProfile();

        // Show beautiful success toast
        success(
          isPrepaid
            ? `🎉 Order placed successfully! Payment confirmed for ₹${grandTotal.toLocaleString()}`
            : `🎉 Order placed successfully! Total: ₹${grandTotal.toLocaleString()} - Cash on Delivery`,
          5000
        );

        const successMessage =
          method === "cod"
            ? `Order placed successfully! \n\nOrder ID: ${orderData.order.id}\nTracking ID: ${
                orderData.order.trackingId
              }\n\nPayment Method: Cash on Delivery\nSubtotal: ₹${subtotal.toLocaleString()}\nShipping: ₹${SHIPPING_CHARGES.toLocaleString()}\nTotal Amount to Pay: ₹${grandTotal.toLocaleString()}\n\nPlease keep cash ready for delivery.\n\nYou can track your order using either ID at animedropzone.com/track-order\n\nCheck your email for detailed order confirmation.`
            : `💳 Payment Successful! \n\n✅ Your payment has been received and confirmed.\n\nOrder ID: ${
                orderData.order.id
              }\nTracking ID: ${
                orderData.order.trackingId
              }\n\nPayment Status: PAID ✓\nPayment Method: ${method}\nSubtotal: ₹${subtotal.toLocaleString()}\nShipping: ₹${SHIPPING_CHARGES.toLocaleString()}\nTotal Paid: ₹${grandTotal.toLocaleString()}\n\nYour order will be processed and shipped shortly.\n\nYou can track your order using either ID at animedropzone.com/track-order\n\nCheck your email for detailed order confirmation.`;

        setOrderSuccessData({
          message: successMessage,
          orderId: orderData.order.id,
          trackingId: orderData.order.trackingId,
          paymentMethod: method,
          subtotal: subtotal,
          shippingCharges: SHIPPING_CHARGES,
          discount: discount,
          total: grandTotal,
          isPrepaid: isPrepaid,
        });
        setShowOrderSuccessModal(true);
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.log("Error saving order:", error);
      alert("Error processing order. Please contact support.");
    }
  };

  const handleRazorpayPayment = async () => {
    setIsProcessing(true);

    try {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
        amount: Math.round(grandTotal * 100), // Amount in paise
        currency: "INR",
        name: "AnimeDrop Zone",
        description: "Purchase anime figures and accessories",
        image: "https://your-logo-url.com/logo.png", // Optional: Add your logo
        handler: async function (response: any) {
          // Success callback - payment successful
          console.log("Razorpay payment successful:", response.razorpay_payment_id);
          await saveOrder(response.razorpay_payment_id, "Razorpay");
          setIsProcessing(false);
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        theme: {
          color: "#9333ea", // Purple color matching your theme
        },
        modal: {
          ondismiss: function () {
            // Payment modal closed without completion
            console.log("Razorpay payment cancelled by user");
            setIsProcessing(false);
            alert("Payment cancelled. Please try again when ready.");
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      // Handle payment failure
      razorpay.on("payment.failed", function (response: any) {
        console.log("Razorpay payment failed:", response.error);
        setIsProcessing(false);
        alert(
          `Payment Failed!\n\n` +
            `Reason: ${response.error.description || "Payment could not be processed"}\n\n` +
            `Please try again or use a different payment method.`
        );
      });

      razorpay.open();
    } catch (error) {
      console.log("Error initializing Razorpay:", error);
      alert("Error initializing payment. Please try again.");
      setIsProcessing(false);
    }
  };

  const handlePaytmPayment = async () => {
    setIsProcessing(true);

    try {
      const orderId = `ORD${Date.now()}`;

      // Get Paytm credentials from environment
      const paytmMid = import.meta.env.VITE_PAYTM_MID;
      const paytmSecretKey = import.meta.env.VITE_PAYTM_SECRET_KEY;

      if (!paytmMid || !paytmSecretKey) {
        alert(
          "⚠️ Paytm is not configured yet.\n\n" +
            "To enable Paytm payments:\n\n" +
            "1. Sign up at https://business.paytm.com\n" +
            "2. Get your Merchant ID and Secret Key\n" +
            "3. Add to environment variables:\n" +
            "   VITE_PAYTM_MID=your_merchant_id\n" +
            "   VITE_PAYTM_SECRET_KEY=your_secret_key\n\n" +
            "For now, use Razorpay or Cash on Delivery."
        );
        setIsProcessing(false);
        return;
      }

      // Prepare payment parameters
      const paytmParams = {
        MID: paytmMid,
        WEBSITE: import.meta.env.VITE_PAYTM_WEBSITE || "WEBSTAGING",
        CHANNEL_ID: "WEB",
        INDUSTRY_TYPE_ID: "Retail",
        ORDER_ID: orderId,
        CUST_ID: user?.id || `CUST${Date.now()}`,
        EMAIL: formData.email,
        MOBILE_NO: formData.phone,
        TXN_AMOUNT: grandTotal.toFixed(2),
        CALLBACK_URL: `${window.location.origin}/payment-callback`,
      };

      // For demo/testing without full integration
      const proceed = confirm(
        `🎯 Paytm Payment\n\n` +
          `Amount: ₹${grandTotal.toFixed(2)}\n` +
          `Order ID: ${orderId}\n\n` +
          `Test Card:\n` +
          `4111 1111 1111 1111 | 123 | Future Date\n\n` +
          `Ready to proceed to Paytm?`
      );

      if (proceed) {
        // In production, you would:
        // 1. Call backend to generate checksum
        // 2. Submit form to Paytm gateway
        // 3. Handle callback/redirect

        // For now, simulate successful payment
        const simulatedPaymentId = `PAYTM${Date.now()}`;
        await saveOrder(simulatedPaymentId, "Paytm");

        // In real implementation, redirect to:
        // https://securegw-stage.paytm.in/order/receivepaytm?
        // (with checksum and parameters)
      } else {
        setIsProcessing(false);
      }
    } catch (error) {
      console.log("Error initializing Paytm:", error);
      alert("Error initializing Paytm payment. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleCODPayment = async () => {
    setIsProcessing(true);

    try {
      const codOrderId = `COD${Date.now()}`;
      await saveOrder(codOrderId, "COD");
    } catch (error) {
      console.log("Error placing COD order:", error);
      alert("Error placing order. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === "razorpay") {
      await handleRazorpayPayment();
    } else if (paymentMethod === "paytm") {
      await handlePaytmPayment();
    } else {
      await handleCODPayment();
    }
  };

  const applyCoupon = async () => {
    setCouponLoading(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/coupons`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: couponCode,
          cartTotal: total, // Send cart total for percentage discount calculation
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAppliedCoupon(data.coupon);
        alert(`Coupon applied successfully! You saved ₹${data.coupon.discount.toLocaleString()}.`);
      } else {
        alert(data.message || "Invalid coupon code.");
      }
    } catch (error) {
      console.log("Error applying coupon:", error);
      alert("Error applying coupon. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  // Load user's saved address when modal opens
  useEffect(() => {
    if (isOpen && user) {
      // Pre-fill with user's saved address from metadata
      const metadata = user.user_metadata || {};
      if (metadata.name || metadata.phone || metadata.address) {
        const nameParts = (metadata.name || "").split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        setFormData({
          firstName: firstName,
          lastName: lastName,
          email: user.email || "",
          phone: metadata.phone || "",
          address: metadata.address || "",
          landmark: metadata.landmark || "",
          city: metadata.city || "",
          state: metadata.state || "",
          pincode: metadata.pincode || "",
        });
      } else {
        // No saved address, use email only
        setFormData({
          firstName: "",
          lastName: "",
          email: user.email || "",
          phone: "",
          address: "",
          landmark: "",
          city: "",
          state: "",
          pincode: "",
        });
      }
    } else if (isOpen && !user) {
      // Guest checkout - clear form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        landmark: "",
        city: "",
        state: "",
        pincode: "",
      });
    }
  }, [isOpen, user]);

  // Save address to user profile after successful order
  const saveAddressToProfile = async () => {
    if (!user) return;

    try {
      await supabase.auth.updateUser({
        data: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phone,
          address: formData.address,
          landmark: formData.landmark,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
      });
      console.log("Address saved to user profile");
    } catch (error) {
      console.error("Error saving address to profile:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl shadow-purple-900/50 m-4">
        <div className="flex items-center justify-between p-6 border-b border-purple-500/30">
          <h2 className="text-white">Checkout</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          <div className="mb-6">
            <h3 className="text-white mb-4">Order Summary</h3>
            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-gray-300">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-purple-500/30 pt-3 space-y-2">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal:</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Shipping Charges:</span>
                <span>₹{SHIPPING_CHARGES.toLocaleString()}</span>
              </div>
              {appliedCoupon && (
                <div className="border-t border-purple-500/30 pt-3 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-lg">Discount:</span>
                    <span className="text-3xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      -₹{appliedCoupon.discount.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
              <div className="border-t border-purple-500/30 pt-3 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-white text-lg">Total:</span>
                  <span className="text-3xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    ₹{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                pattern="[0-9]{10}"
                placeholder="10-digit mobile number"
                className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Shipping Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                rows={3}
                className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Landmark</label>
              <input
                type="text"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                required
                placeholder="Nearby landmark (e.g., Near City Mall)"
                className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
                className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
                className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Pincode</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                required
                pattern="[0-9]{6}"
                placeholder="6-digit pincode"
                className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-3">Payment Method</label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("razorpay")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === "razorpay"
                      ? "border-purple-500 bg-purple-900/30"
                      : "border-purple-500/30 bg-purple-900/10 hover:bg-purple-900/20"
                  }`}
                >
                  <CreditCard className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                  <div className="text-white text-sm">Razorpay</div>
                  <div className="text-gray-400 text-xs">Cards, UPI, Wallet</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("paytm")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === "paytm"
                      ? "border-purple-500 bg-purple-900/30"
                      : "border-purple-500/30 bg-purple-900/10 hover:bg-purple-900/20"
                  }`}
                >
                  <Wallet className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                  <div className="text-white text-sm">Paytm</div>
                  <div className="text-gray-400 text-xs">Wallet & Payment</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === "cod"
                      ? "border-purple-500 bg-purple-900/30"
                      : "border-purple-500/30 bg-purple-900/10 hover:bg-purple-900/20"
                  }`}
                >
                  <Banknote className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                  <div className="text-white text-sm">Cash on Delivery</div>
                  <div className="text-gray-400 text-xs">Pay at doorstep</div>
                </button>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-gray-300 mb-2">Apply Coupon Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-1 bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={couponLoading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 px-6 py-2 rounded-lg transition-all"
                >
                  {couponLoading ? "Applying..." : "Apply"}
                </button>
              </div>
              {appliedCoupon && (
                <p className="text-green-400 text-sm mt-2">
                  ✓ Coupon "{appliedCoupon.code}" applied - You saved ₹{appliedCoupon.discount.toLocaleString()}!
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 py-3 rounded-lg flex items-center justify-center gap-2 transition-all text-lg"
            >
              {paymentMethod === "razorpay" ? (
                <CreditCard className="w-5 h-5" />
              ) : paymentMethod === "paytm" ? (
                <Wallet className="w-5 h-5" />
              ) : (
                <Banknote className="w-5 h-5" />
              )}
              {isProcessing
                ? "Processing..."
                : paymentMethod === "cod"
                ? "Place Order - Pay Cash on Delivery"
                : `Pay ₹${grandTotal.toLocaleString()} with ${paymentMethod === "razorpay" ? "Razorpay" : "Paytm"}`}
            </button>
          </form>
        </div>
      </div>

      {/* Order Success Modal */}
      <OrderSuccessModal
        isOpen={showOrderSuccessModal}
        onClose={() => setShowOrderSuccessModal(false)}
        data={orderSuccessData}
      />
    </div>
  );
}

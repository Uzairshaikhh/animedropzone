import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Save,
  X,
  Package,
  Calendar,
  CreditCard,
  Truck,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Eye,
  Trash2,
  Plus,
  MapPinned,
  AlertTriangle,
  Award,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { supabase } from "../utils/supabase/client";
import { useToast } from "../contexts/ToastContext";
import { ReturnRequestModal } from "../components/ReturnRequestModal";

interface UserProfile {
  email: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  loyaltyPoints?: number;
  defaultAddress?: SavedAddress | null;
}

interface SavedAddress {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

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
  paymentType?: string;
  paymentStatus?: string;
  status: string;
  createdAt: string;
}

export function MyProfilePage() {
  const navigate = useNavigate();
  const { showToast, success, error: showError } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelOrderConfirm, setShowCancelOrderConfirm] = useState<string | null>(null);
  const [showAddressEditor, setShowAddressEditor] = useState<string | null>(null);
  const [editedAddress, setEditedAddress] = useState<any>(null);
  const [showReturnRequestModal, setShowReturnRequestModal] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session || !session.user) {
        navigate("/", { replace: true });
        return;
      }

      setUser(session.user);
      await fetchProfile(session.user.email!, session.user.user_metadata);
      await fetchOrders(session.user.email!);
      await fetchAddresses();
    } catch (error) {
      console.error("Error checking auth:", error);
      navigate("/", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (email: string, metadata: any) => {
    try {
      // Fetch profile from backend endpoint (includes loyalty points and default address)
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/user-profile`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProfile(data.profile);
          setEditedProfile(data.profile);
          return;
        }
      }

      // Fallback to metadata if backend call fails
      const profileData: UserProfile = {
        email: email,
        name: metadata?.name || "",
        phone: metadata?.phone || "",
        address: metadata?.address || "",
        city: metadata?.city || "",
        state: metadata?.state || "",
        pincode: metadata?.pincode || "",
        loyaltyPoints: metadata?.loyaltyPoints || 0,
        defaultAddress: metadata?.defaultAddress || null,
      };

      setProfile(profileData);
      setEditedProfile(profileData);
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Fallback to metadata
      const profileData: UserProfile = {
        email: email,
        name: metadata?.name || "",
        phone: metadata?.phone || "",
        address: metadata?.address || "",
        city: metadata?.city || "",
        state: metadata?.state || "",
        pincode: metadata?.pincode || "",
        loyaltyPoints: metadata?.loyaltyPoints || 0,
        defaultAddress: metadata?.defaultAddress || null,
      };

      setProfile(profileData);
      setEditedProfile(profileData);
    }
  };

  const fetchOrders = async (email: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/my-orders?email=${email}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        const sortedOrders = data.orders.sort(
          (a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sortedOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchAddresses = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/addresses`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setSavedAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !editedProfile) return;

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name: editedProfile.name,
          phone: editedProfile.phone,
          address: editedProfile.address,
          city: editedProfile.city,
          state: editedProfile.state,
          pincode: editedProfile.pincode,
        },
      });

      if (error) throw error;

      setProfile(editedProfile);
      setIsEditing(false);
      success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      showError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/account`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        await supabase.auth.signOut();
        success("Account deleted successfully");
        navigate("/", { replace: true });
      } else {
        showError(data.message || "Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      showError("Error deleting account. Please try again.");
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/orders/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, reason: "Customer requested cancellation" }),
      });

      const data = await response.json();
      if (data.success) {
        success("Order cancelled successfully");
        await fetchOrders(user.email);
        setShowCancelOrderConfirm(null);
      } else {
        showError(data.message || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      showError("Error cancelling order. Please try again.");
    }
  };

  const handleUpdateOrderAddress = async (orderId: string) => {
    if (!editedAddress) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/orders/${orderId}/address`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedAddress),
        }
      );

      const data = await response.json();
      if (data.success) {
        success("Order address updated successfully");
        await fetchOrders(user.email);
        setShowAddressEditor(null);
        setEditedAddress(null);
      } else {
        showError(data.message || "Failed to update address");
      }
    } catch (error) {
      console.error("Error updating address:", error);
      showError("Error updating address. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "processing":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "shipped":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "delivered":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "processing":
        return <Package className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const canModifyOrder = (status: string) => {
    return status.toLowerCase() === "pending";
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/addresses/${addressId}/set-default`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        success("Default address updated successfully!");
        // Refresh profile and addresses
        await fetchProfile(user.email!, user.user_metadata);
        await fetchAddresses();
      } else {
        showError(data.message || "Failed to set default address");
      }
    } catch (error) {
      console.error("Error setting default address:", error);
      showError("Error setting default address. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-400">Loading your profile...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-purple-500/20 bg-black/80 backdrop-blur-sm sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </Link>
            <motion.h1
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent flex items-center gap-2"
            >
              <User className="w-6 h-6 text-purple-400" />
              My Profile
            </motion.h1>
            <div className="w-24" />
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Loyalty Points Banner */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-sm shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-full">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl text-white mb-1">Loyalty Rewards</h3>
                  <p className="text-sm text-gray-300">Earn points on every purchase</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-300 mb-1">Your Points</p>
                <p className="text-3xl bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
                  {profile?.loyaltyPoints || 0} pts
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Saved Addresses Section */}
        {savedAddresses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6"
          >
            <div className="bg-gradient-to-br from-purple-900/40 via-black to-pink-900/20 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-sm shadow-2xl shadow-purple-500/10">
              <h2 className="text-xl flex items-center gap-2 mb-6">
                <MapPinned className="w-5 h-5 text-purple-400" />
                Saved Addresses ({savedAddresses.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedAddresses.map((address) => {
                  const isDefault = profile?.defaultAddress?.id === address.id;
                  return (
                    <motion.div
                      key={address.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`bg-black/50 border rounded-xl p-4 transition-all ${
                        isDefault ? "border-purple-500/50 shadow-lg shadow-purple-500/20" : "border-purple-500/20"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          <h3 className="text-white">{address.label}</h3>
                        </div>
                        {isDefault && (
                          <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-300 space-y-1">
                        <p>
                          {address.firstName} {address.lastName}
                        </p>
                        <p>{address.address}</p>
                        <p>
                          {address.city}, {address.state} - {address.pincode}
                        </p>
                        <p>{address.phone}</p>
                      </div>
                      {!isDefault && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSetDefaultAddress(address.id)}
                          className="mt-3 w-full bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 text-purple-300 px-3 py-2 rounded-lg transition-all text-sm flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Set as Default
                        </motion.button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1">
            <div className="bg-gradient-to-br from-purple-900/40 via-black to-pink-900/20 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-sm shadow-2xl shadow-purple-500/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-400" />
                  Profile Details
                </h2>
                {!isEditing ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="p-2 bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 rounded-lg transition-all"
                  >
                    <Edit2 className="w-4 h-4 text-purple-400" />
                  </motion.button>
                ) : (
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="p-2 bg-green-600/20 border border-green-500/30 hover:bg-green-600/30 rounded-lg transition-all disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 text-green-400 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 text-green-400" />
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCancelEdit}
                      className="p-2 bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 rounded-lg transition-all"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </motion.button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="profileName" className="block text-sm text-gray-400 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      id="profileName"
                      name="profileName"
                      type="text"
                      value={editedProfile?.name || ""}
                      onChange={(e) => setEditedProfile({ ...editedProfile!, name: e.target.value })}
                      className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  ) : (
                    <p className="text-white">{profile?.name || "Not provided"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-400" />
                    Email
                  </label>
                  <p className="text-white">{profile?.email}</p>
                </div>

                <div>
                  <label htmlFor="profilePhone" className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-purple-400" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      id="profilePhone"
                      name="profilePhone"
                      type="tel"
                      value={editedProfile?.phone || ""}
                      onChange={(e) => setEditedProfile({ ...editedProfile!, phone: e.target.value })}
                      placeholder="+91XXXXXXXXXX"
                      className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  ) : (
                    <p className="text-white">{profile?.phone || "Not provided"}</p>
                  )}
                </div>

                {/* Delete Account Button */}
                <div className="pt-4 border-t border-purple-500/20">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Orders Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-gradient-to-br from-purple-900/40 via-black to-pink-900/20 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-sm shadow-2xl shadow-purple-500/10">
              <h2 className="text-xl flex items-center gap-2 mb-6">
                <ShoppingBag className="w-5 h-5 text-purple-400" />
                My Orders {orders.length > 0 && `(${orders.length})`}
              </h2>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-black/50 border border-purple-500/20 rounded-xl p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-400">Order ID: {order.trackingId}</p>
                          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-sm border flex items-center gap-1 ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-purple-500/20 pt-3">
                        <p className="text-white">Total: ₹{order.total.toLocaleString()}</p>
                        <p className="text-sm text-gray-400">{order.items.length} item(s)</p>
                      </div>

                      {/* Order Actions */}
                      {canModifyOrder(order.status) && (
                        <div className="flex gap-2 mt-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setShowAddressEditor(order.id);
                              setEditedAddress(order.customerInfo);
                            }}
                            className="flex-1 bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 text-blue-400 px-3 py-2 rounded-lg transition-all text-sm flex items-center justify-center gap-2"
                          >
                            <MapPin className="w-4 h-4" />
                            Change Address
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowCancelOrderConfirm(order.id)}
                            className="flex-1 bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 text-red-400 px-3 py-2 rounded-lg transition-all text-sm flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Cancel Order
                          </motion.button>
                        </div>
                      )}

                      {!canModifyOrder(order.status) && order.status.toLowerCase() !== "cancelled" && (
                        <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Order cannot be modified once processing has begun
                        </p>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                        className="w-full mt-3 text-purple-400 hover:text-purple-300 text-sm flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        {selectedOrder?.id === order.id ? "Hide" : "View"} Details
                      </motion.button>

                      <AnimatePresence>
                        {selectedOrder?.id === order.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-purple-500/20 mt-3 pt-3 space-y-2">
                              <h4 className="text-sm text-gray-400 mb-2">Items:</h4>
                              {order.items.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                  <span>
                                    {item.name} x {item.quantity}
                                  </span>
                                  <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                              ))}
                              <div className="border-t border-purple-500/20 pt-2 mt-2">
                                <div className="flex justify-between text-sm text-gray-400">
                                  <span>Subtotal:</span>
                                  <span>₹{order.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-400">
                                  <span>Shipping:</span>
                                  <span>₹{order.shippingCharges.toLocaleString()}</span>
                                </div>
                                {order.discount && order.discount > 0 && (
                                  <div className="flex justify-between text-sm text-green-400">
                                    <span>Discount:</span>
                                    <span>-₹{order.discount.toLocaleString()}</span>
                                  </div>
                                )}
                                <div className="flex justify-between text-white mt-2 pt-2 border-t border-purple-500/20">
                                  <span>Total:</span>
                                  <span>₹{order.total.toLocaleString()}</span>
                                </div>
                              </div>
                              <div className="border-t border-purple-500/20 pt-2 mt-2">
                                <h4 className="text-sm text-gray-400 mb-2">Delivery Address:</h4>
                                <p className="text-sm text-white">
                                  {order.customerInfo.firstName} {order.customerInfo.lastName}
                                </p>
                                <p className="text-sm text-gray-300">{order.customerInfo.address}</p>
                                <p className="text-sm text-gray-300">
                                  {order.customerInfo.city}, {order.customerInfo.state} - {order.customerInfo.pincode}
                                </p>
                                <p className="text-sm text-gray-300">{order.customerInfo.phone}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-gradient-to-br from-black to-red-900/20 border border-red-500/30 rounded-2xl p-6 max-w-md w-full"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl text-white mb-2">Delete Account?</h3>
                <p className="text-gray-400">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-600/20 border border-gray-500/30 hover:bg-gray-600/30 px-4 py-2 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDeleteAccount();
                    setShowDeleteConfirm(false);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-all"
                >
                  Delete Account
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancel Order Confirmation Modal */}
      <AnimatePresence>
        {showCancelOrderConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowCancelOrderConfirm(null)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-gradient-to-br from-black to-red-900/20 border border-red-500/30 rounded-2xl p-6 max-w-md w-full"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl text-white mb-2">Cancel Order?</h3>
                <p className="text-gray-400">Are you sure you want to cancel this order?</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelOrderConfirm(null)}
                  className="flex-1 bg-gray-600/20 border border-gray-500/30 hover:bg-gray-600/30 px-4 py-2 rounded-lg transition-all"
                >
                  Keep Order
                </button>
                <button
                  onClick={() => handleCancelOrder(showCancelOrderConfirm)}
                  className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-all"
                >
                  Cancel Order
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Address Editor Modal */}
      <AnimatePresence>
        {showAddressEditor && editedAddress && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowAddressEditor(null)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-400" />
                Update Delivery Address
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm text-gray-400 mb-2">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={editedAddress.firstName || ""}
                    onChange={(e) => setEditedAddress({ ...editedAddress, firstName: e.target.value })}
                    className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm text-gray-400 mb-2">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={editedAddress.lastName || ""}
                    onChange={(e) => setEditedAddress({ ...editedAddress, lastName: e.target.value })}
                    className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="col-span-2">
                  <label htmlFor="phone" className="block text-sm text-gray-400 mb-2">
                    Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={editedAddress.phone || ""}
                    onChange={(e) => setEditedAddress({ ...editedAddress, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="col-span-2">
                  <label htmlFor="address" className="block text-sm text-gray-400 mb-2">
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={editedAddress.address || ""}
                    onChange={(e) => setEditedAddress({ ...editedAddress, address: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm text-gray-400 mb-2">
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={editedAddress.city || ""}
                    onChange={(e) => setEditedAddress({ ...editedAddress, city: e.target.value })}
                    className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm text-gray-400 mb-2">
                    State
                  </label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={editedAddress.state || ""}
                    onChange={(e) => setEditedAddress({ ...editedAddress, state: e.target.value })}
                    className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="col-span-2">
                  <label htmlFor="pincode" className="block text-sm text-gray-400 mb-2">
                    Pincode
                  </label>
                  <input
                    id="pincode"
                    name="pincode"
                    type="text"
                    value={editedAddress.pincode || ""}
                    onChange={(e) => setEditedAddress({ ...editedAddress, pincode: e.target.value })}
                    className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddressEditor(null)}
                  className="flex-1 bg-gray-600/20 border border-gray-500/30 hover:bg-gray-600/30 px-4 py-2 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateOrderAddress(showAddressEditor)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-4 py-2 rounded-lg transition-all"
                >
                  Update Address
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Return Request Modal */}
      <AnimatePresence>
        {showReturnRequestModal && <ReturnRequestModal onClose={() => setShowReturnRequestModal(false)} />}
      </AnimatePresence>
    </div>
  );
}

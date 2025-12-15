import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Lock,
  User,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Package,
  ShoppingBag,
  Tag,
  Percent,
  Shirt,
  DollarSign,
  CheckCircle,
  CreditCard,
  MessageSquare,
  FolderOpen,
  Download,
  Mail,
  Users,
  BarChart3,
  Bell,
  FileSpreadsheet,
  Award,
  Search,
  RotateCcw,
  Shield,
} from "lucide-react";
import { Product } from "../components/ProductCard";
import { Logo } from "../components/Logo";
import { CouponManagement } from "../components/CouponManagement";
import { CustomClothingManagement } from "../components/CustomClothingManagement";
import { PaymentManagement } from "../components/PaymentManagement";
import { AdminSupport } from "../components/AdminSupport";
import { CategoryManagement } from "../components/CategoryManagement";
import { WallpaperManagement } from "../components/WallpaperManagement";
import { HeroWallpaperEditor } from "../components/HeroWallpaperEditor";
import { AdminStorageFix } from "../components/AdminStorageFix";
import { EmailSetup } from "../components/EmailSetup";
import { UserManagement } from "../components/UserManagement";
import { Analytics } from "../components/Analytics";
import { InventoryAlerts } from "../components/InventoryAlerts";
import { BulkOperations } from "../components/BulkOperations";
import { NewsletterManagement } from "../components/NewsletterManagement";
import { LoyaltyProgram } from "../components/LoyaltyProgram";
import { ReturnManagement } from "../components/ReturnManagement";
import { LegalContentManagement } from "../components/LegalContentManagement";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase/client";

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

interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minPurchase: number;
  maxDiscount: number | null;
  expiryDate: string | null;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
}

export function AdminPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Debug logging
  console.log("AdminPage rendered, isLoggedIn:", isLoggedIn);

  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "figures",
    subcategory: "",
    image: "",
    images: [] as string[],
    stock: "",
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showStorageFix, setShowStorageFix] = useState(false);
  const [activeTab, setActiveTab] = useState<
    | "products"
    | "orders"
    | "payments"
    | "coupons"
    | "custom-clothing"
    | "support"
    | "categories"
    | "wallpapers"
    | "email"
    | "users"
    | "analytics"
    | "inventory-alerts"
    | "bulk-operations"
    | "newsletter-management"
    | "loyalty-program"
    | "returns"
    | "legal-content"
  >("products");
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponFormData, setCouponFormData] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    minPurchase: "",
    maxDiscount: "",
    expiryDate: "",
    usageLimit: "",
    isActive: true,
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");

  // Defensive fallbacks to avoid HMR state shape issues
  const galleryImages = formData.images || [];
  const pendingPreviews = imagePreviews || [];

  useEffect(() => {
    if (isLoggedIn) {
      fetchProducts();
      fetchOrders();
      fetchCoupons();
      fetchCategories();
    }
  }, [isLoggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/admin/login`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, password }),
      });

      const data = await response.json();

      if (data.success) {
        setIsLoggedIn(true);
        setUserId("");
        setPassword("");
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.log("Login error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowForm(false);
    setEditingProduct(null);
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/products`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.log("Error fetching products:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/orders`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.log("Error fetching orders:", error);
    }
  };

  const fetchCoupons = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/coupons`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setCoupons(data.coupons);
      }
    } catch (error) {
      console.log("Error fetching coupons:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/categories`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.log("Error fetching categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingProduct
        ? `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/products/${editingProduct.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/products`;

      const response = await fetch(url, {
        method: editingProduct ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          image: formData.image || formData.images[0] || "",
        }),
      });

      const data = await response.json();
      if (data.success) {
        setFormData({
          name: "",
          description: "",
          price: "",
          category: "figures",
          subcategory: "",
          image: "",
          images: [],
          stock: "",
        });
        setSelectedImages([]);
        setImagePreviews([]);
        setEditingProduct(null);
        setShowForm(false);
        fetchProducts();
      }
    } catch (error) {
      console.log("Error saving product:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/products/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        fetchProducts();
      }
    } catch (error) {
      console.log("Error deleting product:", error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      subcategory: (product as any).subcategory || "",
      image: product.image || (product as any).images?.[0] || "",
      images: (product as any).images || (product.image ? [product.image] : []),
      stock: product.stock.toString(),
    });
    setSelectedImages([]);
    setImagePreviews([]);
    setShowForm(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setSelectedImages(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleUploadImage = async () => {
    if (!selectedImages.length) return;
    setUploadingImage(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of selectedImages || []) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage.from("product-images").upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

        if (error) {
          console.error("Error uploading image:", error);
          if (error.message && error.message.includes("row-level security")) {
            setShowStorageFix(true);
          } else {
            alert(`Failed to upload image: ${error.message}`);
          }
          continue;
        }

        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(data.path);
        if (urlData?.publicUrl) {
          uploadedUrls.push(urlData.publicUrl);
        }
      }

      if (uploadedUrls.length) {
        setFormData((prev) => {
          const images = [...prev.images, ...uploadedUrls];
          return {
            ...prev,
            images,
            image: prev.image || images[0],
          };
        });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
      setSelectedImages([]);
      setImagePreviews([]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => {
      const removed = prev.images[index];
      const updatedImages = prev.images.filter((_, i) => i !== index);
      const nextPrimary = updatedImages[0] || "";

      return {
        ...prev,
        images: updatedImages,
        image: prev.image === removed ? nextPrimary : prev.image,
      };
    });
  };

  try {
    return (
      <div className="min-h-screen bg-black">
        {/* Admin Header */}
        <nav className="sticky top-0 z-50 bg-black border-b border-purple-900/30 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={() => navigate("/")}
                  className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <Logo />
                  <span className="text-gray-400 text-xs sm:text-sm ml-1 sm:ml-2 hidden md:inline">Admin Panel</span>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                {isLoggedIn && (
                  <>
                    <button
                      onClick={() => window.open("/email-test", "_blank")}
                      className="bg-blue-600 hover:bg-blue-700 px-2 sm:px-4 py-2 rounded-lg transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                      title="Test Email System"
                    >
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden lg:inline">Email Test</span>
                    </button>
                    <button
                      onClick={async () => {
                        if (
                          !confirm("Seed default categories and wallpapers? This will only add them if none exist.")
                        ) {
                          return;
                        }

                        try {
                          const response = await fetch(
                            `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/seed-defaults`,
                            {
                              method: "POST",
                              headers: {
                                Authorization: `Bearer ${publicAnonKey}`,
                              },
                            }
                          );

                          const data = await response.json();
                          if (data.success) {
                            const messages = [];
                            if (data.categoriesSeeded) {
                              messages.push("✅ Categories seeded successfully!");
                            } else {
                              messages.push("ℹ️ Categories already exist, skipped seeding.");
                            }
                            if (data.wallpapersSeeded) {
                              messages.push("✅ Wallpapers seeded successfully!");
                            } else {
                              messages.push("ℹ️ Wallpapers already exist, skipped seeding.");
                            }

                            // Refresh all data without reloading the page
                            await Promise.all([fetchCategories(), fetchProducts(), fetchOrders(), fetchCoupons()]);

                            alert(
                              messages.join("\n") +
                                "\n\n✅ Data refreshed successfully!\n\n💡 Go to Home Page to see the new wallpapers in action!"
                            );
                          } else {
                            alert("❌ Failed to seed defaults: " + data.error);
                          }
                        } catch (error) {
                          console.error("Error seeding defaults:", error);
                          alert("Failed to seed defaults");
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700 px-2 sm:px-4 py-2 rounded-lg transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                    >
                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Seed Defaults</span>
                      <span className="sm:hidden">Seed</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 hover:bg-red-700 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            {!isLoggedIn ? (
              // Login Form
              <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl w-full max-w-md shadow-2xl shadow-purple-900/50 p-8">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8" />
                    </div>
                    <h1 className="text-white mb-2">Admin Access</h1>
                    <p className="text-gray-400">Sign in to manage your store</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-gray-300 mb-2">User ID</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={userId}
                          onChange={(e) => setUserId(e.target.value)}
                          required
                          placeholder="Enter your user ID"
                          className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg pl-11 pr-4 py-3 text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder="Enter your password"
                          className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg pl-11 pr-4 py-3 text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 py-3 rounded-lg transition-all text-lg"
                    >
                      {isLoading ? "Logging in..." : "Login"}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              // Admin Panel
              <div>
                {/* Tab Navigation */}
                <div className="flex gap-2 sm:gap-4 mb-8 border-b border-purple-900/30 overflow-x-auto scrollbar-hide">
                  <button
                    onClick={() => setActiveTab("products")}
                    className={`px-3 sm:px-6 py-3 flex items-center gap-1 sm:gap-2 transition-all border-b-2 whitespace-nowrap text-sm sm:text-base ${
                      activeTab === "products"
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Products</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className={`px-3 sm:px-6 py-3 flex items-center gap-1 sm:gap-2 transition-all border-b-2 whitespace-nowrap text-sm sm:text-base ${
                      activeTab === "orders"
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Orders</span>
                    {orders.length > 0 && (
                      <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">{orders.length}</span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("payments")}
                    className={`px-3 sm:px-6 py-3 flex items-center gap-1 sm:gap-2 transition-all border-b-2 whitespace-nowrap text-sm sm:text-base ${
                      activeTab === "payments"
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Payments</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("coupons")}
                    className={`px-3 sm:px-6 py-3 flex items-center gap-1 sm:gap-2 transition-all border-b-2 whitespace-nowrap text-sm sm:text-base ${
                      activeTab === "coupons"
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Coupons</span>
                    {coupons.length > 0 && (
                      <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">{coupons.length}</span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("custom-clothing")}
                    className={`px-3 sm:px-6 py-3 flex items-center gap-1 sm:gap-2 transition-all border-b-2 whitespace-nowrap text-sm sm:text-base ${
                      activeTab === "custom-clothing"
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    <Shirt className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Custom</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("support")}
                    className={`px-3 sm:px-6 py-3 flex items-center gap-1 sm:gap-2 transition-all border-b-2 whitespace-nowrap text-sm sm:text-base ${
                      activeTab === "support"
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Support</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("categories")}
                    className={`px-3 sm:px-6 py-3 flex items-center gap-1 sm:gap-2 transition-all border-b-2 whitespace-nowrap text-sm sm:text-base ${
                      activeTab === "categories"
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Categories</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("wallpapers")}
                    className={`px-3 sm:px-6 py-3 flex items-center gap-1 sm:gap-2 transition-all border-b-2 whitespace-nowrap text-sm sm:text-base ${
                      activeTab === "wallpapers"
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Wallpapers</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("email")}
                    className={`px-3 sm:px-6 py-3 flex items-center gap-1 sm:gap-2 transition-all border-b-2 whitespace-nowrap text-sm sm:text-base ${
                      activeTab === "email"
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Email Setup</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("users")}
                    className={`px-3 sm:px-6 py-3 flex items-center gap-1 sm:gap-2 transition-all border-b-2 whitespace-nowrap text-sm sm:text-base ${
                      activeTab === "users"
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Users</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("analytics")}
                    className={`px-3 sm:px-6 py-3 flex items-center gap-1 sm:gap-2 transition-all border-b-2 whitespace-nowrap text-sm sm:text-base ${
                      activeTab === "analytics"
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Analytics</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("inventory-alerts")}
                    className={`px-3 sm:px-6 py-3 flex items-center gap-1 sm:gap-2 transition-all border-b-2 whitespace-nowrap text-sm sm:text-base ${
                      activeTab === "inventory-alerts"
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Inventory Alerts</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("bulk-operations")}
                    className={`px-3 sm:px-6 py-3 flex items-center gap-1 sm:gap-2 transition-all border-b-2 whitespace-nowrap text-sm sm:text-base ${
                      activeTab === "bulk-operations"
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Bulk Operations</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("newsletter-management")}
                    className={`px-3 sm:px-6 py-3 flex items-center gap-1 sm:gap-2 transition-all border-b-2 whitespace-nowrap text-sm sm:text-base ${
                      activeTab === "newsletter-management"
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Newsletter Management</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("loyalty-program")}
                    className={`px-3 sm:px-6 py-3 flex items-center gap-1 sm:gap-2 transition-all border-b-2 whitespace-nowrap text-sm sm:text-base ${
                      activeTab === "loyalty-program"
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Loyalty Program</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("returns")}
                    className={`px-3 sm:px-6 py-3 flex items-center gap-1 sm:gap-2 transition-all border-b-2 whitespace-nowrap text-sm sm:text-base ${
                      activeTab === "returns"
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Returns</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("legal-content")}
                    className={`px-3 sm:px-6 py-3 flex items-center gap-1 sm:gap-2 transition-all border-b-2 whitespace-nowrap text-sm sm:text-base ${
                      activeTab === "legal-content"
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Legal</span>
                  </button>
                </div>

                {activeTab === "products" ? (
                  <>
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h1 className="text-white mb-2">Product Management</h1>
                        <p className="text-gray-400">Manage your store inventory and products</p>
                      </div>
                      {!showForm && (
                        <button
                          onClick={() => {
                            setShowForm(true);
                            setEditingProduct(null);
                            setFormData({
                              name: "",
                              description: "",
                              price: "",
                              category: "figures",
                              subcategory: "",
                              image: "",
                              images: [],
                              stock: "",
                            });
                          }}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg flex items-center gap-2 transition-all"
                        >
                          <Plus className="w-5 h-5" />
                          Add New Product
                        </button>
                      )}
                    </div>

                    {showForm ? (
                      // Product Form
                      <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-8">
                        <h2 className="text-white mb-6">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                          <div>
                            <label className="block text-gray-300 mb-2">Product Name</label>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              required
                              className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 mb-2">Description</label>
                            <textarea
                              value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              rows={3}
                              className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-gray-300 mb-2">Price (₹)</label>
                              <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                required
                                min="0"
                                step="0.01"
                                className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-300 mb-2">Stock</label>
                              <input
                                type="number"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                required
                                min="0"
                                className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-gray-300 mb-2">Category</label>
                            <select
                              value={formData.category}
                              onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: "" })}
                              className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                            >
                              {categories.length > 0 ? (
                                categories.map((cat) => (
                                  <option key={cat.id} value={cat.slug}>
                                    {cat.name}
                                  </option>
                                ))
                              ) : (
                                <>
                                  <option value="figures">Figures</option>
                                  <option value="katana">Katana</option>
                                  <option value="accessories">Accessories</option>
                                  <option value="posters">Posters</option>
                                  <option value="clothing">Clothing</option>
                                  <option value="collectibles">Collectibles</option>
                                </>
                              )}
                            </select>
                          </div>
                          <div>
                            <label className="block text-gray-300 mb-2">Subcategory (Optional)</label>
                            {(() => {
                              const selectedCategory = categories.find((cat) => cat.slug === formData.category);
                              const hasSubcategories =
                                selectedCategory &&
                                selectedCategory.subcategories &&
                                selectedCategory.subcategories.length > 0;

                              return hasSubcategories ? (
                                <select
                                  value={formData.subcategory}
                                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                                  className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                >
                                  <option value="">-- Select Subcategory --</option>
                                  {selectedCategory.subcategories.map((sub: string, index: number) => (
                                    <option key={index} value={sub.toLowerCase().replace(/\s+/g, "-")}>
                                      {sub}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  value={formData.subcategory}
                                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                                  className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                  placeholder="e.g., demon-slayer, naruto, etc."
                                />
                              );
                            })()}
                          </div>
                          <div>
                            <label className="block text-gray-300 mb-2">Product Images</label>
                            <div className="space-y-4">
                              {/* Current gallery */}
                              {galleryImages.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                  {galleryImages.map((img, idx) => (
                                    <div
                                      key={img + idx}
                                      className="relative rounded-lg overflow-hidden border border-purple-500/30 bg-purple-900/10"
                                    >
                                      <img src={img} alt={`Product ${idx + 1}`} className="w-full h-32 object-cover" />
                                      <div className="absolute top-2 left-2 flex gap-2">
                                        {idx === 0 && (
                                          <span className="text-xs bg-black/70 text-purple-200 px-2 py-1 rounded-full border border-purple-500/50">
                                            Primary
                                          </span>
                                        )}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveImage(idx)}
                                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 p-1 rounded-full border border-purple-500/50 transition-colors"
                                      >
                                        <X className="w-4 h-4 text-gray-200" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Pending uploads preview */}
                              {pendingPreviews.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                  {pendingPreviews.map((preview, idx) => (
                                    <div
                                      key={preview + idx}
                                      className="relative rounded-lg overflow-hidden border border-dashed border-purple-500/40 bg-purple-900/10"
                                    >
                                      <img
                                        src={preview}
                                        alt={`Preview ${idx + 1}`}
                                        className="w-full h-32 object-cover opacity-80"
                                      />
                                      <span className="absolute bottom-2 left-2 text-xs bg-black/70 text-gray-200 px-2 py-1 rounded-full border border-purple-500/50">
                                        Ready to upload
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Upload controls */}
                              <div className="flex flex-col sm:flex-row gap-2">
                                <label className="flex-1 bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-3 cursor-pointer hover:bg-purple-900/30 transition-colors flex items-center justify-center gap-2 text-center">
                                  <Upload className="w-5 h-5 text-purple-400" />
                                  <span className="text-gray-300">
                                    {(selectedImages || []).length
                                      ? `${selectedImages.length} image(s) selected`
                                      : "Choose images (you can select multiple)"}
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="hidden"
                                  />
                                </label>

                                {(selectedImages || []).length > 0 && (
                                  <button
                                    type="button"
                                    onClick={handleUploadImage}
                                    disabled={uploadingImage}
                                    className="sm:w-48 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                                  >
                                    {uploadingImage ? (
                                      <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Uploading...
                                      </>
                                    ) : (
                                      <>
                                        <ImageIcon className="w-4 h-4" />
                                        Upload
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>

                              <p className="text-sm text-gray-400">
                                Tip: The first image is used as the primary thumbnail. Re-upload to change the order.
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-4">
                            <button
                              type="submit"
                              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 rounded-lg transition-all"
                            >
                              {editingProduct ? "Update Product" : "Add Product"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowForm(false);
                                setEditingProduct(null);
                              }}
                              className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 rounded-lg transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      // Products List
                      <div className="space-y-4">
                        {products.length === 0 ? (
                          <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-12 text-center">
                            <p className="text-gray-400 text-lg">No products yet. Add your first product!</p>
                          </div>
                        ) : (
                          products.map((product) => (
                            <div
                              key={product.id}
                              className="flex flex-col sm:flex-row gap-4 bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-xl p-4 sm:p-6"
                            >
                              <img
                                src={
                                  (product as any).images?.[0] ||
                                  product.image ||
                                  "https://images.unsplash.com/photo-1763771757355-4c0441df34ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMG1lcmNoYW5kaXNlfGVufDF8fHx8MTc2NTE4ODk3OXww&ixlib=rb-4.1.0&q=80&w=1080"
                                }
                                alt={product.name}
                                className="w-full sm:w-24 md:w-32 h-32 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <h4 className="text-white mb-2">{product.name}</h4>
                                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                                  <span className="text-purple-400">₹{product.price.toLocaleString()}</span>
                                  <span className="text-gray-400">Stock: {product.stock}</span>
                                  <span className="text-gray-400 capitalize hidden sm:inline">
                                    Category: {product.category}
                                  </span>
                                  {(product as any).subcategory && (
                                    <span className="text-gray-400 capitalize hidden lg:inline">
                                      Subcategory: {(product as any).subcategory}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex sm:flex-col gap-2">
                                <button
                                  onClick={() => handleEdit(product)}
                                  className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                                >
                                  <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="sm:inline">Edit</span>
                                </button>
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                                >
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="sm:inline">Delete</span>
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </>
                ) : activeTab === "orders" ? (
                  // Orders List
                  <div className="space-y-4">
                    {/* Order Status Filter Submenu */}
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                      <button
                        onClick={() => setOrderStatusFilter("all")}
                        className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm transition-all ${
                          orderStatusFilter === "all"
                            ? "bg-purple-600 text-white"
                            : "bg-purple-900/20 text-gray-400 hover:text-gray-300 border border-purple-500/30"
                        }`}
                      >
                        All Orders ({orders.length})
                      </button>
                      <button
                        onClick={() => setOrderStatusFilter("Order Pending")}
                        className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm transition-all ${
                          orderStatusFilter === "Order Pending"
                            ? "bg-purple-600 text-white"
                            : "bg-purple-900/20 text-gray-400 hover:text-gray-300 border border-purple-500/30"
                        }`}
                      >
                        Pending ({orders.filter((o) => o.status === "Order Pending").length})
                      </button>
                      <button
                        onClick={() => setOrderStatusFilter("In Transit")}
                        className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm transition-all ${
                          orderStatusFilter === "In Transit"
                            ? "bg-purple-600 text-white"
                            : "bg-purple-900/20 text-gray-400 hover:text-gray-300 border border-purple-500/30"
                        }`}
                      >
                        In Transit ({orders.filter((o) => o.status === "In Transit").length})
                      </button>
                      <button
                        onClick={() => setOrderStatusFilter("Out for Delivery")}
                        className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm transition-all ${
                          orderStatusFilter === "Out for Delivery"
                            ? "bg-purple-600 text-white"
                            : "bg-purple-900/20 text-gray-400 hover:text-gray-300 border border-purple-500/30"
                        }`}
                      >
                        Out for Delivery ({orders.filter((o) => o.status === "Out for Delivery").length})
                      </button>
                      <button
                        onClick={() => setOrderStatusFilter("Order Delivered")}
                        className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm transition-all ${
                          orderStatusFilter === "Order Delivered"
                            ? "bg-purple-600 text-white"
                            : "bg-purple-900/20 text-gray-400 hover:text-gray-300 border border-purple-500/30"
                        }`}
                      >
                        Delivered ({orders.filter((o) => o.status === "Order Delivered").length})
                      </button>
                      <button
                        onClick={() => setOrderStatusFilter("Cancelled")}
                        className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm transition-all ${
                          orderStatusFilter === "Cancelled"
                            ? "bg-purple-600 text-white"
                            : "bg-purple-900/20 text-gray-400 hover:text-gray-300 border border-purple-500/30"
                        }`}
                      >
                        Cancelled ({orders.filter((o) => o.status === "Cancelled").length})
                      </button>
                    </div>

                    {/* Filtered Orders */}
                    {(() => {
                      const filteredOrders =
                        orderStatusFilter === "all" ? orders : orders.filter((o) => o.status === orderStatusFilter);

                      return filteredOrders.length === 0 ? (
                        <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-12 text-center">
                          <p className="text-gray-400 text-lg">
                            {orderStatusFilter === "all"
                              ? "No orders yet. Wait for customers to place orders!"
                              : `No orders with status "${orderStatusFilter}"`}
                          </p>
                        </div>
                      ) : (
                        filteredOrders.map((order) => (
                          <div
                            key={order.id}
                            className="flex gap-4 bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-xl p-6"
                          >
                            <div className="flex-1">
                              <h4 className="text-white mb-2">Order ID: {order.id}</h4>
                              <p className="text-gray-400 text-sm mb-3">Tracking ID: {order.trackingId}</p>
                              <div className="flex items-center gap-4 text-sm mb-4">
                                <span className="text-purple-400">Total: ₹{order.total.toLocaleString()}</span>
                                <span className="text-gray-400">
                                  Created At: {new Date(order.createdAt).toLocaleString()}
                                </span>
                              </div>

                              {/* Admin-only Status Dropdown */}
                              <div className="mb-4">
                                <label className="block text-gray-300 mb-2">Order Status (Admin Only)</label>
                                <select
                                  value={order.status}
                                  onChange={async (e) => {
                                    const newStatus = e.target.value;
                                    if (order.status === "Cancelled") {
                                      alert("Cannot update status of cancelled orders");
                                      return;
                                    }

                                    if (confirm(`Update order status to "${newStatus}"?`)) {
                                      try {
                                        const response = await fetch(
                                          `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/orders/${order.id}/status`,
                                          {
                                            method: "PUT",
                                            headers: {
                                              Authorization: `Bearer ${publicAnonKey}`,
                                              "Content-Type": "application/json",
                                            },
                                            body: JSON.stringify({ status: newStatus }),
                                          }
                                        );

                                        const data = await response.json();
                                        if (data.success) {
                                          alert(
                                            "✅ Order status updated successfully! Customer will be notified via Email and WhatsApp."
                                          );
                                          fetchOrders(); // Refresh orders
                                        } else {
                                          alert(`Failed to update status: ${data.message}`);
                                        }
                                      } catch (error) {
                                        console.error("Error updating order status:", error);
                                        alert("Failed to update order status. Please try again.");
                                      }
                                    }
                                  }}
                                  disabled={order.status === "Cancelled"}
                                  className="w-full max-w-xs bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <option value="Order Pending">Order Pending</option>
                                  <option value="In Transit">In Transit</option>
                                  <option value="Out for Delivery">Out for Delivery</option>
                                  <option value="Order Delivered">Order Delivered</option>
                                  {order.status === "Cancelled" && <option value="Cancelled">Cancelled</option>}
                                </select>
                              </div>

                              <div className="mt-4">
                                <h5 className="text-white mb-2">Customer Information</h5>
                                <p className="text-gray-400 text-sm mb-1">Name: {order.customerInfo.name}</p>
                                <p className="text-gray-400 text-sm mb-1">Email: {order.customerInfo.email}</p>
                                <p className="text-gray-400 text-sm mb-1">Phone: {order.customerInfo.phone}</p>
                                <p className="text-gray-400 text-sm mb-1">Address: {order.customerInfo.address}</p>
                              </div>
                              <div className="mt-4">
                                <h5 className="text-white mb-2">Payment Information</h5>
                                <p className="text-gray-400 text-sm mb-1">Payment ID: {order.paymentId}</p>
                                <p className="text-gray-400 text-sm mb-1">Payment Method: {order.paymentMethod}</p>
                                {(order as any).paymentType && (
                                  <p className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                                    Payment Type:
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-xs ${
                                        (order as any).paymentType === "Prepaid"
                                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                          : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                      }`}
                                    >
                                      {(order as any).paymentType}
                                    </span>
                                  </p>
                                )}
                                {(order as any).paymentStatus && (
                                  <p className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                                    Payment Status:
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                        (order as any).paymentStatus === "Paid"
                                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                          : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                      }`}
                                    >
                                      {(order as any).paymentStatus === "Paid" ? "✓ PAID" : "PAYMENT PENDING"}
                                    </span>
                                  </p>
                                )}

                                {/* Payment Verification Section - Only for Razorpay and Paytm */}
                                {(order.paymentMethod.toLowerCase().includes("razorpay") ||
                                  order.paymentMethod.toLowerCase().includes("paytm")) &&
                                  order.status !== "Cancelled" && (
                                    <div className="mt-4 p-4 bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-lg">
                                      <div className="flex items-center gap-2 mb-3">
                                        <Shield className="w-5 h-5 text-yellow-400" />
                                        <h6 className="text-yellow-400 font-medium">Payment Verification Required</h6>
                                      </div>
                                      <p className="text-gray-300 text-sm mb-3">
                                        This order was placed using {order.paymentMethod}. Please verify that payment
                                        was actually received before processing the order.
                                      </p>

                                      {(order as any).paymentVerified ? (
                                        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                                          <div className="flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                            <span className="text-green-400 font-medium">Payment Verified ✓</span>
                                          </div>
                                          <p className="text-gray-300 text-xs mt-2">
                                            Verified on: {new Date((order as any).paymentVerifiedAt).toLocaleString()}
                                          </p>
                                          {(order as any).verifiedBy && (
                                            <p className="text-gray-400 text-xs">By: {(order as any).verifiedBy}</p>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="space-y-2">
                                          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mb-3">
                                            <p className="text-orange-300 text-xs mb-2">⚠️ Payment Not Yet Verified</p>
                                            <p className="text-gray-400 text-xs">
                                              Check your {order.paymentMethod} dashboard to confirm payment was received
                                              for Payment ID:{" "}
                                              <span className="text-purple-400 font-mono">{order.paymentId}</span>
                                            </p>
                                          </div>

                                          <div className="flex gap-2">
                                            <button
                                              onClick={async () => {
                                                if (
                                                  confirm(
                                                    `Confirm that you have verified payment receipt in your ${
                                                      order.paymentMethod
                                                    } dashboard?\n\nPayment ID: ${
                                                      order.paymentId
                                                    }\nAmount: ₹${order.total.toLocaleString()}\n\nThis will mark the payment as verified and allow order processing.`
                                                  )
                                                ) {
                                                  try {
                                                    const response = await fetch(
                                                      `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/orders/${order.id}/verify-payment`,
                                                      {
                                                        method: "POST",
                                                        headers: {
                                                          Authorization: `Bearer ${publicAnonKey}`,
                                                          "Content-Type": "application/json",
                                                        },
                                                        body: JSON.stringify({
                                                          verified: true,
                                                          verifiedBy: "Admin",
                                                        }),
                                                      }
                                                    );

                                                    const data = await response.json();
                                                    if (data.success) {
                                                      alert("✅ Payment verified successfully!");
                                                      fetchOrders(); // Refresh orders
                                                    } else {
                                                      alert(`Failed to verify payment: ${data.message}`);
                                                    }
                                                  } catch (error) {
                                                    console.error("Error verifying payment:", error);
                                                    alert("Failed to verify payment. Please try again.");
                                                  }
                                                }
                                              }}
                                              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                                            >
                                              <CheckCircle className="w-4 h-4" />
                                              Verify Payment Received
                                            </button>

                                            <button
                                              onClick={async () => {
                                                const reason = prompt(
                                                  `⚠️ PAYMENT VERIFICATION FAILED\n\n` +
                                                    `You are about to CANCEL this order because payment was not received.\n\n` +
                                                    `Payment ID: ${order.paymentId}\n` +
                                                    `Amount: ₹${order.total.toLocaleString()}\n` +
                                                    `Method: ${order.paymentMethod}\n\n` +
                                                    `Please enter the reason for cancellation:`
                                                );

                                                if (reason && reason.trim()) {
                                                  if (
                                                    confirm(
                                                      `Are you absolutely sure you want to CANCEL this order?\n\nReason: ${reason}\n\nThe customer will be notified via email.`
                                                    )
                                                  ) {
                                                    try {
                                                      const response = await fetch(
                                                        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/orders/${order.id}/cancel-payment-failed`,
                                                        {
                                                          method: "POST",
                                                          headers: {
                                                            Authorization: `Bearer ${publicAnonKey}`,
                                                            "Content-Type": "application/json",
                                                          },
                                                          body: JSON.stringify({
                                                            reason: reason,
                                                            cancelledBy: "Admin",
                                                          }),
                                                        }
                                                      );

                                                      const data = await response.json();
                                                      if (data.success) {
                                                        alert(
                                                          "✅ Order cancelled successfully. Customer has been notified via email."
                                                        );
                                                        fetchOrders(); // Refresh orders
                                                      } else {
                                                        alert(`Failed to cancel order: ${data.message}`);
                                                      }
                                                    } catch (error) {
                                                      console.error("Error cancelling order:", error);
                                                      alert("Failed to cancel order. Please try again.");
                                                    }
                                                  }
                                                }
                                              }}
                                              className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                                            >
                                              <X className="w-4 h-4" />
                                              Payment Not Received - Cancel Order
                                            </button>
                                          </div>

                                          <p className="text-gray-500 text-xs mt-2 text-center">
                                            💡 Tip: Check your payment gateway dashboard before taking action
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                              </div>
                              <div className="mt-4">
                                <h5 className="text-white mb-2">Items</h5>
                                <ul className="list-disc list-inside">
                                  {order.items.map((item, index) => (
                                    <li key={index} className="text-gray-400 text-sm">
                                      {item.name} - ₹{item.price.toLocaleString()} x {item.quantity}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))
                      );
                    })()}
                  </div>
                ) : activeTab === "payments" ? (
                  // Payments Management
                  <PaymentManagement orders={orders} onRefresh={fetchOrders} />
                ) : activeTab === "custom-clothing" ? (
                  // Custom Clothing Management
                  <CustomClothingManagement />
                ) : activeTab === "support" ? (
                  // Admin Support
                  <AdminSupport />
                ) : activeTab === "categories" ? (
                  // Category Management
                  <CategoryManagement />
                ) : activeTab === "wallpapers" ? (
                  // Wallpaper Management
                  <div className="space-y-8">
                    <HeroWallpaperEditor />
                    <div className="border-t border-gray-700 pt-8">
                      <WallpaperManagement />
                    </div>
                  </div>
                ) : activeTab === "email" ? (
                  // Email Setup
                  <EmailSetup />
                ) : activeTab === "users" ? (
                  // Users Management
                  <UserManagement />
                ) : activeTab === "analytics" ? (
                  // Analytics
                  <Analytics />
                ) : activeTab === "inventory-alerts" ? (
                  // Inventory Alerts
                  <InventoryAlerts />
                ) : activeTab === "bulk-operations" ? (
                  // Bulk Operations
                  <BulkOperations />
                ) : activeTab === "newsletter-management" ? (
                  // Newsletter Management
                  <NewsletterManagement />
                ) : activeTab === "loyalty-program" ? (
                  // Loyalty Program
                  <LoyaltyProgram />
                ) : activeTab === "returns" ? (
                  // Returns Management
                  <ReturnManagement />
                ) : activeTab === "legal-content" ? (
                  // Legal Content Management
                  <LegalContentManagement />
                ) : (
                  // Coupons Management
                  <CouponManagement coupons={coupons} onRefresh={fetchCoupons} />
                )}
              </div>
            )}
          </div>
        </main>

        {/* Storage Fix Modal */}
        {showStorageFix && <AdminStorageFix />}
      </div>
    );
  } catch (error) {
    console.error("AdminPage render error:", error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-black text-white flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Admin Panel Error</h1>
          <p className="text-gray-300 mb-4">
            There was an error loading the admin panel. Please check the console for details.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}

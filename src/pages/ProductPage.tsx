import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ShoppingCart,
  Star,
  Package,
  Shield,
  Truck,
  CreditCard,
  ChevronDown,
  ChevronUp,
  ImagePlus,
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { FloatingParticles } from "../components/FloatingParticles";
import { Cart } from "../components/Cart";
import { UserAuth } from "../components/UserAuth";
import { CheckoutModal } from "../components/CheckoutModal";
import { Product } from "../components/ProductCard";
import { ProductReviews } from "../components/ProductReviews";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { supabase } from "../utils/supabase/client";

interface CartItem extends Product {
  quantity: number;
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserAuthOpen, setIsUserAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const slideTimer = useRef<number | null>(null);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    checkUser();
  }, [id]);

  useEffect(() => {
    setSelectedImage(0);
    if (slideTimer.current) {
      clearInterval(slideTimer.current);
      slideTimer.current = null;
    }
  }, [product?.id]);

  // Auto-advance slider for products with multiple images
  useEffect(() => {
    if (!product) {
      if (slideTimer.current) {
        clearInterval(slideTimer.current);
        slideTimer.current = null;
      }
      return;
    }

    const currentGallery = (product.images && product.images.length ? product.images : [product.image]).filter(Boolean);
    const currentSafeGallery = currentGallery.length
      ? currentGallery
      : [
          "https://images.unsplash.com/photo-1763771757355-4c0441df34ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMG1lcmNoYW5kaXNlfGVufDF8fHx8MTc2NTE4ODk3OXww&ixlib=rb-4.1.0&q=80&w=1080",
        ];

    if (currentSafeGallery.length <= 1) {
      if (slideTimer.current) {
        clearInterval(slideTimer.current);
        slideTimer.current = null;
      }
      return;
    }

    slideTimer.current = window.setInterval(() => {
      setSelectedImage((prev) => (prev + 1) % currentSafeGallery.length);
    }, 5000);

    return () => {
      if (slideTimer.current) {
        clearInterval(slideTimer.current);
        slideTimer.current = null;
      }
    };
  }, [product?.images, product?.image]);

  const checkUser = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      setUser(data.session.user);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const fetchProduct = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/products`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        const foundProduct = data.products.find((p: Product) => p.id === id);
        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      console.log("Error fetching product:", error);
      navigate("/");
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/reviews/${id}`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.log("Error fetching reviews:", error);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item));
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const handleOrderNow = () => {
    if (!product) return;

    // Check if user is logged in
    if (!user) {
      setPendingCheckout(true);
      setIsUserAuthOpen(true);
      return;
    }

    // Add to cart and immediately checkout
    const newCartItems = [{ ...product, quantity }];
    setCartItems(newCartItems);
    setIsCheckoutOpen(true);
  };

  const handleAuthSuccess = (authUser: any) => {
    setUser(authUser);
    if (pendingCheckout) {
      setPendingCheckout(false);
      handleOrderNow();
    }
  };

  const handleCheckoutSuccess = () => {
    setCartItems([]);
    setIsCheckoutOpen(false);
    navigate("/");
  };

  const handleBack = () => {
    const productRoute = `/product/${id}`;
    let prevRoute: string | null = null;
    try {
      prevRoute = sessionStorage.getItem("prevRoute");
    } catch {}

    // Prefer stored previous route if valid and different from current product route
    if (prevRoute && prevRoute !== productRoute) {
      navigate(prevRoute);
      return;
    }

    // Otherwise, use history back when possible; fallback to home
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    setCartItems((prev) => prev.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item)));
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleCheckout = () => {
    if (!user) {
      setIsCartOpen(false);
      setPendingCheckout(true);
      setIsUserAuthOpen(true);
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <FloatingParticles />
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 4.8;
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const fallbackImage =
    "https://images.unsplash.com/photo-1763771757355-4c0441df34ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMG1lcmNoYW5kaXNlfGVufDF8fHx8MTc2NTE4ODk3OXww&ixlib=rb-4.1.0&q=80&w=1080";
  const gallery = (product.images && product.images.length ? product.images : [product.image]).filter(Boolean);
  const safeGallery = gallery.length ? gallery : [fallbackImage];
  const activeImage = safeGallery[Math.min(selectedImage, safeGallery.length - 1)];

  const goNext = () => {
    if (!safeGallery.length) return;
    setSelectedImage((prev) => (prev + 1) % safeGallery.length);
  };

  const goPrev = () => {
    if (!safeGallery.length) return;
    setSelectedImage((prev) => (prev - 1 + safeGallery.length) % safeGallery.length);
  };

  return (
    <div className="min-h-screen bg-black">
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      <FloatingParticles />

      <Navbar
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        onLoginClick={() => setIsUserAuthOpen(true)}
        user={user}
        onLogout={handleLogout}
      />

      <main className="relative z-10">
        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <motion.button
            onClick={handleBack}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
            whileHover={{ x: -5 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Product Details Section */}
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Product Images */}
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="relative">
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50"
                  animate={{
                    opacity: [0.5, 0.7, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <div className="relative rounded-2xl overflow-hidden border-2 border-purple-500/50 bg-black">
                  <motion.img
                    src={activeImage}
                    alt={product.name}
                    className="w-full h-auto object-cover"
                    layoutId={`product-${product.id}`}
                  />
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                      <span className="text-red-400 border border-red-400 px-6 py-3 rounded-lg text-xl">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  {safeGallery.length > 1 && (
                    <>
                      <div className="absolute inset-y-0 left-0 flex items-center pl-2 z-20">
                        <button
                          type="button"
                          onClick={goPrev}
                          className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white p-3 rounded-full border-2 border-purple-400 transition-all shadow-lg hover:shadow-purple-600/50 cursor-pointer"
                          aria-label="Previous image"
                        >
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 z-20">
                        <button
                          type="button"
                          onClick={goNext}
                          className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white p-3 rounded-full border-2 border-purple-400 transition-all shadow-lg hover:shadow-purple-600/50 cursor-pointer"
                          aria-label="Next image"
                        >
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
                {/* Thumbnail Gallery Slider */}
                <div className="mt-6 pt-4 border-t border-purple-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-gray-400 text-sm">
                      Product Images {safeGallery.length > 1 && `(${safeGallery.length} available)`}
                    </p>
                    {safeGallery.length > 1 && (
                      <motion.button
                        onClick={() => setShowImageSelector(!showImageSelector)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/50 hover:bg-purple-600 border border-purple-500/50 rounded-lg text-purple-300 hover:text-white text-sm transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ImagePlus className="w-4 h-4" />
                        Select Image
                      </motion.button>
                    )}
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {safeGallery.map((img, idx) => (
                      <button
                        type="button"
                        key={`${idx}-${img.substring(0, 20)}`}
                        onClick={() => setSelectedImage(idx)}
                        className={`shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 cursor-pointer ${
                          selectedImage === idx
                            ? "border-purple-500 shadow-lg shadow-purple-900/50 ring-2 ring-purple-400"
                            : "border-purple-500/30 hover:border-purple-400"
                        }`}
                        aria-label={`View image ${idx + 1}`}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover pointer-events-none"
                        />
                      </button>
                    ))}
                  </div>

                  {/* Image Selector Dropdown */}
                  {showImageSelector && safeGallery.length > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4 p-4 bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg"
                    >
                      <p className="text-gray-300 text-sm font-semibold mb-3">Choose an image:</p>
                      <div className="grid grid-cols-3 gap-3">
                        {safeGallery.map((img, idx) => (
                          <motion.button
                            key={`selector-${idx}-${img.substring(0, 20)}`}
                            onClick={() => {
                              setSelectedImage(idx);
                              setShowImageSelector(false);
                            }}
                            className={`relative rounded-lg overflow-hidden border-2 transition-all h-28 ${
                              selectedImage === idx
                                ? "border-purple-400 ring-2 ring-purple-400 scale-105"
                                : "border-purple-500/30 hover:border-purple-400"
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <img src={img} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
                            {selectedImage === idx && (
                              <div className="absolute inset-0 bg-purple-600/20 flex items-center justify-center">
                                <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                                  ✓
                                </div>
                              </div>
                            )}
                            <div className="absolute bottom-1 right-1 bg-black/70 text-purple-300 text-xs px-2 py-1 rounded">
                              {idx + 1}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Features */}
              <motion.div
                className="grid grid-cols-2 gap-4 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {[
                  { icon: Shield, text: "100% Authentic" },
                  { icon: Truck, text: "Fast Delivery" },
                  { icon: Package, text: "Secure Packaging" },
                  { icon: CreditCard, text: "Secure Payment" },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.text}
                    className="flex items-center gap-3 bg-purple-900/20 border border-purple-500/30 rounded-lg p-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <feature.icon className="w-6 h-6 text-purple-400" />
                    <span className="text-gray-300 text-sm">{feature.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <span className="inline-block px-3 py-1 bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/50 rounded-full text-purple-300 text-sm mb-4">
                  {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                </span>
              </motion.div>

              <motion.h1
                className="text-white mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {product.name}
              </motion.h1>

              {/* Rating */}
              <motion.div
                className="flex items-center gap-4 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-400">
                  {averageRating.toFixed(1)} ({reviews.length} reviews)
                </span>
              </motion.div>

              <motion.p
                className="text-gray-300 text-lg mb-6 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                {product.description}
              </motion.p>

              <motion.div
                className="mb-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <span className="text-5xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ₹{product.price.toLocaleString()}
                </span>
                <p className="text-gray-400 mt-2">
                  Stock:{" "}
                  <span className={product.stock > 10 ? "text-green-400" : "text-orange-400"}>
                    {product.stock} available
                  </span>
                </p>
              </motion.div>

              {/* Quantity Selector */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <label className="text-white mb-2 block">Quantity:</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="bg-purple-600 hover:bg-purple-700 w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                    disabled={product.stock === 0}
                  >
                    -
                  </button>
                  <span className="text-white text-xl w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="bg-purple-600 hover:bg-purple-700 w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                    disabled={product.stock === 0}
                  >
                    +
                  </button>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <motion.button
                  onClick={handleOrderNow}
                  disabled={product.stock === 0}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed px-8 py-4 rounded-lg flex items-center justify-center gap-2 transition-all text-lg shadow-lg shadow-purple-900/50"
                  whileHover={{ scale: product.stock > 0 ? 1.02 : 1 }}
                  whileTap={{ scale: product.stock > 0 ? 0.98 : 1 }}
                >
                  <CreditCard className="w-5 h-5" />
                  Order Now
                </motion.button>
                <motion.button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-white/10 hover:bg-white/20 border border-purple-500/50 hover:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-4 rounded-lg flex items-center justify-center gap-2 transition-all text-lg"
                  whileHover={{ scale: product.stock > 0 ? 1.02 : 1 }}
                  whileTap={{ scale: product.stock > 0 ? 0.98 : 1 }}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <ProductReviews productId={id!} user={user} onLoginClick={() => setIsUserAuthOpen(true)} />
          </motion.div>
        </section>
      </main>

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />

      <UserAuth
        isOpen={isUserAuthOpen}
        onClose={() => setIsUserAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        showCheckoutMessage={pendingCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        total={total}
        onSuccess={handleCheckoutSuccess}
        user={user}
      />
    </div>
  );
}

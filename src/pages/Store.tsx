import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useToast } from "../contexts/ToastContext";
import { useCart } from "../contexts/CartContext";
import { Package, Swords, Sparkles, Image, Shirt, Bookmark, type LucideIcon } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { CategoryCard } from "../components/CategoryCard";
import { ProductCard, type Product } from "../components/ProductCard";
import { Footer } from "../components/Footer";
import { Cart } from "../components/Cart";
import { Wishlist } from "../components/Wishlist";
import { UserAuth } from "../components/UserAuth";
import { CheckoutModal } from "../components/CheckoutModal";
import { SubcategoryModal } from "../components/SubcategoryModal";
import { ProductDetailModal } from "../components/ProductDetailModal";
import { CustomClothingModal } from "../components/CustomClothingModal";
import { ProductRecommendations } from "../components/ProductRecommendations";
import { AboutUs } from "../components/AboutUs";
import { ContactUs } from "../components/ContactUs";
import { NewsletterSubscribe } from "../components/NewsletterSubscribe";
import { Logo } from "../components/Logo";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { supabase } from "../utils/supabase/client";
import { Link } from "react-router-dom";

interface CartItem extends Product {
  quantity: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  subcategories: string[];
  order: number;
}

// Icon mapping
const iconMap: { [key: string]: LucideIcon } = {
  Package,
  Swords,
  Sparkles,
  Image,
  Shirt,
  Bookmark,
};

// Debounce helper
const debounce = <T extends (...args: any[]) => any>(func: T, delay: number) => {
  let timeoutId: NodeJS.Timeout | null = null;
  return ((...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
};

// Fallback default categories (used if database is empty)
const defaultCategories = [
  {
    icon: "Package",
    title: "Figures",
    description: "Premium anime action figures and statues",
    value: "figures",
  },
  {
    icon: "Swords",
    title: "Katana",
    description: "Authentic Japanese swords and replicas",
    value: "katana",
  },
  {
    icon: "Sparkles",
    title: "Accessories",
    description: "Keychains, pins, and more collectibles",
    value: "accessories",
  },
  {
    icon: "Image",
    title: "Posters",
    description: "High-quality anime art prints",
    value: "posters",
  },
  {
    icon: "Shirt",
    title: "Clothing",
    description: "Anime-themed apparel and cosplay",
    value: "clothing",
  },
  {
    icon: "Bookmark",
    title: "Collectibles",
    description: "Limited edition merchandise",
    value: "collectibles",
  },
];

// Featured Products Section - Only show when no category selected

export function StorePage() {
  const { cartItems, addToCart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [productsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isUserAuthOpen, setIsUserAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [pendingCheckout, setPendingCheckout] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductDetailModalOpen, setIsProductDetailModalOpen] = useState(false);
  const [isCustomClothingModalOpen, setIsCustomClothingModalOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategoryData, setSubcategoryData] = useState<{ [key: string]: string[] }>({});
  const navigate = useNavigate();
  const { showToast } = useToast();
  const hasInitialized = useRef(false);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 768);

  useEffect(() => {
    if (hasInitialized.current) return; // Only fetch once on mount
    hasInitialized.current = true;

    fetchProducts();
    checkUser();
    fetchCategories();
    loadWishlistFromStorage();
  }, []);

  // Load wishlist from localStorage on mount
  const loadWishlistFromStorage = () => {
    const savedWishlist = localStorage.getItem("animedropzone_wishlist");
    if (savedWishlist) {
      try {
        setWishlistItems(JSON.parse(savedWishlist));
      } catch (error) {
        console.error("Error loading wishlist:", error);
      }
    }
  };

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("animedropzone_wishlist", JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const handleToggleWishlist = (product: Product) => {
    setWishlistItems((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        // Remove from wishlist
        showToast(`Removed ${product.name} from wishlist`, "info", 3000);
        return prev.filter((item) => item.id !== product.id);
      } else {
        // Add to wishlist
        showToast(`Added ${product.name} to wishlist!`, "info", 3000);
        return [...prev, product];
      }
    });
  };

  const handleRemoveFromWishlist = (productId: string) => {
    const product = wishlistItems.find((item) => item.id === productId);
    setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
    if (product) {
      showToast(`Removed ${product.name} from wishlist`, "info", 3000);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  const fetchCategories = async () => {
    try {
      // Check localStorage cache first
      const cachedCategories = localStorage.getItem("animedropzone_categories");
      const cacheTimestamp = localStorage.getItem("animedropzone_categories_time");
      const now = Date.now();

      // Use cache if it's less than 5 minutes old
      if (cachedCategories && cacheTimestamp && now - parseInt(cacheTimestamp) < 5 * 60 * 1000) {
        const cached = JSON.parse(cachedCategories);
        setCategories(cached);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/categories`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.categories && data.categories.length > 0) {
          // Convert database categories to display format
          const formattedCategories = data.categories
            .sort((a: Category, b: Category) => a.order - b.order)
            .map((cat: Category) => ({
              icon: iconMap[cat.icon] || Package,
              title: cat.name,
              description: cat.description,
              value: cat.slug,
            }));

          setCategories(formattedCategories);

          // Cache the categories for 5 minutes
          localStorage.setItem("animedropzone_categories", JSON.stringify(formattedCategories));
          localStorage.setItem("animedropzone_categories_time", Date.now().toString());

          // Build subcategory data
          const subData: { [key: string]: string[] } = {};
          data.categories.forEach((cat: Category) => {
            if (cat.subcategories && cat.subcategories.length > 0) {
              subData[cat.slug] = cat.subcategories;
            }
          });
          setSubcategoryData(subData);
        } else {
          // Use default categories if none in database
          setCategories(
            defaultCategories.map((cat) => ({
              icon: iconMap[cat.icon] || Package,
              title: cat.title,
              description: cat.description,
              value: cat.value,
            }))
          );
        }
      } else {
        // Fallback to default categories
        setCategories(
          defaultCategories.map((cat) => ({
            icon: iconMap[cat.icon] || Package,
            title: cat.title,
            description: cat.description,
            value: cat.value,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Check if we have cached categories to fall back to
      const cachedCategories = localStorage.getItem("animedropzone_categories");
      if (cachedCategories) {
        setCategories(JSON.parse(cachedCategories));
      } else {
        // Fallback to default categories
        setCategories(
          defaultCategories.map((cat) => ({
            icon: iconMap[cat.icon] || Package,
            title: cat.title,
            description: cat.description,
            value: cat.value,
          }))
        );
      }
    }
  };

  useEffect(() => {
    if (!products || products.length === 0) {
      setFilteredProducts([]);
      setDisplayedProducts([]);
      return;
    }

    let filtered = [...products];

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (selectedSubcategory) {
      filtered = filtered.filter((p) => {
        const subcat = (p as any).subcategory;
        return subcat && subcat.toLowerCase() === selectedSubcategory.toLowerCase();
      });
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filters change

    // Paginate the filtered results
    const startIdx = (1 - 1) * productsPerPage;
    const endIdx = startIdx + productsPerPage;
    setDisplayedProducts(filtered.slice(startIdx, endIdx));
  }, [selectedCategory, selectedSubcategory, products, productsPerPage]);

  // Handle page changes
  useEffect(() => {
    const startIdx = (currentPage - 1) * productsPerPage;
    const endIdx = startIdx + productsPerPage;
    setDisplayedProducts(filteredProducts.slice(startIdx, endIdx));
  }, [currentPage, filteredProducts, productsPerPage]);

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

  const fetchProducts = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/products`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.log("Error fetching products:", error);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    showToast(`${product.name} added to cart!`, "success", 3000);
  };

  const handleCheckout = () => {
    // Check if user is logged in
    if (!user) {
      setIsCartOpen(false);
      setPendingCheckout(true);
      setIsUserAuthOpen(true);
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleAuthSuccess = (user: any) => {
    setUser(user);
    // If checkout was pending, proceed with checkout
    if (pendingCheckout) {
      setPendingCheckout(false);
      setIsCheckoutOpen(true);
    }
  };

  const handleCheckoutSuccess = () => {
    // Cart will be cleared by checkout modal's clearCart
    setIsCheckoutOpen(false);
  };

  const handleCategoryClick = (category: string) => {
    // Navigate to category page
    navigate(`/category/${category}`);
  };

  const handleSubcategorySelect = (subcategory: string) => {
    setSelectedCategory(pendingCategory);
    setSelectedSubcategory(subcategory);
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Load Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

      <Navbar
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlistItems.length}
        onCartClick={() => setIsCartOpen(true)}
        onWishlistClick={() => setIsWishlistOpen(true)}
        onLoginClick={() => setIsUserAuthOpen(true)}
        user={user}
        onLogout={handleLogout}
      />

      <main id="home">
        <Hero
          onShopNow={() => {
            // Show all products by selecting the first category (or show all)
            if (categories.length > 0) {
              setSelectedCategory(categories[0].value);
              setSelectedSubcategory("");
            }
            // Scroll to shop section after state updates
            setTimeout(() => {
              document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
            }, 150);
          }}
        />

        {/* Categories Section */}
        <section id="categories" className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Browse Categories
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">Explore our wide range of anime merchandise categories</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => (
                <motion.div
                  key={category.value}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <CategoryCard
                    icon={category.icon}
                    title={category.title}
                    description={category.description}
                    onClick={() => handleCategoryClick(category.value)}
                  />
                </motion.div>
              ))}
            </div>
            {(selectedCategory || selectedSubcategory) && (
              <div className="mt-6 text-center space-x-4">
                {selectedSubcategory && (
                  <button
                    onClick={() => setSelectedSubcategory(null)}
                    className="text-purple-400 hover:text-purple-300 underline transition-colors"
                  >
                    Clear subcategory filter
                  </button>
                )}
                {selectedCategory && (
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedSubcategory(null);
                    }}
                    className="text-purple-400 hover:text-purple-300 underline transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Featured Products Section - Only show when no category selected */}
        {!selectedCategory && !selectedSubcategory && (
          <section id="featured" className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
              <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Latest Products
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Discover our handpicked selection of premium anime merchandise
                </p>
              </motion.div>

              {products.length >= 4 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Show last 4 products (most recent) */}
                  {products
                    .sort((a, b) => {
                      // Sort by createdAt if available, otherwise by id (assuming newer ids are higher)
                      const aTime = (a as any).createdAt
                        ? new Date((a as any).createdAt).getTime()
                        : parseInt(a.id) || 0;
                      const bTime = (b as any).createdAt
                        ? new Date((b as any).createdAt).getTime()
                        : parseInt(b.id) || 0;
                      return bTime - aTime; // Most recent first
                    })
                    .slice(0, 4)
                    .map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onViewDetails={() => {
                          setSelectedProduct(product);
                          setIsProductDetailModalOpen(true);
                        }}
                        onToggleWishlist={handleToggleWishlist}
                        isInWishlist={isInWishlist(product.id)}
                      />
                    ))}
                </div>
              ) : (
                // Fallback for when there are fewer than 4 products
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {displayedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onViewDetails={() => {
                        setSelectedProduct(product);
                        setIsProductDetailModalOpen(true);
                      }}
                      onToggleWishlist={handleToggleWishlist}
                      isInWishlist={isInWishlist(product.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Products Section - Only show when category/subcategory selected */}
        {(selectedCategory || selectedSubcategory) && (
          <section id="shop" className="py-20 px-4 bg-gradient-to-b from-transparent to-purple-900/10">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  {selectedSubcategory
                    ? `${selectedSubcategory.charAt(0).toUpperCase() + selectedSubcategory.slice(1)}`
                    : selectedCategory
                    ? `${categories.find((c) => c.value === selectedCategory)?.title} Collection`
                    : "All Products"}
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  {selectedSubcategory
                    ? `Browse ${selectedSubcategory} products`
                    : selectedCategory
                    ? `Browse our collection of ${categories
                        .find((c) => c.value === selectedCategory)
                        ?.title.toLowerCase()}`
                    : "Discover our handpicked selection of premium anime merchandise"}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayedProducts.length === 0 ? (
                  <div className="col-span-full text-center py-20">
                    <p className="text-gray-400 text-lg mb-4">
                      {products.length === 0 ? "No products available yet." : "No products found in this category."}
                    </p>
                  </div>
                ) : (
                  displayedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onViewDetails={() => {
                        setSelectedProduct(product);
                        setIsProductDetailModalOpen(true);
                      }}
                      onToggleWishlist={handleToggleWishlist}
                      isInWishlist={isInWishlist(product.id)}
                    />
                  ))
                )}
              </div>

              {/* Pagination */}
              {filteredProducts.length > productsPerPage && (
                <div className="mt-12 flex justify-center gap-2">
                  {Array.from({ length: Math.ceil(filteredProducts.length / productsPerPage) }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          currentPage === page
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                            : "bg-white/10 text-gray-300 hover:bg-white/20"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        <AboutUs />
        <ContactUs />
        <NewsletterSubscribe />

        {/* Footer */}
        <footer className="border-t border-purple-900/30 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Logo size="md" />
                  <span className="text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    animedropzone
                  </span>
                </div>
                <p className="text-gray-400">
                  Your one-stop destination for premium anime merchandise and collectibles.
                </p>
              </div>
              <div>
                <h4 className="text-white mb-4">Shop</h4>
                <div className="space-y-2">
                  <a href="#shop" className="block text-gray-400 hover:text-purple-400 transition-colors">
                    All Products
                  </a>
                  <a href="#categories" className="block text-gray-400 hover:text-purple-400 transition-colors">
                    Categories
                  </a>
                </div>
              </div>
              <div>
                <h4 className="text-white mb-4">About</h4>
                <div className="space-y-2">
                  <a href="#about" className="block text-gray-400 hover:text-purple-400 transition-colors">
                    About Us
                  </a>
                  <a href="#contact" className="block text-gray-400 hover:text-purple-400 transition-colors">
                    Contact Us
                  </a>
                  <button
                    onClick={() => navigate("/track-order")}
                    className="block text-gray-400 hover:text-purple-400 transition-colors text-left"
                  >
                    Track Order
                  </button>
                </div>
              </div>
              <div>
                <h4 className="text-white mb-4">Legal</h4>
                <div className="space-y-2">
                  <Link to="/privacy-policy" className="block text-gray-400 hover:text-purple-400 transition-colors">
                    Privacy Policy
                  </Link>
                  <Link to="/terms-of-service" className="block text-gray-400 hover:text-purple-400 transition-colors">
                    Terms of Service
                  </Link>
                </div>
              </div>
            </div>
            <div className="border-t border-purple-900/30 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 animedropzone. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
        onProductClick={(product) => {
          setIsCartOpen(false);
          navigate(`/product/${product.id}`);
        }}
      />

      <Wishlist
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistItems={wishlistItems}
        onRemoveFromWishlist={handleRemoveFromWishlist}
        onAddToCart={handleAddToCart}
        onViewProduct={(product) => {
          setSelectedProduct(product);
          setIsProductDetailModalOpen(true);
        }}
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

      <SubcategoryModal
        isOpen={isSubcategoryModalOpen}
        onClose={() => setIsSubcategoryModalOpen(false)}
        category={pendingCategory}
        subcategories={subcategoryData[pendingCategory] || []}
        onSelectSubcategory={handleSubcategorySelect}
      />

      <ProductDetailModal
        isOpen={isProductDetailModalOpen}
        onClose={() => setIsProductDetailModalOpen(false)}
        product={selectedProduct!}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        wishlistItems={wishlistItems}
        user={user}
        onLoginClick={() => setIsUserAuthOpen(true)}
      />

      <CustomClothingModal
        isOpen={isCustomClothingModalOpen}
        onClose={() => setIsCustomClothingModalOpen(false)}
        onSuccess={() => {
          showToast(
            "Custom clothing request submitted successfully! We'll get back to you soon with a quote.",
            "success",
            6000
          );
        }}
      />
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Package, Swords, Sparkles, Image, Shirt, Bookmark, Palette } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { FloatingParticles } from "../components/FloatingParticles";
import { ProductCard, Product } from "../components/ProductCard";
import { Cart } from "../components/Cart";
import { UserAuth } from "../components/UserAuth";
import { CheckoutModal } from "../components/CheckoutModal";
import { SubcategoryModal } from "../components/SubcategoryModal";
import { CustomClothingModal } from "../components/CustomClothingModal";
import { useToast } from "../contexts/ToastContext";
import { useCart } from "../contexts/CartContext";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { supabase } from "../utils/supabase/client";

const categoryIcons: { [key: string]: any } = {
  figures: Package,
  katana: Swords,
  accessories: Sparkles,
  posters: Image,
  clothing: Shirt,
  collectibles: Bookmark,
  custom_clothing: Palette,
};

const categoryInfo: { [key: string]: { title: string; description: string } } = {
  figures: {
    title: "Anime Figures",
    description: "Premium anime action figures and statues from your favorite series",
  },
  katana: {
    title: "Katana Collection",
    description: "Authentic Japanese swords and replicas inspired by legendary anime",
  },
  accessories: {
    title: "Accessories",
    description: "Keychains, pins, phone cases, and more anime collectibles",
  },
  posters: {
    title: "Posters & Art",
    description: "High-quality anime art prints and wall decorations",
  },
  clothing: {
    title: "Anime Clothing",
    description: "Anime-themed apparel, cosplay costumes, and fashion accessories",
  },
  collectibles: {
    title: "Collectibles",
    description: "Limited edition merchandise, trading cards, and rare items",
  },
  custom_clothing: {
    title: "Custom Clothing",
    description: "Create your own anime-themed clothing with our custom design service",
  },
};

const subcategoryData: { [key: string]: Array<{ name: string; value: string; description: string }> } = {
  figures: [
    { name: "Demon Slayer", value: "demon-slayer", description: "Tanjiro, Nezuko, and more" },
    { name: "Naruto", value: "naruto", description: "Iconic ninja figures" },
    { name: "One Piece", value: "one-piece", description: "Luffy and crew collectibles" },
    { name: "Attack on Titan", value: "attack-on-titan", description: "Survey Corps figures" },
    { name: "My Hero Academia", value: "my-hero-academia", description: "Heroes and villains" },
    { name: "Dragon Ball", value: "dragon-ball", description: "Super Saiyan warriors" },
  ],
  katana: [
    { name: "Demon Slayer Swords", value: "demon-slayer-katana", description: "Nichirin blades collection" },
    { name: "Samurai Katanas", value: "samurai-katana", description: "Traditional Japanese swords" },
    { name: "Replica Katanas", value: "replica-katana", description: "Display-worthy replicas" },
    { name: "Training Katanas", value: "training-katana", description: "Practice swords" },
  ],
  accessories: [
    { name: "Keychains", value: "keychains", description: "Character keychains" },
    { name: "Pins & Badges", value: "pins", description: "Collectible pins" },
    { name: "Phone Cases", value: "phone-cases", description: "Anime-themed cases" },
    { name: "Jewelry", value: "jewelry", description: "Necklaces and rings" },
    { name: "Bags & Backpacks", value: "bags", description: "Character bags" },
  ],
  posters: [
    { name: "Wall Scrolls", value: "wall-scrolls", description: "Hanging art scrolls" },
    { name: "Framed Prints", value: "framed-prints", description: "Premium framed art" },
    { name: "Mini Posters", value: "mini-posters", description: "Small format prints" },
    { name: "Canvas Art", value: "canvas-art", description: "Canvas wall art" },
  ],
  clothing: [
    { name: "T-Shirts", value: "t-shirts", description: "Character t-shirts" },
    { name: "Hoodies", value: "hoodies", description: "Anime hoodies" },
    { name: "Cosplay", value: "cosplay", description: "Cosplay costumes" },
    { name: "Accessories", value: "clothing-accessories", description: "Hats, socks, etc." },
  ],
  collectibles: [
    { name: "Limited Editions", value: "limited-editions", description: "Rare collectibles" },
    { name: "Trading Cards", value: "trading-cards", description: "Collectible cards" },
    { name: "Plushies", value: "plushies", description: "Soft character plushies" },
    { name: "Model Kits", value: "model-kits", description: "Build-your-own kits" },
  ],
  custom_clothing: [
    { name: "Custom T-Shirts", value: "custom-t-shirts", description: "Design your own t-shirts" },
    { name: "Custom Hoodies", value: "custom-hoodies", description: "Design your own hoodies" },
    { name: "Custom Cosplay", value: "custom-cosplay", description: "Design your own cosplay costumes" },
    { name: "Custom Accessories", value: "custom-accessories", description: "Design your own accessories" },
  ],
};

export function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const isMobile = typeof window !== "undefined" ? window.innerWidth < 768 : false;
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  // Get subcategory from URL on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const subcatFromUrl = searchParams.get("subcat");
    if (subcatFromUrl) {
      setSelectedSubcategory(subcatFromUrl);
    }
  }, []);
  const { cartItems, addToCart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen } = useCart();
  const { showToast } = useToast();
  const [isUserAuthOpen, setIsUserAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [isCustomClothingModalOpen, setIsCustomClothingModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [pendingCheckout, setPendingCheckout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState<any>(null);
  const [dynamicSubcategories, setDynamicSubcategories] = useState<
    Array<{ name: string; value: string; description: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [isValidCategory, setIsValidCategory] = useState(true);

  useEffect(() => {
    fetchCategoryData();
    fetchProducts();
    checkUser();
  }, [category]);

  // Validate category and redirect if invalid
  useEffect(() => {
    if (!category) {
      setError("Category not specified");
      setIsValidCategory(false);
    } else {
      // Normalize category for validation (handle spaces in URL)
      const normalizedForValidation = category.toLowerCase().replace(/\s+/g, "-").replace(/-/g, "_");

      if (!categoryInfo[normalizedForValidation] && !categoryInfo[category]) {
        // Don't redirect immediately - let it try to load from database
        console.log("⚠️ Category not in hardcoded list, checking database...");
        setIsValidCategory(true);
      } else {
        setIsValidCategory(true);
        setError(null);
      }
    }
  }, [category, navigate]);

  const fetchCategoryData = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/categories`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.categories) {
          // Normalize category for matching: convert to lowercase and replace spaces with hyphens
          const normalizedCategory = category?.toLowerCase().replace(/\s+/g, "-");
          const currentCategory = data.categories.find(
            (cat: any) => cat.slug === normalizedCategory || cat.slug === category
          );
          console.log("🔵 Category data:", currentCategory);

          if (currentCategory) {
            setCategoryData(currentCategory);

            // Convert subcategories to the format needed
            if (currentCategory.subcategories && currentCategory.subcategories.length > 0) {
              const formattedSubcategories = currentCategory.subcategories.map((sub: any) => ({
                name: sub.name || sub,
                value: sub.value || sub.toLowerCase().replace(/\s+/g, "-"),
                description: sub.description || "",
              }));
              setDynamicSubcategories(formattedSubcategories);
              console.log("✅ Dynamic subcategories loaded:", formattedSubcategories);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching category data:", error);
    }
  };

  useEffect(() => {
    let filtered = products;

    if (selectedSubcategory) {
      filtered = filtered.filter((p) => (p as any).subcategory === selectedSubcategory);
    }

    setFilteredProducts(filtered);
  }, [selectedSubcategory, products]);

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
    setLoading(true);
    setError(null);
    try {
      if (!category) {
        throw new Error("Category not specified");
      }
      // Convert category to lowercase and replace spaces with hyphens for API compatibility
      const normalizedCategory = category.toLowerCase().replace(/\s+/g, "-");
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/products/category/${encodeURIComponent(
          normalizedCategory
        )}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
        setFilteredProducts(data.products);
      } else if (!data.success) {
        setError("Failed to load products");
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error instanceof Error ? error.message : "Failed to load products");
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    showToast(`${product.name} added to cart!`, "success", 3000);
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

  const handleAuthSuccess = (authUser: any) => {
    setUser(authUser);
    if (pendingCheckout) {
      setPendingCheckout(false);
      setIsCheckoutOpen(true);
    }
  };

  const handleCheckoutSuccess = () => {
    // Cart will be cleared by checkout modal
    setIsCheckoutOpen(false);
  };

  const handleSubcategorySelect = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    setIsSubcategoryModalOpen(false);
    // Save subcategory to sessionStorage for ProductCard to use
    try {
      sessionStorage.setItem("categorySubcategory", subcategory);
    } catch {}
    // Add subcategory to URL for proper back navigation
    const newUrl = `${window.location.pathname}?subcat=${encodeURIComponent(subcategory)}`;
    window.history.replaceState({}, "", newUrl);
  };

  // Normalize category for lookups (handle spaces in URL)
  const normalizedCategoryForLookup = category ? category.toLowerCase().replace(/\s+/g, "-").replace(/-/g, "_") : "";

  // Use dynamic category data with fallbacks
  const Icon = category ? categoryIcons[normalizedCategoryForLookup] || categoryIcons[category] || Package : Package;
  const info =
    category && (categoryInfo[normalizedCategoryForLookup] || categoryInfo[category])
      ? categoryInfo[normalizedCategoryForLookup] || categoryInfo[category]
      : categoryData
      ? { title: categoryData.name, description: categoryData.description || "Browse our products" }
      : { title: "Category", description: "Browse our products" };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Use dynamic subcategories if available, otherwise fallback to hardcoded
  const subcategoriesToUse =
    dynamicSubcategories.length > 0
      ? dynamicSubcategories
      : subcategoryData[normalizedCategoryForLookup] || subcategoryData[category || ""] || [];
  const hasSubcategories = subcategoriesToUse.length > 0;

  return (
    <div className="min-h-screen bg-black">
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      {typeof window !== "undefined" && window.innerWidth >= 768 && <FloatingParticles />}

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
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Show error if category is invalid */}
        {!isValidCategory && (
          <section className="max-w-7xl mx-auto px-4 py-8">
            <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-12 max-w-md mx-auto">
              <Package className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-white text-2xl mb-2 text-center">Invalid Category</h3>
              <p className="text-gray-400 mb-6 text-center">
                The category "{category}" does not exist. Please select a valid category from the store.
              </p>
              <button
                onClick={() => navigate("/")}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg transition-all"
              >
                Return to Store
              </button>
            </div>
          </section>
        )}

        {/* Category Header */}
        {isValidCategory && (
          <section className="max-w-7xl mx-auto px-4 py-4 md:py-8">
            <div className="text-center mb-8 md:mb-12">
              {!isMobile ? (
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-6">
                  <Icon className="w-12 h-12 text-white" />
                </div>
              ) : (
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-4">
                  <Icon className="w-10 h-10 text-white" />
                </div>
              )}

              <h1 className="mb-2 md:mb-4 text-2xl md:text-4xl bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                {info.title}
              </h1>

              <p className="text-gray-300 text-sm md:text-lg max-w-2xl mx-auto">{info.description}</p>

              {/* Subcategory Filter Button */}
              {hasSubcategories && (
                <div className="mt-6">
                  <button
                    onClick={() => setIsSubcategoryModalOpen(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg transition-all shadow-lg shadow-purple-900/50"
                  >
                    Browse by Subcategory
                  </button>
                  {selectedSubcategory && (
                    <button
                      onClick={() => {
                        setSelectedSubcategory(null);
                        // Clear from sessionStorage
                        try {
                          sessionStorage.removeItem("categorySubcategory");
                        } catch {}
                        // Remove subcat from URL
                        window.history.replaceState({}, "", window.location.pathname);
                      }}
                      className="ml-4 text-purple-400 hover:text-purple-300 underline transition-colors"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Custom Clothing Banner (Only for clothing category) */}
            {category === "clothing" && (
              <div className="mb-12 bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500/50 rounded-2xl p-8 shadow-2xl shadow-purple-900/50">
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-pink-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <Palette className="w-10 h-10 text-white" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-white text-2xl mb-2">🎨 Design Your Own Custom Clothing</h3>
                    <p className="text-gray-300 mb-4">
                      Want something unique? Upload your design and we'll create custom anime-themed clothing just for
                      you!
                    </p>
                    <ul className="text-gray-400 text-sm space-y-1 mb-4">
                      <li>✅ Upload your own designs or photos</li>
                      <li>✅ Choose clothing type, size, and color</li>
                      <li>✅ Get a quote within 24-48 hours</li>
                      <li>✅ Professional quality printing</li>
                    </ul>
                    <button
                      onClick={() => setIsCustomClothingModalOpen(true)}
                      className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 px-8 py-4 rounded-lg text-lg shadow-lg shadow-pink-900/50 flex items-center gap-2"
                    >
                      <Palette className="w-5 h-5" />
                      Start Custom Design
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 mt-4">Loading products...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-12 max-w-md mx-auto">
                  <Icon className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-white text-2xl mb-2">Error Loading Products</h3>
                  <p className="text-gray-400 mb-6">{error}</p>
                  <button
                    onClick={() => fetchProducts()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg transition-all"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-12 max-w-md mx-auto">
                  <Icon className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-white text-2xl mb-2">No Products Found</h3>
                  <p className="text-gray-400">
                    {selectedSubcategory
                      ? "No products available in this subcategory. Try selecting a different filter."
                      : "No products available in this category yet. Check back soon!"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id}>
                    <ProductCard product={product} onAddToCart={handleAddToCart} />
                  </div>
                ))}
              </div>
            )}

            {/* Product Count */}
            {!loading && filteredProducts.length > 0 && (
              <motion.div
                className="text-center mt-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <p className="text-gray-400">
                  Showing {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
                  {selectedSubcategory && " in selected subcategory"}
                </p>
              </motion.div>
            )}
          </section>
        )}
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

      {hasSubcategories && (
        <SubcategoryModal
          isOpen={isSubcategoryModalOpen}
          onClose={() => setIsSubcategoryModalOpen(false)}
          category={category}
          subcategories={subcategoriesToUse}
          onSelectSubcategory={handleSubcategorySelect}
        />
      )}

      {category === "custom_clothing" && (
        <CustomClothingModal
          isOpen={isCustomClothingModalOpen}
          onClose={() => setIsCustomClothingModalOpen(false)}
          onSuccess={() => {
            alert("Custom clothing request submitted successfully!");
            setIsCustomClothingModalOpen(false);
          }}
        />
      )}

      {category === "clothing" && (
        <CustomClothingModal
          isOpen={isCustomClothingModalOpen}
          onClose={() => setIsCustomClothingModalOpen(false)}
          onSuccess={() => {
            alert("Custom clothing request submitted successfully!");
            setIsCustomClothingModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

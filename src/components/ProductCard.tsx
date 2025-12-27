import { ShoppingCart, Star, Eye, Heart } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate, useLocation } from "react-router-dom";
import { memo, useState } from "react";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  images?: string[];
  stock: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
  isInWishlist?: boolean;
  onToggleWishlist?: (product: Product) => void;
}

export const ProductCard = memo(function ProductCard({
  product,
  onAddToCart,
  onViewDetails,
  isInWishlist = false,
  onToggleWishlist,
}: ProductCardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const isMobile = typeof window !== "undefined" ? window.innerWidth < 768 : false;

  // Detect device capabilities for intelligent image optimization
  const deviceMemory = typeof navigator !== "undefined" ? (navigator as any).deviceMemory || 4 : 4;
  const networkType = typeof navigator !== "undefined" ? (navigator as any).connection?.effectiveType || "4g" : "4g";
  const devicePixelRatio = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  // Detect top-end device (8GB+ RAM) with fast network (4G/5G)
  const isTopEndDevice = deviceMemory >= 8 && (networkType === "4g" || networkType === "5g");

  // Detect low-end device (budget phone with slow connection)
  const isLowEndDevice =
    typeof window !== "undefined" &&
    (deviceMemory < 4 || networkType === "slow-2g" || networkType === "2g" || networkType === "3g");

  const imageUrl =
    product.images?.[0] ||
    product.image ||
    "https://images.unsplash.com/photo-1763771757355-4c0441df34ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMG1lcmNoYW5kaXNlfGVufDF8fHx8MTc2NTE4ODk3OXww&ixlib=rb-4.1.0&q=80&w=1080";

  // Intelligent image optimization based on device & network capabilities
  let imageQuality = "75"; // Default: good quality for modern phones
  let imageWidth = "600"; // Default: larger width for modern phones

  if (isTopEndDevice) {
    // TOP-END phones (iPhone 13+, Galaxy S20+) with 4G/5G: MAXIMUM quality
    imageQuality = "90"; // Premium quality - almost lossless
    imageWidth = "1000"; // Full high-resolution images
  } else if (isMobile) {
    // Regular modern phones on mobile: good quality
    imageQuality = "70";
    imageWidth = "400";
  }

  if (isLowEndDevice) {
    // Only for truly low-end devices: aggressive compression
    imageQuality = "50";
    imageWidth = "250";
  }

  // Only append query params to Unsplash URLs, don't modify Supabase or other URLs
  const finalImageUrl = imageUrl.includes("unsplash.com") ? `${imageUrl}&w=${imageWidth}&q=${imageQuality}` : imageUrl;

  const handleViewDetails = () => {
    try {
      const currentPath = location.pathname + location.search;
      // Check if we have a subcategory saved in sessionStorage
      const subcategory = sessionStorage.getItem("categorySubcategory");
      let pathToSave = currentPath;

      // If we have a subcategory and it's not in the URL, add it
      if (subcategory && !currentPath.includes("subcat=")) {
        pathToSave = `${location.pathname}?subcat=${encodeURIComponent(subcategory)}`;
      }

      // Save previous route for smarter back navigation
      sessionStorage.setItem("prevRoute", pathToSave);
    } catch {}
    navigate(`/product/${product.id}`);
  };

  return (
    <motion.div
      className="group bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-xl overflow-hidden hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-900/50 cursor-pointer relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      whileHover={isMobile ? {} : { y: -5 }}
      onClick={handleViewDetails}
    >
      {/* Wishlist Heart Button */}
      {onToggleWishlist && (
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          aria-label={isInWishlist ? `Remove ${product?.name} from wishlist` : `Add ${product?.name} to wishlist`}
          title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 z-10 w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-purple-500/30 hover:border-purple-500 transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Heart
            className={`w-5 h-5 transition-all ${
              isInWishlist ? "fill-pink-500 text-pink-500" : "text-gray-400 hover:text-pink-400"
            }`}
          />
        </motion.button>
      )}

      <div className="relative overflow-hidden aspect-square bg-gradient-to-br from-purple-900 via-black to-pink-900">
        <img
          src={finalImageUrl}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-cover transition-all duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          } group-hover:scale-110`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            console.warn("Product image failed to load:", finalImageUrl);
            setImageLoaded(true);
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-pink-900 animate-pulse" />
        )}
        {/* Fallback content when image fails */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 opacity-50">
          <div className="text-2xl mb-2">📦</div>
          <p className="text-xs text-gray-300">{product?.name || "Product"}</p>
        </div>
        {(product?.stock === 0 || !product?.stock) && (
          <motion.div
            className="absolute inset-0 bg-black/80 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-red-400 border border-red-400 px-4 py-2 rounded">Out of Stock</span>
          </motion.div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
            >
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </motion.div>
          ))}
          <span className="text-sm text-gray-400 ml-2">(4.8)</span>
        </div>
        <h3 className="text-white mb-1 line-clamp-1">{product?.name || "Product Name"}</h3>
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product?.description || "No description available"}</p>
        <motion.div
          className="mb-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="text-2xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ₹{(product?.price ?? 0).toLocaleString()}
          </span>
        </motion.div>
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={product?.stock === 0 || !product?.stock}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-all text-sm"
            whileHover={isMobile ? {} : { scale: 1.05 }}
            whileTap={isMobile ? {} : { scale: 0.95 }}
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </motion.button>
          <motion.button
            onClick={handleViewDetails}
            className="bg-white/10 hover:bg-white/20 border border-purple-500/50 hover:border-purple-500 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-all text-sm"
            whileHover={isMobile ? {} : { scale: 1.05 }}
            whileTap={isMobile ? {} : { scale: 0.95 }}
          >
            <Eye className="w-4 h-4" />
            Details
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

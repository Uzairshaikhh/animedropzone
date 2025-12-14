import { ShoppingCart, Star, Eye, Heart } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

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

export function ProductCard({
  product,
  onAddToCart,
  onViewDetails,
  isInWishlist = false,
  onToggleWishlist,
}: ProductCardProps) {
  const navigate = useNavigate();

  const imageUrl =
    product.images?.[0] ||
    product.image ||
    "https://images.unsplash.com/photo-1763771757355-4c0441df34ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMG1lcmNoYW5kaXNlfGVufDF8fHx8MTc2NTE4ODk3OXww&ixlib=rb-4.1.0&q=80&w=1080";

  const handleViewDetails = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <motion.div
      className="group bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-xl overflow-hidden hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-900/50 cursor-pointer relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      onClick={handleViewDetails}
    >
      {/* Wishlist Heart Button */}
      {onToggleWishlist && (
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
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

      <div className="relative overflow-hidden aspect-square bg-black/50">
        <motion.img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        />
        {product.stock === 0 && (
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
        <h3 className="text-white mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
        <motion.div
          className="mb-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="text-2xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ₹{product.price.toLocaleString()}
          </span>
        </motion.div>
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={product.stock === 0}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-all text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </motion.button>
          <motion.button
            onClick={handleViewDetails}
            className="bg-white/10 hover:bg-white/20 border border-purple-500/50 hover:border-purple-500 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-all text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Eye className="w-4 h-4" />
            Details
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

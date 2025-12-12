import { Heart, X, Trash2, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { Link } from 'react-router-dom';

interface WishlistProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistItems: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
}

export function Wishlist({
  isOpen,
  onClose,
  wishlistItems,
  onRemoveFromWishlist,
  onAddToCart,
  onViewProduct,
}: WishlistProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Wishlist Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-br from-black via-purple-900/20 to-black border-l border-purple-500/30 shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-purple-500/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-purple-600 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 fill-white" />
                  </div>
                  <h2 className="text-2xl text-white">My Wishlist</h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-400 text-sm">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>

            {/* Wishlist Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {wishlistItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="w-24 h-24 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-full flex items-center justify-center mb-6"
                  >
                    <Heart className="w-12 h-12 text-purple-400" />
                  </motion.div>
                  <h3 className="text-xl text-white mb-2">Your wishlist is empty</h3>
                  <p className="text-gray-400 mb-6">
                    Save your favorite items by clicking the heart icon on any product
                  </p>
                  <button
                    onClick={onClose}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg transition-all"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {wishlistItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 rounded-xl p-4 hover:border-purple-500/50 transition-all"
                      >
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <button
                            onClick={() => {
                              onViewProduct(item);
                              onClose();
                            }}
                            className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 group cursor-pointer"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            {item.stock === 0 && (
                              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                <span className="text-red-400 text-xs font-semibold">Out of Stock</span>
                              </div>
                            )}
                          </button>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <button
                              onClick={() => {
                                onViewProduct(item);
                                onClose();
                              }}
                              className="text-white hover:text-purple-400 transition-colors mb-1 block text-left truncate w-full"
                            >
                              {item.name}
                            </button>
                            <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                              {item.description}
                            </p>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-lg text-purple-400">
                                ₹{item.price.toLocaleString()}
                              </span>
                              {item.stock > 0 && item.stock < 5 && (
                                <span className="text-xs text-orange-400">
                                  Only {item.stock} left
                                </span>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  onAddToCart(item);
                                  onRemoveFromWishlist(item.id);
                                }}
                                disabled={item.stock === 0}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-all"
                              >
                                <ShoppingCart className="w-4 h-4" />
                                Add to Cart
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onRemoveFromWishlist(item.id)}
                                className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 hover:border-red-500/50 p-2 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {wishlistItems.length > 0 && (
              <div className="p-6 border-t border-purple-500/30 bg-black/50">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    wishlistItems.forEach((item) => {
                      if (item.stock > 0) {
                        onAddToCart(item);
                        onRemoveFromWishlist(item.id);
                      }
                    });
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add All to Cart
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
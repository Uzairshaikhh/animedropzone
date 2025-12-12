import { X, ShoppingCart, Star } from 'lucide-react';
import { Product } from './ProductCard';
import { ProductReviews } from './ProductReviews';
import { ProductRecommendations } from './ProductRecommendations';

interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistItems: Product[];
  user: any;
  onLoginClick: () => void;
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onToggleWishlist,
  wishlistItems,
  user,
  onLoginClick,
}: ProductDetailModalProps) {
  if (!isOpen) return null;

  const handleProductClick = (clickedProduct: Product) => {
    // Close current modal and reopen with new product
    onClose();
    // Use a small delay to ensure smooth transition
    setTimeout(() => {
      onClose(); // This will be passed the new product from parent
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-purple-900/50">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-purple-500/30 bg-black/50 backdrop-blur-sm">
          <h2 className="text-white text-xl">Product Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Product Image */}
            <div className="relative rounded-xl overflow-hidden bg-black/50">
              <img
                src={product.image || 'https://images.unsplash.com/photo-1763771757355-4c0441df34ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMG1lcmNoYW5kaXNlfGVufDF8fHx8MTc2NTE4ODk3OXww&ixlib=rb-4.1.0&q=80&w=1080'}
                alt={product.name}
                className="w-full h-auto object-cover"
              />
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <span className="text-white text-xl">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h3 className="text-white text-3xl mb-4">{product.name}</h3>
              
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-gray-400 ml-2">(See reviews below)</span>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">{product.description}</p>

              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-1">Category</p>
                <p className="text-purple-400 capitalize">{product.category}</p>
              </div>

              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-1">Stock Status</p>
                <p className={`${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}
                </p>
              </div>

              <div className="flex items-center justify-between mb-6 p-6 bg-purple-900/20 border border-purple-500/30 rounded-xl">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Price</p>
                  <p className="text-4xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    ₹{product.price.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    onAddToCart(product);
                    onClose();
                  }}
                  disabled={product.stock === 0}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed px-8 py-4 rounded-lg flex items-center gap-3 transition-all text-lg"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <ProductReviews
            productId={product.id}
            user={user}
            onLoginClick={() => {
              onClose();
              onLoginClick();
            }}
          />

          {/* Recommendations Section */}
          <div className="mt-12 pt-8 border-t border-purple-500/20">
            <ProductRecommendations
              productId={product.id}
              onProductClick={handleProductClick}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              wishlistItems={wishlistItems}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
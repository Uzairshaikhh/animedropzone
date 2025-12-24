import { useEffect, useRef, useState } from "react";
import { X, ShoppingCart, Star } from "lucide-react";
import { Product } from "./ProductCard";
import { ProductReviews } from "./ProductReviews";
import { ProductRecommendations } from "./ProductRecommendations";

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
  const [activeImage, setActiveImage] = useState(0);
  const slideTimer = useRef<number | null>(null);

  // Reset active image whenever the product or modal opens to avoid stale selections
  useEffect(() => {
    setActiveImage(0);
  }, [product?.id, isOpen]);

  // Auto-advance slider when multiple images exist
  useEffect(() => {
    if (!isOpen || !product) {
      if (slideTimer.current) {
        clearInterval(slideTimer.current);
        slideTimer.current = null;
      }
      return;
    }

    const fallbackImageUrl =
      "https://images.unsplash.com/photo-1763771757355-4c0441df34ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMG1lcmNoYW5kaXNlfGVufDF8fHx8MTc2NTE4ODk3OXww&ixlib=rb-4.1.0&q=80&w=1080";
    const currentGallery = (product.images && product.images.length ? product.images : [product.image]).filter(Boolean);
    const currentSafeGallery = currentGallery.length ? currentGallery : [fallbackImageUrl];

    if (currentSafeGallery.length <= 1) {
      if (slideTimer.current) {
        clearInterval(slideTimer.current);
        slideTimer.current = null;
      }
      return;
    }

    slideTimer.current = window.setInterval(() => {
      setActiveImage((prev) => (prev + 1) % currentSafeGallery.length);
    }, 5000);

    return () => {
      if (slideTimer.current) {
        clearInterval(slideTimer.current);
        slideTimer.current = null;
      }
    };
  }, [isOpen, product?.images, product?.image]);

  if (!isOpen || !product) return null;

  const fallbackImage =
    "https://images.unsplash.com/photo-1763771757355-4c0441df34ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMG1lcmNoYW5kaXNlfGVufDF8fHx8MTc2NTE4ODk3OXww&ixlib=rb-4.1.0&q=80&w=1080";
  const gallery = (product.images && product.images.length ? product.images : [product.image]).filter(Boolean);
  const safeGallery = gallery.length ? gallery : [fallbackImage];

  // Slider controls (guard against empty gallery)
  const goNext = () => {
    if (!safeGallery.length) return;
    setActiveImage((prev) => (prev + 1) % safeGallery.length);
  };

  const goPrev = () => {
    if (!safeGallery.length) return;
    setActiveImage((prev) => (prev - 1 + safeGallery.length) % safeGallery.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-lg md:rounded-2xl w-full md:max-w-6xl h-[95vh] md:h-[90vh] flex flex-col overflow-hidden shadow-2xl shadow-purple-900/50">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-3 md:p-6 border-b border-purple-500/30 bg-black/50 backdrop-blur-sm flex-shrink-0">
          <h2 className="text-white text-lg md:text-xl">Product Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 md:p-6">
            {/* Mobile: Full width image on top, Desktop: Side-by-side layout */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-6 mb-4 md:mb-8">
              {/* Product Image - Full Width on Mobile, Auto on Desktop */}
              <div className="w-full md:flex-1 md:min-w-0 md:max-h-[60vh]">
                <div className="relative rounded-lg md:rounded-xl overflow-hidden bg-black/50">
                  <div className="w-full aspect-square flex items-center justify-center">
                    <img
                      src={safeGallery[Math.min(activeImage, safeGallery.length - 1)]}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <span className="text-white text-lg md:text-xl">Out of Stock</span>
                    </div>
                  )}
                  {safeGallery.length > 1 && (
                    <>
                      <div className="absolute inset-y-0 left-0 flex items-center pl-1 md:pl-2 z-20">
                        <button
                          type="button"
                          onClick={goPrev}
                          className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white p-2 md:p-3 rounded-full border-2 border-purple-400 transition-all shadow-lg hover:shadow-purple-600/50 cursor-pointer"
                          aria-label="Previous image"
                        >
                          <svg className="w-4 h-4 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-1 md:pr-2 z-20">
                        <button
                          type="button"
                          onClick={goNext}
                          className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white p-2 md:p-3 rounded-full border-2 border-purple-400 transition-all shadow-lg hover:shadow-purple-600/50 cursor-pointer"
                          aria-label="Next image"
                        >
                          <svg className="w-4 h-4 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
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
              </div>

              {/* Vertical Thumbnail Slider - Desktop Only */}
              {safeGallery.length > 0 && (
                <div className="hidden md:flex md:flex-col gap-2 overflow-y-auto max-h-[32rem] w-32 flex-shrink-0">
                  {safeGallery.map((img, idx) => (
                    <button
                      type="button"
                      key={`thumb-${idx}-${img.substring(0, 20)}`}
                      onClick={() => setActiveImage(idx)}
                      className={`w-24 h-24 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 cursor-pointer shrink-0 ${
                        activeImage === idx
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
              )}
            </div>
            {/* Horizontal Thumbnail Slider - Mobile Only */}
            {safeGallery.length > 1 && (
              <div className="md:hidden flex gap-1 overflow-x-auto pb-2 mb-4 scroll-smooth -mx-3 px-3">
                {safeGallery.map((img, idx) => (
                  <button
                    type="button"
                    key={`thumb-mobile-${idx}-${img.substring(0, 20)}`}
                    onClick={() => setActiveImage(idx)}
                    className={`w-14 h-14 md:w-24 md:h-24 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 cursor-pointer shrink-0 ${
                      activeImage === idx
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
            )}
            {/* Product Info */}
            <div>
              <h3 className="text-white text-2xl md:text-3xl mb-2 md:mb-4">{product.name}</h3>

              <div className="flex items-center gap-1 mb-2 md:mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 md:w-5 md:h-5 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-gray-400 ml-2 text-xs md:text-sm">(See reviews below)</span>
              </div>

              <p className="text-gray-300 mb-3 md:mb-6 leading-relaxed text-sm md:text-base">{product.description}</p>

              <div className="mb-3 md:mb-6">
                <p className="text-gray-400 text-xs md:text-sm mb-1">Category</p>
                <p className="text-purple-400 capitalize text-sm md:text-base">{product.category}</p>
              </div>

              <div className="mb-3 md:mb-6">
                <p className="text-gray-400 text-xs md:text-sm mb-1">Stock Status</p>
                <p className={`text-sm md:text-base ${product.stock > 0 ? "text-green-400" : "text-red-400"}`}>
                  {product.stock > 0 ? `${product.stock} units available` : "Out of stock"}
                </p>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 p-3 md:p-6 bg-purple-900/20 border border-purple-500/30 rounded-lg md:rounded-xl gap-3 md:gap-0">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm mb-1">Price</p>
                  <p className="text-2xl md:text-4xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    ₹{product.price.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    onAddToCart(product);
                    onClose();
                  }}
                  disabled={product.stock === 0}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed px-4 md:px-8 py-2 md:py-4 rounded-lg flex items-center gap-2 md:gap-3 transition-all text-sm md:text-lg w-full md:w-auto justify-center md:justify-start"
                >
                  <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                  Add to Cart
                </button>
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
            <div className="mt-6 md:mt-12 pt-4 md:pt-8 border-t border-purple-500/20">
              <ProductRecommendations
                productId={product.id}
                onProductClick={handleProductClick}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                wishlistItems={wishlistItems}
              />
            </div>{" "}
          </div>{" "}
        </div>
      </div>
    </div>
  );
}

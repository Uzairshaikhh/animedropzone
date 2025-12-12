import { useState, useEffect } from 'react';
import { ProductCard, Product } from './ProductCard';
import { Sparkles } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { motion } from 'motion/react';

interface ProductRecommendationsProps {
  productId: string;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistItems: Product[];
}

export function ProductRecommendations({
  productId,
  onProductClick,
  onAddToCart,
  onToggleWishlist,
  wishlistItems,
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [productId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/products/${productId}/recommendations`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-6 h-6 text-purple-500" />
          <h2 className="text-white text-2xl">You Might Also Like</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="py-12">
      <div className="flex items-center gap-3 mb-8">
        <Sparkles className="w-6 h-6 text-purple-500" />
        <h2 className="text-white text-2xl">You Might Also Like</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ProductCard
              product={product}
              onAddToCart={() => onAddToCart(product)}
              onViewDetails={() => onProductClick(product)}
              onToggleWishlist={() => onToggleWishlist(product)}
              isInWishlist={wishlistItems.some(item => item.id === product.id)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
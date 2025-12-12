import { useState, useEffect } from 'react';
import { Search, X, Filter, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  categories: Array<{ slug: string; name: string }>;
  isVisible: boolean;
  onClose: () => void;
}

export interface SearchFilters {
  query: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  minRating?: number;
  sortBy?: 'price-low' | 'price-high' | 'rating' | 'newest';
  inStock?: boolean;
}

export function AdvancedSearch({ onSearch, categories, isVisible, onClose }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    minPrice: undefined,
    maxPrice: undefined,
    category: undefined,
    minRating: undefined,
    sortBy: undefined,
    inStock: false,
  });

  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({
      query: '',
      minPrice: undefined,
      maxPrice: undefined,
      category: undefined,
      minRating: undefined,
      sortBy: undefined,
      inStock: false,
    });
    onSearch({
      query: '',
      minPrice: undefined,
      maxPrice: undefined,
      category: undefined,
      minRating: undefined,
      sortBy: undefined,
      inStock: false,
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gradient-to-br from-black to-purple-900/40 border border-purple-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-white text-xl">Advanced Search</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Search Query */}
          <div>
            <label className="block text-gray-300 mb-2">Search Products</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                placeholder="Search by name, description, or subcategory..."
                className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg pl-11 pr-4 py-3 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Toggle Filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Price Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Min Price (₹)</label>
                    <input
                      type="number"
                      value={filters.minPrice || ''}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="0"
                      min="0"
                      className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Max Price (₹)</label>
                    <input
                      type="number"
                      value={filters.maxPrice || ''}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="10000"
                      min="0"
                      className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-gray-300 mb-2">Category</label>
                  <select
                    value={filters.category || ''}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
                    className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Minimum Rating */}
                <div>
                  <label className="block text-gray-300 mb-2">Minimum Rating</label>
                  <select
                    value={filters.minRating || ''}
                    onChange={(e) => setFilters({ ...filters, minRating: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2">2+ Stars</option>
                    <option value="1">1+ Stars</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-gray-300 mb-2">Sort By</label>
                  <select
                    value={filters.sortBy || ''}
                    onChange={(e) => setFilters({ ...filters, sortBy: (e.target.value || undefined) as any })}
                    className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Default</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>

                {/* In Stock Only */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="inStock"
                    checked={filters.inStock}
                    onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                    className="w-4 h-4 text-purple-600 border-purple-500 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <label htmlFor="inStock" className="text-gray-300 cursor-pointer">
                    Show only items in stock
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSearch}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
            <button
              onClick={handleClear}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Active Filters Summary */}
          <div className="pt-4 border-t border-purple-500/20">
            <p className="text-gray-400 text-sm mb-2">Active Filters:</p>
            <div className="flex flex-wrap gap-2">
              {filters.query && (
                <span className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-500/30">
                  Search: {filters.query}
                </span>
              )}
              {filters.minPrice !== undefined && (
                <span className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-500/30">
                  Min: ₹{filters.minPrice}
                </span>
              )}
              {filters.maxPrice !== undefined && (
                <span className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-500/30">
                  Max: ₹{filters.maxPrice}
                </span>
              )}
              {filters.category && (
                <span className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-500/30">
                  Category: {categories.find(c => c.slug === filters.category)?.name}
                </span>
              )}
              {filters.minRating && (
                <span className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-500/30">
                  Rating: {filters.minRating}+ ⭐
                </span>
              )}
              {filters.sortBy && (
                <span className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-500/30">
                  Sort: {filters.sortBy.replace(/-/g, ' ')}
                </span>
              )}
              {filters.inStock && (
                <span className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-500/30">
                  In Stock Only
                </span>
              )}
              {!filters.query && !filters.minPrice && !filters.maxPrice && !filters.category && !filters.minRating && !filters.sortBy && !filters.inStock && (
                <span className="text-gray-500 text-sm">No filters applied</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

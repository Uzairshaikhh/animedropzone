import { X, Plus, Minus, Trash2, CreditCard } from 'lucide-react';
import { Product } from './ProductCard';
import { motion, AnimatePresence } from 'motion/react';

interface CartItem extends Product {
  quantity: number;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export function Cart({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem, onCheckout }: CartProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          ></motion.div>
          <motion.div 
            className="relative bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl shadow-purple-900/50 m-4"
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center justify-between p-6 border-b border-purple-500/30">
              <h2 className="text-white">Shopping Cart</h2>
              <motion.button 
                onClick={onClose} 
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ rotate: 90, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-220px)] p-6">
              {items.length === 0 ? (
                <motion.div 
                  className="text-center py-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-gray-400 text-lg">Your cart is empty</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        className="flex gap-4 bg-purple-900/10 border border-purple-500/20 rounded-lg p-4"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50, height: 0, marginBottom: 0, padding: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        layout
                      >
                        <motion.img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.3 }}
                        />
                        <div className="flex-1">
                          <h4 className="text-white mb-1">{item.name}</h4>
                          <p className="text-purple-400 mb-2">₹{item.price.toLocaleString()}</p>
                          <div className="flex items-center gap-2">
                            <motion.button
                              onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="bg-purple-600 hover:bg-purple-700 w-8 h-8 rounded flex items-center justify-center transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Minus className="w-4 h-4" />
                            </motion.button>
                            <motion.span 
                              className="text-white w-8 text-center"
                              key={item.quantity}
                              initial={{ scale: 1.5, color: '#ec4899' }}
                              animate={{ scale: 1, color: '#ffffff' }}
                              transition={{ duration: 0.3 }}
                            >
                              {item.quantity}
                            </motion.span>
                            <motion.button
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="bg-purple-600 hover:bg-purple-700 w-8 h-8 rounded flex items-center justify-center transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Plus className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              onClick={() => onRemoveItem(item.id)}
                              className="ml-auto text-red-400 hover:text-red-300 transition-colors"
                              whileHover={{ scale: 1.2, rotate: 15 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Trash2 className="w-5 h-5" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-purple-500/30 bg-black/50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-300 text-lg">Total:</span>
                  <span className="text-3xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    ₹{total.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={onCheckout}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 rounded-lg flex items-center justify-center gap-2 transition-all text-lg"
                >
                  <CreditCard className="w-5 h-5" />
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
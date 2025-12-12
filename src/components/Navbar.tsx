import { ShoppingCart, User, Menu, X, LogOut, Heart, Package } from 'lucide-react';
import { useState } from 'react';
import { Logo } from './Logo';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  cartCount: number;
  wishlistCount?: number;
  onCartClick: () => void;
  onWishlistClick?: () => void;
  onLoginClick: () => void;
  user: any;
  onLogout: () => void;
}

export function Navbar({ cartCount, wishlistCount = 0, onCartClick, onWishlistClick, onLoginClick, user, onLogout }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <motion.nav 
      className="sticky top-0 z-50 bg-black border-b border-purple-900/30 backdrop-blur-lg"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 md:h-20">
          {/* Left: Desktop Navigation Links */}
          <motion.div 
            className="hidden lg:flex items-center gap-3 xl:gap-6 flex-1 justify-start"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {['Home', 'Shop', 'Categories', 'About', 'Contact'].map((item, index) => (
              <motion.a
                key={item}
                href={item === 'Home' ? '/' : `/#${item.toLowerCase()}`}
                onClick={(e) => {
                  if (item === 'Home') {
                    e.preventDefault();
                    navigate('/');
                  } else {
                    const section = document.getElementById(item.toLowerCase());
                    if (section) {
                      e.preventDefault();
                      section.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
                className="text-gray-300 hover:text-purple-400 transition-colors text-sm xl:text-base whitespace-nowrap"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                whileHover={{ scale: 1.1, y: -2 }}
              >
                {item}
              </motion.a>
            ))}
          </motion.div>

          {/* Left: Mobile Menu Button */}
          <motion.div
            className="lg:hidden flex-1 flex justify-start"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white"
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </motion.div>

          {/* Center: Logo */}
          <motion.div 
            className="flex items-center gap-2 cursor-pointer flex-shrink-0 justify-center"
            onClick={() => navigate('/')}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Logo size="md" />
            <span className="hidden sm:inline text-xl md:text-2xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent whitespace-nowrap">
              animedropzone
            </span>
          </motion.div>

          {/* Right: Action Icons */}
          <motion.div 
            className="flex items-center gap-2 xl:gap-3 flex-1 justify-end"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Desktop Icons */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-3">
              {user ? (
                <>
                  <motion.button
                    onClick={() => navigate('/my-profile')}
                    className="text-gray-300 hover:text-purple-400 transition-colors text-sm xl:text-base flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="My Profile"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden xl:inline max-w-[100px] truncate" title={user.user_metadata?.name || 'User'}>
                      {user.user_metadata?.name || 'User'}
                    </span>
                  </motion.button>
                  <motion.button
                    onClick={onLogout}
                    className="text-gray-300 hover:text-purple-400 transition-colors p-2 rounded-lg hover:bg-purple-900/20"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </motion.button>
                </>
              ) : (
                <motion.button
                  onClick={onLoginClick}
                  className="text-gray-300 hover:text-purple-400 transition-colors p-2 rounded-lg hover:bg-purple-900/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Login"
                >
                  <User className="w-5 h-5" />
                </motion.button>
              )}
              
              <motion.button
                onClick={() => navigate('/my-orders')}
                className="bg-purple-600 hover:bg-purple-700 p-2 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="My Orders"
              >
                <Package className="w-5 h-5" />
              </motion.button>

              {onWishlistClick && (
                <motion.button
                  onClick={onWishlistClick}
                  className="relative bg-purple-600 hover:bg-purple-700 p-2 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                  <AnimatePresence>
                    {wishlistCount > 0 && (
                      <motion.span 
                        className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      >
                        {wishlistCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              )}

              <motion.button
                onClick={onCartClick}
                className="relative bg-purple-600 hover:bg-purple-700 p-2 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span 
                      className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Mobile Icons (Cart, Wishlist, Orders) */}
            <div className="flex lg:hidden items-center gap-2">
              <motion.button
                onClick={() => navigate('/my-orders')}
                className="bg-purple-600 hover:bg-purple-700 p-2 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Package className="w-5 h-5" />
              </motion.button>

              {onWishlistClick && (
                <motion.button
                  onClick={onWishlistClick}
                  className="relative bg-purple-600 hover:bg-purple-700 p-2 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Heart className="w-5 h-5" />
                  <AnimatePresence>
                    {wishlistCount > 0 && (
                      <motion.span 
                        className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      >
                        {wishlistCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              )}

              <motion.button
                onClick={onCartClick}
                className="relative bg-purple-600 hover:bg-purple-700 p-2 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingCart className="w-5 h-5" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span 
                      className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              className="lg:hidden py-4 border-t border-purple-900/30"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col gap-4">
                {['Home', 'Shop', 'Categories', 'About', 'Contact'].map((item, index) => (
                  <motion.a
                    key={item}
                    href={item === 'Home' ? '/' : `/#${item.toLowerCase()}`}
                    onClick={(e) => {
                      setMobileMenuOpen(false);
                      if (item === 'Home') {
                        e.preventDefault();
                        navigate('/');
                      } else {
                        const section = document.getElementById(item.toLowerCase());
                        if (section) {
                          e.preventDefault();
                          section.scrollIntoView({ behavior: 'smooth' });
                        }
                      }
                    }}
                    className="text-gray-300 hover:text-purple-400 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    {item}
                  </motion.a>
                ))}
                {user ? (
                  <>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/my-profile');
                      }}
                      className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2"
                    >
                      <User className="w-5 h-5" />
                      My Profile
                    </button>
                    <button
                      onClick={onLogout}
                      className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={onLoginClick}
                    className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2"
                  >
                    <User className="w-5 h-5" />
                    Login
                  </button>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onCartClick();
                  }}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 justify-center"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Cart ({cartCount})
                </button>
                {onWishlistClick && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onWishlistClick();
                    }}
                    className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 justify-center"
                  >
                    <Heart className="w-5 h-5" />
                    Wishlist ({wishlistCount})
                  </button>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/my-orders');
                  }}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Package className="w-5 h-5" />
                  My Orders
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
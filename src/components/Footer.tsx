import { Logo } from './Logo';
import { useNavigate } from 'react-router-dom';

export function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-purple-900/30 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Logo size="md" />
              <span className="text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                animedropzone
              </span>
            </div>
            <p className="text-gray-400">
              Your one-stop destination for premium anime merchandise and collectibles.
            </p>
          </div>
          <div>
            <h4 className="text-white mb-4">Shop</h4>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/#shop')}
                className="block text-gray-400 hover:text-purple-400 transition-colors text-left"
              >
                All Products
              </button>
              <button 
                onClick={() => navigate('/#categories')}
                className="block text-gray-400 hover:text-purple-400 transition-colors text-left"
              >
                Categories
              </button>
            </div>
          </div>
          <div>
            <h4 className="text-white mb-4">About</h4>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/#about')}
                className="block text-gray-400 hover:text-purple-400 transition-colors text-left"
              >
                About Us
              </button>
              <button 
                onClick={() => navigate('/#contact')}
                className="block text-gray-400 hover:text-purple-400 transition-colors text-left"
              >
                Contact Us
              </button>
              <button 
                onClick={() => navigate('/track-order')}
                className="block text-gray-400 hover:text-purple-400 transition-colors text-left"
              >
                Track Order
              </button>
            </div>
          </div>
          <div>
            <h4 className="text-white mb-4">Legal</h4>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/privacy-policy')}
                className="block text-gray-400 hover:text-purple-400 transition-colors text-left"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => navigate('/terms-of-service')}
                className="block text-gray-400 hover:text-purple-400 transition-colors text-left"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-purple-900/30 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 animedropzone. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
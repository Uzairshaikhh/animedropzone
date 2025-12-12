import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface UserAuthProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
  showCheckoutMessage?: boolean;
}

export function UserAuth({ isOpen, onClose, onAuthSuccess, showCheckoutMessage = false }: UserAuthProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setError('Please enter a valid email address');
          setIsLoading(false);
          return;
        }

        // Validate password length
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          setIsLoading(false);
          return;
        }

        // Validate name
        if (!formData.name || formData.name.trim().length < 2) {
          setError('Please enter a valid name');
          setIsLoading(false);
          return;
        }

        console.log('🔵 SIGNUP ATTEMPT:', {
          email: formData.email,
          name: formData.name,
          timestamp: new Date().toISOString()
        });

        // Sign up new user
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/signup`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
              name: formData.name,
            }),
          }
        );

        const data = await response.json();
        console.log('✅ Signup response:', data);

        if (data.success) {
          // Auto login after signup
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

          if (loginError) {
            setError(loginError.message);
          } else if (loginData.user) {
            onAuthSuccess(loginData.user);
            resetForm();
            onClose();
          }
        } else {
          setError(data.message || 'Signup failed. Please try again.');
        }
      } else {
        // Login existing user
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (loginError) {
          setError(loginError.message);
        } else if (data.user) {
          onAuthSuccess(data.user);
          resetForm();
          onClose();
        }
      }
    } catch (error) {
      console.log('Auth error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '' });
    setError('');
    setShowPassword(false);
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl w-full max-w-md shadow-2xl shadow-purple-900/50 m-4">
        <div className="flex items-center justify-between p-6 border-b border-purple-500/30">
          <h2 className="text-white">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {showCheckoutMessage && (
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3 text-purple-300 text-sm mb-4">
              <p className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Please login or create an account to complete your order
              </p>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-gray-300 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter your full name"
                  className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg pl-11 pr-4 py-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="Enter your email"
                className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg pl-11 pr-4 py-3 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="Enter your password"
                className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg pl-11 pr-11 py-3 text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {mode === 'login' && (
              <div className="text-right mt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/forgot-password');
                  }}
                  className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 py-3 rounded-lg transition-all text-lg"
          >
            {isLoading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Sign Up'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={switchMode}
              className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
            >
              {mode === 'login'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
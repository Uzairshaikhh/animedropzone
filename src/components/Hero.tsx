import { ArrowRight, Star, Zap, Shield, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Wallpaper {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  order: number;
}

export function Hero() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch wallpapers from the database
  useEffect(() => {
    fetchWallpapers();
  }, []);

  const fetchWallpapers = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/wallpapers`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.wallpapers && data.wallpapers.length > 0) {
          // Filter out null/undefined wallpapers and handle missing order
          const validWallpapers = data.wallpapers
            .filter((w: Wallpaper | null) => w !== null && w !== undefined)
            .sort((a: Wallpaper, b: Wallpaper) => (a.order || 0) - (b.order || 0));
          
          if (validWallpapers.length > 0) {
            setWallpapers(validWallpapers);
          } else {
            setWallpapers(getDefaultWallpapers());
          }
        } else {
          // Use default wallpapers if none in database
          setWallpapers(getDefaultWallpapers());
        }
      } else {
        setWallpapers(getDefaultWallpapers());
      }
    } catch (error) {
      console.error('Error fetching wallpapers:', error);
      setWallpapers(getDefaultWallpapers());
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultWallpapers = (): Wallpaper[] => [
    {
      id: '1',
      imageUrl: 'https://images.unsplash.com/photo-1668293750324-bd77c1f08ca9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW1vbiUyMHNsYXllciUyMGFuaW1lfGVufDF8fHx8MTc2NTMwODI3OHww&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Demon Slayer Collection',
      subtitle: 'Limited Edition Figures & Katanas',
      order: 0,
    },
    {
      id: '2',
      imageUrl: 'https://images.unsplash.com/photo-1740644545217-892da8cce224?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXJ1dG8lMjBhbmltZSUyMGNoYXJhY3RlcnxlbnwxfHx8fDE3NjUzMDgyNzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Naruto Legends',
      subtitle: 'Iconic Ninja Collection',
      order: 1,
    },
    {
      id: '3',
      imageUrl: 'https://images.unsplash.com/photo-1667419674822-1a9195436f1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmUlMjBwaWVjZSUyMGFuaW1lfGVufDF8fHx8MTc2NTMwODI3OXww&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'One Piece Adventure',
      subtitle: 'Grand Line Treasures',
      order: 2,
    },
    {
      id: '4',
      imageUrl: 'https://images.unsplash.com/photo-1709675577960-0b1e7ba55347?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdHRhY2slMjB0aXRhbiUyMGFuaW1lfGVufDF8fHx8MTc2NTMwODI3OXww&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Attack on Titan',
      subtitle: 'Survey Corps Collection',
      order: 3,
    },
    {
      id: '5',
      imageUrl: 'https://images.unsplash.com/photo-1575540325855-4b5d285a3845?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcmFnb24lMjBiYWxsJTIwYW5pbWV8ZW58MXx8fHwxNzY1MjE3NDA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Dragon Ball Z',
      subtitle: 'Super Saiyan Warriors',
      order: 4,
    },
  ];

  // Auto-slide wallpapers
  useEffect(() => {
    if (wallpapers.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % wallpapers.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [wallpapers.length]);

  const scrollToShop = () => {
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
  };

  const currentWallpaper = wallpapers[currentIndex] || getDefaultWallpapers()[0];

  if (isLoading) {
    return <div className="h-screen bg-black"></div>;
  }

  return (
    <section className="relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-pink-900/30"></div>
        <div className="absolute inset-0 opacity-20">
          <motion.div 
            className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          ></motion.div>
          <motion.div 
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          ></motion.div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="z-10">
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/50 rounded-full mb-6 backdrop-blur-sm"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              </motion.div>
              <span className="text-purple-300">Premium Collection</span>
            </motion.div>
            
            <motion.h1 
              className="mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent leading-tight"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Embrace Your Inner Demon
            </motion.h1>
            
            <motion.p 
              className="mb-4 text-gray-300 text-lg"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Step into the world of anime with our exclusive collection of premium figures, 
              authentic katanas, and rare collectibles.
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap gap-6 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {[
                { icon: Zap, text: 'Fast Shipping' },
                { icon: Shield, text: '100% Authentic' },
                { icon: Star, text: 'Premium Quality', filled: true }
              ].map((item, index) => (
                <motion.div 
                  key={item.text}
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <item.icon className={`w-5 h-5 text-purple-400 ${item.filled ? 'fill-purple-400' : ''}`} />
                  <span className="text-gray-300">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <motion.a
                href="#shop"
                className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-purple-900/50 hover:shadow-purple-900/70"
                onClick={scrollToShop}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg">Shop Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.a>
              <motion.a
                href="#categories"
                className="bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/50 px-8 py-4 rounded-lg transition-all backdrop-blur-sm text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Categories
              </motion.a>
            </motion.div>
          </div>

          {/* Sliding Wallpaper Poster */}
          <motion.div 
            className="relative z-10"
            initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="relative group">
              {/* Glow effect */}
              <motion.div 
                className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"
                animate={{
                  opacity: [0.5, 0.7, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              ></motion.div>
              
              {/* Main image container */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-purple-500/50 shadow-2xl shadow-purple-900/50">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentIndex}
                    src={currentWallpaper.imageUrl}
                    alt={currentWallpaper.title}
                    className="w-full h-auto"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.7 }}
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                
                {/* Badge */}
                <motion.div 
                  className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-orange-600 px-4 py-2 rounded-full"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <span className="text-white text-sm">New Arrival</span>
                </motion.div>

                {/* Bottom text */}
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={`text-${currentIndex}`}
                    className="absolute bottom-0 left-0 right-0 p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h3 className="text-white text-2xl mb-2">{currentWallpaper.title}</h3>
                    <p className="text-purple-200">{currentWallpaper.subtitle}</p>
                  </motion.div>
                </AnimatePresence>

                {/* Slide indicators */}
                {wallpapers.length > 1 && (
                  <div className="absolute bottom-24 left-0 right-0 flex justify-center gap-2">
                    {wallpapers.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentIndex 
                            ? 'bg-white w-8' 
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Floating stats */}
            {/* Removed rating section */}
          </motion.div>
        </div>
      </div>

      {/* Decorative bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="url(#gradient)" fillOpacity="0.1"/>
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="1440" y2="0">
              <stop offset="0%" stopColor="#9333ea"/>
              <stop offset="100%" stopColor="#ec4899"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  );
}
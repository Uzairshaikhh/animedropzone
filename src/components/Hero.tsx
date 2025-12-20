import { ArrowRight, Star, Zap, Shield, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface Wallpaper {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  order: number;
}

interface HeroProps {
  onShopNow?: () => void;
}

// Define this OUTSIDE the component to avoid initialization order issues
const getDefaultWallpapers = (): Wallpaper[] => [
  {
    id: "default_wallpaper_1",
    imageUrl:
      "https://images.pexels.com/photos/18613634/pexels-photo-18613634/portrait.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1",
    title: "Demon Slayer Collection",
    subtitle: "Limited Edition Figures & Katanas",
    order: 0,
  },
  {
    id: "default_wallpaper_2",
    imageUrl:
      "https://images.pexels.com/photos/19091613/pexels-photo-19091613/portrait.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1",
    title: "Naruto Legends",
    subtitle: "Iconic Ninja Collection",
    order: 1,
  },
  {
    id: "default_wallpaper_3",
    imageUrl:
      "https://images.pexels.com/photos/17696732/pexels-photo-17696732/portrait.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1",
    title: "One Piece Adventure",
    subtitle: "Grand Line Treasures",
    order: 2,
  },
  {
    id: "default_wallpaper_4",
    imageUrl:
      "https://images.pexels.com/photos/16615635/pexels-photo-16615635/portrait.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1",
    title: "Attack on Titan",
    subtitle: "Survey Corps Collection",
    order: 3,
  },
  {
    id: "default_wallpaper_5",
    imageUrl:
      "https://images.pexels.com/photos/15582104/pexels-photo-15582104/portrait.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1",
    title: "Dragon Ball Z",
    subtitle: "Super Saiyan Warriors",
    order: 4,
  },
];

export function Hero({ onShopNow }: HeroProps) {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>(() => {
    // Load from cache immediately on mount (instant load)
    try {
      const cached = localStorage.getItem("cached_wallpapers");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.log("Cache read error");
    }
    return getDefaultWallpapers();
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = typeof window !== "undefined" ? window.innerWidth < 768 : false;
  const [showCTA, setShowCTA] = useState(true); // Will be controlled by useEffect

  // Detect mobile on window resize
  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768;
      // On first load transition from mobile to showing CTA
      if (newIsMobile && !showCTA) {
        setTimeout(() => setShowCTA(true), 100);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [showCTA]);

  // Show CTA buttons immediately on mobile (300ms) for instant feedback
  useEffect(() => {
    if (isMobile && !showCTA) {
      const timer = setTimeout(() => setShowCTA(true), 300);
      return () => clearTimeout(timer);
    }
  }, [isMobile, showCTA]);

  // Fetch wallpapers from the database
  useEffect(() => {
    // Don't wait for fetch, update in background only
    fetchWallpapersInBackground();

    // Listen for wallpaper updates via BroadcastChannel
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("wallpapers");
      channel.onmessage = (event) => {
        if (
          event.data.type === "wallpaper_updated" ||
          event.data.type === "wallpaper_deleted" ||
          event.data.type === "wallpaper_added"
        ) {
          console.log("📡 Wallpaper update received via BroadcastChannel");

          // If wallpapers data is included in message, use it directly
          if (event.data.wallpapers && event.data.wallpapers.length > 0) {
            console.log("📡 Using wallpapers from BroadcastChannel message:", event.data.wallpapers);
            setWallpapers(event.data.wallpapers);
          } else {
            // Otherwise refetch from API
            console.log("📡 Refetching wallpapers from API...");
            setTimeout(() => {
              fetchWallpapersInBackground();
            }, 500);
          }
        }
      };
    } catch (error) {
      console.log("BroadcastChannel not available, using polling only");
    }

    // Poll for wallpaper updates every 60 seconds (reduced frequency)
    const pollInterval = setInterval(() => {
      console.log("🔄 Polling for wallpaper updates...");
      fetchWallpapersInBackground();
    }, 120000); // Increased from 60s to 120s to reduce network requests

    return () => {
      if (channel) channel.close();
      clearInterval(pollInterval);
    };
  }, []);

  const fetchWallpapersInBackground = async () => {
    try {
      console.log("🔵 Fetching wallpapers in background...");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout for faster fallback

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/wallpapers`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.wallpapers && data.wallpapers.length > 0) {
          const validWallpapers = data.wallpapers
            .filter((w: Wallpaper | null) => w !== null && w !== undefined)
            .sort((a: Wallpaper, b: Wallpaper) => (a.order || 0) - (b.order || 0));

          if (validWallpapers.length > 0) {
            setWallpapers(validWallpapers);
            localStorage.setItem("cached_wallpapers", JSON.stringify(validWallpapers));
          }
        }
      }
    } catch (error) {
      console.log("Background fetch failed, using cached data");
      // Silently fail - using cached data
    }
  };

  const seedDefaultWallpapers = async () => {
    try {
      console.log("🌱 Seeding default wallpapers...");
      const defaults = getDefaultWallpapers();

      for (const wallpaper of defaults) {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/wallpapers`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrl: wallpaper.imageUrl,
            title: wallpaper.title,
            subtitle: wallpaper.subtitle,
          }),
        });

        if (response.ok) {
          console.log(`✅ Seeded wallpaper: ${wallpaper.title}`);
        } else {
          console.error(`❌ Failed to seed wallpaper: ${wallpaper.title}`);
        }
      }

      // Fetch again after seeding
      console.log("🔄 Re-fetching wallpapers after seeding...");
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/wallpapers`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const validWallpapers = (data.wallpapers || [])
          .filter((w: Wallpaper | null) => w !== null && w !== undefined)
          .sort((a: Wallpaper, b: Wallpaper) => (a.order || 0) - (b.order || 0));

        if (validWallpapers.length > 0) {
          console.log("✅ Wallpapers seeded and fetched successfully!");
          setWallpapers(validWallpapers);
        } else {
          console.log("ℹ️ Using local default wallpapers");
          setWallpapers(getDefaultWallpapers());
        }
      }
    } catch (error) {
      console.error("❌ Error seeding wallpapers:", error);
      setWallpapers(getDefaultWallpapers());
    }
  };

  // Auto-slide wallpapers
  useEffect(() => {
    if (wallpapers.length <= 1) return;

    // Preload all wallpaper images
    wallpapers.forEach((wallpaper) => {
      const img = new Image();
      img.src = wallpaper.imageUrl;
    });

    // Increase interval on mobile to reduce animation overhead
    const slideInterval = isMobile ? 10000 : 6000; // 10s on mobile, 6s on desktop

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % wallpapers.length);
    }, slideInterval);

    return () => clearInterval(interval);
  }, [wallpapers.length, isMobile]);

  const scrollToShop = () => {
    console.log("🛍️ Shop Now clicked!");

    // First, call the parent callback to ensure products are visible
    if (onShopNow) {
      console.log("Calling onShopNow callback");
      onShopNow();
    }

    // Then scroll to the shop section
    // Use setTimeout to ensure DOM has updated after state change
    setTimeout(() => {
      const shopElement = document.getElementById("shop");
      console.log("Shop element found:", shopElement);
      if (shopElement) {
        shopElement.scrollIntoView({ behavior: "smooth" });
        console.log("✅ Scrolling to shop section");
      } else {
        console.warn("❌ Shop section not found in DOM");
      }
    }, 100);
  };

  const currentWallpaper = wallpapers[currentIndex] || getDefaultWallpapers()[0];

  return (
    <section className="relative overflow-hidden">
      {/* Animated Background - Disabled on mobile for performance */}
      {!isMobile && (
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
                ease: "easeInOut",
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
                delay: 1,
              }}
            ></motion.div>
          </div>
        </div>
      )}
      {/* Mobile background - simple solid gradient */}
      {isMobile && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20"></div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="z-10">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/50 rounded-full mb-6 backdrop-blur-sm"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: isMobile ? 0.3 : 0.6 }}
            >
              <motion.div
                animate={{
                  rotate: isMobile ? [0, 180] : [0, 360], // Half rotation on mobile
                }}
                transition={{
                  duration: isMobile ? 2 : 3,
                  repeat: Infinity,
                  ease: "linear",
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
              transition={{ duration: isMobile ? 0.3 : 0.8, delay: isMobile ? 0 : 0.2 }}
            >
              Embrace Your Inner Demon
            </motion.h1>

            <motion.p
              className="mb-4 text-gray-300 text-lg"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: isMobile ? 0.3 : 0.8, delay: isMobile ? 0.1 : 0.4 }}
            >
              Step into the world of anime with our exclusive collection of premium figures, authentic katanas, and rare
              collectibles.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-6 mb-8"
              initial={isMobile ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: isMobile ? 0 : 0.8, delay: isMobile ? 0.2 : 0.6 }}
            >
              {[
                { icon: Zap, text: "Fast Shipping" },
                { icon: Shield, text: "100% Authentic" },
                { icon: Star, text: "Premium Quality", filled: true },
              ].map((item, index) => (
                <motion.div
                  key={item.text}
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: isMobile ? 0.3 : 0.5, delay: 0.7 + index * 0.05 }}
                  whileHover={!isMobile ? { scale: 1.05 } : {}}
                >
                  <item.icon className={`w-5 h-5 text-purple-400 ${item.filled ? "fill-purple-400" : ""}`} />
                  <span className="text-gray-300">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="flex flex-wrap gap-4"
              initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: isMobile ? 0 : 0.8, delay: isMobile ? 0 : 0.9 }}
            >
              <motion.div whileHover={!isMobile ? { scale: 1.05 } : {}} whileTap={{ scale: 0.95 }}>
                <button
                  type="button"
                  onClick={scrollToShop}
                  className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-purple-900/50 hover:shadow-purple-900/70 cursor-pointer"
                >
                  <span className="text-lg">Shop Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
              <motion.a
                href="#categories"
                className="bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/50 px-8 py-4 rounded-lg transition-all backdrop-blur-sm text-lg"
                whileHover={!isMobile ? { scale: 1.05 } : {}}
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
            animate={{ opacity: 1, scale: 1, rotateY: isMobile ? 0 : 0 }}
            transition={{ duration: isMobile ? 0.6 : 1, delay: 0.3 }}
          >
            <div className="relative group">
              {/* Glow effect - Disabled on mobile */}
              {!isMobile && (
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"
                  animate={{
                    opacity: [0.5, 0.7, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                ></motion.div>
              )}

              {/* Main image container */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-purple-500/50 shadow-2xl shadow-purple-900/50 bg-gradient-to-br from-purple-900 via-black to-pink-900 min-h-96">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentIndex}
                    src={currentWallpaper.imageUrl}
                    alt={currentWallpaper.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto"
                    onError={(e) => {
                      console.error("❌ Image failed to load:", currentWallpaper.imageUrl);
                      console.error("Error:", e);
                    }}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: isMobile ? 0.4 : 0.7 }}
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>

                {/* Badge - Disabled animation on mobile, instant load */}
                <motion.div
                  className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-orange-600 px-4 py-2 rounded-full"
                  initial={isMobile ? { scale: 1 } : {}}
                  animate={
                    isMobile
                      ? { scale: 1 }
                      : {
                          scale: [1, 1.1, 1],
                        }
                  }
                  transition={
                    isMobile
                      ? {}
                      : {
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }
                  }
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
                          index === currentIndex ? "bg-white w-8" : "bg-white/50 hover:bg-white/75"
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
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="url(#gradient)"
            fillOpacity="0.1"
          />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="1440" y2="0">
              <stop offset="0%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  );
}

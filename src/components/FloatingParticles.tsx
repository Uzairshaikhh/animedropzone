import { motion } from "motion/react";
import { useMemo } from "react";

export function FloatingParticles() {
  // Memoize particles to prevent unnecessary regeneration
  const particles = useMemo(() => {
    // Use fewer particles on small screens
    const isMobile = typeof window !== "undefined" ? window.innerWidth < 768 : false;
    const particleCount = isMobile ? 5 : 20;

    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      size: Math.random() * 6 + 2,
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 blur-sm"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.initialX}%`,
            top: `${particle.initialY}%`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

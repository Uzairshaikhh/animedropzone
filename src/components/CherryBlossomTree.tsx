import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface Petal {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
  drift: number;
}

export function CherryBlossomTree() {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    // Generate random petals - increased count for more visibility
    const newPetals: Petal[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // Random horizontal position (percentage)
      delay: Math.random() * 5, // Random delay before starting
      duration: 8 + Math.random() * 7, // Random fall duration (8-15s)
      size: 10 + Math.random() * 12, // Random size (10-22px) - increased size
      rotation: Math.random() * 360, // Random initial rotation
      drift: -20 + Math.random() * 40, // Random horizontal drift (-20 to 20)
    }));
    setPetals(newPetals);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Cherry Blossom Trees - Left side */}
      <svg
        className="absolute -left-20 top-0 h-full w-96 opacity-35"
        viewBox="0 0 400 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main trunk */}
        <path
          d="M200 1000 Q200 800 180 600 Q160 400 150 200 Q145 100 140 0"
          stroke="url(#trunkGradient1)"
          strokeWidth="12"
          fill="none"
          opacity="0.8"
        />
        
        {/* Branch 1 */}
        <path
          d="M150 200 Q180 180 220 170 Q260 160 300 165"
          stroke="url(#branchGradient1)"
          strokeWidth="6"
          fill="none"
          opacity="0.7"
        />
        
        {/* Branch 2 */}
        <path
          d="M160 400 Q200 380 240 385 Q280 390 320 400"
          stroke="url(#branchGradient1)"
          strokeWidth="8"
          fill="none"
          opacity="0.7"
        />
        
        {/* Branch 3 */}
        <path
          d="M180 600 Q150 580 120 590 Q90 600 70 620"
          stroke="url(#branchGradient1)"
          strokeWidth="7"
          fill="none"
          opacity="0.7"
        />

        {/* Branch 4 */}
        <path
          d="M165 350 Q135 330 105 335 Q75 340 50 355"
          stroke="url(#branchGradient1)"
          strokeWidth="5"
          fill="none"
          opacity="0.7"
        />

        {/* Gradients */}
        <defs>
          <linearGradient id="trunkGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="branchGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* Blossom clusters on branches */}
        <g opacity="0.7">
          <circle cx="300" cy="165" r="25" fill="url(#blossomGradient)" />
          <circle cx="280" cy="175" r="20" fill="url(#blossomGradient)" />
          <circle cx="320" cy="400" r="30" fill="url(#blossomGradient)" />
          <circle cx="290" cy="395" r="22" fill="url(#blossomGradient)" />
          <circle cx="70" cy="620" r="28" fill="url(#blossomGradient)" />
          <circle cx="95" cy="610" r="20" fill="url(#blossomGradient)" />
          <circle cx="50" cy="355" r="25" fill="url(#blossomGradient)" />
          <circle cx="75" cy="345" r="18" fill="url(#blossomGradient)" />
        </g>

        <defs>
          <radialGradient id="blossomGradient">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.4" />
          </radialGradient>
        </defs>
      </svg>

      {/* Cherry Blossom Trees - Right side */}
      <svg
        className="absolute -right-20 top-0 h-full w-96 opacity-35"
        viewBox="0 0 400 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main trunk */}
        <path
          d="M200 1000 Q200 800 220 600 Q240 400 250 200 Q255 100 260 0"
          stroke="url(#trunkGradient2)"
          strokeWidth="12"
          fill="none"
          opacity="0.8"
        />
        
        {/* Branch 1 */}
        <path
          d="M250 200 Q220 180 180 170 Q140 160 100 165"
          stroke="url(#branchGradient2)"
          strokeWidth="6"
          fill="none"
          opacity="0.7"
        />
        
        {/* Branch 2 */}
        <path
          d="M240 400 Q200 380 160 385 Q120 390 80 400"
          stroke="url(#branchGradient2)"
          strokeWidth="8"
          fill="none"
          opacity="0.7"
        />
        
        {/* Branch 3 */}
        <path
          d="M220 600 Q250 580 280 590 Q310 600 330 620"
          stroke="url(#branchGradient2)"
          strokeWidth="7"
          fill="none"
          opacity="0.7"
        />

        {/* Branch 4 */}
        <path
          d="M235 350 Q265 330 295 335 Q325 340 350 355"
          stroke="url(#branchGradient2)"
          strokeWidth="5"
          fill="none"
          opacity="0.7"
        />

        {/* Gradients */}
        <defs>
          <linearGradient id="trunkGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="branchGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* Blossom clusters on branches */}
        <g opacity="0.7">
          <circle cx="100" cy="165" r="25" fill="url(#blossomGradient2)" />
          <circle cx="120" cy="175" r="20" fill="url(#blossomGradient2)" />
          <circle cx="80" cy="400" r="30" fill="url(#blossomGradient2)" />
          <circle cx="110" cy="395" r="22" fill="url(#blossomGradient2)" />
          <circle cx="330" cy="620" r="28" fill="url(#blossomGradient2)" />
          <circle cx="305" cy="610" r="20" fill="url(#blossomGradient2)" />
          <circle cx="350" cy="355" r="25" fill="url(#blossomGradient2)" />
          <circle cx="325" cy="345" r="18" fill="url(#blossomGradient2)" />
        </g>

        <defs>
          <radialGradient id="blossomGradient2">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ec4899" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.4" />
          </radialGradient>
        </defs>
      </svg>

      {/* Falling Petals */}
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          className="absolute"
          style={{
            left: `${petal.x}%`,
            top: '-20px',
          }}
          initial={{ 
            y: -20, 
            x: 0,
            rotate: petal.rotation,
            opacity: 0 
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, petal.drift, -petal.drift / 2, petal.drift / 3, 0],
            rotate: [petal.rotation, petal.rotation + 360, petal.rotation + 720],
            opacity: [0, 1, 1, 0.8, 0],
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {/* Cherry Blossom Petal SVG */}
          <svg
            width={petal.size}
            height={petal.size}
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-lg"
          >
            {/* Five-petaled cherry blossom */}
            <g transform="translate(10, 10)">
              {/* Center */}
              <circle cx="0" cy="0" r="1.5" fill="#fbbf24" opacity="0.9" />
              
              {/* Petals */}
              {[0, 72, 144, 216, 288].map((angle, i) => {
                const radians = (angle * Math.PI) / 180;
                const x = Math.cos(radians) * 3;
                const y = Math.sin(radians) * 3;
                
                return (
                  <ellipse
                    key={i}
                    cx={x}
                    cy={y}
                    rx="3"
                    ry="4.5"
                    fill="url(#petalGradient)"
                    transform={`rotate(${angle} ${x} ${y})`}
                    opacity="0.85"
                  />
                );
              })}
            </g>

            <defs>
              <linearGradient id="petalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f9a8d4" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#db2777" />
              </linearGradient>
            </defs>

            {/* Glow effect */}
            <g transform="translate(10, 10)" opacity="0.3">
              <circle cx="0" cy="0" r="8" fill="url(#glowGradient)" />
            </g>

            <defs>
              <radialGradient id="glowGradient">
                <stop offset="0%" stopColor="#ec4899" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
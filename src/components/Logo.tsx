export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { container: 'w-8 h-8', text: 'text-lg' },
    md: { container: 'w-10 h-10', text: 'text-xl' },
    lg: { container: 'w-16 h-16', text: 'text-3xl' },
  };

  return (
    <div className={`${sizes[size].container} bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center relative overflow-hidden shadow-lg shadow-purple-900/50`}>
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20"></div>
      
      {/* Logo text/icon */}
      <span className={`${sizes[size].text} relative z-10`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1"
        >
          {/* Stylized "A" for Anime */}
          <path
            d="M12 3L3 21H7L9 16H15L17 21H21L12 3Z"
            fill="white"
            stroke="white"
            strokeWidth="0.5"
          />
          <path
            d="M10 13L12 8L14 13H10Z"
            fill="url(#logo-gradient)"
          />
          <defs>
            <linearGradient id="logo-gradient" x1="12" y1="8" x2="12" y2="13">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
          </defs>
        </svg>
      </span>
    </div>
  );
}

import { useEffect } from 'react';

export function Favicon() {
  useEffect(() => {
    // Create SVG favicon
    const svg = `
      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#9333ea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="inner-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#ec4899;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#9333ea;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Background rounded square -->
        <rect width="32" height="32" rx="6" fill="url(#bg-gradient)"/>
        
        <!-- Stylized "A" for Anime -->
        <path
          d="M16 8L9 26H12L14 21H18L20 26H23L16 8Z"
          fill="white"
          stroke="white"
          stroke-width="0.3"
        />
        <path
          d="M15 18L16 14L17 18H15Z"
          fill="url(#inner-gradient)"
        />
      </svg>
    `;

    // Convert SVG to data URL
    const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);

    // Remove any existing favicons
    const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
    existingFavicons.forEach(favicon => favicon.remove());

    // Add new favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.href = url;
    document.head.appendChild(link);

    // Also add apple-touch-icon
    const appleTouchIcon = document.createElement('link');
    appleTouchIcon.rel = 'apple-touch-icon';
    appleTouchIcon.href = url;
    document.head.appendChild(appleTouchIcon);

    // Update page title if not already set
    if (document.title === '' || document.title === 'Vite + React + TS') {
      document.title = 'AnimeDropZone - Anime Figures & Accessories Store';
    }

    // Add meta theme color for mobile browsers
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = '#9333ea';
      document.head.appendChild(meta);
    }

    // Cleanup
    return () => {
      URL.revokeObjectURL(url);
    };
  }, []);

  return null;
}

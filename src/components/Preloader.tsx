import { useEffect, useState } from "react";

export function Preloader() {
  const [isVisible, setIsVisible] = useState(true);
  const isMobile = typeof window !== "undefined" ? window.innerWidth < 768 : false;

  useEffect(() => {
    // Detect if mobile for faster timeout
    const mobileTimeout = isMobile ? 1500 : 2500; // Mobile: 1.5s, Desktop: 2.5s
    const minTimeout = isMobile ? 200 : 300; // Mobile: 200ms, Desktop: 300ms

    // Minimum preloader duration (for smooth transition)
    const minTimer = setTimeout(() => {
      // Check if page is ready
      if (document.readyState === "complete") {
        setIsVisible(false);
      }
    }, minTimeout);

    // Maximum preloader duration (safety net - faster on mobile)
    const maxTimer = setTimeout(() => {
      setIsVisible(false);
    }, mobileTimeout);

    const handleLoad = () => {
      setIsVisible(false);
    };

    window.addEventListener("load", handleLoad);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  if (!isVisible) return null;

  // Mobile-optimized sizes
  const spinnerSize = isMobile ? 48 : 60; // Smaller on mobile
  const fadeOutDuration = isMobile ? "0.3s" : "0.5s"; // Faster fade on mobile
  const spinSpeed = isMobile ? "0.8s" : "1s"; // Faster spinner on mobile
  const fontSize = isMobile ? "14px" : "16px";
  const marginTop = isMobile ? "20px" : "30px";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #000 0%, #1a0033 50%, #000 100%)",
        zIndex: 9999,
        animation: `fadeOut ${fadeOutDuration} ease-out forwards`,
        animationDelay: "0.2s",
        willChange: "opacity", // GPU acceleration
      }}
    >
      <style>{`
        @keyframes fadeOut {
          from {
            opacity: 1;
            visibility: visible;
          }
          to {
            opacity: 0;
            visibility: hidden;
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .preloader-spinner {
          will-change: transform;
        }

        @media (max-width: 767px) {
          .preloader-spinner {
            animation: spin 0.8s linear infinite;
          }
          .preloader-text {
            animation: pulse 1.2s ease-in-out infinite;
          }
        }

        @media (min-width: 768px) {
          .preloader-spinner {
            animation: spin 1s linear infinite;
          }
          .preloader-text {
            animation: pulse 1.5s ease-in-out infinite;
          }
        }
      `}</style>

      <div style={{ textAlign: "center", userSelect: "none" }}>
        {/* Animated Spinner */}
        <div
          className="preloader-spinner"
          style={{
            width: `${spinnerSize}px`,
            height: `${spinnerSize}px`,
            border: "4px solid rgba(168, 85, 247, 0.2)",
            borderTop: "4px solid #a855f7",
            borderRadius: "50%",
            margin: "0 auto 20px",
            backgroundColor: "transparent",
          }}
        />

        {/* Text */}
        <div
          className="preloader-text"
          style={{
            color: "#a855f7",
            fontSize: fontSize,
            fontWeight: "600",
            letterSpacing: "2px",
            marginBottom: "10px",
            pointerEvents: "none",
          }}
        >
          LOADING
        </div>

        {/* Dots */}
        <div
          style={{
            color: "#a855f7",
            fontSize: isMobile ? "16px" : "20px",
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "2px",
          }}
        >
          <span style={{ animation: "pulse 0.6s ease-in-out infinite" }}>.</span>
          <span style={{ animation: "pulse 0.6s ease-in-out infinite 0.2s" }}>.</span>
          <span style={{ animation: "pulse 0.6s ease-in-out infinite 0.4s" }}>.</span>
        </div>

        {/* Brand Name */}
        <div
          style={{
            marginTop: marginTop,
            fontSize: "11px",
            color: "#999",
            letterSpacing: "1px",
            opacity: 0.8,
          }}
        >
          animedropzone
        </div>
      </div>
    </div>
  );
}

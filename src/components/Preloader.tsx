import { useEffect, useState } from "react";

export function Preloader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Minimum preloader duration (300ms for smooth transition)
    const minTimer = setTimeout(() => {
      // Check if page is ready
      if (document.readyState === "complete") {
        setIsVisible(false);
      }
    }, 300);

    // Maximum preloader duration (3s as safety net)
    const maxTimer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

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
        animation: "fadeOut 0.5s ease-out forwards",
        animationDelay: "0.3s",
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
          animation: spin 1s linear infinite;
        }

        .preloader-text {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>

      <div style={{ textAlign: "center" }}>
        {/* Animated Spinner */}
        <div
          className="preloader-spinner"
          style={{
            width: "60px",
            height: "60px",
            border: "4px solid rgba(168, 85, 247, 0.2)",
            borderTop: "4px solid #a855f7",
            borderRadius: "50%",
            margin: "0 auto 20px",
          }}
        />

        {/* Text */}
        <div
          className="preloader-text"
          style={{
            color: "#a855f7",
            fontSize: "16px",
            fontWeight: "600",
            letterSpacing: "2px",
            marginBottom: "10px",
          }}
        >
          LOADING
        </div>

        {/* Dots */}
        <div
          style={{
            color: "#a855f7",
            fontSize: "20px",
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ animation: "pulse 0.6s ease-in-out infinite" }}>.</span>
          <span style={{ animation: "pulse 0.6s ease-in-out infinite 0.2s" }}>.</span>
          <span style={{ animation: "pulse 0.6s ease-in-out infinite 0.4s" }}>.</span>
        </div>

        {/* Brand Name */}
        <div
          style={{
            marginTop: "30px",
            fontSize: "12px",
            color: "#999",
            letterSpacing: "1px",
          }}
        >
          animedropzone
        </div>
      </div>
    </div>
  );
}

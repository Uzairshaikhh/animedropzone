/**
 * Mobile Optimization Utilities
 * Disables heavy animations and features on mobile for maximum performance
 */

export const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
};

/**
 * Disable all animations on mobile by returning empty animation config
 */
export const getAnimationConfig = () => {
  if (isMobileDevice()) {
    return {
      initial: {},
      animate: {},
      transition: {},
      variants: {},
      whileHover: {},
      whileTap: {},
    };
  }
  return null; // Desktop uses normal animations
};

/**
 * Conditionally render animations only on desktop
 */
export const shouldAnimateOnDesktop = (): boolean => {
  return !isMobileDevice();
};

/**
 * Get optimized image loading config for mobile
 */
export const getImageLoadingConfig = () => {
  return {
    loading: "lazy" as const,
    decoding: "async" as const,
  };
};

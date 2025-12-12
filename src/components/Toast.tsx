import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastData {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: ToastData;
  onClose: (id: string) => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
          border: 'border-green-500/50',
          icon: 'text-green-400',
          glow: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]',
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-500/20 to-rose-500/20',
          border: 'border-red-500/50',
          icon: 'text-red-400',
          glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20',
          border: 'border-yellow-500/50',
          icon: 'text-yellow-400',
          glow: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]',
        };
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20',
          border: 'border-purple-500/50',
          icon: 'text-purple-400',
          glow: 'shadow-[0_0_20px_rgba(147,51,234,0.3)]',
        };
    }
  };

  const styles = getStyles();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`
        relative overflow-hidden
        ${styles.bg} ${styles.border} ${styles.glow}
        backdrop-blur-md
        border rounded-lg
        p-4 pr-12
        min-w-[320px] max-w-[500px]
        cursor-pointer
        group
      `}
      onClick={() => onClose(toast.id)}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-30">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative flex items-start gap-3">
        {/* Icon */}
        <div className={`${styles.icon} flex-shrink-0 mt-0.5`}>
          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
          >
            {getIcon()}
          </motion.div>
        </div>

        {/* Message */}
        <div className="flex-1">
          <p className="text-white text-sm leading-relaxed">
            {toast.message}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose(toast.id);
          }}
          className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <motion.div
        className={`absolute bottom-0 left-0 h-1 ${
          toast.type === 'success' ? 'bg-green-400' :
          toast.type === 'error' ? 'bg-red-400' :
          toast.type === 'warning' ? 'bg-yellow-400' :
          'bg-purple-400'
        }`}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: (toast.duration || 5000) / 1000, ease: 'linear' }}
      />

      {/* Sparkle effect for success */}
      {toast.type === 'success' && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-green-400 rounded-full"
              initial={{ 
                x: Math.random() * 100 - 50, 
                y: Math.random() * 50,
                scale: 0,
                opacity: 1
              }}
              animate={{ 
                y: -50,
                scale: [0, 1, 0],
                opacity: [1, 1, 0]
              }}
              transition={{ 
                duration: 1.5,
                delay: i * 0.2,
                repeat: Infinity,
                repeatDelay: 1
              }}
              style={{
                left: `${20 + i * 30}%`,
                top: '50%'
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onClose={onClose} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

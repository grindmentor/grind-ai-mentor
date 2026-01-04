import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface GlobalLoadingIndicatorProps {
  isVisible: boolean;
  message?: string;
  variant?: 'bar' | 'overlay' | 'subtle';
}

/**
 * Global loading indicator that shows at the top of the screen
 * to indicate background operations without blocking UI
 */
export const GlobalLoadingIndicator: React.FC<GlobalLoadingIndicatorProps> = ({
  isVisible,
  message = 'Loading...',
  variant = 'bar'
}) => {
  if (variant === 'bar') {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="fixed top-0 left-0 right-0 z-[100] pointer-events-none"
            style={{ paddingTop: 'env(safe-area-inset-top)' }}
          >
            <div className="h-1 bg-muted overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5, 
                  ease: 'easeInOut' 
                }}
                style={{ width: '40%' }}
              />
            </div>
            {message && (
              <div className="px-4 py-1.5 bg-background/95 backdrop-blur-sm border-b border-border/30">
                <div className="flex items-center gap-2 max-w-2xl mx-auto">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">{message}</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (variant === 'subtle') {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[100] h-0.5 bg-muted overflow-hidden pointer-events-none"
            style={{ marginTop: 'env(safe-area-inset-top)' }}
          >
            <motion.div
              className="h-full bg-primary/50"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ 
                repeat: Infinity, 
                duration: 1, 
                ease: 'linear' 
              }}
              style={{ width: '30%' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Overlay variant
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center"
        >
          <div className="flex flex-col items-center gap-3 p-6">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Loading state wrapper that shows content or a loading placeholder
 */
interface LoadingWrapperProps {
  isLoading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minHeight?: string;
  showAfterMs?: number; // Delay before showing loader to prevent flicker
}

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  isLoading,
  children,
  fallback,
  minHeight = '100px',
  showAfterMs = 150
}) => {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShowLoading(true), showAfterMs);
      return () => clearTimeout(timer);
    } else {
      setShowLoading(false);
    }
  }, [isLoading, showAfterMs]);

  if (isLoading && showLoading) {
    return fallback || (
      <div 
        className="flex items-center justify-center"
        style={{ minHeight }}
      >
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
};

export default GlobalLoadingIndicator;

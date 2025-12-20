import { useCallback, useRef, useEffect } from 'react';
import { useReturnNavigation } from './useReturnNavigation';

interface ScrollToBackOptions {
  enabled?: boolean;
  threshold?: number;
  onBack?: () => void;
  fallbackPath?: string;
}

/**
 * Pull-to-go-back hook that respects returnTo state.
 */
export const useScrollToBack = (options: ScrollToBackOptions = {}) => {
  const { 
    enabled = true, 
    threshold = 80, 
    onBack, 
    fallbackPath = '/modules' 
  } = options;
  const { goBack } = useReturnNavigation({ fallbackPath, onBack });
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const isOverscrollingRef = useRef(false);
  const pulledRef = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;
    
    // Only track if at top of scroll
    if (container.scrollTop <= 0) {
      startYRef.current = e.touches[0].clientY;
      isOverscrollingRef.current = true;
      pulledRef.current = false;
    }
  }, [enabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || !isOverscrollingRef.current) return;
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) {
      isOverscrollingRef.current = false;
      return;
    }
    
    const deltaY = e.touches[0].clientY - startYRef.current;
    
    // Visual feedback for pull-to-go-back
    if (deltaY > 30) {
      const translateY = Math.min(deltaY * 0.4, 60);
      container.style.transform = `translateY(${translateY}px)`;
      container.style.transition = 'none';
      
      // Indicate ready to go back
      if (deltaY > threshold) {
        pulledRef.current = true;
        container.style.opacity = '0.8';
      } else {
        pulledRef.current = false;
        container.style.opacity = '1';
      }
    }
  }, [enabled, threshold]);

  const handleTouchEnd = useCallback(() => {
    if (!enabled || !isOverscrollingRef.current) return;
    const container = containerRef.current;
    if (!container) return;
    
    // Reset transform with smooth transition
    container.style.transform = '';
    container.style.opacity = '1';
    container.style.transition = 'transform 0.25s ease-out, opacity 0.25s ease-out';
    
    // Trigger back navigation if pulled far enough
    // Priority: onBack → returnTo → history → fallback (matches MobileHeader)
    if (pulledRef.current) {
      setTimeout(() => {
        goBack();
      }, 100);
    }
    
    isOverscrollingRef.current = false;
    pulledRef.current = false;
  }, [enabled, goBack]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  const scrollToTop = useCallback(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return { containerRef, scrollToTop };
};

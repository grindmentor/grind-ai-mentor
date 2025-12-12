import { useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ScrollToBackOptions {
  enabled?: boolean;
  threshold?: number;
  onBack?: () => void;
}

export const useScrollToBack = (options: ScrollToBackOptions = {}) => {
  const { enabled = true, threshold = -80, onBack } = options;
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const isOverscrollingRef = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;
    
    // Only track if at top of scroll
    if (container.scrollTop <= 0) {
      startYRef.current = e.touches[0].clientY;
      isOverscrollingRef.current = true;
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
    if (deltaY > 50) {
      container.style.transform = `translateY(${Math.min(deltaY * 0.3, 40)}px)`;
      container.style.transition = 'none';
    }
  }, [enabled]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!enabled || !isOverscrollingRef.current) return;
    const container = containerRef.current;
    if (!container) return;
    
    const deltaY = e.changedTouches[0].clientY - startYRef.current;
    
    // Reset transform
    container.style.transform = '';
    container.style.transition = 'transform 0.2s ease-out';
    
    // Trigger back navigation if pulled far enough
    if (deltaY > Math.abs(threshold)) {
      if (onBack) {
        onBack();
      } else {
        navigate(-1);
      }
    }
    
    isOverscrollingRef.current = false;
  }, [enabled, threshold, onBack, navigate]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  const scrollToTop = useCallback(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return { containerRef, scrollToTop };
};

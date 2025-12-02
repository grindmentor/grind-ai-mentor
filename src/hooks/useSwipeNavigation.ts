import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMobileEnhancements } from './useMobileEnhancements';

interface SwipeNavigationOptions {
  enabled?: boolean;
  threshold?: number;
  edgeWidth?: number;
}

export const useSwipeNavigation = (options: SwipeNavigationOptions = {}) => {
  const { enabled = true, threshold = 80, edgeWidth = 30 } = options;
  const navigate = useNavigate();
  const { hapticFeedback } = useMobileEnhancements();
  
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isEdgeSwipeRef = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;
    
    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    startYRef.current = touch.clientY;
    
    // Check if swipe started from edge (for back navigation)
    isEdgeSwipeRef.current = touch.clientX < edgeWidth;
  }, [enabled, edgeWidth]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!enabled) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startXRef.current;
    const deltaY = touch.clientY - startYRef.current;
    
    // Only trigger if horizontal swipe is dominant
    if (Math.abs(deltaX) < Math.abs(deltaY)) return;
    
    // Back navigation (swipe right from edge)
    if (isEdgeSwipeRef.current && deltaX > threshold) {
      hapticFeedback('light');
      navigate(-1);
    }
  }, [enabled, threshold, navigate, hapticFeedback]);

  useEffect(() => {
    if (!enabled) return;
    
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchEnd]);
};

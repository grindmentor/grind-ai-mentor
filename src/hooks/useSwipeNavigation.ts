import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMobileEnhancements } from './useMobileEnhancements';

interface SwipeNavigationOptions {
  enabled?: boolean;
  threshold?: number;
  edgeWidth?: number;
  fallbackPath?: string;
}

/**
 * Swipe navigation hook that respects returnTo state.
 * Swipe right from left edge triggers back navigation.
 */
export const useSwipeNavigation = (options: SwipeNavigationOptions = {}) => {
  const { enabled = true, threshold = 80, edgeWidth = 30, fallbackPath = '/modules' } = options;
  const navigate = useNavigate();
  const location = useLocation();
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
      
      // Respect returnTo state
      const state = location.state as { returnTo?: string } | null;
      if (state?.returnTo) {
        navigate(state.returnTo);
      } else if (window.history.length > 2) {
        navigate(-1);
      } else {
        navigate(fallbackPath);
      }
    }
  }, [enabled, threshold, navigate, hapticFeedback, location.state, fallbackPath]);

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

import { useEffect, useRef, useState } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPullToRefresh?: () => void;
  threshold?: number;
  preventScroll?: boolean;
}

export const useMobileGestures = (options: SwipeGestureOptions = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPullToRefresh,
    threshold = 50,
    preventScroll = false
  } = options;

  const elementRef = useRef<HTMLElement | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let startX = 0;
    let startY = 0;
    let startTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
      
      setStartY(startY);
      setCurrentY(startY);
      setIsDragging(true);

      if (preventScroll) {
        e.preventDefault();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      setCurrentY(currentY);

      // Pull to refresh logic
      if (onPullToRefresh && element.scrollTop === 0 && currentY > startY + 50) {
        e.preventDefault();
        setIsRefreshing(true);
      }

      if (preventScroll) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isDragging) return;
      setIsDragging(false);

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = Date.now() - startTime;

      // Ignore if touch was too slow or too short
      if (deltaTime > 500 || (Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold)) {
        setIsRefreshing(false);
        return;
      }

      // Determine swipe direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > threshold && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < -threshold && onSwipeLeft) {
          onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (deltaY > threshold && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < -threshold && onSwipeUp) {
          onSwipeUp();
        }
      }

      // Handle pull to refresh
      if (isRefreshing && onPullToRefresh && deltaY > 100) {
        onPullToRefresh();
        setTimeout(() => setIsRefreshing(false), 1000);
      } else {
        setIsRefreshing(false);
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: !preventScroll });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventScroll });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPullToRefresh,
    threshold,
    preventScroll,
    isDragging,
    isRefreshing
  ]);

  return {
    elementRef,
    isRefreshing,
    isDragging,
    pullDistance: Math.max(0, currentY - startY)
  };
};
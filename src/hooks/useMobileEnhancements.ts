
import { useEffect, useRef, useState } from 'react';

interface TouchState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  duration: number;
  velocity: number;
}

interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
}

export const useMobileEnhancements = () => {
  const [touchState, setTouchState] = useState<TouchState | null>(null);
  const [isPortrait, setIsPortrait] = useState(true);
  const [safeArea, setSafeArea] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });

  // Detect orientation changes
  useEffect(() => {
    const handleOrientationChange = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
      
      // Force layout recalculation after orientation change
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    };

    handleOrientationChange();
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  // Calculate safe areas for notches/home indicators
  useEffect(() => {
    const updateSafeArea = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      setSafeArea({
        top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
        left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0'),
        right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0')
      });
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);

    return () => window.removeEventListener('resize', updateSafeArea);
  }, []);

  // Enhanced touch handling
  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    setTouchState({
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX: 0,
      deltaY: 0,
      duration: 0,
      velocity: 0
    });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!touchState) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchState.startX;
    const deltaY = touch.clientY - touchState.startY;
    
    setTouchState(prev => prev ? {
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX,
      deltaY
    } : null);
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchState) return;
    
    const duration = Date.now() - (e.timeStamp || Date.now());
    const distance = Math.sqrt(touchState.deltaX ** 2 + touchState.deltaY ** 2);
    const velocity = distance / duration;
    
    setTouchState(prev => prev ? {
      ...prev,
      duration,
      velocity
    } : null);
  };

  // Swipe gesture detection
  const detectSwipe = (onSwipe: (gesture: SwipeGesture) => void) => {
    if (!touchState || touchState.velocity < 0.5) return;
    
    const { deltaX, deltaY, velocity } = touchState;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    
    if (absX > absY && absX > 50) {
      onSwipe({
        direction: deltaX > 0 ? 'right' : 'left',
        distance: absX,
        velocity
      });
    } else if (absY > absX && absY > 50) {
      onSwipe({
        direction: deltaY > 0 ? 'down' : 'up',
        distance: absY,
        velocity
      });
    }
  };

  // Haptic feedback
  const hapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 50,
        heavy: 100
      };
      navigator.vibrate(patterns[type]);
    }
  };

  // Prevent zoom on double tap
  useEffect(() => {
    let lastTouchEnd = 0;
    
    const preventZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchend', preventZoom, { passive: false });
    
    return () => document.removeEventListener('touchend', preventZoom);
  }, []);

  return {
    touchState,
    isPortrait,
    safeArea,
    detectSwipe,
    hapticFeedback,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
};

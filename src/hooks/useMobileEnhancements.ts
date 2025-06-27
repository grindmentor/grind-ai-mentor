
import { useEffect, useRef, useState, useCallback } from 'react';

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
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);

  // Enhanced orientation detection
  useEffect(() => {
    const handleOrientationChange = () => {
      // Use multiple methods to detect orientation
      const isPortraitMode = window.innerHeight > window.innerWidth;
      const orientation = screen.orientation?.angle || 0;
      const isPortraitOrientation = orientation === 0 || orientation === 180;
      
      setIsPortrait(isPortraitMode || isPortraitOrientation);
      
      // Delay layout recalculation to allow for proper orientation change
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        updateViewportHeight();
      }, 150);
    };

    const updateViewportHeight = () => {
      const vh = window.innerHeight;
      setViewportHeight(vh);
      // Update CSS custom property for consistent viewport height
      document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`);
    };

    handleOrientationChange();
    updateViewportHeight();

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('resize', updateViewportHeight);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('resize', updateViewportHeight);
    };
  }, []);

  // Enhanced safe area calculation
  useEffect(() => {
    const updateSafeArea = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      
      // Try to get safe area values, fallback to 0
      const getEnvValue = (property: string) => {
        const value = computedStyle.getPropertyValue(property) || '0px';
        return parseInt(value.replace('px', '')) || 0;
      };

      setSafeArea({
        top: getEnvValue('env(safe-area-inset-top)'),
        bottom: getEnvValue('env(safe-area-inset-bottom)'),
        left: getEnvValue('env(safe-area-inset-left)'),
        right: getEnvValue('env(safe-area-inset-right)')
      });
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);

    return () => window.removeEventListener('resize', updateSafeArea);
  }, []);

  // Enhanced keyboard detection
  useEffect(() => {
    const initialHeight = window.innerHeight;
    
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialHeight - currentHeight;
      
      // Keyboard is likely open if height decreased significantly
      const keyboardThreshold = 150;
      setIsKeyboardOpen(heightDifference > keyboardThreshold);
    };

    window.addEventListener('resize', handleResize);
    
    // Also listen for visual viewport changes (more accurate on mobile)
    if ('visualViewport' in window) {
      const visualViewport = window.visualViewport!;
      visualViewport.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        visualViewport.removeEventListener('resize', handleResize);
      };
    }

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Enhanced touch handling with better performance
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    const now = Date.now();
    
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
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
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
  }, [touchState]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchState) return;
    
    const now = Date.now();
    const duration = now - (e.timeStamp || now);
    const distance = Math.sqrt(touchState.deltaX ** 2 + touchState.deltaY ** 2);
    const velocity = distance / (duration || 1);
    
    setTouchState(prev => prev ? {
      ...prev,
      duration,
      velocity
    } : null);
  }, [touchState]);

  // Enhanced swipe gesture detection
  const detectSwipe = useCallback((onSwipe: (gesture: SwipeGesture) => void, options = {}) => {
    if (!touchState || touchState.velocity < 0.3) return;
    
    const { deltaX, deltaY, velocity } = touchState;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const minDistance = 30;
    
    if (absX > absY && absX > minDistance) {
      onSwipe({
        direction: deltaX > 0 ? 'right' : 'left',
        distance: absX,
        velocity
      });
    } else if (absY > absX && absY > minDistance) {
      onSwipe({
        direction: deltaY > 0 ? 'down' : 'up',
        distance: absY,
        velocity
      });
    }
  }, [touchState]);

  // Enhanced haptic feedback with fallbacks
  const hapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
    // Try modern Vibration API first
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [50],
        heavy: [100],
        success: [10, 10, 10],
        warning: [50, 30, 50],
        error: [100, 50, 100]
      };
      
      try {
        navigator.vibrate(patterns[type]);
      } catch (error) {
        console.warn('Vibration not supported:', error);
      }
    }
    
    // Try Web Vibration API as fallback
    if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
      const simplePatterns = {
        light: 10,
        medium: 50,
        heavy: 100,
        success: 20,
        warning: 40,
        error: 80
      };
      
      try {
        navigator.vibrate(simplePatterns[type]);
      } catch (error) {
        console.warn('Simple vibration not supported:', error);
      }
    }
  }, []);

  // Enhanced zoom prevention
  useEffect(() => {
    let lastTouchEnd = 0;
    
    const preventZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    const preventPinchZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Prevent double-tap zoom
    document.addEventListener('touchend', preventZoom, { passive: false });
    
    // Prevent pinch zoom
    document.addEventListener('touchmove', preventPinchZoom, { passive: false });
    
    return () => {
      document.removeEventListener('touchend', preventZoom);
      document.removeEventListener('touchmove', preventPinchZoom);
    };
  }, []);

  // Scroll lock utility
  const lockScroll = useCallback(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
  }, []);

  const unlockScroll = useCallback(() => {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
  }, []);

  return {
    touchState,
    isPortrait,
    safeArea,
    isKeyboardOpen,
    viewportHeight,
    detectSwipe,
    hapticFeedback,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    lockScroll,
    unlockScroll
  };
};

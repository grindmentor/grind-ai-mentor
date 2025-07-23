import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileEnhancements } from '@/hooks/useMobileEnhancements';

interface NativeAppWrapperProps {
  children: React.ReactNode;
  className?: string;
  enableHaptics?: boolean;
  enableGestures?: boolean;
  hideStatusBar?: boolean;
}

export const NativeAppWrapper: React.FC<NativeAppWrapperProps> = ({
  children,
  className,
  enableHaptics = true,
  enableGestures = true,
  hideStatusBar = true
}) => {
  const isMobile = useIsMobile();
  const [isLoaded, setIsLoaded] = useState(false);
  
  const {
    isPortrait,
    isKeyboardOpen,
    safeArea,
    hapticFeedback,
    lockScroll,
    unlockScroll
  } = useMobileEnhancements();

  useEffect(() => {
    // Native app initialization
    setIsLoaded(true);
    
    // Add native app meta tags
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
      );
    }

    // Add status bar meta for iOS
    const statusBarMeta = document.createElement('meta');
    statusBarMeta.name = 'apple-mobile-web-app-status-bar-style';
    statusBarMeta.content = hideStatusBar ? 'black-translucent' : 'default';
    document.head.appendChild(statusBarMeta);

    // Add theme color
    const themeColor = document.createElement('meta');
    themeColor.name = 'theme-color';
    themeColor.content = '#000000';
    document.head.appendChild(themeColor);

    // Prevent pull-to-refresh on mobile
    document.body.style.overscrollBehavior = 'none';
    
    return () => {
      document.body.style.overscrollBehavior = 'auto';
    };
  }, [hideStatusBar]);

  // Add global touch feedback
  useEffect(() => {
    if (!enableHaptics || !isMobile) return;

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button') || target.closest('[role="button"]')) {
        hapticFeedback('light');
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    return () => document.removeEventListener('touchstart', handleTouchStart);
  }, [enableHaptics, isMobile, hapticFeedback]);

  return (
    <div 
      className={cn(
        "min-h-screen bg-background text-foreground",
        "relative overflow-hidden",
        // Native app styling
        "no-select touch-manipulation",
        // Safe area support
        "pt-safe pl-safe pr-safe pb-safe",
        // Smooth transitions
        "transition-all duration-300 ease-out",
        // Performance optimizations
        "gpu-accelerated",
        // Keyboard adjustments
        isKeyboardOpen && "pb-0",
        className
      )}
      style={{
        // Dynamic safe area support
        paddingTop: `max(${safeArea.top}px, env(safe-area-inset-top))`,
        paddingBottom: isKeyboardOpen ? '0px' : `max(${safeArea.bottom}px, env(safe-area-inset-bottom))`,
        paddingLeft: `max(${safeArea.left}px, env(safe-area-inset-left))`,
        paddingRight: `max(${safeArea.right}px, env(safe-area-inset-right))`,
        // Prevent overscroll
        overscrollBehavior: 'none',
        // Native app feel
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Status bar placeholder for iOS */}
      {isMobile && hideStatusBar && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 bg-background"
          style={{ height: safeArea.top }}
        />
      )}
      
      {/* App content */}
      <div 
        className={cn(
          "flex flex-col min-h-screen",
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      >
        {children}
      </div>
    </div>
  );
};
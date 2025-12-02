import React, { useState, useRef, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { RefreshSkeleton } from './refresh-skeleton';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  showSkeleton?: boolean;
  skeletonVariant?: 'dashboard' | 'card' | 'list' | 'module';
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  threshold = 80,
  showSkeleton = true,
  skeletonVariant = 'dashboard'
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0 && !isRefreshing) {
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    
    if (diff > 0 && containerRef.current?.scrollTop === 0) {
      // Apply resistance to pull
      const resistance = 0.4;
      setPullDistance(Math.min(diff * resistance, threshold * 1.5));
    }
  }, [isRefreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold);
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        try { navigator.vibrate(20); } catch {}
      }
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = isRefreshing ? 0 : progress * 180;

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-50 flex items-center justify-center transition-opacity duration-200"
        style={{
          top: Math.max(pullDistance - 40, -40),
          opacity: progress,
        }}
      >
        <div className={`p-2 rounded-full bg-primary/20 backdrop-blur-sm ${isRefreshing ? 'animate-spin' : ''}`}>
          <RefreshCw
            className="w-5 h-5 text-primary transition-transform"
            style={{ transform: `rotate(${rotation}deg)` }}
          />
        </div>
      </div>

      {/* Content with transform */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : 'none',
          transitionDuration: isPulling.current ? '0ms' : '200ms',
        }}
      >
        {/* Show skeleton overlay during refresh */}
        {isRefreshing && showSkeleton ? (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-40 p-4 overflow-hidden">
            <RefreshSkeleton variant={skeletonVariant} />
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
};

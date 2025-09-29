import { useState, useEffect, useRef, useMemo } from 'react';

interface UseVirtualScrollProps {
  itemCount: number;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface VirtualScrollResult {
  virtualItems: Array<{
    index: number;
    offsetTop: number;
  }>;
  totalHeight: number;
  scrollToIndex: (index: number) => void;
}

/**
 * Virtual scrolling hook for rendering large lists efficiently
 * Only renders visible items + overscan buffer
 */
export function useVirtualScroll({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 3
}: UseVirtualScrollProps): VirtualScrollResult {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLElement | null>(null);

  // Calculate visible range
  const { startIndex, endIndex, virtualItems } = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      itemCount - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const virtualItems = [];
    for (let i = startIndex; i <= endIndex; i++) {
      virtualItems.push({
        index: i,
        offsetTop: i * itemHeight
      });
    }

    return { startIndex, endIndex, virtualItems };
  }, [scrollTop, itemCount, itemHeight, containerHeight, overscan]);

  const totalHeight = itemCount * itemHeight;

  // Handle scroll with RAF for performance
  useEffect(() => {
    const element = scrollElementRef.current;
    if (!element) return;

    let rafId: number;
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        setScrollTop(element.scrollTop);
      });
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      element.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const scrollToIndex = (index: number) => {
    const element = scrollElementRef.current;
    if (!element) return;

    const offset = index * itemHeight;
    element.scrollTo({
      top: offset,
      behavior: 'smooth'
    });
  };

  return {
    virtualItems,
    totalHeight,
    scrollToIndex
  };
}

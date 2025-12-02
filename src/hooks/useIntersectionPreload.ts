import { useEffect, useRef, useCallback } from 'react';
import { preloadRoute } from '@/utils/routePreloader';

interface PreloadOptions {
  rootMargin?: string;
  threshold?: number;
}

/**
 * Hook to preload routes when elements come into viewport
 * Useful for preloading routes before user scrolls to a section
 */
export function useIntersectionPreload(
  routes: string[],
  options: PreloadOptions = {}
) {
  const elementRef = useRef<HTMLElement>(null);
  const hasPreloaded = useRef(false);

  useEffect(() => {
    if (!elementRef.current || hasPreloaded.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasPreloaded.current) {
            hasPreloaded.current = true;
            routes.forEach(route => preloadRoute(route));
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: options.rootMargin || '100px',
        threshold: options.threshold || 0,
      }
    );

    observer.observe(elementRef.current);

    return () => observer.disconnect();
  }, [routes, options.rootMargin, options.threshold]);

  return elementRef;
}

/**
 * Hook to lazy load images when they come into viewport
 */
export function useLazyImage(src: string, placeholder?: string) {
  const imgRef = useRef<HTMLImageElement>(null);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!imgRef.current || hasLoaded.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasLoaded.current) {
            hasLoaded.current = true;
            if (imgRef.current) {
              imgRef.current.src = src;
            }
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px' }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [src]);

  return { ref: imgRef, placeholder };
}

/**
 * Hook to detect when user is about to scroll to an area
 * Preloads content before they get there
 */
export function usePredictivePreload(callback: () => void) {
  const hasTriggered = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (hasTriggered.current) return;

      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const clientHeight = window.innerHeight;

      // Trigger when user has scrolled 50% of the page
      if (scrollTop + clientHeight > scrollHeight * 0.5) {
        hasTriggered.current = true;
        callback();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [callback]);
}

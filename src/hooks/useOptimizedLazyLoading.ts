
import { useEffect, useRef, useState, useCallback } from 'react';

interface LazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useOptimizedLazyLoading = (options: LazyLoadOptions = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const { threshold = 0.1, rootMargin = '50px', triggerOnce = true } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Use requestIdleCallback for better performance
    const scheduleObserver = () => {
      if ('IntersectionObserver' in window) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setIsVisible(true);
                
                // Defer loading slightly to improve perceived performance
                requestAnimationFrame(() => {
                  setIsLoaded(true);
                });

                if (triggerOnce && observerRef.current) {
                  observerRef.current.unobserve(element);
                }
              }
            });
          },
          {
            threshold,
            rootMargin,
          }
        );

        observerRef.current.observe(element);
      } else {
        // Fallback for browsers without Intersection Observer
        setIsVisible(true);
        setIsLoaded(true);
      }
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(scheduleObserver, { timeout: 2000 });
    } else {
      setTimeout(scheduleObserver, 0);
    }

    return () => {
      if (observerRef.current && element) {
        observerRef.current.unobserve(element);
      }
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { elementRef, isVisible, isLoaded };
};

// Enhanced image lazy loading hook
export const useOptimizedImageLoading = (src: string, options: LazyLoadOptions = {}) => {
  const { elementRef, isVisible, isLoaded } = useOptimizedLazyLoading(options);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isVisible && !imageSrc && src) {
      // Preload image
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setImageLoaded(true);
      };
      img.onerror = () => {
        setError(true);
      };
      img.src = src;
    }
  }, [isVisible, src, imageSrc]);

  return {
    elementRef,
    imageSrc,
    imageLoaded,
    error,
    isVisible,
    isLoaded
  };
};

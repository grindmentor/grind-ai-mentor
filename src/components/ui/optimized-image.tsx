
import React, { useState, useCallback, memo, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  priority?: boolean;
  fallback?: string;
  lazy?: boolean;
}

const OptimizedImage = memo<OptimizedImageProps>(({
  src,
  alt,
  width,
  height,
  quality = 80,
  priority = false,
  fallback = '/placeholder-image.svg',
  lazy = true,
  className,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px', // Load when 50px before entering viewport
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy, priority, isInView]);

  // Check WebP support
  const supportsWebP = useCallback(() => {
    if (typeof window === 'undefined') return false;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    } catch {
      return false;
    }
  }, []);

  // Generate optimized image URL
  const getOptimizedSrc = useCallback((originalSrc: string) => {
    if (originalSrc.startsWith('data:') || originalSrc.startsWith('blob:')) {
      return originalSrc;
    }

    // For external URLs or specific formats, return as-is
    if (originalSrc.startsWith('http') && !originalSrc.includes('lovable-uploads')) {
      return originalSrc;
    }

    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('q', quality.toString());
    
    if (supportsWebP()) {
      params.set('fm', 'webp');
    }

    const separator = originalSrc.includes('?') ? '&' : '?';
    return `${originalSrc}${separator}${params.toString()}`;
  }, [width, height, quality, supportsWebP]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true); // Consider error state as "loaded" to hide placeholder
  }, []);

  const imageSrc = hasError ? fallback : getOptimizedSrc(src);

  // Don't render image until it's in view (for lazy loading)
  if (!isInView) {
    return (
      <div 
        ref={imgRef}
        className={cn("bg-gray-800 animate-pulse", className)}
        style={{ 
          aspectRatio: width && height ? `${width}/${height}` : undefined,
          width: width ? `${width}px` : undefined,
          height: height ? `${height}px` : undefined
        }}
      />
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300 object-cover",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        {...props}
      />
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center"
          style={{ aspectRatio: width && height ? `${width}/${height}` : undefined }}
        >
          <div className="w-8 h-8 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = "OptimizedImage";

export { OptimizedImage };

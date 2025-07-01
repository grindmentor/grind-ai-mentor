
import React, { useState, useCallback, memo } from 'react';
import { cn } from '@/lib/utils';
import { usePerformanceContext } from './performance-provider';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  priority?: boolean;
  fallback?: string;
}

const OptimizedImage = memo<OptimizedImageProps>(({
  src,
  alt,
  width,
  height,
  quality,
  priority = false,
  fallback,
  className,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { optimizedSettings } = usePerformanceContext();

  // Use connection-aware quality settings
  const finalQuality = quality || optimizedSettings.imageQuality;
  const finalWidth = width || optimizedSettings.imageWidth;

  // Check WebP support (cached)
  const supportsWebP = useCallback(() => {
    try {
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    } catch {
      return false;
    }
  }, []);

  // Generate optimized image URL with connection awareness
  const getOptimizedSrc = useCallback((originalSrc: string) => {
    if (originalSrc.startsWith('data:') || originalSrc.startsWith('blob:')) {
      return originalSrc;
    }

    const params = new URLSearchParams();
    if (finalWidth) params.set('w', finalWidth.toString());
    if (height) params.set('h', height.toString());
    params.set('q', finalQuality.toString());
    
    // Only use WebP for fast connections unless explicitly disabled
    if (optimizedSettings.useWebP && supportsWebP()) {
      params.set('fm', 'webp');
    }

    const separator = originalSrc.includes('?') ? '&' : '?';
    return `${originalSrc}${separator}${params.toString()}`;
  }, [finalWidth, height, finalQuality, optimizedSettings.useWebP, supportsWebP]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    if (fallback) {
      setIsLoaded(true);
    }
  }, [fallback]);

  const imageSrc = hasError && fallback ? fallback : getOptimizedSrc(src);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        src={imageSrc}
        alt={alt}
        width={finalWidth}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity",
          optimizedSettings.reduceAnimations ? "duration-150" : "duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        {...props}
      />
      {!isLoaded && !hasError && (
        <div 
          className={cn(
            "absolute inset-0 bg-gray-800",
            optimizedSettings.reduceAnimations ? "" : "animate-pulse"
          )}
          style={{ aspectRatio: finalWidth && height ? `${finalWidth}/${height}` : undefined }}
        />
      )}
    </div>
  );
});

OptimizedImage.displayName = "OptimizedImage";

export { OptimizedImage };

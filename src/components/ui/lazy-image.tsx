import React, { useState, useRef, useEffect, memo } from 'react';
import { cn } from '@/lib/utils';

/**
 * Pre-defined blur placeholders for common images
 * Generated from tiny base64 versions for instant display
 */
export const BLUR_PLACEHOLDERS = {
  // Default gray gradient placeholder
  default: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAUABQDASIAAhEBAxEB/8QAGAAAAgMAAAAAAAAAAAAAAAAAAAYEBQf/xAAjEAACAQQBBAMBAAAAAAAAAAABAgMABAUREhMhMUEiUWFx/8QAFgEBAQEAAAAAAAAAAAAAAAAAAwQF/8QAHBEAAgIDAQEAAAAAAAAAAAAAAQIAAxEhMQQS/9oADAMBAAIRAxEAPwDTcpiLq6yAnhuGgQqCGRgTv9FU+fyV9j7qOKG+eNXTekytyU/laPJYu2mlMskKs57kkfNIGVwVrdXCzSQgyL4O/Fc/5Y/f1S05U7mfZarYQDCc/9k=',
  // Anatomy/muscle image - warm skin tone blur
  anatomy: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAUABQDASIAAhEBAxEB/8QAGQAAAgMBAAAAAAAAAAAAAAAAAAUDBAYH/8QAJBAAAgIBAwQCAwAAAAAAAAAAAQIDBBEABSEGEjFBE1EiYXH/xAAWAQEBAQAAAAAAAAAAAAAAAAADAgT/xAAbEQACAgMBAAAAAAAAAAAAAAABAgADBBESIf/aAAwDAQACEQMRAD8A6Hd3K1t9OjLPHDLLG0kckhwrspBUE/R86oU+orU9OvYassdqGVwYzG3A+iCfGq/VlKS7tMlaSaSOtEwkljjYqZGIwASPpf8AdY7brVLb9qp1KdeKvDFEFSOMYUa8+f7O5+y8jTuuItdQ6nPWlpwmUcfI7cmzp9uqdsNO+rO00rLHBEGlkY4VFHkk6NGiZxA0kydhOyMfZ/Z/9tz/2Q==',
  // Food/meal placeholder - warm colors
  food: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAUABQDASIAAhEBAxEB/8QAGQAAAgMBAAAAAAAAAAAAAAAAAAUCAwYH/8QAJhAAAgEDAwMEAwAAAAAAAAAAAQIDAAQRBRIhEzFBBiJRYRRxgf/EABYBAQEBAAAAAAAAAAAAAAAAAAQDAP/EAB0RAAICAgMBAAAAAAAAAAAAAAECAAMEESExQVH/2gAMAwEAAhEDEQA/AOg6lrF1Z6m9vBbxyRqBhmJGTiqdR1q+nsJYobONZHUqrF85JHHasz6h1C4tNZuYbdykasAqjsAQD/a0WjXk9zpltNcMHlkjV3YAAFiMk4H7q/jYVdqkHvJM2W4YB/BNYakZZ5FaJUCMQADnI+TWO9R65fWOqSW1rDG8Sg5ZgcmtLqOo2OnkLeXcMDH+xXZj/BWN1vVtNuNSlntLyGVHYFTG4I4+anuyKm4oVeoPGDuB3P/Z'
};

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  blurPlaceholder?: string; // Base64 blur data URL
  aspectRatio?: string;
  priority?: boolean;
  onLoadComplete?: () => void;
}

export const LazyImage = memo<LazyImageProps>(({
  src,
  alt,
  placeholder,
  blurPlaceholder,
  aspectRatio,
  priority = false,
  className,
  onLoadComplete,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0.01
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoadComplete?.();
  };

  const handleError = () => {
    setHasError(true);
  };

  // Generate srcset for responsive images
  const generateSrcSet = (baseSrc: string) => {
    if (baseSrc.startsWith('data:') || baseSrc.startsWith('blob:')) {
      return undefined;
    }
    // Only generate srcset for images that might benefit from it
    const sizes = [320, 640, 768, 1024, 1280];
    const separator = baseSrc.includes('?') ? '&' : '?';
    return sizes.map(size => `${baseSrc}${separator}w=${size} ${size}w`).join(', ');
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-muted",
        className
      )}
      style={{ aspectRatio }}
    >
      {/* Blur placeholder with blur-up effect */}
      {blurPlaceholder && !isLoaded && !hasError && (
        <div 
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            backgroundImage: `url(${blurPlaceholder})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px)',
            transform: 'scale(1.1)' // Prevent blur edge artifacts
          }}
          aria-hidden="true"
        />
      )}

      {/* Shimmer placeholder (when no blur placeholder) */}
      {!blurPlaceholder && !isLoaded && !hasError && (
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer",
            placeholder && "bg-cover bg-center"
          )}
          style={placeholder ? { backgroundImage: `url(${placeholder})` } : undefined}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-muted-foreground text-sm">Failed to load</span>
        </div>
      )}

      {/* Actual image */}
      {isInView && !hasError && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          srcSet={generateSrcSet(src)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          {...props}
        />
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;

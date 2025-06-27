
// Lightweight image loading utilities
export const createLazyImage = (src: string, alt: string, className?: string) => {
  const img = document.createElement('img');
  img.loading = 'lazy';
  img.decoding = 'async';
  img.src = src;
  img.alt = alt;
  if (className) img.className = className;
  
  // Add intersection observer for very lazy loading
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    }, { 
      rootMargin: '50px',
      threshold: 0.1 
    });
    
    observer.observe(img);
  }
  
  return img;
};

// Compress images on the client side for uploads
export const compressImage = (file: File, quality: number = 0.7, maxWidth: number = 800): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        } else {
          resolve(file); // Fallback to original
        }
      }, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Preload critical images
export const preloadCriticalImages = (urls: string[]) => {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      urls.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = url;
        document.head.appendChild(link);
      });
    });
  }
};

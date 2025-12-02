/**
 * Image compression utility for client-side image optimization
 * Reduces file size before upload to save bandwidth and storage
 */

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1, default 0.8
  outputFormat?: 'jpeg' | 'webp';
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  outputFormat: 'webp'
};

/**
 * Compress an image file using Canvas API
 * Returns a new compressed File object
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const { maxWidth, maxHeight, quality, outputFormat } = { ...DEFAULT_OPTIONS, ...options };

  // Skip compression for small files (< 100KB)
  if (file.size < 100 * 1024) {
    console.log('Image already small, skipping compression');
    return file;
  }

  // Skip non-image files
  if (!file.type.startsWith('image/')) {
    console.warn('Not an image file, skipping compression');
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth! || height > maxHeight!) {
        const ratio = Math.min(maxWidth! / width, maxHeight! / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      // Use better image smoothing for quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      const mimeType = outputFormat === 'webp' ? 'image/webp' : 'image/jpeg';
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }

          // Generate new filename with correct extension
          const ext = outputFormat === 'webp' ? 'webp' : 'jpg';
          const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
          const newFile = new File([blob], `${nameWithoutExt}.${ext}`, {
            type: mimeType,
            lastModified: Date.now()
          });

          const compressionRatio = ((file.size - newFile.size) / file.size * 100).toFixed(1);
          console.log(`Image compressed: ${(file.size / 1024).toFixed(1)}KB → ${(newFile.size / 1024).toFixed(1)}KB (${compressionRatio}% reduction)`);

          resolve(newFile);
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    // Create object URL from file
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Generate a tiny blur placeholder (base64) for an image
 * Used for blur-up loading effect
 */
export async function generateBlurPlaceholder(
  file: File,
  size: number = 20
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      // Create tiny version for blur
      const ratio = img.width / img.height;
      canvas.width = size;
      canvas.height = Math.round(size / ratio);

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Return as base64 data URL
      resolve(canvas.toDataURL('image/jpeg', 0.5));
    };

    img.onerror = () => {
      // Return empty placeholder on error
      resolve('');
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Check if WebP is supported in the browser
 */
export function isWebPSupported(): boolean {
  const canvas = document.createElement('canvas');
  return canvas.toDataURL('image/webp').startsWith('data:image/webp');
}

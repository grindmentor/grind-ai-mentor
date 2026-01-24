import { supabase } from "@/integrations/supabase/client";

/**
 * Image compression utility for optimizing user uploads
 * Supports both client-side (Canvas API) and server-side (Edge Function) optimization
 * Reduces file size while maintaining acceptable quality
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
 * High-quality preset optimized for OCR and text recognition tasks.
 * Higher resolution + quality preserves small text on labels.
 */
export const HIGH_QUALITY_OPTIONS: CompressionOptions = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 0.92,
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

/**
 * Server-side image optimization via Edge Function
 * Provides consistent compression across all devices
 */
export async function optimizeImageServerSide(
  file: File,
  options: CompressionOptions = {}
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('quality', (options.quality || 0.8).toString());
    formData.append('maxWidth', (options.maxWidth || 1920).toString());
    formData.append('maxHeight', (options.maxHeight || 1920).toString());

    const { data, error } = await supabase.functions.invoke('optimize-image', {
      body: formData,
    });

    if (error) {
      console.error('Server-side optimization error:', error);
      return { success: false, error: error.message };
    }

    console.log('Server-side optimization result:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Failed to call optimize-image function:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Hybrid optimization: tries server-side first, falls back to client-side
 * Ensures consistent WebP conversion across all devices
 */
export async function optimizeImageHybrid(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  // For small files, skip optimization
  if (file.size < 100 * 1024) {
    console.log('Image already small, skipping optimization');
    return file;
  }

  // Try client-side compression (more reliable and faster)
  try {
    const compressed = await compressImage(file, options);
    return compressed;
  } catch (err) {
    console.warn('Client-side compression failed, returning original:', err);
    return file;
  }
}

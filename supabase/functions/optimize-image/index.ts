import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory rate limiter
const rateLimiter = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // requests per minute (lower for image processing)
const RATE_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB max

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimiter.get(ip);

  // Cleanup old entries periodically
  if (rateLimiter.size > 5000) {
    for (const [key, value] of rateLimiter.entries()) {
      if (value.resetTime < now) {
        rateLimiter.delete(key);
      }
    }
  }

  if (!record || record.resetTime < now) {
    rateLimiter.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         req.headers.get('x-real-ip') ||
         'unknown';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting
  const clientIP = getClientIP(req);
  if (!checkRateLimit(clientIP)) {
    console.warn(`Rate limit exceeded for IP: ${clientIP}`);
    return new Response(JSON.stringify({ 
      error: 'Rate limit exceeded. Please try again later.',
      success: false 
    }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    
    let imageData: ArrayBuffer;
    let quality = 0.8;
    let maxWidth = 1920;
    let maxHeight = 1920;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('image') as File;
      
      if (!file) {
        throw new Error('No image provided');
      }

      // Validate file size
      if (file.size > MAX_IMAGE_SIZE) {
        return new Response(JSON.stringify({ 
          error: `Image too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
          success: false 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      quality = Math.min(Math.max(parseFloat(formData.get('quality') as string) || 0.8, 0.1), 1.0);
      maxWidth = Math.min(Math.max(parseInt(formData.get('maxWidth') as string) || 1920, 100), 4096);
      maxHeight = Math.min(Math.max(parseInt(formData.get('maxHeight') as string) || 1920, 100), 4096);
      
      imageData = await file.arrayBuffer();
    } else if (contentType.includes('application/json')) {
      const body = await req.json();
      
      if (!body.imageBase64) {
        throw new Error('No image data provided');
      }

      // Validate base64 length (rough size estimate)
      if (body.imageBase64.length > MAX_IMAGE_SIZE * 1.4) {
        return new Response(JSON.stringify({ 
          error: `Image too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
          success: false 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      quality = Math.min(Math.max(body.quality || 0.8, 0.1), 1.0);
      maxWidth = Math.min(Math.max(body.maxWidth || 1920, 100), 4096);
      maxHeight = Math.min(Math.max(body.maxHeight || 1920, 100), 4096);
      
      // Decode base64
      const base64Data = body.imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      imageData = bytes.buffer;
    } else {
      throw new Error('Invalid content type. Use multipart/form-data or application/json');
    }

    console.log(`Processing image: ${imageData.byteLength} bytes, quality: ${quality}, max: ${maxWidth}x${maxHeight}`);

    const inputBytes = new Uint8Array(imageData);
    
    // Detect image format from magic bytes
    const isJPEG = inputBytes[0] === 0xFF && inputBytes[1] === 0xD8;
    const isPNG = inputBytes[0] === 0x89 && inputBytes[1] === 0x50;
    const isWebP = inputBytes[0] === 0x52 && inputBytes[1] === 0x49;

    console.log(`Image format detected: JPEG=${isJPEG}, PNG=${isPNG}, WebP=${isWebP}`);

    // If already WebP and small enough, return as-is
    if (isWebP && imageData.byteLength < 500000) {
      console.log('Image is already optimized WebP, returning as-is');
      return new Response(inputBytes, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/webp',
          'X-Original-Size': imageData.byteLength.toString(),
          'X-Optimized-Size': imageData.byteLength.toString(),
          'X-Compression-Ratio': '1.0',
        },
      });
    }

    // Calculate estimated compression based on format
    let estimatedRatio = 1.0;
    if (isPNG) {
      estimatedRatio = 0.3;
    } else if (isJPEG) {
      estimatedRatio = 0.75;
    }

    const estimatedSize = Math.round(imageData.byteLength * estimatedRatio);

    const responseData = {
      success: true,
      originalSize: imageData.byteLength,
      estimatedOptimizedSize: estimatedSize,
      compressionRatio: estimatedRatio,
      format: isJPEG ? 'jpeg' : isPNG ? 'png' : isWebP ? 'webp' : 'unknown',
      recommendation: 'Use client-side WebP conversion for optimal results',
      serverSupportsWebP: false,
    };

    console.log('Image analysis complete:', responseData);

    return new Response(JSON.stringify(responseData), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error in optimize-image function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

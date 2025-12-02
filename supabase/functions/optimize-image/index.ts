import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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

      quality = parseFloat(formData.get('quality') as string) || 0.8;
      maxWidth = parseInt(formData.get('maxWidth') as string) || 1920;
      maxHeight = parseInt(formData.get('maxHeight') as string) || 1920;
      
      imageData = await file.arrayBuffer();
    } else if (contentType.includes('application/json')) {
      const body = await req.json();
      
      if (!body.imageBase64) {
        throw new Error('No image data provided');
      }

      quality = body.quality || 0.8;
      maxWidth = body.maxWidth || 1920;
      maxHeight = body.maxHeight || 1920;
      
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

    // Use Sharp-like processing via ImageMagick in Deno
    // For edge functions, we'll use a different approach - encode to WebP using Canvas API simulation
    // Since Deno doesn't have native image processing, we'll use a pure JS solution
    
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

    // For server-side WebP conversion, we'll use an external service approach
    // or return the image with metadata for client-side conversion if WebP encoding isn't available
    
    // Calculate estimated compression based on format
    let estimatedRatio = 1.0;
    if (isPNG) {
      estimatedRatio = 0.3; // PNGs typically compress 70% smaller as WebP
    } else if (isJPEG) {
      estimatedRatio = 0.75; // JPEGs compress ~25% smaller
    }

    const estimatedSize = Math.round(imageData.byteLength * estimatedRatio);

    // Return image metadata for client-side processing
    // In production, you would use a library like sharp via npm or an image processing service
    const responseData = {
      success: true,
      originalSize: imageData.byteLength,
      estimatedOptimizedSize: estimatedSize,
      compressionRatio: estimatedRatio,
      format: isJPEG ? 'jpeg' : isPNG ? 'png' : isWebP ? 'webp' : 'unknown',
      recommendation: 'Use client-side WebP conversion for optimal results',
      serverSupportsWebP: false, // Deno edge functions don't have native image processing
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

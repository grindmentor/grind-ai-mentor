import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { compressImage, isWebPSupported } from '@/utils/imageCompression';

interface UploadOptions {
  bucket: 'physique-photos' | 'progress-photos' | 'food-photos';
  maxSizeMB?: number;
  allowedTypes?: string[];
  compress?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export const usePhotoUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const uploadPhoto = async (file: File, options: UploadOptions): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upload photos.",
        variant: "destructive",
      });
      return null;
    }

    const { 
      bucket, 
      maxSizeMB = 50, 
      allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
      compress = true,
      maxWidth = 1920,
      maxHeight = 1920,
      quality = 0.8
    } = options;

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please select a JPEG, PNG, or WebP image.",
        variant: "destructive",
      });
      return null;
    }

    // Validate initial file size (before compression)
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: `Please select a file smaller than ${maxSizeMB}MB.`,
        variant: "destructive",
      });
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let fileToUpload = file;

      // Compress image if enabled and file is large enough
      if (compress && file.size > 100 * 1024) { // > 100KB
        setIsCompressing(true);
        setUploadProgress(10);
        
        try {
          const outputFormat = isWebPSupported() ? 'webp' : 'jpeg';
          fileToUpload = await compressImage(file, {
            maxWidth,
            maxHeight,
            quality,
            outputFormat
          });
          
          const savings = ((file.size - fileToUpload.size) / file.size * 100).toFixed(0);
          console.log(`Compressed: ${(file.size / 1024).toFixed(0)}KB → ${(fileToUpload.size / 1024).toFixed(0)}KB (${savings}% saved)`);
        } catch (compressError) {
          console.warn('Compression failed, uploading original:', compressError);
          // Continue with original file if compression fails
        }
        
        setIsCompressing(false);
        setUploadProgress(30);
      }

      // Generate unique filename with user ID prefix
      const fileExt = fileToUpload.name.split('.').pop() || 'webp';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const uploadPromise = supabase.storage
        .from(bucket)
        .upload(fileName, fileToUpload, {
          cacheControl: '31536000', // 1 year cache
          upsert: false,
          contentType: fileToUpload.type
        });

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const { data, error } = await uploadPromise;

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) {
        console.error('Upload error:', error);
        toast({
          title: "Upload Failed",
          description: error.message || "Failed to upload photo. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      if (data) {
        // Get public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);

        const originalSize = (file.size / 1024).toFixed(0);
        const finalSize = (fileToUpload.size / 1024).toFixed(0);
        const compressionMsg = compress && file.size !== fileToUpload.size 
          ? ` (compressed ${originalSize}KB → ${finalSize}KB)`
          : '';

        toast({
          title: "Upload Successful",
          description: `Your photo has been uploaded successfully${compressionMsg}.`,
        });

        return publicUrl;
      }

      return null;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
      setIsCompressing(false);
      setUploadProgress(0);
    }
  };

  const deletePhoto = async (photoUrl: string, bucket: UploadOptions['bucket']): Promise<boolean> => {
    if (!user) return false;

    try {
      // Extract path from URL
      const urlParts = photoUrl.split('/');
      const path = urlParts.slice(-2).join('/'); // Get user_id/filename.ext

      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        console.error('Delete error:', error);
        toast({
          title: "Delete Failed",
          description: "Failed to delete photo. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Photo Deleted",
        description: "Photo has been successfully deleted.",
      });

      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  };

  return {
    uploadPhoto,
    deletePhoto,
    isUploading,
    isCompressing,
    uploadProgress
  };
};

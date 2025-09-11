import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UploadOptions {
  bucket: 'physique-photos' | 'progress-photos' | 'food-photos';
  maxSizeMB?: number;
  allowedTypes?: string[];
}

export const usePhotoUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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

    const { bucket, maxSizeMB = 50, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] } = options;

    // Validate file size (default 50MB limit)
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: `Please select a file smaller than ${maxSizeMB}MB.`,
        variant: "destructive",
      });
      return null;
    }

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please select a JPEG, PNG, or WebP image.",
        variant: "destructive",
      });
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique filename with user ID prefix
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Create a progress callback for large files
      const uploadPromise = supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      // Simulate progress for better UX (Supabase doesn't provide real progress)
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

        toast({
          title: "Upload Successful",
          description: "Your photo has been uploaded successfully.",
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
    uploadProgress
  };
};
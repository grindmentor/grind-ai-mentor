
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SupportFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface SupportFormHandlerProps {
  onSuccess: () => void;
}

const SupportFormHandler: React.FC<SupportFormHandlerProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<SupportFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<SupportFormData>>({});
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: Partial<SupportFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sanitizeText = (text: string): string => {
    return text.trim().replace(/[<>]/g, '');
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `support/${fileName}`;

      console.log('Uploading file:', fileName);

      const { error: uploadError } = await supabase.storage
        .from('support-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('File upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully:', filePath);

      const { data: { publicUrl } } = supabase.storage
        .from('support-files')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Starting form submission...');
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please check all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload file if present
      let fileUrl: string | null = null;
      if (uploadedFiles.length > 0) {
        console.log('Uploading file...');
        fileUrl = await uploadFile(uploadedFiles[0]);
        if (!fileUrl) {
          throw new Error('Failed to upload file');
        }
        console.log('File uploaded, URL:', fileUrl);
      }

      // Sanitize form data
      const sanitizedData = {
        name: sanitizeText(formData.name),
        email: sanitizeText(formData.email),
        subject: sanitizeText(formData.subject),
        message: sanitizeText(formData.message),
        file_url: fileUrl
      };

      console.log('Submitting sanitized data:', sanitizedData);

      // Insert into Supabase with explicit error handling
      const { data, error } = await supabase
        .from('support_requests')
        .insert([sanitizedData])
        .select();

      if (error) {
        console.error('Database insertion error:', error);
        throw error;
      }

      console.log('Support request submitted successfully:', data);

      // Reset form and show success
      setFormData({ name: '', email: '', subject: '', message: '' });
      setUploadedFiles([]);
      setErrors({});
      
      toast({
        title: "Request Submitted Successfully",
        description: "Your support request has been received. We'll get back to you within 7 days.",
      });
      
      onSuccess();
    } catch (error: any) {
      console.error('Error submitting support request:', error);
      
      // Provide more specific error messages
      let errorMessage = "There was an error submitting your request. Please try again.";
      
      if (error?.message?.includes('violates row-level security')) {
        errorMessage = "Permission error occurred. Please try again or contact us directly.";
      } else if (error?.message?.includes('network')) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error?.message?.includes('file')) {
        errorMessage = "File upload failed. Please try with a smaller file or contact us directly.";
      }
      
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof SupportFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file size (max 10MB)
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `File ${file.name} is too large. Maximum size is 10MB.`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    // Validate file types
    const allowedTypes = ['image/', 'application/pdf', 'text/', '.doc', '.docx'];
    const typeValidFiles = validFiles.filter(file => {
      const isAllowed = allowedTypes.some(type => 
        file.type.startsWith(type) || file.name.toLowerCase().endsWith(type.replace('.', ''))
      );
      if (!isAllowed) {
        toast({
          title: "Invalid File Type",
          description: `File ${file.name} is not supported. Please use images, PDFs, or documents.`,
          variant: "destructive",
        });
      }
      return isAllowed;
    });

    setUploadedFiles(typeValidFiles.slice(0, 1)); // Max 1 file
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
            Name *
          </label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className={`bg-gray-800 border-gray-700 text-white min-h-[48px] ${
              errors.name ? 'border-red-500' : ''
            }`}
            placeholder="Your full name"
          />
          {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
            Email *
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className={`bg-gray-800 border-gray-700 text-white min-h-[48px] ${
              errors.email ? 'border-red-500' : ''
            }`}
            placeholder="your@email.com"
          />
          {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
        </div>
      </div>
      
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-white mb-2">
          Subject *
        </label>
        <Input
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          disabled={isSubmitting}
          className={`bg-gray-800 border-gray-700 text-white min-h-[48px] ${
            errors.subject ? 'border-red-500' : ''
          }`}
          placeholder="What can we help you with?"
        />
        {errors.subject && <p className="text-red-400 text-sm mt-1">{errors.subject}</p>}
      </div>
      
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
          Message *
        </label>
        <Textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          disabled={isSubmitting}
          className={`bg-gray-800 border-gray-700 text-white resize-none ${
            errors.message ? 'border-red-500' : ''
          }`}
          placeholder="Please describe your issue or question in detail..."
        />
        {errors.message && <p className="text-red-400 text-sm mt-1">{errors.message}</p>}
      </div>
      
      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Attachment (optional)
        </label>
        <div className="space-y-2">
          <label 
            htmlFor="file-upload" 
            className={`flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 transition-colors ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="text-center">
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Click to upload screenshot or document</p>
              <p className="text-xs text-gray-500">Max 1 file, 10MB (images, PDFs, documents)</p>
            </div>
            <input
              id="file-upload"
              type="file"
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              disabled={isSubmitting}
              className="hidden"
            />
          </label>
          
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                  <span className="text-sm text-gray-300 truncate">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={isSubmitting}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 min-h-[48px] disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Sending...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Send Message
          </>
        )}
      </Button>
    </form>
  );
};

export default SupportFormHandler;

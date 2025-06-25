
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

      const { error: uploadError } = await supabase.storage
        .from('support-files')
        .upload(filePath, file);

      if (uploadError) {
        console.error('File upload error:', uploadError);
        throw uploadError;
      }

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
        fileUrl = await uploadFile(uploadedFiles[0]);
        if (!fileUrl) {
          throw new Error('Failed to upload file');
        }
      }

      // Sanitize form data
      const sanitizedData = {
        name: sanitizeText(formData.name),
        email: sanitizeText(formData.email),
        subject: sanitizeText(formData.subject),
        message: sanitizeText(formData.message),
        file_url: fileUrl
      };

      // Insert into Supabase
      const { error } = await supabase
        .from('support_requests')
        .insert([sanitizedData]);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // Reset form and show success
      setFormData({ name: '', email: '', subject: '', message: '' });
      setUploadedFiles([]);
      setErrors({});
      
      toast({
        title: "Request Submitted",
        description: "Your request has been received. Please allow up to 7 days for a reply.",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error submitting support request:', error);
      toast({
        title: "Submission Error",
        description: "There was an error submitting your request. Please try again.",
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

    setUploadedFiles(validFiles.slice(0, 1)); // Max 1 file
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
          <label htmlFor="file-upload" className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 transition-colors">
            <div className="text-center">
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Click to upload screenshot or document</p>
              <p className="text-xs text-gray-500">Max 1 file, 10MB</p>
            </div>
            <input
              id="file-upload"
              type="file"
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
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
        className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 min-h-[48px]"
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

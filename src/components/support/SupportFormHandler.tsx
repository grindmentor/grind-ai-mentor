
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
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
      // Get current user if logged in (for user_id, but it's optional now)
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id || null;

      // Sanitize form data
      const sanitizedData = {
        name: sanitizeText(formData.name),
        email: sanitizeText(formData.email),
        subject: sanitizeText(formData.subject),
        message: sanitizeText(formData.message),
        user_id: userId, // Can be null for anonymous submissions
        file_url: null
      };

      // Submit to Supabase (RLS is disabled, so this should work)
      const { error } = await supabase
        .from('support_requests')
        .insert([sanitizedData]);

      if (error) {
        throw new Error(`Failed to submit support request: ${error.message}`);
      }

      // Send email notification (fire and forget - don't block on this)
      supabase.functions.invoke('support-notification', {
        body: {
          name: sanitizedData.name,
          email: sanitizedData.email,
          subject: sanitizedData.subject,
          message: sanitizedData.message,
          userId: userId
        }
      }).catch(err => {
        console.warn('Failed to send email notification:', err);
      });

      // Reset form and show success
      setFormData({ name: '', email: '', subject: '', message: '' });
      setErrors({});
      
      toast({
        title: "Request Submitted Successfully",
        description: "Your support request has been received. We'll get back to you within 7 days.",
      });
      
      onSuccess();
      
    } catch (error: any) {
      console.error('Support form submission error:', error);
      
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your request. Please try again.",
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

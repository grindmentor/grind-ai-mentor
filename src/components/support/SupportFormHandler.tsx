
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SupportFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface SupportFormHandlerProps {
  onSuccess: () => void;
}

const MAX_MESSAGE_LENGTH = 1000;
const MAX_REQUESTS_PER_WEEK = 3;

const SupportFormHandler: React.FC<SupportFormHandlerProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<SupportFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<SupportFormData>>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const [isCheckingLimit, setIsCheckingLimit] = useState(true);
  const { toast } = useToast();

  // Autofill name and email from user profile and check request limit
  useEffect(() => {
    const loadUserDataAndCheckLimit = async () => {
      if (!user) {
        setIsCheckingLimit(false);
        return;
      }

      try {
        // Load user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, email')
          .eq('id', user.id)
          .maybeSingle();

        if (profile) {
          setFormData(prev => ({
            ...prev,
            name: profile.display_name || user.user_metadata?.full_name || '',
            email: profile.email || user.email || ''
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            name: user.user_metadata?.full_name || '',
            email: user.email || ''
          }));
        }

        // Check request limit (last 7 days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const { count, error } = await supabase
          .from('support_requests')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', oneWeekAgo.toISOString());

        if (!error && count !== null) {
          setRequestCount(count);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setFormData(prev => ({
          ...prev,
          name: user.user_metadata?.full_name || '',
          email: user.email || ''
        }));
      } finally {
        setIsCheckingLimit(false);
      }
    };

    loadUserDataAndCheckLimit();
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Partial<SupportFormData> = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    } else if (formData.message.length > MAX_MESSAGE_LENGTH) {
      newErrors.message = `Message must be less than ${MAX_MESSAGE_LENGTH} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sanitizeText = (text: string): string => {
    return text.trim().replace(/[<>]/g, '');
  };

  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please check all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Check rate limit
    if (user && requestCount >= MAX_REQUESTS_PER_WEEK) {
      toast({
        title: "Request Limit Reached",
        description: `You can only submit ${MAX_REQUESTS_PER_WEEK} support requests per week. Please try again later.`,
        variant: "destructive",
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmedSubmit = async () => {
    setShowConfirmDialog(false);
    setIsSubmitting(true);

    try {
      // Sanitize form data
      const sanitizedData = {
        name: sanitizeText(formData.name) || 'Anonymous',
        email: sanitizeText(formData.email) || 'no-email@provided.com',
        subject: sanitizeText(formData.subject),
        message: sanitizeText(formData.message),
        user_id: user?.id || null,
        file_url: null
      };

      // Submit to Supabase
      const { error } = await supabase
        .from('support_requests')
        .insert([sanitizedData]);

      if (error) {
        throw new Error(`Failed to submit support request: ${error.message}`);
      }

      // Send email notification (fire and forget)
      supabase.functions.invoke('support-notification', {
        body: {
          name: sanitizedData.name,
          email: sanitizedData.email,
          subject: sanitizedData.subject,
          message: sanitizedData.message,
          userId: user?.id
        }
      }).catch(err => {
        console.warn('Failed to send email notification:', err);
      });

      // Reset form (keep name and email)
      setFormData(prev => ({ ...prev, subject: '', message: '' }));
      setErrors({});
      setRequestCount(prev => prev + 1);
      
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
    
    // Enforce max length for message
    if (name === 'message' && value.length > MAX_MESSAGE_LENGTH) {
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof SupportFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const remainingRequests = MAX_REQUESTS_PER_WEEK - requestCount;
  const isLimitReached = user && requestCount >= MAX_REQUESTS_PER_WEEK;

  return (
    <>
      <form onSubmit={handleSubmitClick} className="space-y-4">
        {/* Rate limit warning */}
        {user && !isCheckingLimit && (
          <div className={`p-3 rounded-lg text-sm ${
            isLimitReached 
              ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
              : 'bg-gray-800/50 text-gray-400'
          }`}>
            {isLimitReached ? (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>You've reached your weekly limit of {MAX_REQUESTS_PER_WEEK} support requests.</span>
              </div>
            ) : (
              <span>{remainingRequests} support request{remainingRequests !== 1 ? 's' : ''} remaining this week</span>
            )}
          </div>
        )}

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
            disabled={isSubmitting || isLimitReached}
            className={`bg-gray-800 border-gray-700 text-white min-h-[48px] ${
              errors.subject ? 'border-red-500' : ''
            }`}
            placeholder="What can we help you with?"
          />
          {errors.subject && <p className="text-red-400 text-sm mt-1">{errors.subject}</p>}
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="message" className="block text-sm font-medium text-white">
              Message *
            </label>
            <span className={`text-xs ${
              formData.message.length > MAX_MESSAGE_LENGTH * 0.9 
                ? 'text-orange-400' 
                : 'text-gray-500'
            }`}>
              {formData.message.length}/{MAX_MESSAGE_LENGTH}
            </span>
          </div>
          <Textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={5}
            disabled={isSubmitting || isLimitReached}
            className={`bg-gray-800 border-gray-700 text-white resize-none ${
              errors.message ? 'border-red-500' : ''
            }`}
            placeholder="Please describe your issue or question in detail..."
          />
          {errors.message && <p className="text-red-400 text-sm mt-1">{errors.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || isLimitReached}
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

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-gray-900 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Submit Support Request?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Your message will be sent to our support team. We'll respond within 7 days.
              <br /><br />
              <strong className="text-white">Subject:</strong> {formData.subject}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmedSubmit}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SupportFormHandler;

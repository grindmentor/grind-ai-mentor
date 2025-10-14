import { useState } from "react";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Validation schema using zod
const contactSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  message: z.string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be less than 1000 characters")
});

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const result = contactSchema.safeParse(formData);
    
    if (!result.success) {
      // Extract validation errors
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(fieldErrors);
      
      toast({
        title: "Validation Error",
        description: "Please check the form for errors.",
        variant: "destructive"
      });
      return;
    }
    
    // Clear errors on successful validation
    setErrors({});
    
    // Log to console as requested
    console.log("Contact Form Submission:", result.data);
    
    // Show success message
    toast({
      title: "Message Sent!",
      description: "We'll get back to you as soon as possible.",
    });
    
    // Reset form
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <section id="contact" className="scroll-mt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl py-12 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-2xl">
          <AnimatedCard 
            className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 p-6 sm:p-8 lg:p-10"
            delay={200}
          >
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 leading-tight">
                <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  Get in Touch
                </span>
              </h2>
              <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
                Have questions? We'd love to hear from you
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <Input
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  aria-label="Your name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className="w-full bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500 min-h-[44px] text-base"
                />
                {errors.name && (
                  <p id="name-error" className="text-red-400 text-sm mt-2" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>
              
              <div>
                <Input
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  aria-label="Your email address"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className="w-full bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500 min-h-[44px] text-base"
                />
                {errors.email && (
                  <p id="email-error" className="text-red-400 text-sm mt-2" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>
              
              <div>
                <Textarea
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={5}
                  aria-label="Your message"
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? "message-error" : undefined}
                  className="w-full bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500 resize-none text-base"
                />
                {errors.message && (
                  <p id="message-error" className="text-red-400 text-sm mt-2" role="alert">
                    {errors.message}
                  </p>
                )}
              </div>
              
              <Button 
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold min-h-[44px] text-base sm:text-lg"
                aria-label="Send your message"
              >
                Send Message
                <Send className="ml-2 w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              </Button>
            </form>
          </AnimatedCard>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;

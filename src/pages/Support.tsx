
import { useState } from 'react';
import { ArrowLeft, Send, MessageCircle, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function Support() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.category || !formData.subject || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Here you would typically send the form data to your support system
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Support request submitted successfully! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        category: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast.error('Failed to submit support request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            onClick={() => window.history.back()}
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-gray-800/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Get Support</h1>
            <p className="text-xl text-gray-400">
              We're here to help you on your fitness journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <MessageCircle className="w-6 h-6 text-orange-400" />
                <h2 className="text-2xl font-semibold">Send us a message</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-300">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-2 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400"
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-300">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-2 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category" className="text-gray-300">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="mt-2 bg-gray-800/50 border-gray-700 text-white">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="billing">Billing & Subscription</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="fitness">Fitness Question</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject" className="text-gray-300">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="mt-2 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400"
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-gray-300">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="mt-2 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 min-h-[120px]"
                    placeholder="Please provide as much detail as possible..."
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Contact Information & FAQ */}
            <div className="space-y-8">
              {/* Contact Info */}
              <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
                <h2 className="text-2xl font-semibold mb-6">Other ways to reach us</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Email Support</p>
                      <p className="text-gray-400 text-sm">support@myotopia.com</p>
                      <p className="text-gray-500 text-xs">We typically respond within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Phone Support</p>
                      <p className="text-gray-400 text-sm">+1 (555) 123-4567</p>
                      <p className="text-gray-500 text-xs">Mon-Fri 9AM-6PM EST</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ */}
              <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
                <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-white mb-2">How do I cancel my subscription?</h3>
                    <p className="text-gray-400 text-sm">You can cancel your subscription anytime from your account settings or by contacting support.</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-white mb-2">Is my data secure?</h3>
                    <p className="text-gray-400 text-sm">Yes, we use industry-standard encryption and security measures to protect your data.</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-white mb-2">Can I use Myotopia offline?</h3>
                    <p className="text-gray-400 text-sm">Some features work offline, but an internet connection is required for AI features and syncing.</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-white mb-2">How accurate are the AI recommendations?</h3>
                    <p className="text-gray-400 text-sm">Our AI is trained on peer-reviewed research and continuously updated with the latest fitness science.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

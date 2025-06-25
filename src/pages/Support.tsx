
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, HeadphonesIcon, Mail, MessageSquare, Send, CheckCircle, ChevronDown, ChevronRight, Upload, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const Support = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setUploadedFiles([]);
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files].slice(0, 3)); // Max 3 files
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const faqItems = [
    {
      id: 'login',
      question: 'Having trouble logging in?',
      answer: 'If you can\'t log in, try resetting your password or clearing your browser cache. Make sure you\'re using the correct email address associated with your account.'
    },
    {
      id: 'subscription',
      question: 'Subscription and billing issues',
      answer: 'For subscription problems, visit your Account page and click "Manage Subscription" to access your billing portal. You can update payment methods, change plans, or cancel subscriptions there.'
    },
    {
      id: 'meal-plans',
      question: 'Missing or incorrect meal plans',
      answer: 'Meal plans are generated based on your profile information. Make sure your dietary preferences, goals, and restrictions are up to date in Settings. Premium users get unlimited meal plan generations.'
    },
    {
      id: 'workouts',
      question: 'Workout visibility and tracking',
      answer: 'Ensure your fitness profile is complete in Settings. The AI uses this information to create personalized workouts. Check that you\'ve selected appropriate fitness goals and experience level.'
    },
    {
      id: 'ai-responses',
      question: 'AI not responding or giving poor advice',
      answer: 'The AI works best with detailed, specific questions. Include your current stats, goals, and context. If responses seem off, try providing more background information about your situation.'
    },
    {
      id: 'data-sync',
      question: 'Data not syncing across devices',
      answer: 'Make sure you\'re logged into the same account on all devices. Data syncs automatically when connected to the internet. Try refreshing the page or logging out and back in.'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white ios-safe-area">
      {/* Header */}
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between border-b border-gray-800" style={{ paddingTop: 'max(env(safe-area-inset-top) + 1rem, 1rem)' }}>
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white text-sm">GM</span>
          </div>
          <span className="text-xl font-bold logo-text">GrindMentor</span>
        </Link>
        <Link to="/app">
          <Button variant="ghost" className="text-white hover:bg-gray-800 min-h-[48px]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to App
          </Button>
        </Link>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-6">
            <HeadphonesIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Support Center</h1>
          <p className="text-xl text-gray-400">
            We're here to help! Find answers or get support for your fitness journey.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* FAQ Section */}
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Frequently Asked Questions</CardTitle>
                <CardDescription className="text-gray-400">
                  Quick answers to common questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {faqItems.map((item) => (
                  <Collapsible
                    key={item.id}
                    open={openFAQ === item.id}
                    onOpenChange={(open) => setOpenFAQ(open ? item.id : null)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between text-left p-4 h-auto text-white hover:bg-gray-800"
                      >
                        <span className="font-medium">{item.question}</span>
                        {openFAQ === item.id ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 pb-4">
                      <p className="text-gray-300 text-sm leading-relaxed">{item.answer}</p>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Mail className="w-6 h-6 text-blue-500" />
                  <CardTitle className="text-white">Contact Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">General Support</p>
                  <p className="text-white font-medium">support@grindmentor.com</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Technical Issues</p>
                  <p className="text-white font-medium">tech@grindmentor.com</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Billing Questions</p>
                  <p className="text-white font-medium">billing@grindmentor.com</p>
                </div>
                <div className="pt-2">
                  <p className="text-sm text-gray-400">Response Time</p>
                  <p className="text-white font-medium">Within 24 hours</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-6 h-6 text-orange-500" />
                <CardTitle className="text-white">Contact Support</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                Send us a message and we'll get back to you within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                  <p className="text-gray-400">We've received your request. Our team will get back to you within 24 hours.</p>
                </div>
              ) : (
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
                        className="bg-gray-800 border-gray-700 text-white min-h-[48px]"
                        placeholder="Your full name"
                      />
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
                        className="bg-gray-800 border-gray-700 text-white min-h-[48px]"
                        placeholder="your@email.com"
                      />
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
                      className="bg-gray-800 border-gray-700 text-white min-h-[48px]"
                      placeholder="What can we help you with?"
                    />
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
                      className="bg-gray-800 border-gray-700 text-white resize-none"
                      placeholder="Please describe your issue or question in detail..."
                    />
                  </div>
                  
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Attachments (optional)
                    </label>
                    <div className="space-y-2">
                      <label htmlFor="file-upload" className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 transition-colors">
                        <div className="text-center">
                          <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">Click to upload screenshots or documents</p>
                          <p className="text-xs text-gray-500">Max 3 files, 10MB each</p>
                        </div>
                        <input
                          id="file-upload"
                          type="file"
                          multiple
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
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Support;

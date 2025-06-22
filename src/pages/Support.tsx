
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, HeadphonesIcon, Mail, MessageSquare, Send, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Support = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between border-b border-gray-800">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white text-sm">GM</span>
          </div>
          <span className="text-xl font-bold">GrindMentor</span>
        </Link>
        <Link to="/">
          <Button variant="ghost" className="text-white hover:bg-gray-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-6">
            <HeadphonesIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Support Center</h1>
          <p className="text-xl text-gray-400">
            We're here to help! Get support for your fitness journey.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact Form */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-6 h-6 text-orange-500" />
                <CardTitle className="text-white">Contact Support</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                Send us a message and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                  <p className="text-gray-400">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                        Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-white mb-2">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="What can we help you with?"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                      Message
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
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
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

          {/* FAQ & Quick Help */}
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-1">How accurate is the AI coaching?</h4>
                  <p className="text-gray-400 text-sm">Our AI is trained on peer-reviewed research and provides science-backed recommendations with study citations.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Can I cancel my subscription anytime?</h4>
                  <p className="text-gray-400 text-sm">Yes, you can cancel your premium subscription at any time through your account settings.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Is my progress data private?</h4>
                  <p className="text-gray-400 text-sm">Absolutely. Your photos and personal data are encrypted and never shared with third parties.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">How do I upload progress photos?</h4>
                  <p className="text-gray-400 text-sm">Use the CutCalc Pro feature or upload directly in the AI chat for body composition analysis.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Mail className="w-6 h-6 text-blue-500" />
                  <CardTitle className="text-white">Other Ways to Reach Us</CardTitle>
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
        </div>
      </div>
    </div>
  );
};

export default Support;

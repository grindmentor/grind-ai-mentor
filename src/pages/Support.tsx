
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, HeadphonesIcon, Mail, MessageSquare, CheckCircle, ChevronDown, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import SupportFormHandler from "@/components/support/SupportFormHandler";

const Support = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const handleFormSuccess = () => {
    setIsSubmitted(true);
    // Reset success message after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000);
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
      {/* Fixed Header */}
      <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur border-b border-gray-800 px-6 py-4" style={{ paddingTop: 'max(env(safe-area-inset-top) + 1rem, 1rem)' }}>
        <div className="container mx-auto flex items-center justify-between">
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
        </div>
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
                  <CardTitle className="text-white">Response Time</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Average Response Time</p>
                  <p className="text-white font-medium">Within 7 days</p>
                </div>
                <div className="pt-2">
                  <p className="text-sm text-gray-400">Support Hours</p>
                  <p className="text-white font-medium">Monday - Friday, 9 AM - 5 PM EST</p>
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
                Send us a message and we'll get back to you within 7 days.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Request Received!</h3>
                  <p className="text-gray-400">Your request has been received. Please allow up to 7 days for a reply.</p>
                </div>
              ) : (
                <SupportFormHandler onSuccess={handleFormSuccess} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Support;

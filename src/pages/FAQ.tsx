import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, ArrowLeft, Home, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const LAST_UPDATED = "December 2, 2025";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  description: string;
  items: FAQItem[];
}

const faqData: FAQCategory[] = [
  {
    title: "General Questions",
    description: "Basic information about Myotopia",
    items: [
      {
        question: "What is Myotopia?",
        answer: "Myotopia is an AI-powered fitness coaching platform that provides personalized workout plans, nutrition guidance, and progress tracking. We use artificial intelligence to deliver evidence-based recommendations tailored to your individual goals and circumstances."
      },
      {
        question: "Is Myotopia a replacement for medical advice?",
        answer: "No. Myotopia provides general fitness and nutrition information for educational purposes only. Our AI-generated recommendations are not medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals before starting any fitness or nutrition program, especially if you have existing health conditions."
      },
      {
        question: "Who can use Myotopia?",
        answer: "Myotopia is available to users who are 18 years of age or older. This age requirement ensures compliance with data protection laws and safety guidelines for fitness programs. Users must verify their age during registration."
      },
      {
        question: "What devices can I use Myotopia on?",
        answer: "Myotopia is a progressive web app (PWA) that works on any modern web browser. You can access it on desktop computers, tablets, and smartphones. You can also install it as an app on your device for offline access and a native app-like experience."
      }
    ]
  },
  {
    title: "AI & Technology",
    description: "How our AI technology works",
    items: [
      {
        question: "How does the AI generate recommendations?",
        answer: "Our AI analyzes publicly available scientific research, fitness studies, and evidence-based training principles to generate personalized recommendations. It considers your profile data, goals, and progress to tailor suggestions. However, AI can make mistakes, and recommendations should be verified with professionals when appropriate."
      },
      {
        question: "Is the AI always accurate?",
        answer: "No. While we strive for accuracy and use evidence-based information, AI-generated content may contain errors or inaccuracies. The recommendations are general guidance based on fitness principles and may not suit your specific circumstances. Always use your judgment and consult professionals for important decisions."
      },
      {
        question: "Are some features in beta?",
        answer: "Yes, certain features may be in beta or experimental stages. These features are subject to change, improvement, or discontinuation as we continue to develop and refine our platform. We clearly mark beta features when possible."
      },
      {
        question: "Do you use my data to train AI models?",
        answer: "No. We do not use your personal data to train AI models. Your data is processed in real-time to generate personalized recommendations for your use only. We only use aggregated, anonymized data to improve our services."
      }
    ]
  },
  {
    title: "Subscriptions & Billing",
    description: "Information about plans and payments",
    items: [
      {
        question: "What's the difference between Free and Premium?",
        answer: "The Free tier provides basic access to core features with usage limits. Premium unlocks unlimited access to all AI-powered features, including unlimited workout plans, meal planning, progress analysis, physique analysis, and priority support. Check our pricing page for detailed feature comparisons."
      },
      {
        question: "How does billing work?",
        answer: "Premium subscriptions are billed either monthly or annually, depending on your choice. Annual plans offer a discount compared to monthly billing. Payments are processed securely through Stripe, and your subscription automatically renews unless cancelled."
      },
      {
        question: "Can I cancel my subscription?",
        answer: "Yes, you can cancel your subscription at any time through your account settings. When you cancel, you'll retain access to Premium features until the end of your current billing period. After that, your account will revert to the Free tier."
      },
      {
        question: "Do you offer refunds?",
        answer: "We have a no-refund policy for subscription payments. By subscribing to Premium, you acknowledge and accept this policy. We encourage you to fully explore the Free tier before upgrading to ensure Premium meets your needs."
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover) through our secure Stripe integration. Additional payment methods like Apple Pay, Google Pay, and PayPal are planned for future releases."
      }
    ]
  },
  {
    title: "Data & Privacy",
    description: "How we handle your information",
    items: [
      {
        question: "What data do you collect?",
        answer: "We collect information you provide directly: account details (email, date of birth), profile data (fitness goals, measurements), and usage data (workout logs, nutrition entries, progress photos). We also collect basic device information for service optimization. See our Privacy Policy for complete details."
      },
      {
        question: "How is my data protected?",
        answer: "All data is encrypted in transit using TLS/SSL and at rest using AES-256 encryption. We implement industry-standard security measures and follow best practices for data protection. However, no method of transmission over the Internet is 100% secure."
      },
      {
        question: "Do you sell my data?",
        answer: "Absolutely not. We never sell your personal information. We only share data with trusted service providers (like payment processors) who are bound by confidentiality agreements, or when required by law."
      },
      {
        question: "How long do you keep my data?",
        answer: "We retain your data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where retention is required by law or for legitimate business purposes like resolving disputes."
      },
      {
        question: "What are my data rights?",
        answer: "Depending on your location, you may have rights to access, correct, delete, or export your data. You can also object to certain types of processing. Contact us through our support page to exercise these rights."
      },
      {
        question: "Do you use cookies?",
        answer: "We use essential cookies to maintain your session and preferences. We do not use third-party advertising cookies. Analytics data is collected in anonymized form to improve our services. You can manage your cookie preferences through the consent banner."
      }
    ]
  },
  {
    title: "Account & Support",
    description: "Managing your account",
    items: [
      {
        question: "How do I delete my account?",
        answer: "You can delete your account through the Settings page. Account deletion is permanent and will remove all your data within 30 days. Make sure to export any data you want to keep before deleting your account."
      },
      {
        question: "I forgot my password. How do I reset it?",
        answer: "On the sign-in page, click 'Forgot Password' and enter your email address. You'll receive a password reset link. If you don't receive the email, check your spam folder or contact support."
      },
      {
        question: "How do I contact support?",
        answer: "You can reach our support team through the Support page in the app. We aim to respond to all inquiries within 24-48 hours. Premium users receive priority support."
      },
      {
        question: "Can I change my email address?",
        answer: "Currently, email address changes require contacting support. We verify your identity before making any account changes to ensure security."
      }
    ]
  }
];

const FAQ = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/20 to-orange-700 text-white">
      {/* Mobile-Optimized Header */}
      <nav 
        className="sticky top-0 z-50 bg-black/95 backdrop-blur border-b border-gray-800 px-4 py-3"
        style={{ 
          paddingTop: 'max(env(safe-area-inset-top, 16px), 16px)',
          paddingLeft: 'max(env(safe-area-inset-left, 16px), 16px)',
          paddingRight: 'max(env(safe-area-inset-right, 16px), 16px)'
        }}
      >
        <div className="container mx-auto flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center space-x-1">
            <Link to="/app">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-gray-800 min-h-[44px] px-3 mobile-nav-button touch-manipulation"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
            <Link to="/">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-gray-800 min-h-[44px] px-3 mobile-nav-button touch-manipulation"
              >
                <Home className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div 
        className="container mx-auto px-4 py-6 max-w-4xl"
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom, 32px), 32px)',
          paddingLeft: 'max(env(safe-area-inset-left, 16px), 16px)',
          paddingRight: 'max(env(safe-area-inset-right, 16px), 16px)'
        }}
      >
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-400">
            Find answers to common questions about Myotopia
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {faqData.map((category, index) => (
            <a
              key={index}
              href={`#${category.title.toLowerCase().replace(/\s+/g, '-')}`}
              className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-full text-sm text-gray-300 hover:text-white transition-colors"
            >
              {category.title}
            </a>
          ))}
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqData.map((category, categoryIndex) => (
            <Card 
              key={categoryIndex} 
              id={category.title.toLowerCase().replace(/\s+/g, '-')}
              className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm scroll-mt-24"
            >
              <CardHeader>
                <CardTitle className="text-white text-xl">{category.title}</CardTitle>
                <CardDescription className="text-gray-400">
                  {category.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.items.map((item, itemIndex) => (
                    <AccordionItem 
                      key={itemIndex} 
                      value={`item-${categoryIndex}-${itemIndex}`}
                      className="border-gray-700/50"
                    >
                      <AccordionTrigger className="text-left text-gray-200 hover:text-white hover:no-underline py-4">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-400 leading-relaxed pb-4">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact CTA */}
        <Card className="bg-orange-500/10 border-orange-500/30 mt-8">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">Still have questions?</h3>
            <p className="text-gray-400 mb-4">
              Our support team is here to help you with any questions not covered above.
            </p>
            <Link to="/support">
              <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                Contact Support
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Related Links */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Related pages:</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link to="/terms" className="text-orange-400 hover:text-orange-300 underline">Terms of Service</Link>
            <Link to="/privacy" className="text-orange-400 hover:text-orange-300 underline">Privacy Policy</Link>
            <Link to="/about" className="text-orange-400 hover:text-orange-300 underline">About Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;

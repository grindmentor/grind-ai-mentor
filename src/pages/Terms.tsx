
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ArrowLeft, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";

const Terms = () => {
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
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-400">
            The terms and conditions for using Myotopia
          </p>
        </div>

        <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Terms and Conditions</CardTitle>
            <CardDescription className="text-gray-400">
              Last updated: {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-300">
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Acceptance of Terms</h3>
              <p className="leading-relaxed">
                By accessing and using Myotopia, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to these terms, please do not 
                use our service.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Use of Service</h3>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>You must be at least 18 years old to use this service</li>
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>You agree to use the service for lawful purposes only</li>
                <li>You will not attempt to gain unauthorized access to our systems</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Health and Fitness Disclaimer</h3>
              <p className="leading-relaxed">
                Myotopia provides fitness and nutrition information for educational purposes only. 
                This information is not intended as a substitute for professional medical advice. 
                Please consult with a healthcare provider before starting any fitness program.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Subscription and Billing</h3>
              <p className="leading-relaxed">
                Premium features require a paid subscription. Subscriptions automatically renew unless 
                cancelled. You can manage your subscription through your account settings or contact 
                our support team.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Limitation of Liability</h3>
              <p className="leading-relaxed">
                Myotopia shall not be liable for any indirect, incidental, special, consequential, 
                or punitive damages resulting from your use of the service.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Contact Information</h3>
              <p className="leading-relaxed">
                If you have any questions about these Terms of Service, please contact us through 
                our support page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ArrowLeft, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Terms = () => {
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
          <div className="flex items-center space-x-2">
            <Link to="/app">
              <Button variant="ghost" className="text-white hover:bg-gray-800 min-h-[48px] touch-manipulation">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link to="/">
              <Button variant="ghost" className="text-white hover:bg-gray-800 min-h-[48px] touch-manipulation">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-400">
            The terms and conditions for using GrindMentor
          </p>
        </div>

        <Card className="bg-gray-900 border-gray-800">
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
                By accessing and using GrindMentor, you accept and agree to be bound by the terms 
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
                GrindMentor provides fitness and nutrition information for educational purposes only. 
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
                GrindMentor shall not be liable for any indirect, incidental, special, consequential, 
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

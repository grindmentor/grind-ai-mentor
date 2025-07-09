
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowLeft, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";

const Privacy = () => {
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
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-400">
            How we protect and handle your personal information
          </p>
        </div>

        <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Your Privacy Matters</CardTitle>
            <CardDescription className="text-gray-400">
              Last updated: {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-300">
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Information We Collect</h3>
              <p className="leading-relaxed">
                We collect information you provide directly to us, such as when you create an account, 
                use our services, or contact us for support. This may include your name, email address, 
                fitness goals, and workout data.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">How We Use Your Information</h3>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>Provide and improve our fitness coaching services</li>
                <li>Personalize your workout and nutrition recommendations</li>
                <li>Send you important updates about your account</li>
                <li>Respond to your questions and support requests</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Data Security</h3>
              <p className="leading-relaxed">
                We implement appropriate security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction. All data is encrypted in 
                transit and at rest.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Your Rights</h3>
              <p className="leading-relaxed">
                You have the right to access, update, or delete your personal information. You can 
                manage your account settings or contact us directly for assistance with your data.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Contact Us</h3>
              <p className="leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us through our 
                support page or email us directly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;

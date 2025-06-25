
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowLeft, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Privacy = () => {
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
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-400">
            How we protect and handle your personal information
          </p>
        </div>

        <Card className="bg-gray-900 border-gray-800">
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

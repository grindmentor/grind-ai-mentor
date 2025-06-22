
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Privacy = () => {
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
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-400">
            Your privacy is our priority. Here's how we protect your data.
          </p>
          <p className="text-sm text-gray-500 mt-2">Last updated: December 22, 2024</p>
        </div>

        <div className="space-y-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Eye className="w-6 h-6 text-orange-500" />
                <CardTitle className="text-white">Information We Collect</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Account Information</h4>
                <p>When you create an account, we collect your email address and basic profile information to provide our services.</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">AI Chat Data</h4>
                <p>Your conversations with our AI coaching system are processed to provide personalized fitness advice. Chat messages are analyzed to improve our AI responses and ensure scientific accuracy.</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Progress Photos</h4>
                <p>Photos you upload for progress tracking are stored securely and used only for your personal fitness analysis and body composition assessments.</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Usage Data</h4>
                <p>We collect information about how you use our app to improve our services and user experience.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Database className="w-6 h-6 text-blue-500" />
                <CardTitle className="text-white">How We Use Your Data</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <ul className="space-y-2">
                <li>• Provide personalized AI coaching and fitness recommendations</li>
                <li>• Generate custom meal plans and training programs</li>
                <li>• Track your progress and provide analytics</li>
                <li>• Improve our AI models and scientific accuracy</li>
                <li>• Send important account and service updates</li>
                <li>• Ensure platform security and prevent abuse</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Lock className="w-6 h-6 text-green-500" />
                <CardTitle className="text-white">Data Protection & Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <ul className="space-y-2">
                <li>• All data is encrypted in transit and at rest</li>
                <li>• We use industry-standard security measures</li>
                <li>• Access to your data is strictly limited to authorized personnel</li>
                <li>• We do not sell your personal information to third parties</li>
                <li>• Regular security audits and monitoring</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <UserCheck className="w-6 h-6 text-purple-500" />
                <CardTitle className="text-white">Your Rights</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <ul className="space-y-2">
                <li>• <strong>Access:</strong> Request a copy of your personal data</li>
                <li>• <strong>Correction:</strong> Update or correct your information</li>
                <li>• <strong>Deletion:</strong> Request deletion of your account and data</li>
                <li>• <strong>Portability:</strong> Export your data in a readable format</li>
                <li>• <strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Mail className="w-6 h-6 text-orange-500" />
                <CardTitle className="text-white">Contact Us</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-gray-300">
              <p>If you have questions about this Privacy Policy or your data, contact us at:</p>
              <p className="mt-2 font-semibold">privacy@grindmentor.com</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Privacy;

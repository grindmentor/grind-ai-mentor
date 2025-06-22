
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck, Mail, Globe } from "lucide-react";
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
                <Globe className="w-6 h-6 text-blue-500" />
                <CardTitle className="text-white">GDPR & Norwegian Data Protection Compliance</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="font-semibold text-blue-400 mb-2">YOUR RIGHTS UNDER GDPR & NORWEGIAN LAW:</p>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Right to Access:</strong> Request copies of your personal data</li>
                  <li>• <strong>Right to Rectification:</strong> Correct inaccurate personal data</li>
                  <li>• <strong>Right to Erasure:</strong> Request deletion of your personal data</li>
                  <li>• <strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                  <li>• <strong>Right to Data Portability:</strong> Transfer your data to another service</li>
                  <li>• <strong>Right to Object:</strong> Object to processing of your personal data</li>
                  <li>• <strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
                </ul>
              </div>
              <p>We process your data lawfully under GDPR Article 6 (legitimate interests and consent) and comply with Norwegian Personal Data Act.</p>
            </CardContent>
          </Card>

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
              <div>
                <h4 className="font-semibold text-white mb-2">Payment Information</h4>
                <p>Payment processing is handled by Stripe. We do not store your payment card details.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Database className="w-6 h-6 text-blue-500" />
                <CardTitle className="text-white">Legal Basis for Processing</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <ul className="space-y-2">
                <li>• <strong>Contract Performance:</strong> Processing necessary to provide our services</li>
                <li>• <strong>Legitimate Interests:</strong> Service improvement and customer support</li>
                <li>• <strong>Consent:</strong> Marketing communications and optional features</li>
                <li>• <strong>Legal Obligation:</strong> Compliance with applicable laws</li>
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
                <li>• Data is hosted in secure, GDPR-compliant facilities</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Globe className="w-6 h-6 text-purple-500" />
                <CardTitle className="text-white">Data Transfers</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                Your data may be transferred to and processed in countries outside the EEA. 
                We ensure adequate protection through:
              </p>
              <ul className="space-y-2 ml-4">
                <li>• EU Standard Contractual Clauses</li>
                <li>• Adequacy decisions by the European Commission</li>
                <li>• Other appropriate safeguards under GDPR</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <UserCheck className="w-6 h-6 text-purple-500" />
                <CardTitle className="text-white">Data Retention</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>We retain your personal data only as long as necessary for:</p>
              <ul className="space-y-2 ml-4">
                <li>• Providing our services to you</li>
                <li>• Complying with legal obligations</li>
                <li>• Resolving disputes and enforcing agreements</li>
                <li>• Account data: Until you delete your account</li>
                <li>• Usage data: Up to 3 years for analytics purposes</li>
                <li>• Chat data: Anonymized after 1 year</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Mail className="w-6 h-6 text-orange-500" />
                <CardTitle className="text-white">Contact & Complaints</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>For privacy-related questions or to exercise your rights, contact us at:</p>
              <p className="mt-2 font-semibold">privacy@grindmentor.com</p>
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="font-semibold text-blue-400 mb-2">Right to Lodge a Complaint:</p>
                <p className="text-sm">
                  You have the right to lodge a complaint with a supervisory authority. 
                  In Norway, you can contact Datatilsynet (Norwegian Data Protection Authority).
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Privacy;

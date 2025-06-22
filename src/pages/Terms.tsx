
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, AlertTriangle, Shield, Gavel, Users, Zap, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const Terms = () => {
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
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-400">
            Terms and conditions for using GrindMentor
          </p>
          <p className="text-sm text-gray-500 mt-2">Last updated: December 22, 2024</p>
        </div>

        <div className="space-y-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-blue-500" />
                <CardTitle className="text-white">Acceptance of Terms</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>By accessing and using GrindMentor, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Globe className="w-6 h-6 text-green-500" />
                <CardTitle className="text-white">Legal Jurisdiction & Norwegian Law Compliance</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="font-semibold text-blue-400 mb-2">NORWEGIAN CONSUMER RIGHTS:</p>
                <ul className="space-y-2 text-sm">
                  <li>• For Norwegian residents: Consumer purchase rights may apply where legally required</li>
                  <li>• Withdrawal rights (angrerett) may apply for certain digital services under Norwegian law</li>
                  <li>• These terms are subject to mandatory Norwegian consumer protection laws where applicable</li>
                  <li>• Any disputes will be resolved according to Norwegian law and jurisdiction</li>
                </ul>
              </div>
              <p>This service complies with Norwegian regulations for digital services and data protection (GDPR).</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Zap className="w-6 h-6 text-orange-500" />
                <CardTitle className="text-white">Service Description</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>GrindMentor provides AI-powered fitness coaching, meal planning, and progress tracking services. Our platform offers:</p>
              <ul className="space-y-2 ml-4">
                <li>• Personalized AI fitness coaching with scientific citations</li>
                <li>• Custom meal plans and nutrition guidance</li>
                <li>• Progress tracking and body composition analysis</li>
                <li>• Training programs based on exercise science</li>
                <li>• Community features and premium content</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-green-500" />
                <CardTitle className="text-white">User Responsibilities</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <ul className="space-y-2">
                <li>• Provide accurate information for personalized recommendations</li>
                <li>• Use the service responsibly and ethically</li>
                <li>• Respect other users and maintain appropriate conduct</li>
                <li>• Protect your account credentials and personal information</li>
                <li>• Comply with all applicable laws and regulations</li>
                <li>• Do not misuse or attempt to harm our systems</li>
                <li>• You must be at least 16 years old to use this service</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                <CardTitle className="text-white">Health & Medical Disclaimer</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="font-semibold text-yellow-400 mb-2">IMPORTANT MEDICAL DISCLAIMER:</p>
                <ul className="space-y-2 text-sm">
                  <li>• GrindMentor provides general fitness information and is NOT medical advice</li>
                  <li>• Always consult qualified healthcare professionals before starting any fitness program</li>
                  <li>• We are not responsible for injuries or health issues from using our recommendations</li>
                  <li>• If you experience pain or discomfort, stop immediately and consult a doctor</li>
                  <li>• Our AI provides science-backed advice but cannot replace professional medical guidance</li>
                  <li>• This service is not intended to diagnose, treat, cure, or prevent any disease</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Gavel className="w-6 h-6 text-purple-500" />
                <CardTitle className="text-white">Intellectual Property</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <ul className="space-y-2">
                <li>• All content, features, and functionality are owned by GrindMentor</li>
                <li>• You may not copy, modify, or distribute our content without permission</li>
                <li>• User-generated content remains your property but you grant us usage rights</li>
                <li>• We respect intellectual property rights and expect users to do the same</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Subscription & Billing</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                <p className="font-semibold text-red-400 mb-2">REFUND POLICY:</p>
                <p className="text-sm">
                  <strong>General Policy:</strong> All payments are final and non-refundable under normal circumstances. 
                  However, Norwegian consumer protection laws may grant certain withdrawal rights (angrerett) for Norwegian residents. 
                  Please contact support if you believe you have legal grounds for a refund under Norwegian consumer law.
                </p>
              </div>
              <ul className="space-y-2">
                <li>• Free and premium subscription tiers available</li>
                <li>• Premium subscriptions auto-renew unless cancelled</li>
                <li>• All sales are generally final - limited refunds as per Norwegian law</li>
                <li>• We reserve the right to modify pricing with 30 days advance notice</li>
                <li>• Cancellation can be done anytime to prevent future charges</li>
                <li>• Cancelled subscriptions remain active until the end of the billing period</li>
                <li>• Norwegian residents may have additional rights under consumer protection laws</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Data Protection & Privacy</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <ul className="space-y-2">
                <li>• We comply with GDPR and Norwegian data protection regulations</li>
                <li>• Your personal data is processed according to our Privacy Policy</li>
                <li>• You have rights to access, correct, and delete your personal data</li>
                <li>• Data transfers comply with international data protection requirements</li>
                <li>• We implement appropriate security measures to protect your data</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                GrindMentor is provided "as is" without warranties of any kind. We shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages, including but not limited to loss of profits, 
                data, or other intangible losses. This limitation applies to the extent permitted by Norwegian law.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                We reserve the right to modify these terms at any time with reasonable notice. 
                Users will be notified of significant changes via email or in-app notification. 
                Continued use of the service after changes constitutes acceptance of new terms.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              <p>For questions about these Terms of Service, contact us at:</p>
              <p className="mt-2 font-semibold">legal@grindmentor.com</p>
              <p className="mt-2 text-sm">
                For Norwegian residents with consumer law questions: support@grindmentor.com
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Terms;

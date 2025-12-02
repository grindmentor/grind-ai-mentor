
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowLeft, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";

const LAST_UPDATED = "December 2, 2025";

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
              Last updated: {LAST_UPDATED}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-300">
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Information We Collect</h3>
              <p className="leading-relaxed mb-3">
                We collect information you provide directly to us when you create an account, 
                use our services, or contact us for support. This includes:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li><strong>Account Information:</strong> Name, email address, date of birth, and password</li>
                <li><strong>Profile Data:</strong> Fitness goals, physical measurements (height, weight), and experience level</li>
                <li><strong>Usage Data:</strong> Workout logs, nutrition entries, progress photos you upload, and feature interactions</li>
                <li><strong>Device Information:</strong> Device type, operating system, and browser for service optimization</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">How We Use Your Information</h3>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>Provide personalized AI-powered fitness and nutrition recommendations</li>
                <li>Track your progress and generate insights based on your logged data</li>
                <li>Send important updates about your account and subscription</li>
                <li>Respond to your questions and support requests</li>
                <li>Improve our services based on aggregated, anonymized usage patterns</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">AI and Data Processing</h3>
              <p className="leading-relaxed">
                Myotopia uses artificial intelligence to provide fitness recommendations. Your data may be 
                processed by AI systems to generate personalized suggestions. We do not use your personal 
                data to train AI models. AI recommendations are generated in real-time based on your 
                individual profile and are not stored beyond what is necessary to provide our services.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Data Retention</h3>
              <p className="leading-relaxed">
                We retain your personal data for as long as your account is active or as needed to provide 
                our services. If you delete your account, we will delete your personal data within 30 days, 
                except where retention is required by law or for legitimate business purposes (such as 
                resolving disputes or enforcing agreements).
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Data Sharing</h3>
              <p className="leading-relaxed mb-3">
                We do not sell your personal information. We may share your data only in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li><strong>Service Providers:</strong> With trusted third parties who assist in operating our service (payment processors, hosting providers), bound by confidentiality agreements</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, with prior notice to users</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Data Security</h3>
              <p className="leading-relaxed">
                We implement industry-standard security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction. All data is encrypted in 
                transit using TLS/SSL and at rest using AES-256 encryption. However, no method of 
                transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Your Rights</h3>
              <p className="leading-relaxed mb-3">
                Depending on your location, you may have the following rights regarding your personal data:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal requirements)</li>
                <li><strong>Portability:</strong> Request your data in a machine-readable format</li>
                <li><strong>Objection:</strong> Object to processing of your data for certain purposes</li>
              </ul>
              <p className="leading-relaxed mt-3">
                To exercise these rights, contact us through our support page or at the email address below.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Cookies and Tracking</h3>
              <p className="leading-relaxed">
                We use essential cookies to maintain your session and preferences. We do not use 
                third-party advertising cookies. Analytics data is collected in anonymized form to 
                improve our services.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Children's Privacy</h3>
              <p className="leading-relaxed">
                Myotopia is not intended for users under 18 years of age. We do not knowingly collect 
                personal information from children under 18. If we become aware that we have collected 
                personal data from a child under 18, we will delete that information promptly.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Changes to This Policy</h3>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of material changes 
                by posting the new policy on this page and updating the "Last updated" date. Your continued 
                use of Myotopia after changes constitutes acceptance of the updated policy.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Contact Us</h3>
              <p className="leading-relaxed">
                If you have any questions about this Privacy Policy or wish to exercise your data rights, 
                please contact us through our <Link to="/support" className="text-orange-400 hover:text-orange-300 underline">support page</Link>.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;

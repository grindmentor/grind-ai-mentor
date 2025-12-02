
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ArrowLeft, Home, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";

const LAST_UPDATED = "December 2, 2025";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-orange-900/20 to-orange-700 text-foreground">
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

        {/* Important Disclaimer Banner */}
        <div className="bg-orange-500/20 border border-orange-500/40 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-orange-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-orange-400 font-semibold mb-1">Important Notice</p>
              <p className="text-orange-300 text-sm">
                Myotopia provides AI-generated fitness information for educational purposes only. 
                This is not medical advice. Always consult qualified healthcare professionals before 
                starting any fitness or nutrition program.
              </p>
            </div>
          </div>
        </div>

        <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Terms and Conditions</CardTitle>
            <CardDescription className="text-gray-400">
              Last updated: {LAST_UPDATED}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-300">
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h3>
              <p className="leading-relaxed">
                By accessing and using Myotopia ("the Service"), you accept and agree to be bound by these 
                Terms of Service. If you do not agree to these terms, you must not use our Service. 
                We reserve the right to modify these terms at any time, and your continued use constitutes 
                acceptance of any changes.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">2. Eligibility</h3>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>You must be at least 18 years old to use this Service</li>
                <li>You must provide accurate and complete registration information</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You are responsible for all activities that occur under your account</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">3. Health and Fitness Disclaimer</h3>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-3">
                <p className="text-red-400 font-semibold mb-2">IMPORTANT MEDICAL DISCLAIMER</p>
                <p className="text-red-300 text-sm leading-relaxed">
                  THE CONTENT PROVIDED BY MYOTOPIA IS FOR INFORMATIONAL AND EDUCATIONAL PURPOSES ONLY 
                  AND IS NOT INTENDED AS MEDICAL ADVICE, DIAGNOSIS, OR TREATMENT. ALWAYS SEEK THE ADVICE 
                  OF YOUR PHYSICIAN OR OTHER QUALIFIED HEALTH PROVIDER WITH ANY QUESTIONS YOU MAY HAVE 
                  REGARDING A MEDICAL CONDITION OR FITNESS PROGRAM.
                </p>
              </div>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>Consult with a healthcare provider before starting any fitness or nutrition program</li>
                <li>Stop any exercise immediately if you experience pain, dizziness, or discomfort</li>
                <li>Our AI recommendations are general guidance, not personalized medical advice</li>
                <li>Results vary by individual and depend on many factors beyond our control</li>
                <li>We do not guarantee any specific fitness or health outcomes</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">4. AI-Generated Content Disclaimer</h3>
              <p className="leading-relaxed mb-3">
                Myotopia uses artificial intelligence to generate fitness and nutrition recommendations. 
                Please be aware of the following:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>AI-generated content may contain errors or inaccuracies</li>
                <li>Recommendations are based on general fitness principles and may not suit your specific circumstances</li>
                <li>AI outputs should be verified with qualified professionals when appropriate</li>
                <li>We continuously improve our AI but cannot guarantee accuracy or completeness</li>
                <li>Certain features may be in beta and subject to change or discontinuation</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">5. User Conduct</h3>
              <p className="leading-relaxed mb-3">You agree NOT to:</p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>Use the Service for any unlawful purpose or in violation of any laws</li>
                <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                <li>Upload malicious code, spam, or harmful content</li>
                <li>Impersonate others or misrepresent your affiliation with any person or entity</li>
                <li>Use the Service to provide medical advice to others</li>
                <li>Reproduce, duplicate, or resell any part of the Service without permission</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">6. Subscription and Billing</h3>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>Premium features require a paid subscription</li>
                <li>Subscriptions automatically renew unless cancelled before the renewal date</li>
                <li>Prices are subject to change with reasonable notice</li>
                <li>You can cancel your subscription at any time through your account settings</li>
                <li><strong>Refund Policy:</strong> We do not offer refunds for subscription payments. By subscribing, you acknowledge this no-refund policy</li>
                <li>Cancellation takes effect at the end of your current billing period</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">7. Intellectual Property</h3>
              <p className="leading-relaxed">
                All content, features, and functionality of Myotopia, including but not limited to text, 
                graphics, logos, and software, are the exclusive property of Myotopia and are protected 
                by copyright, trademark, and other intellectual property laws. You may not reproduce, 
                distribute, modify, or create derivative works without our express written permission.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">8. User-Generated Content</h3>
              <p className="leading-relaxed">
                By uploading content (such as progress photos or workout notes), you grant Myotopia a 
                non-exclusive, royalty-free license to use, store, and process that content solely for 
                the purpose of providing and improving our services. You retain ownership of your content 
                and can delete it at any time.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">9. Limitation of Liability</h3>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <p className="leading-relaxed text-sm">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, MYOTOPIA AND ITS AFFILIATES, OFFICERS, EMPLOYEES, 
                  AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR 
                  PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR GOODWILL, 
                  ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.
                </p>
                <p className="leading-relaxed text-sm mt-3">
                  IN NO EVENT SHALL OUR TOTAL LIABILITY EXCEED THE AMOUNT YOU PAID TO US IN THE TWELVE (12) 
                  MONTHS PRECEDING THE CLAIM, OR $100, WHICHEVER IS GREATER.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">10. Disclaimer of Warranties</h3>
              <p className="leading-relaxed">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER 
                EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, 
                FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE 
                WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">11. Indemnification</h3>
              <p className="leading-relaxed">
                You agree to indemnify and hold harmless Myotopia and its affiliates from any claims, 
                damages, losses, or expenses (including reasonable attorney fees) arising from your use 
                of the Service, violation of these Terms, or infringement of any third-party rights.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">12. Termination</h3>
              <p className="leading-relaxed">
                We reserve the right to suspend or terminate your account at our discretion, with or without 
                notice, for conduct that we believe violates these Terms or is harmful to other users, us, 
                or third parties. Upon termination, your right to use the Service will immediately cease.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">13. Governing Law</h3>
              <p className="leading-relaxed">
                These Terms shall be governed by and construed in accordance with applicable laws, without 
                regard to conflict of law principles. Any disputes arising from these Terms or your use of 
                the Service shall be resolved through binding arbitration, except where prohibited by law.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">14. Severability</h3>
              <p className="leading-relaxed">
                If any provision of these Terms is found to be unenforceable or invalid, that provision 
                shall be limited or eliminated to the minimum extent necessary, and the remaining provisions 
                shall remain in full force and effect.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">15. Contact Information</h3>
              <p className="leading-relaxed">
                If you have any questions about these Terms of Service, please contact us through 
                our <Link to="/support" className="text-orange-400 hover:text-orange-300 underline">support page</Link>.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;

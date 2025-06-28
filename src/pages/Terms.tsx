
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            onClick={() => window.history.back()}
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-gray-800/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Terms of Service</h1>
          
          <div className="space-y-8">
            <section className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">Acceptance of Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                By accessing and using Myotopia, you accept and agree to be bound by the terms 
                and provision of this agreement. These Terms of Service constitute a legally 
                binding agreement between you and Myotopia.
              </p>
            </section>

            <section className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">Use of Service</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Myotopia provides fitness guidance and AI-powered recommendations. You agree to use 
                our service responsibly and in accordance with these terms:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2">
                <li>You must be at least 16 years old to use our service</li>
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>You will not use the service for any unlawful purpose</li>
                <li>You will not attempt to interfere with or disrupt our service</li>
              </ul>
            </section>

            <section className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">Health and Safety Disclaimer</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                <strong>Important:</strong> Myotopia provides fitness guidance for informational purposes only. 
                Our recommendations are not medical advice and should not replace consultation with healthcare professionals.
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2">
                <li>Consult your doctor before starting any new exercise program</li>
                <li>Stop exercising if you experience pain or discomfort</li>
                <li>We are not liable for injuries resulting from use of our recommendations</li>
                <li>Individual results may vary based on personal circumstances</li>
              </ul>
            </section>

            <section className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">Intellectual Property</h2>
              <p className="text-gray-300 leading-relaxed">
                All content, features, and functionality of Myotopia are owned by us and are 
                protected by international copyright, trademark, and other intellectual property laws. 
                You may not reproduce, distribute, or create derivative works without our express permission.
              </p>
            </section>

            <section className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">Limitation of Liability</h2>
              <p className="text-gray-300 leading-relaxed">
                Myotopia shall not be liable for any indirect, incidental, special, consequential, 
                or punitive damages, including but not limited to loss of profits, data, or use, 
                arising out of or relating to your use of our service.
              </p>
            </section>

            <section className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">Changes to Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of 
                any significant changes. Your continued use of the service after such modifications 
                constitutes acceptance of the updated terms.
              </p>
            </section>

            <section className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">Contact Information</h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at 
                legal@myotopia.com.
              </p>
            </section>
          </div>

          <div className="mt-8 text-center text-gray-500 text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}

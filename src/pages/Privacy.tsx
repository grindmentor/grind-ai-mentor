
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Privacy() {
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
          <h1 className="text-4xl font-bold mb-8 text-center">Privacy Policy</h1>
          
          <div className="space-y-8">
            <section className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">Information We Collect</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We collect information you provide directly to us, such as when you create an account, 
                use our services, or contact us for support.
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2">
                <li>Account information (email, name, preferences)</li>
                <li>Fitness data (workouts, progress, goals)</li>
                <li>Usage data (how you interact with our app)</li>
                <li>Device information (for optimization purposes)</li>
              </ul>
            </section>

            <section className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">How We Use Your Information</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We use the information we collect to provide, maintain, and improve our services:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2">
                <li>Personalize your fitness experience</li>
                <li>Track your progress and provide insights</li>
                <li>Improve our AI recommendations</li>
                <li>Send you important updates and notifications</li>
                <li>Provide customer support</li>
              </ul>
            </section>

            <section className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">Data Security</h2>
              <p className="text-gray-300 leading-relaxed">
                We take data security seriously and implement industry-standard measures to protect 
                your information. All data is encrypted in transit and at rest, and we regularly 
                audit our security practices.
              </p>
            </section>

            <section className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">Your Rights</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and data</li>
                <li>Export your data</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </section>

            <section className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">Contact Us</h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, 
                please contact us at privacy@myotopia.com.
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

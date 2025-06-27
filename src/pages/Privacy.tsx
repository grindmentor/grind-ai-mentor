
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Dumbbell } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              to="/"
              className="text-white hover:text-orange-400 transition-colors font-medium flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-lg font-semibold">Privacy Policy</h1>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-400">
            How we protect and handle your personal information
          </p>
        </div>

        <div className="bg-gray-900/40 rounded-xl p-8 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Information We Collect</h2>
            <p className="text-gray-400 mb-4">
              We collect information you provide directly to us, such as when you create an account, 
              use our services, or contact us for support. This may include your name, email address, 
              fitness goals, and workout data.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>Provide and improve our fitness coaching services</li>
              <li>Personalize your workout and nutrition recommendations</li>
              <li>Send you important updates about your account</li>
              <li>Respond to your questions and support requests</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Data Security</h2>
            <p className="text-gray-400">
              We implement appropriate security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction. All data is encrypted in 
              transit and at rest.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Your Rights</h2>
            <p className="text-gray-400">
              You have the right to access, update, or delete your personal information. You can 
              manage your account settings or contact us directly for assistance with your data.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-gray-400">
              If you have any questions about this Privacy Policy, please contact us through our 
              support page or email us directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;

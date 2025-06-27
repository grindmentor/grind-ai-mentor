
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Dumbbell } from 'lucide-react';

const Terms = () => {
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
            <h1 className="text-lg font-semibold">Terms of Service</h1>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-400">
            The terms and conditions for using Myotopia
          </p>
        </div>

        <div className="bg-gray-900/40 rounded-xl p-8 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Acceptance of Terms</h2>
            <p className="text-gray-400">
              By accessing and using Myotopia, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to these terms, please do not 
              use our service.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Use of Service</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>You must be at least 18 years old to use this service</li>
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You agree to use the service for lawful purposes only</li>
              <li>You will not attempt to gain unauthorized access to our systems</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Health and Fitness Disclaimer</h2>
            <p className="text-gray-400">
              Myotopia provides fitness and nutrition information for educational purposes only. 
              This information is not intended as a substitute for professional medical advice. 
              Please consult with a healthcare provider before starting any fitness program.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Subscription and Billing</h2>
            <p className="text-gray-400">
              Premium features require a paid subscription. Subscriptions automatically renew unless 
              cancelled. You can manage your subscription through your account settings or contact 
              our support team.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Limitation of Liability</h2>
            <p className="text-gray-400">
              Myotopia shall not be liable for any indirect, incidental, special, consequential, 
              or punitive damages resulting from your use of the service.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Contact Information</h2>
            <p className="text-gray-400">
              If you have any questions about these Terms of Service, please contact us through 
              our support page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;

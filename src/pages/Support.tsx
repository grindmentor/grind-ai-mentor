
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Mail, MessageSquare, Dumbbell } from 'lucide-react';

const Support = () => {
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
            <h1 className="text-lg font-semibold">Support</h1>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Support Center</h1>
          <p className="text-xl text-gray-400">
            We're here to help you on your fitness journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-900/40 rounded-xl p-8">
            <div className="flex items-center mb-6">
              <Mail className="w-8 h-8 text-blue-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">Email Support</h2>
            </div>
            <p className="text-gray-400 mb-6">
              Send us an email and we'll get back to you within 24 hours.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Contact Support
            </Button>
          </div>

          <div className="bg-gray-900/40 rounded-xl p-8">
            <div className="flex items-center mb-6">
              <MessageSquare className="w-8 h-8 text-green-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">Live Chat</h2>
            </div>
            <p className="text-gray-400 mb-6">
              Chat with our support team in real-time for immediate assistance.
            </p>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Start Chat
            </Button>
          </div>
        </div>

        <div className="mt-12 bg-gray-900/40 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">How do I cancel my subscription?</h3>
              <p className="text-gray-400">
                You can cancel your subscription at any time from your account settings page. 
                Your access will continue until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Can I use Myotopia offline?</h3>
              <p className="text-gray-400">
                While some features require an internet connection, you can download workouts 
                and access them offline once they're saved to your device.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">How accurate are the AI recommendations?</h3>
              <p className="text-gray-400">
                Our AI recommendations are based on peer-reviewed research and are continuously 
                updated with the latest fitness science. However, always consult with a healthcare 
                professional before starting any new fitness program.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;

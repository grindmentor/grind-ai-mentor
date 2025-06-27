
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, Dumbbell, Award, Users, TrendingUp } from 'lucide-react';

const About = () => {
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
            <h1 className="text-lg font-semibold">About Myotopia</h1>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
            <span className="text-4xl font-bold text-white">Myotopia</span>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-white">
            Science-Based Fitness for Everyone
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            We believe fitness should be backed by science, personalized by AI, and accessible to all. 
            Our mission is to revolutionize how people approach their health and fitness journey.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center p-6 bg-gray-900/40 rounded-xl">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Evidence-Based</h3>
            <p className="text-gray-400">
              Every recommendation is backed by peer-reviewed research and scientific studies, 
              ensuring you get results that actually work.
            </p>
          </div>

          <div className="text-center p-6 bg-gray-900/40 rounded-xl">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">AI-Powered</h3>
            <p className="text-gray-400">
              Our advanced AI analyzes your progress, preferences, and goals to create 
              personalized training and nutrition plans just for you.
            </p>
          </div>

          <div className="text-center p-6 bg-gray-900/40 rounded-xl">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Community-Driven</h3>
            <p className="text-gray-400">
              Join a community of fitness enthusiasts who share your commitment to 
              science-based training and continuous improvement.
            </p>
          </div>
        </div>

        <div className="bg-gray-900/40 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Our Story</h2>
          <p className="text-gray-400 mb-4">
            Myotopia was born from the frustration of seeing too many people struggle with 
            fitness misinformation and cookie-cutter programs that don't deliver results. 
            We knew there had to be a better way.
          </p>
          <p className="text-gray-400 mb-4">
            By combining the latest exercise science research with cutting-edge AI technology, 
            we've created a platform that adapts to your unique needs, preferences, and goals. 
            No more guesswork, no more one-size-fits-all solutions.
          </p>
          <p className="text-gray-400">
            Whether you're a beginner taking your first steps into fitness or a seasoned 
            athlete looking to optimize your performance, Myotopia provides the tools, 
            knowledge, and guidance you need to succeed.
          </p>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
          <p className="text-gray-400 mb-6">
            Join thousands of people who have transformed their lives with science-based fitness.
          </p>
          <Link to="/signup">
            <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3 text-lg">
              Get Started Today
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;

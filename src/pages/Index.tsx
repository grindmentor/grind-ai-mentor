
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ScientificStudies from '@/components/homepage/ScientificStudies';
import { AvailableAchievements } from '@/components/homepage/AvailableAchievements';

const Index = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <main>
        {/* Hero Section */}
        <section className="py-20 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">
              Welcome to Myotopia
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              Your AI-powered fitness companion for smarter training, nutrition, and progress tracking.
            </p>
            <div className="space-x-4">
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                  Get Started
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Available Achievements Section */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AvailableAchievements />
          </div>
        </section>

        {/* Scientific Studies Section */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScientificStudies />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;


import React, { Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { AppBackground } from '@/components/ui/app-background';

// Lazy load components
const Dashboard = React.lazy(() => import('@/components/Dashboard'));
const LandingPage = React.lazy(() => import('@/components/homepage/LandingPage'));

// Create a simple landing page component with available achievements
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Welcome to Myotopia
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Your science-backed fitness companion powered by AI
            </p>
          </div>
          
          {/* Available Achievements Section */}
          <AvailableAchievements />
          
          <div className="text-center mt-12">
            <a 
              href="/signin" 
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Loading Myotopia..." />;
  }

  return (
    <AppBackground>
      <Suspense fallback={<LoadingScreen message="Loading..." />}>
        {user ? <Dashboard /> : <LandingPage />}
      </Suspense>
    </AppBackground>
  );
}

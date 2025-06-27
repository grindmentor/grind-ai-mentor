
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useModules } from '@/contexts/ModulesContext';
import { PageTransition } from '@/components/ui/page-transition';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ModuleGrid } from '@/components/dashboard/ModuleGrid';
import { Star, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { user } = useAuth();
  const { modules } = useModules();
  const [selectedModule, setSelectedModule] = useState(null);
  const [favorites, setFavorites] = useState([]);

  // Load favorites from localStorage safely
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('module-favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    }
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = (moduleId) => {
    try {
      const newFavorites = favorites.includes(moduleId) 
        ? favorites.filter(id => id !== moduleId)
        : [...favorites, moduleId];
      
      setFavorites(newFavorites);
      localStorage.setItem('module-favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const handleModuleClick = (module) => {
    console.log('Module clicked:', module.id);
    setSelectedModule(module);
  };

  const handleBackToDashboard = () => {
    setSelectedModule(null);
  };

  const handleFoodLogged = (data) => {
    console.log('Food logged:', data);
  };

  // Handle case where modules might not be loaded yet
  if (!modules || modules.length === 0) {
    return <LoadingScreen message="Loading modules..." />;
  }

  if (selectedModule) {
    const ModuleComponent = selectedModule.component;
    return (
      <ErrorBoundary>
        <PageTransition>
          <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
            <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800/50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <button
                    onClick={handleBackToDashboard}
                    className="text-white hover:text-orange-400 transition-colors font-medium"
                  >
                    ← Back to Dashboard
                  </button>
                  <h1 className="text-lg font-semibold text-center flex-1 px-4 truncate">
                    {selectedModule.title}
                  </h1>
                  <div className="w-32"></div>
                </div>
              </div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <ModuleComponent 
                onBack={handleBackToDashboard}
                onFoodLogged={handleFoodLogged}
              />
            </div>
          </div>
        </PageTransition>
      </ErrorBoundary>
    );
  }

  // Separate Progress Hub from other modules
  const progressHubModule = modules.find(m => m.id === 'progress-hub');
  const otherModules = modules.filter(m => m.id !== 'progress-hub');

  return (
    <ErrorBoundary>
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
          <DashboardHeader />

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="mb-8 sm:mb-12 text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Champion'}! 👋
              </h1>
              <p className="text-gray-400 text-base sm:text-lg">
                Ready to achieve your fitness goals with science-backed training?
              </p>
            </div>

            {/* Favorites Section */}
            {favorites.length > 0 && (
              <div className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center">
                  <Star className="w-6 h-6 mr-2 text-yellow-500 fill-current" />
                  Favorites
                </h2>
                <ModuleGrid
                  modules={otherModules.filter(module => favorites.includes(module.id))}
                  favorites={favorites}
                  onModuleClick={handleModuleClick}
                  onToggleFavorite={toggleFavorite}
                />
              </div>
            )}

            {/* All Modules */}
            <div className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                All Modules
              </h2>
              <ModuleGrid
                modules={otherModules}
                favorites={favorites}
                onModuleClick={handleModuleClick}
                onToggleFavorite={toggleFavorite}
              />
            </div>

            {/* Progress Hub - Long Rectangular Button */}
            {progressHubModule && (
              <div className="mb-8">
                <Button
                  onClick={() => handleModuleClick(progressHubModule)}
                  className="w-full h-20 bg-gradient-to-r from-blue-500/20 to-blue-600/40 backdrop-blur-sm border border-blue-500/30 hover:from-blue-500/30 hover:to-blue-600/50 transition-all duration-300 text-white rounded-xl group"
                >
                  <div className="flex items-center justify-between w-full px-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                          Progress Hub
                        </h3>
                        <p className="text-sm text-gray-300">
                          Track your fitness journey with detailed analytics
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-blue-400" />
                      <span className="text-sm text-blue-300">View Progress</span>
                    </div>
                  </div>
                </Button>
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    </ErrorBoundary>
  );
};

export default Dashboard;

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
import ScientificStudies from '@/components/homepage/ScientificStudies';
import PersonalizedSummary from '@/components/homepage/PersonalizedSummary';
import NotificationsSummary from '@/components/dashboard/NotificationsSummary';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard = () => {
  const { user } = useAuth();
  const { modules } = useModules();
  const isMobile = useIsMobile();
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
          <div className="min-h-screen bg-white overflow-x-hidden">
            {/* Mobile-optimized sticky header */}
            <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
              <div className="px-4 sm:px-6">
                <div className="flex items-center justify-between h-14 sm:h-16">
                  <button
                    onClick={handleBackToDashboard}
                    className="text-gray-700 hover:text-orange-500 transition-colors font-medium text-sm sm:text-base py-2 px-3 rounded-lg hover:bg-gray-100 touch-manipulation"
                  >
                    ← Back
                  </button>
                  <h1 className="text-base sm:text-lg font-semibold text-center flex-1 px-4 truncate text-gray-900">
                    {selectedModule.title}
                  </h1>
                  <div className="w-20 sm:w-24"></div>
                </div>
              </div>
            </div>
            
            {/* Module content with mobile-optimized padding */}
            <div className="overflow-x-hidden">
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

  // Filter out Progress Hub from regular modules
  const regularModules = modules.filter(m => m.id !== 'progress-hub');
  const progressHubModule = modules.find(m => m.id === 'progress-hub');

  return (
    <ErrorBoundary>
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white overflow-x-hidden">
          <DashboardHeader />

          {/* Main Content with mobile-optimized spacing */}
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-full overflow-x-hidden">
            <div className="max-w-7xl mx-auto">
              {/* Welcome section with responsive text */}
              <div className="mb-6 sm:mb-8 lg:mb-12 text-center">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 lg:mb-4 leading-tight">
                  Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Champion'}! 👋
                </h1>
                <p className="text-gray-400 text-sm sm:text-base lg:text-lg px-4">
                  Ready to achieve your fitness goals with science-backed training?
                </p>
              </div>

              {/* Compact Notifications Summary */}
              <div className="mb-6 sm:mb-8 lg:mb-12">
                <NotificationsSummary />
              </div>

              {/* Favorites Section with mobile-optimized layout */}
              {favorites.length > 0 ? (
                <div className="mb-6 sm:mb-8 lg:mb-12">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 flex items-center">
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-yellow-500 fill-current" />
                    Your Favorites
                  </h2>
                  <ModuleGrid
                    modules={regularModules.filter(module => favorites.includes(module.id))}
                    favorites={favorites}
                    onModuleClick={handleModuleClick}
                    onToggleFavorite={toggleFavorite}
                  />
                </div>
              ) : (
                <div className="mb-6 sm:mb-8 lg:mb-12 text-center">
                  <div className="bg-gray-900/40 border border-gray-700/50 rounded-2xl p-6 sm:p-8 backdrop-blur-sm max-w-md mx-auto">
                    <Star className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 mx-auto mb-4" />
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-3 sm:mb-4">No Favorites Yet</h2>
                    <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base px-2">
                      Visit the Module Library to explore and favorite modules you'd like to see here.
                    </p>
                    <Button
                      onClick={() => window.location.href = '/modules'}
                      className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 w-full sm:w-auto touch-manipulation"
                    >
                      Browse Module Library
                    </Button>
                  </div>
                </div>
              )}

              {/* Progress Hub - Mobile-optimized - Moved up after favorites */}
              {progressHubModule && (
                <div className="mb-6 sm:mb-8 lg:mb-12">
                  <Button
                    onClick={() => handleModuleClick(progressHubModule)}
                    className="w-full h-16 sm:h-20 bg-gradient-to-r from-purple-900/60 to-purple-800/80 backdrop-blur-sm border border-purple-700/50 hover:from-purple-900/80 hover:to-purple-800/90 transition-all duration-300 text-white rounded-xl group touch-manipulation"
                  >
                    <div className="flex items-center justify-between w-full px-4 sm:px-6">
                      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r from-purple-800/80 to-purple-900/90 border border-purple-700/40 flex items-center justify-center flex-shrink-0">
                          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-200" />
                        </div>
                        <div className="text-left min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg font-semibold text-purple-100 group-hover:text-purple-50 transition-colors truncate">
                            Progress Hub
                          </h3>
                          <p className="text-xs sm:text-sm text-purple-200/80 truncate">
                            Track your fitness journey with detailed analytics
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300/80" />
                        <span className="text-xs sm:text-sm text-purple-200/90 hidden sm:inline">View Progress</span>
                      </div>
                    </div>
                  </Button>
                </div>
              )}

              {/* Dashboard Content Grid - Mobile-optimized */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
                <ScientificStudies />
                <PersonalizedSummary />
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </ErrorBoundary>
  );
};

export default Dashboard;


import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useModules } from '@/contexts/ModulesContext';
import { PageTransition } from '@/components/ui/page-transition';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ModuleGrid } from '@/components/dashboard/ModuleGrid';

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
                Ready to crush your fitness goals today?
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
                  modules={modules.filter(module => favorites.includes(module.id))}
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
                modules={modules}
                favorites={favorites}
                onModuleClick={handleModuleClick}
                onToggleFavorite={toggleFavorite}
              />
            </div>
          </div>
        </div>
      </PageTransition>
    </ErrorBoundary>
  );
};

export default Dashboard;

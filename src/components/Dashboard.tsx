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
import NotificationCenter from '@/components/NotificationCenter';

// Create proper fallback components
const GenericFallback = ({ error, reset }: { error?: Error; reset: () => void }) => (
  <div className="bg-gray-900/40 border border-gray-700/50 rounded-2xl p-6 text-center text-gray-400">
    Unable to load component
    {error && (
      <button onClick={reset} className="ml-2 text-orange-400 hover:text-orange-300 underline">
        Try Again
      </button>
    )}
  </div>
);

const ScientificStudiesFallback = ({ error, reset }: { error?: Error; reset: () => void }) => (
  <div className="bg-gray-900/40 border border-gray-700/50 rounded-2xl p-6 text-center text-gray-400">
    Unable to load scientific studies
    {error && (
      <button onClick={reset} className="ml-2 text-orange-400 hover:text-orange-300 underline">
        Try Again
      </button>
    )}
  </div>
);

const PersonalizedSummaryFallback = ({ error, reset }: { error?: Error; reset: () => void }) => (
  <div className="bg-gray-900/40 border border-gray-700/50 rounded-2xl p-6 text-center text-gray-400">
    Unable to load personalized summary
    {error && (
      <button onClick={reset} className="ml-2 text-orange-400 hover:text-orange-300 underline">
        Try Again
      </button>
    )}
  </div>
);

const NotificationCenterFallback = ({ error, reset }: { error?: Error; reset: () => void }) => (
  <div className="bg-gray-900/40 border border-gray-700/50 rounded-2xl p-6 text-center text-gray-400">
    Unable to load notifications
    {error && (
      <button onClick={reset} className="ml-2 text-orange-400 hover:text-orange-300 underline">
        Try Again
      </button>
    )}
  </div>
);

const FavoriteModulesFallback = ({ error, reset }: { error?: Error; reset: () => void }) => (
  <div className="bg-gray-900/40 border border-gray-700/50 rounded-2xl p-6 text-center text-gray-400">
    Unable to load favorite modules
    {error && (
      <button onClick={reset} className="ml-2 text-orange-400 hover:text-orange-300 underline">
        Try Again
      </button>
    )}
  </div>
);

const ProgressHubFallback = ({ error, reset }: { error?: Error; reset: () => void }) => (
  <div className="bg-gray-900/40 border border-gray-700/50 rounded-2xl p-6 text-center text-gray-400">
    Unable to load Progress Hub
    {error && (
      <button onClick={reset} className="ml-2 text-orange-400 hover:text-orange-300 underline">
        Try Again
      </button>
    )}
  </div>
);

const Dashboard = () => {
  console.log('Dashboard component rendering - start');
  
  const { user } = useAuth();
  const { modules } = useModules();
  const [selectedModule, setSelectedModule] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Safety check for user
  useEffect(() => {
    console.log('Dashboard: User check effect running', { user: !!user });
    if (user) {
      setIsLoading(false);
    }
  }, [user]);

  // Load favorites from localStorage safely
  useEffect(() => {
    console.log('Dashboard: Loading favorites from localStorage');
    try {
      const savedFavorites = localStorage.getItem('module-favorites');
      if (savedFavorites) {
        const parsedFavorites = JSON.parse(savedFavorites);
        console.log('Dashboard: Loaded favorites:', parsedFavorites);
        setFavorites(Array.isArray(parsedFavorites) ? parsedFavorites : []);
      }
    } catch (error) {
      console.error('Dashboard: Error loading favorites:', error);
      setFavorites([]);
    }
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = (moduleId) => {
    console.log('Dashboard: Toggling favorite for module:', moduleId);
    try {
      const newFavorites = favorites.includes(moduleId) 
        ? favorites.filter(id => id !== moduleId)
        : [...favorites, moduleId];
      
      setFavorites(newFavorites);
      localStorage.setItem('module-favorites', JSON.stringify(newFavorites));
      console.log('Dashboard: Updated favorites:', newFavorites);
    } catch (error) {
      console.error('Dashboard: Error saving favorites:', error);
    }
  };

  const handleModuleClick = (module) => {
    console.log('Dashboard: Module clicked:', module?.id);
    if (module && module.component) {
      setSelectedModule(module);
    } else {
      console.error('Dashboard: Invalid module clicked:', module);
    }
  };

  const handleBackToDashboard = () => {
    console.log('Dashboard: Returning to dashboard');
    setSelectedModule(null);
  };

  const handleFoodLogged = (data) => {
    console.log('Dashboard: Food logged:', data);
  };

  // Early loading state
  if (isLoading || !user) {
    console.log('Dashboard: Showing loading screen - user loading');
    return <LoadingScreen message="Loading user data..." />;
  }

  // Safety check for modules
  if (!modules || !Array.isArray(modules) || modules.length === 0) {
    console.log('Dashboard: No modules found, showing loading screen');
    return <LoadingScreen message="Loading modules..." />;
  }

  console.log('Dashboard: Loaded', modules.length, 'modules');

  // Handle selected module rendering
  if (selectedModule) {
    console.log('Dashboard: Rendering selected module:', selectedModule.title);
    const ModuleComponent = selectedModule.component;
    
    if (!ModuleComponent) {
      console.error('Dashboard: Selected module has no component:', selectedModule);
      setSelectedModule(null);
      return <LoadingScreen message="Loading module..." />;
    }
    
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

  // Filter out Progress Hub from regular modules
  const regularModules = modules.filter(m => m && m.id !== 'progress-hub');
  const progressHubModule = modules.find(m => m && m.id === 'progress-hub');

  console.log('Dashboard: Rendering main dashboard view');
  console.log('Dashboard: Regular modules:', regularModules.length);
  console.log('Dashboard: Progress hub module:', progressHubModule ? 'found' : 'not found');

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Champion';

  return (
    <ErrorBoundary>
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
          <DashboardHeader />

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="mb-8 sm:mb-12 text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                Welcome back, {userName}! 👋
              </h1>
              <p className="text-gray-400 text-base sm:text-lg">
                Ready to achieve your fitness goals with science-backed training?
              </p>
            </div>

            {/* Dashboard Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 sm:mb-12">
              <ErrorBoundary fallback={ScientificStudiesFallback}>
                <ScientificStudies />
              </ErrorBoundary>
              <ErrorBoundary fallback={PersonalizedSummaryFallback}>
                <PersonalizedSummary />
              </ErrorBoundary>
            </div>

            {/* Notification Center */}
            <div className="mb-8 sm:mb-12">
              <ErrorBoundary fallback={NotificationCenterFallback}>
                <NotificationCenter />
              </ErrorBoundary>
            </div>

            {/* Show only favorites if they exist, otherwise show message */}
            {favorites.length > 0 ? (
              <div className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center">
                  <Star className="w-6 h-6 mr-2 text-yellow-500 fill-current" />
                  Your Favorites
                </h2>
                <ErrorBoundary fallback={FavoriteModulesFallback}>
                  <ModuleGrid
                    modules={regularModules.filter(module => module && favorites.includes(module.id))}
                    favorites={favorites}
                    onModuleClick={handleModuleClick}
                    onToggleFavorite={toggleFavorite}
                  />
                </ErrorBoundary>
              </div>
            ) : (
              <div className="mb-8 sm:mb-12 text-center">
                <div className="bg-gray-900/40 border border-gray-700/50 rounded-2xl p-8 backdrop-blur-sm">
                  <Star className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-4">No Favorites Yet</h2>
                  <p className="text-gray-400 mb-6">
                    Visit the Module Library to explore and favorite modules you'd like to see here.
                  </p>
                  <Button
                    onClick={() => window.location.href = '/modules'}
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  >
                    Browse Module Library
                  </Button>
                </div>
              </div>
            )}

            {/* Progress Hub - Purple Button */}
            {progressHubModule && (
              <div className="mb-8">
                <ErrorBoundary fallback={ProgressHubFallback}>
                  <Button
                    onClick={() => handleModuleClick(progressHubModule)}
                    className="w-full h-20 bg-gradient-to-r from-purple-500/20 to-purple-600/40 backdrop-blur-sm border border-purple-500/30 hover:from-purple-500/30 hover:to-purple-600/50 transition-all duration-300 text-white rounded-xl group"
                  >
                    <div className="flex items-center justify-between w-full px-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                            Progress Hub
                          </h3>
                          <p className="text-sm text-gray-300">
                            Track your fitness journey with detailed analytics
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <span className="text-sm text-purple-300">View Progress</span>
                      </div>
                    </div>
                  </Button>
                </ErrorBoundary>
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    </ErrorBoundary>
  );
};

export default Dashboard;

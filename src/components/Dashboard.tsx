import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useModules } from '@/contexts/ModulesContext';
import { PageTransition } from '@/components/ui/page-transition';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Star, TrendingUp, Sparkles, Bell, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFavorites } from '@/hooks/useFavorites';
import { usePerformanceContext } from '@/components/ui/performance-provider';
import { useSubscription } from '@/hooks/useSubscription';
import { useLocation } from 'react-router-dom';
import NotificationCenter from '@/components/NotificationCenter';

// Lazy load heavy components
const ModuleGrid = lazy(() => import('@/components/dashboard/ModuleGrid'));
const RealGoalsAchievements = lazy(() => import('@/components/goals/RealGoalsAchievements').then(module => ({ default: module.RealGoalsAchievements })));
const LatestResearch = lazy(() => import('@/components/homepage/LatestResearch'));
const ModuleErrorBoundary = lazy(() => import('@/components/ModuleErrorBoundary'));

const Dashboard = () => {
  const { user } = useAuth();
  const { modules } = useModules();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [selectedModule, setSelectedModule] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [navigationSource, setNavigationSource] = useState<'dashboard' | 'library'>('dashboard');
  const { favorites, loading: favoritesLoading, toggleFavorite } = useFavorites();
  const { lowDataMode, createDebouncedFunction } = usePerformanceContext();
  const { currentTier, currentTierData } = useSubscription();

  // Check if we should open notifications from navigation state
  useEffect(() => {
    if (location.state?.openNotifications) {
      setShowNotifications(true);
      // Clear the state to prevent reopening on subsequent renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Optimized module click handler with debouncing
  const handleModuleClick = useMemo(() => {
    const handler = (module: any) => {
      console.log('Module clicked:', module.id, 'at', new Date().toISOString());
      try {
        setSelectedModule(module);
        setNavigationSource('dashboard');
      } catch (error) {
        console.error('Error setting selected module:', error);
      }
    };
    return createDebouncedFunction(handler, 150) as (module: any) => void;
  }, [createDebouncedFunction]);

  const handleBackToDashboard = useMemo(() => {
    const handler = () => {
      console.log('Returning to dashboard at', new Date().toISOString());
      try {
        setSelectedModule(null);
        setShowNotifications(false);
      } catch (error) {
        console.error('Error returning to dashboard:', error);
      }
    };
    return createDebouncedFunction(handler, 100) as () => void;
  }, [createDebouncedFunction]);

  const handleNotificationsClick = () => {
    setShowNotifications(true);
  };

  const handleProfileClick = () => {
    window.location.href = '/profile';
  };

  const handleSettingsClick = () => {
    window.location.href = '/settings';
  };

  const handleFoodLogged = useMemo(() => {
    const handler = (data: any) => {
      console.log('Food logged:', data);
    };
    return createDebouncedFunction(handler, 200) as (data: any) => void;
  }, [createDebouncedFunction]);

  // Memoized computed values
  const { regularModules, progressHubModule, favoriteModules } = useMemo(() => {
    if (!modules || modules.length === 0) return { regularModules: [], progressHubModule: null, favoriteModules: [] };
    
    const regular = modules.filter(m => m.id !== 'progress-hub');
    const progressHub = modules.find(m => m.id === 'progress-hub');
    const favoritesList = regular.filter(module => favorites.includes(module.id));
    
    return {
      regularModules: regular,
      progressHubModule: progressHub,
      favoriteModules: favoritesList
    };
  }, [modules, favorites]);

  // Handle case where modules might not be loaded yet
  if (!modules || modules.length === 0) {
    console.log('Modules not loaded yet, showing loading screen');
    return <LoadingScreen message="Loading Myotopia modules..." />;
  }

  // Show notifications
  if (showNotifications) {
    return <NotificationCenter onBack={handleBackToDashboard} />;
  }

  if (selectedModule) {
    console.log('Rendering selected module:', selectedModule.id);
    try {
      const ModuleComponent = selectedModule.component;
      return (
        <ErrorBoundary>
          <PageTransition>
            <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white overflow-x-hidden">
              <Suspense fallback={<LoadingScreen message="Loading module..." />}>
                <ModuleErrorBoundary moduleName={selectedModule.title} onBack={handleBackToDashboard}>
                  <ModuleComponent 
                    onBack={handleBackToDashboard}
                    onFoodLogged={handleFoodLogged}
                    navigationSource={navigationSource}
                  />
                </ModuleErrorBoundary>
              </Suspense>
            </div>
          </PageTransition>
        </ErrorBoundary>
      );
    } catch (error) {
      console.error('Error rendering selected module:', error);
      setSelectedModule(null);
    }
  }

  console.log('Rendering dashboard with', modules.length, 'total modules');

  return (
    <ErrorBoundary>
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white overflow-x-hidden">
          {/* Enhanced header with notifications, profile, and settings */}
          <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800/50">
            <div className="px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h1 className="text-xl sm:text-2xl font-bold text-white">
                    Myotopia
                  </h1>
                  {/* Subscription tier indicator */}
                  <div className="hidden sm:block">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      currentTier === 'premium' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                      currentTier === 'basic' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                      'bg-gray-600 text-gray-300'
                    }`}>
                      {currentTier.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 sm:space-x-2">
                  {/* Notifications */}
                  <Button
                    onClick={handleNotificationsClick}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white hover:bg-gray-800/50 p-2"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                  </Button>

                  {/* Profile */}
                  <Button
                    onClick={handleProfileClick}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white hover:bg-gray-800/50 p-2"
                    title="Profile"
                  >
                    <User className="w-5 h-5" />
                  </Button>

                  {/* Settings */}
                  <Button
                    onClick={handleSettingsClick}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white hover:bg-gray-800/50 p-2"
                    title="Settings"
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

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

              {/* Favorites Section with performance optimization */}
              {!favoritesLoading && favoriteModules.length > 0 ? (
                <div className="mb-6 sm:mb-8 lg:mb-12">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 flex items-center">
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-yellow-500 fill-current" />
                    Your Favorites
                  </h2>
                  <Suspense fallback={<div className="h-32 bg-gray-900/40 rounded-xl animate-pulse" />}>
                    <ModuleGrid
                      modules={favoriteModules}
                      favorites={favorites}
                      onModuleClick={handleModuleClick}
                      onToggleFavorite={toggleFavorite}
                    />
                  </Suspense>
                </div>
              ) : !favoritesLoading ? (
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
              ) : null}

              {/* Progress Hub - Optimized */}
              {progressHubModule && (
                <div className="mb-6 sm:mb-8 lg:mb-12">
                  <Button
                    onClick={() => handleModuleClick(progressHubModule)}
                    className="w-full h-16 sm:h-20 bg-gradient-to-r from-purple-900/60 to-purple-800/80 backdrop-blur-sm border border-purple-700/50 hover:from-purple-900/80 hover:to-purple-800/90 transition-all duration-200 text-white rounded-xl group touch-manipulation gpu-accelerated"
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

              {/* Dashboard Content Grid - Performance optimized */}
              {!lowDataMode && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
                  <Suspense fallback={<div className="h-48 bg-gray-900/40 rounded-xl animate-pulse" />}>
                    <RealGoalsAchievements />
                  </Suspense>
                  <Suspense fallback={<div className="h-48 bg-gray-900/40 rounded-xl animate-pulse" />}>
                    <LatestResearch />
                  </Suspense>
                </div>
              )}
            </div>
          </div>
        </div>
      </PageTransition>
    </ErrorBoundary>
  );
};

export default Dashboard;

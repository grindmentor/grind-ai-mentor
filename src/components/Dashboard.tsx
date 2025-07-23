

import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useModules } from '@/contexts/ModulesContext';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '@/components/ui/page-transition';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Star, TrendingUp, Sparkles, Bell, User, Settings, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFavorites } from '@/hooks/useFavorites';
import { usePerformanceContext } from '@/components/ui/performance-provider';
import { useSubscription } from '@/hooks/useSubscription';
import { useLocation } from 'react-router-dom';
import NotificationCenter from '@/components/NotificationCenter';
import { SmoothTransition } from '@/components/ui/smooth-transition';
import { BrandedLoading } from '@/components/ui/branded-loading';
import { EnhancedLoading } from '@/components/ui/enhanced-loading';
import { useSessionCache } from '@/hooks/useSessionCache';
import { useModulePreloader } from '@/hooks/usePreloadComponents';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';
import { useMobileGestures } from '@/hooks/useMobileGestures';
import { SmoothPageTransition } from '@/components/ui/smooth-page-transition';
import PremiumPromoCard from '@/components/PremiumPromoCard';
import { toast } from 'sonner';
import { useInstantLoading } from '@/hooks/useInstantLoading';
import { useAggressiveModulePreloader } from '@/hooks/useAggressiveModulePreloader';

// Lazy load heavy components with better loading states
const ModuleGrid = lazy(() => import('@/components/dashboard/ModuleGrid'));
const RealGoalsAchievements = lazy(() => import('@/components/goals/RealGoalsAchievements'));
const LatestResearch = lazy(() => import('@/components/homepage/LatestResearch'));
const ModuleErrorBoundary = lazy(() => import('@/components/ModuleErrorBoundary'));

// Define the type for computed modules
interface ComputedModules {
  regularModules: any[];
  progressHubModule: any;
  favoriteModules: any[];
}

const Dashboard = () => {
  const { user } = useAuth();
  const { modules } = useModules();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedModule, setSelectedModule] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [navigationSource, setNavigationSource] = useState<'dashboard' | 'library' | 'direct'>('dashboard');
  const { favorites, loading: favoritesLoading, toggleFavorite } = useFavorites();
  const { lowDataMode, createDebouncedFunction } = usePerformanceContext();
  const { currentTier, currentTierData } = useSubscription();
  const { preloadModule } = useModulePreloader();
  
  // Instant loading optimization
  const { isShellReady, trackInteraction, warmupRoute } = useInstantLoading({
    preloadModules: ['CoachGPT', 'SmartTraining', 'WorkoutLoggerAI'],
    enablePredictiveLoading: true,
    aggressiveCaching: !lowDataMode
  });

  const { 
    preloadOnHover, 
    preloadOnInteraction, 
    isModuleReady 
  } = useAggressiveModulePreloader();

  const handleModuleHover = (moduleId: string) => {
    preloadOnHover(moduleId);
  };
  
  // Session persistence for smooth navigation
  const {
    scrollElementRef,
    sessionState,
    toggleSection,
    isSectionExpanded
  } = useSessionPersistence('dashboard');

  // Mobile gestures for native app feel
  const { elementRef: gestureRef, isRefreshing } = useMobileGestures({
    onPullToRefresh: () => {
      // Refresh functionality - could trigger a data refetch
      toast.success('Dashboard refreshed');
    },
    onSwipeRight: () => {
      if (selectedModule) {
        setSelectedModule(null);
        setNavigationSource('dashboard');
      }
    }
  });
  
  // Session caching for dashboard data
  const dashboardCache = useSessionCache('dashboard', 300000); // 5 minutes

  // Helper function to get module by ID
  const getModuleById = (moduleId: string) => {
    return modules?.find(module => module.id === moduleId) || null;
  };

  // Check if we should open notifications from navigation state or URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (location.state?.openNotifications || urlParams.get('notifications') === 'true') {
      setShowNotifications(true);
      // Clear the state to prevent reopening on subsequent renders
      if (location.state?.openNotifications) {
        window.history.replaceState({}, document.title);
      }
    }

    // Handle module parameter for direct navigation to modules
    const moduleParam = urlParams.get('module');
    if (moduleParam && !selectedModule) {
      const moduleData = getModuleById(moduleParam);
      if (moduleData) {
        setSelectedModule(moduleData);
        setNavigationSource('direct');
        
        // Clear the module parameter from URL to prevent re-triggering
        const newParams = new URLSearchParams(urlParams);
        newParams.delete('module');
        const newUrl = newParams.toString() 
          ? `${window.location.pathname}?${newParams.toString()}`
          : window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [location.state, selectedModule]);

  // Optimized module click handler with preloading
  const handleModuleClick = useMemo(() => {
    const handler = (module: any) => {
      console.log('Module clicked:', module.id, 'at', new Date().toISOString());
      
      // Preload the module if not already loaded
      if (module.id && !lowDataMode) {
        preloadModule(module.id);
      }
      
      try {
        setSelectedModule(module);
        setNavigationSource('dashboard');
      } catch (error) {
        console.error('Error setting selected module:', error);
      }
    };
    return createDebouncedFunction(handler, 150) as (module: any) => void;
  }, [createDebouncedFunction, preloadModule, lowDataMode]);

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
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleFoodLogged = useMemo(() => {
    const handler = (data: any) => {
      console.log('Food logged:', data);
    };
    return createDebouncedFunction(handler, 200) as (data: any) => void;
  }, [createDebouncedFunction]);

  // Memoized computed values with caching - Fixed favorites update issue
  const { regularModules, progressHubModule, favoriteModules }: ComputedModules = useMemo(() => {
    // Include favorites in cache key to invalidate when favorites change
    const cacheKey = `computed-modules-${favorites.join(',')}-${modules?.length || 0}`;
    const cached = dashboardCache.get(cacheKey);
    
    // Consistent return type structure
    const defaultResult: ComputedModules = {
      regularModules: [] as any[],
      progressHubModule: null as any,
      favoriteModules: [] as any[]
    };

    if (cached && modules && modules.length > 0 && !favoritesLoading) {
      return cached as ComputedModules;
    }

    if (!modules || modules.length === 0) {
      return defaultResult;
    }
    
    const regular = modules.filter(m => m.id !== 'progress-hub');
    const progressHub = modules.find(m => m.id === 'progress-hub') || null;
    const favoritesList = regular.filter(module => favorites.includes(module.id));
    
    const result: ComputedModules = {
      regularModules: regular,
      progressHubModule: progressHub,
      favoriteModules: favoritesList
    };

    // Cache the computed result only when favorites are loaded
    if (!favoritesLoading) {
      dashboardCache.set(cacheKey, result);
    }
    return result;
  }, [modules, favorites, favoritesLoading, dashboardCache]);

  // Handle case where modules might not be loaded yet
  if (!modules || modules.length === 0) {
    console.log('Modules not loaded yet, showing loading screen');
    return <EnhancedLoading type="dashboard" skeleton={true} message="Loading Myotopia modules..." />;
  }

  // Show notifications with smooth transition
  if (showNotifications) {
    return (
      <SmoothTransition transitionKey="notifications">
        <NotificationCenter onBack={handleBackToDashboard} />
      </SmoothTransition>
    );
  }

  // Show selected module with smooth transition
  if (selectedModule) {
    console.log('Rendering selected module:', selectedModule.id);
    try {
      const ModuleComponent = selectedModule.component;
      return (
        <ErrorBoundary>
          <SmoothTransition transitionKey={selectedModule.id}>
            <div className="min-h-screen bg-gradient-to-br from-background via-orange-900/10 to-orange-800/20 text-foreground overflow-x-hidden">
              <Suspense fallback={<EnhancedLoading type="module" skeleton={true} message={`Loading ${selectedModule.title}...`} />}>
                <ModuleErrorBoundary moduleName={selectedModule.title} onBack={handleBackToDashboard}>
                  <ModuleComponent 
                    onBack={handleBackToDashboard}
                    onFoodLogged={handleFoodLogged}
                    navigationSource={navigationSource}
                  />
                </ModuleErrorBoundary>
              </Suspense>
            </div>
          </SmoothTransition>
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
      <SmoothTransition transitionKey="dashboard">
        <div className="min-h-screen bg-gradient-to-br from-background via-orange-900/10 to-orange-800/20 text-foreground overflow-x-hidden">
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
                      
                      'bg-gray-600 text-gray-300'
                    }`}>
                      {currentTier.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 sm:space-x-2">
                  {/* Module Library */}
                  <Button
                    onClick={() => navigate('/modules')}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white hover:bg-gray-800/50 p-2 hidden sm:flex"
                    title="Module Library"
                  >
                    <span className="text-xs sm:text-sm">Library</span>
                  </Button>

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

          {/* Main Content with optimized loading */}
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
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold flex items-center">
                      <Star className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-yellow-500 fill-current" />
                      Your Favorites
                    </h2>
                    <Button
                      onClick={() => navigate('/modules')}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white hover:bg-gray-800/50 flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add More
                    </Button>
                  </div>
                  <Suspense fallback={<EnhancedLoading type="module" size="sm" message="Loading favorites..." />}>
                    <ModuleGrid
                      modules={favoriteModules}
                      favorites={favorites}
                      onModuleClick={handleModuleClick}
                      onToggleFavorite={toggleFavorite}
                      onModuleHover={handleModuleHover}
                      onModuleInteraction={preloadOnInteraction}
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
                      onClick={() => navigate('/modules')}
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

              {/* Premium Promotion for Free Users - Moved to sidebar */}
              {currentTier === 'free' && (
                <div className="mb-6 sm:mb-8">
                  <Suspense fallback={<div className="h-24 bg-gray-800/30 rounded-lg animate-pulse" />}>
                    <PremiumPromoCard variant="compact" />
                  </Suspense>
                </div>
              )}

              {/* Dashboard Content Grid - Performance optimized */}
              {!lowDataMode && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
              <Suspense fallback={<EnhancedLoading type="default" size="sm" message="Loading achievements..." />}>
                <RealGoalsAchievements />
              </Suspense>
              <Suspense fallback={<EnhancedLoading type="default" size="sm" message="Loading research..." />}>
                <LatestResearch />
              </Suspense>
                </div>
              )}
            </div>
          </div>
        </div>
      </SmoothTransition>
    </ErrorBoundary>
  );
};

export default Dashboard;


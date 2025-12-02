import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useModules } from '@/contexts/ModulesContext';
import { useNavigate } from 'react-router-dom';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Star, TrendingUp, Sparkles, Bell, User, Settings, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFavorites } from '@/hooks/useFavorites';
import { useSubscription } from '@/hooks/useSubscription';
import NotificationCenter from '@/components/NotificationCenter';
import { EnhancedLoading } from '@/components/ui/enhanced-loading';
import { NativeButton } from '@/components/ui/native-button';
import NativeInstallPrompt from '@/components/ui/native-install-prompt';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { useQueryClient } from '@tanstack/react-query';
import { ModuleGridSkeleton } from '@/components/ui/module-card-skeleton';
import { DataSkeleton, DashboardContentSkeleton, ProgressHubSkeleton, FavoritesSkeleton } from '@/components/ui/data-skeleton';

// Lazy load heavy components
const ModuleGrid = lazy(() => import('@/components/dashboard/ModuleGrid'));
const RealGoalsAchievements = lazy(() => import('@/components/goals/RealGoalsAchievements'));
const LatestResearch = lazy(() => import('@/components/homepage/LatestResearch'));
const ModuleErrorBoundary = lazy(() => import('@/components/ModuleErrorBoundary'));
const PremiumPromoCard = lazy(() => import('@/components/PremiumPromoCard'));

// Define the type for computed modules
interface ComputedModules {
  regularModules: any[];
  progressHubModule: any;
  favoriteModules: any[];
}

const Dashboard = () => {
  const { user } = useAuth();
  const { modules } = useModules();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedModule, setSelectedModule] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [navigationSource, setNavigationSource] = useState<'dashboard' | 'library' | 'direct'>('dashboard');
  const { favorites, loading: favoritesLoading, toggleFavorite, reorderFavorites } = useFavorites();
  const { currentTier } = useSubscription();
  const queryClient = useQueryClient();

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries();
    // Small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 500));
  }, [queryClient]);

  // Helper function to get module by ID
  const getModuleById = (moduleId: string) => {
    return modules?.find(module => module.id === moduleId) || null;
  };

  // Check for notifications from navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('notifications') === 'true') {
      setShowNotifications(true);
    }
  }, []);

  // Simplified module click handler
  const handleModuleClick = useCallback((module: any) => {
    setSelectedModule(module);
    setNavigationSource('dashboard');
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setSelectedModule(null);
    setShowNotifications(false);
  }, []);

  const handleNotificationsClick = () => {
    setShowNotifications(true);
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleFoodLogged = useCallback((data: any) => {
    // Handle food logged
  }, []);

  // Simplified computed modules
  const { regularModules, progressHubModule, favoriteModules }: ComputedModules = useMemo(() => {
    if (!modules || modules.length === 0) {
      return { regularModules: [], progressHubModule: null, favoriteModules: [] };
    }

    const regular: any[] = [];
    let progressHub: any = null;
    
    for (const module of modules) {
      if (module.id === 'progress-hub') {
        progressHub = module;
      } else {
        regular.push(module);
      }
    }
    
    const favoriteSet = new Set(favorites);
    const favoritesList = regular.filter(m => favoriteSet.has(m.id));

    return {
      regularModules: regular,
      progressHubModule: progressHub,
      favoriteModules: favoritesList
    };
  }, [modules, favorites]);

  // Loading state
  if (!modules || modules.length === 0) {
    return <LoadingScreen />;
  }

  // Show notifications
  if (showNotifications) {
    return <NotificationCenter onBack={handleBackToDashboard} />;
  }

  // Show selected module
  if (selectedModule) {
    try {
      const ModuleComponent = selectedModule.component;
      return (
        <ErrorBoundary>
          <div className="min-h-screen bg-gradient-to-br from-background via-orange-900/10 to-orange-800/20 text-foreground overflow-x-hidden">
            <Suspense fallback={<EnhancedLoading type="module" message={`Loading ${selectedModule.title}...`} />}>
              <ModuleErrorBoundary moduleName={selectedModule.title} onBack={handleBackToDashboard}>
                <ModuleComponent 
                  onBack={handleBackToDashboard}
                  onFoodLogged={handleFoodLogged}
                  navigationSource={navigationSource}
                />
              </ModuleErrorBoundary>
            </Suspense>
          </div>
        </ErrorBoundary>
      );
    } catch (error) {
      setSelectedModule(null);
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-background via-orange-900/10 to-orange-800/20 text-foreground overflow-x-hidden">
          {/* Enhanced header with notifications, profile, and settings */}
          <div className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border shadow-sm" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
            <div className="px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                    Myotopia
                  </h1>
                  {/* Subscription tier indicator */}
                  <div className="hidden sm:block">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        currentTier === 'premium' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                        
                        'bg-muted text-muted-foreground'
                    }`}>
                      {currentTier.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 sm:gap-2">
                  {/* Module Library */}
                  <Button
                    onClick={() => navigate('/modules')}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground hover:bg-accent/50 px-3 py-2 hidden sm:flex min-h-[40px]"
                    title="Module Library"
                  >
                    <span className="text-xs sm:text-sm">Library</span>
                  </Button>

                  {/* Notifications */}
                  <Button
                    onClick={handleNotificationsClick}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground hover:bg-accent/50 p-2 min-h-[44px] min-w-[44px]"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                  </Button>

                  {/* Profile */}
                  <Button
                    onClick={handleProfileClick}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground hover:bg-accent/50 p-2 min-h-[44px] min-w-[44px]"
                    title="Profile"
                  >
                    <User className="w-5 h-5" />
                  </Button>

                  {/* Settings */}
                  <Button
                    onClick={handleSettingsClick}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground hover:bg-accent/50 p-2 min-h-[44px] min-w-[44px]"
                    title="Settings"
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content with pull-to-refresh */}
          <PullToRefresh onRefresh={handleRefresh}>
            <div className="px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-32 max-w-full overflow-x-hidden" style={{ paddingTop: 'calc(80px + env(safe-area-inset-top))' }}>
            <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 lg:space-y-12">
              {/* Welcome section with responsive text */}
              <div className="mb-6 sm:mb-8 lg:mb-12 text-center">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 lg:mb-4 leading-tight">
                  Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Champion'}! 👋
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base lg:text-lg px-4">
                  Ready to achieve your fitness goals with science-backed training?
                </p>
              </div>

              {/* Favorites Section with skeleton loading */}
              {favoritesLoading ? (
                <div className="mb-6 sm:mb-8 lg:mb-12">
                  <FavoritesSkeleton />
                </div>
              ) : favoriteModules.length > 0 ? (
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
                      className="text-muted-foreground hover:text-foreground hover:bg-accent/50 flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add More
                    </Button>
                  </div>
                  <Suspense fallback={<ModuleGridSkeleton count={favoriteModules.length || 3} />}>
                    <ModuleGrid
                      modules={favoriteModules}
                      favorites={favorites}
                      onModuleClick={handleModuleClick}
                      onToggleFavorite={toggleFavorite}
                      enableReorder={true}
                      onReorder={(reorderedModules) => {
                        const newOrder = reorderedModules.map(m => m.id);
                        reorderFavorites(newOrder);
                      }}
                    />
                  </Suspense>
                </div>
              ) : (
                <div className="mb-6 sm:mb-8 lg:mb-12 text-center">
                  <div className="bg-card border-border rounded-2xl p-6 sm:p-8 backdrop-blur-sm max-w-md mx-auto">
                    <Star className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-3 sm:mb-4">No Favorites Yet</h2>
                    <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base px-2">
                      Visit the Module Library to explore and favorite modules you'd like to see here.
                    </p>
                    <NativeButton
                      onClick={() => navigate('/modules')}
                      variant="primary"
                      size="lg"
                      haptic="medium"
                      className="w-full sm:w-auto"
                    >
                      Browse Module Library
                    </NativeButton>
                  </div>
                </div>
              )}

              {/* Progress Hub - Optimized */}
              {progressHubModule && (
                <div className="mb-6 sm:mb-8 lg:mb-12">
                  <NativeButton
                    onClick={() => handleModuleClick(progressHubModule)}
                    variant="native"
                    size="xl"
                    haptic="medium"
                    className="w-full h-16 sm:h-20 bg-gradient-to-r from-purple-900/60 to-purple-800/80 backdrop-blur-sm border border-purple-700/50 hover:from-purple-900/80 hover:to-purple-800/90 text-foreground rounded-xl group"
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
                  </NativeButton>
                </div>
              )}

              {/* Premium Promotion for Free Users */}
              {currentTier === 'free' && (
                <div className="mb-6 sm:mb-8">
                  <Suspense fallback={<DataSkeleton variant="card" className="h-24" />}>
                    <PremiumPromoCard variant="compact" />
                  </Suspense>
                </div>
              )}

              {/* Dashboard Content Grid with proper skeletons */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
                <Suspense fallback={<DataSkeleton variant="goals" />}>
                  <RealGoalsAchievements />
                </Suspense>
                <Suspense fallback={<DataSkeleton variant="research" />}>
                  <LatestResearch />
                </Suspense>
              </div>
            </div>
          </div>
          </PullToRefresh>
          
          <NativeInstallPrompt />
        </div>
    </ErrorBoundary>
  );
};

export default Dashboard;


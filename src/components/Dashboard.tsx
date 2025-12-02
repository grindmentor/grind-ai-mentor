import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense, memo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useModules } from '@/contexts/ModulesContext';
import { useNavigate } from 'react-router-dom';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Star, Bell, Settings, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFavorites } from '@/hooks/useFavorites';
import { useSubscription } from '@/hooks/useSubscription';
import NotificationCenter from '@/components/NotificationCenter';
import { EnhancedLoading } from '@/components/ui/enhanced-loading';
import NativeInstallPrompt from '@/components/ui/native-install-prompt';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { useQueryClient } from '@tanstack/react-query';
import { ModuleGridSkeleton } from '@/components/ui/module-card-skeleton';
import { DataSkeleton, FavoritesSkeleton } from '@/components/ui/data-skeleton';
import { motion } from 'framer-motion';
import { useNativeHaptics } from '@/hooks/useNativeHaptics';
import PersonalizedFeed from '@/components/home/PersonalizedFeed';

// Memoized header component to prevent re-renders
const DashboardHeader = memo<{
  currentTier: string;
  onNotifications: () => void;
  onSettings: () => void;
}>(({ currentTier, onNotifications, onSettings }) => (
  <header 
    className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50"
    style={{ paddingTop: 'env(safe-area-inset-top)' }}
  >
    <div className="px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-foreground">Myotopia</h1>
        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
          currentTier === 'premium' 
            ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-500 border border-yellow-500/30' 
            : 'bg-muted text-muted-foreground'
        }`}>
          {currentTier.toUpperCase()}
        </span>
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          onClick={onNotifications}
          variant="ghost"
          size="sm"
          className="p-2 h-10 w-10 rounded-full"
        >
          <Bell className="w-5 h-5" />
        </Button>
        <Button
          onClick={onSettings}
          variant="ghost"
          size="sm"
          className="p-2 h-10 w-10 rounded-full"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </div>
  </header>
));

DashboardHeader.displayName = 'DashboardHeader';

// Lazy load heavy components
const ModuleGrid = lazy(() => import('@/components/dashboard/ModuleGrid'));
const RealGoalsAchievements = lazy(() => import('@/components/goals/RealGoalsAchievements'));
const LatestResearch = lazy(() => import('@/components/homepage/LatestResearch'));
const ModuleErrorBoundary = lazy(() => import('@/components/ModuleErrorBoundary'));
const PremiumPromoCard = lazy(() => import('@/components/PremiumPromoCard'));

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
  const { trigger } = useNativeHaptics();

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries();
    await new Promise(resolve => setTimeout(resolve, 500));
  }, [queryClient]);

  const getModuleById = (moduleId: string) => {
    return modules?.find(module => module.id === moduleId) || null;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('notifications') === 'true') {
      setShowNotifications(true);
    }
  }, []);

  const handleModuleClick = useCallback((module: any) => {
    trigger('light');
    setSelectedModule(module);
    setNavigationSource('dashboard');
  }, [trigger]);

  const handleBackToDashboard = useCallback(() => {
    setSelectedModule(null);
    setShowNotifications(false);
  }, []);

  const handleFoodLogged = useCallback((data: any) => {}, []);

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

  if (!modules || modules.length === 0) {
    return <LoadingScreen />;
  }

  if (showNotifications) {
    return <NotificationCenter onBack={handleBackToDashboard} />;
  }

  if (selectedModule) {
    try {
      const ModuleComponent = selectedModule.component;
      return (
        <ErrorBoundary>
          <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
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

  const firstName = useMemo(() => 
    user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Champion',
    [user?.user_metadata?.name, user?.email]
  );

  // Stable callbacks for header
  const handleNotificationsPress = useCallback(() => {
    trigger('light');
    setShowNotifications(true);
  }, [trigger]);

  const handleSettingsPress = useCallback(() => {
    trigger('light');
    navigate('/settings');
  }, [trigger, navigate]);

  const handleEditFavorites = useCallback(() => {
    trigger('light');
    navigate('/modules');
  }, [trigger, navigate]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <DashboardHeader 
          currentTier={currentTier}
          onNotifications={handleNotificationsPress}
          onSettings={handleSettingsPress}
        />

        <PullToRefresh onRefresh={handleRefresh}>
          <div 
            className="px-4 pb-24"
            style={{ paddingTop: 'calc(72px + env(safe-area-inset-top))' }}
          >
            <div className="max-w-2xl mx-auto">
              {/* Welcome Section */}
              <motion.div 
                className="py-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  Hey, {firstName} 👋
                </h2>
                <p className="text-muted-foreground text-sm">
                  Ready to crush your goals today?
                </p>
              </motion.div>

              {/* Personalized Feed */}
              <PersonalizedFeed />

              {/* Favorites Section */}
              {favoritesLoading ? (
                <FavoritesSkeleton />
              ) : favoriteModules.length > 0 && (
                <motion.div 
                  className="mt-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      Quick Access
                    </h3>
                    <Button
                      onClick={handleEditFavorites}
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground text-xs h-7"
                    >
                      Edit
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                  <Suspense fallback={<ModuleGridSkeleton count={favoriteModules.length} />}>
                    <ModuleGrid
                      modules={favoriteModules}
                      favorites={favorites}
                      onModuleClick={handleModuleClick}
                      onToggleFavorite={toggleFavorite}
                      enableReorder={false}
                    />
                  </Suspense>
                </motion.div>
              )}

              {/* Premium CTA for free users */}
              {currentTier === 'free' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6"
                >
                  <Suspense fallback={<DataSkeleton variant="card" className="h-24" />}>
                    <PremiumPromoCard variant="compact" />
                  </Suspense>
                </motion.div>
              )}

              {/* Goals */}
              <motion.div 
                className="mt-6 space-y-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <Suspense fallback={<DataSkeleton variant="goals" />}>
                  <RealGoalsAchievements />
                </Suspense>
              </motion.div>
            </div>
          </div>
        </PullToRefresh>
        
        <NativeInstallPrompt />
      </div>
    </ErrorBoundary>
  );
};

export default memo(Dashboard);

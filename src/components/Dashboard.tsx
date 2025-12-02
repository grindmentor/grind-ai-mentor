import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useModules } from '@/contexts/ModulesContext';
import { useNavigate } from 'react-router-dom';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Star, TrendingUp, Sparkles, Bell, User, Settings, Plus, BarChart3, ChevronRight } from 'lucide-react';
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
import { DataSkeleton, FavoritesSkeleton } from '@/components/ui/data-skeleton';
import { motion } from 'framer-motion';

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
    setSelectedModule(module);
    setNavigationSource('dashboard');
  }, []);

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

  const firstName = user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Champion';

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        {/* Native-style header */}
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
                onClick={() => navigate('/usage')}
                variant="ghost"
                size="sm"
                className="p-2 h-10 w-10 rounded-full"
              >
                <BarChart3 className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => setShowNotifications(true)}
                variant="ghost"
                size="sm"
                className="p-2 h-10 w-10 rounded-full"
              >
                <Bell className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => navigate('/profile')}
                variant="ghost"
                size="sm"
                className="p-2 h-10 w-10 rounded-full"
              >
                <User className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => navigate('/settings')}
                variant="ghost"
                size="sm"
                className="p-2 h-10 w-10 rounded-full"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        <PullToRefresh onRefresh={handleRefresh}>
          <div 
            className="px-4 pb-32"
            style={{ paddingTop: 'calc(72px + env(safe-area-inset-top))' }}
          >
            <div className="max-w-2xl mx-auto">
              {/* Welcome Section */}
              <motion.div 
                className="py-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  Hey, {firstName} 👋
                </h2>
                <p className="text-muted-foreground">
                  Ready to crush your goals today?
                </p>
              </motion.div>

              {/* Quick Actions */}
              <motion.div 
                className="grid grid-cols-2 gap-3 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {progressHubModule && (
                  <button
                    onClick={() => handleModuleClick(progressHubModule)}
                    className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 text-left active:scale-[0.98] transition-transform"
                  >
                    <TrendingUp className="w-6 h-6 text-purple-400 mb-2" />
                    <p className="font-semibold text-foreground text-sm">Progress</p>
                    <p className="text-xs text-muted-foreground">Track results</p>
                  </button>
                )}
                <button
                  onClick={() => navigate('/modules')}
                  className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 text-left active:scale-[0.98] transition-transform"
                >
                  <Plus className="w-6 h-6 text-primary mb-2" />
                  <p className="font-semibold text-foreground text-sm">Modules</p>
                  <p className="text-xs text-muted-foreground">All features</p>
                </button>
              </motion.div>

              {/* Favorites Section */}
              {favoritesLoading ? (
                <FavoritesSkeleton />
              ) : favoriteModules.length > 0 ? (
                <motion.div 
                  className="mb-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      Favorites
                    </h3>
                    <Button
                      onClick={() => navigate('/modules')}
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground text-sm h-8"
                    >
                      Edit
                      <ChevronRight className="w-4 h-4 ml-1" />
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
              ) : (
                <motion.div 
                  className="mb-8 p-6 rounded-2xl bg-card border border-border text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <Star className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">No favorites yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add modules to quick access them here
                  </p>
                  <Button
                    onClick={() => navigate('/modules')}
                    variant="outline"
                    size="sm"
                  >
                    Browse Modules
                  </Button>
                </motion.div>
              )}

              {/* Premium CTA for free users */}
              {currentTier === 'free' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8"
                >
                  <Suspense fallback={<DataSkeleton variant="card" className="h-24" />}>
                    <PremiumPromoCard variant="compact" />
                  </Suspense>
                </motion.div>
              )}

              {/* Goals & Research */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Suspense fallback={<DataSkeleton variant="goals" />}>
                  <RealGoalsAchievements />
                </Suspense>
                <Suspense fallback={<DataSkeleton variant="research" />}>
                  <LatestResearch />
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

export default Dashboard;

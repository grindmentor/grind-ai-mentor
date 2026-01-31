import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense, memo, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useModules } from '@/contexts/ModulesContext';
import { useNavigate } from 'react-router-dom';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Star, Bell, Settings, ChevronRight, LayoutGrid } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { perfMetrics } from '@/utils/performanceMetrics';

// Memoized premium header component
const DashboardHeader = memo<{
  currentTier: string;
  onNotifications: () => void;
  onSettings: () => void;
}>(({ currentTier, onNotifications, onSettings }) => (
  <header 
    className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl"
    style={{ paddingTop: 'env(safe-area-inset-top)' }}
  >
    <div className="px-4 h-14 flex items-center justify-between border-b border-border/40 max-w-4xl mx-auto">
      <div className="flex items-center gap-2.5">
        <h1 className="text-lg font-bold text-foreground tracking-tight">Myotopia</h1>
        <span className={cn(
          "px-2 py-0.5 text-[9px] font-bold rounded tracking-wide",
          currentTier === 'premium' 
            ? 'badge-tier-premium' 
            : 'badge-tier-free'
        )}>
          {currentTier.toUpperCase()}
        </span>
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          onClick={onNotifications}
          variant="ghost"
          size="sm"
          className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground"
          aria-label="View notifications"
        >
          <Bell className="w-[18px] h-[18px]" />
        </Button>
        <Button
          onClick={onSettings}
          variant="ghost"
          size="sm"
          className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground"
          aria-label="Open settings"
        >
          <Settings className="w-[18px] h-[18px]" />
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
  // Performance tracking ref
  const mountTime = useRef(performance.now());
  
  const { user, loading: authLoading } = useAuth();
  const { modules } = useModules();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedModule, setSelectedModule] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [navigationSource, setNavigationSource] = useState<'dashboard' | 'library' | 'direct'>('dashboard');
  const [displayName, setDisplayName] = useState<string | null>(null);
  const { favorites, loading: favoritesLoading, toggleFavorite, reorderFavorites } = useFavorites();
  const { currentTier } = useSubscription();
  const queryClient = useQueryClient();
  const { trigger } = useNativeHaptics();
  
  // Track dashboard render performance
  useEffect(() => {
    const renderTime = performance.now() - mountTime.current;
    if (renderTime > 100) {
      console.log(`[PERF] Dashboard mounted: ${renderTime.toFixed(0)}ms`);
    }
  }, []);

  // Fetch display name from profile with real-time subscription
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchDisplayName = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .maybeSingle();
        
        if (data?.display_name) {
          setDisplayName(data.display_name);
        }
      } catch (error) {
        console.error('Error fetching display name:', error);
      }
    };
    
    fetchDisplayName();
    
    // Subscribe to real-time changes on the user's profile
    const channel = supabase
      .channel('profile-display-name')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new && payload.new.display_name) {
            setDisplayName(payload.new.display_name);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

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

  const firstName = useMemo(() => 
    displayName?.split(' ')[0] || user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Champion',
    [displayName, user?.user_metadata?.name, user?.email]
  );

  // Stable callbacks for header
  const handleNotificationsPress = useCallback(() => {
    trigger('light');
    setShowNotifications(true);
  }, [trigger]);

  const handleSettingsPress = useCallback(() => {
    trigger('light');
    navigate('/settings', { state: { returnTo: '/app' } });
  }, [trigger, navigate]);

  const handleModuleLibraryPress = useCallback(() => {
    trigger('light');
    navigate('/modules', { state: { returnTo: '/app' } });
  }, [trigger, navigate]);

  const handleEditFavorites = useCallback(() => {
    trigger('light');
    navigate('/modules', { state: { returnTo: '/app' } });
  }, [trigger, navigate]);

  // Conditional returns AFTER all hooks
  // Wait for auth to complete before determining if we should show loading
  if (authLoading) {
    return <LoadingScreen />;
  }
  
  // Only show loading if modules aren't ready yet (brief moment after auth)
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
            className="px-4 pb-28 w-full"
            style={{ paddingTop: 'calc(56px + env(safe-area-inset-top))' }}
          >
            <div className="max-w-2xl mx-auto w-full">
              {/* Welcome Section - Compact */}
              <motion.div 
                className="py-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                  Hey, {firstName} 👋
                </h2>
                <p className="text-muted-foreground text-sm mt-0.5">
                  Your training hub — log, track, improve.
                </p>
              </motion.div>

              {/* Quick Access Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.25 }}
                className="mb-6 flex flex-col gap-3"
              >
                <Button
                  onClick={() => navigate('/progress-hub-dashboard', { state: { returnTo: '/app' } })}
                  className="w-full h-14 min-h-[56px] bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl flex items-center justify-center gap-3 touch-manipulation shadow-none"
                  aria-label="Open Progress Hub"
                >
                  <Star className="w-5 h-5 flex-shrink-0" />
                  <span className="text-base font-semibold">Progress Hub</span>
                </Button>
                
                {/* Module Library Button - Colorful */}
                <Button
                  onClick={handleModuleLibraryPress}
                  className="w-full h-14 min-h-[56px] bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-2xl flex items-center justify-center gap-3 touch-manipulation shadow-none"
                  aria-label="Open Module Library"
                >
                  <LayoutGrid className="w-5 h-5 flex-shrink-0" />
                  <span className="text-base font-semibold">Module Library</span>
                </Button>
              </motion.div>

              {/* Personalized Feed */}
              <PersonalizedFeed />

              {/* Favorites Section */}
              {favoritesLoading ? (
                <FavoritesSkeleton />
              ) : favoriteModules.length > 0 && (
                <motion.section 
                  className="mt-5"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.25 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      Quick Access
                    </h3>
                    <Button
                      onClick={handleEditFavorites}
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground text-xs h-7 px-2 hover:text-foreground"
                    >
                      Edit
                      <ChevronRight className="w-3 h-3 ml-0.5" />
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
                </motion.section>
              )}

              {/* Premium CTA for free users */}
              {currentTier === 'free' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.25 }}
                  className="mt-5"
                >
                  <Suspense fallback={<DataSkeleton variant="card" className="h-24" />}>
                    <PremiumPromoCard variant="compact" />
                  </Suspense>
                </motion.div>
              )}

              {/* Goals */}
              <motion.section 
                className="mt-5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.25 }}
              >
                <Suspense fallback={<DataSkeleton variant="goals" />}>
                  <RealGoalsAchievements />
                </Suspense>
              </motion.section>

              {/* Latest Research Section */}
              <motion.section 
                className="mt-5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.25 }}
              >
                <Suspense fallback={<DataSkeleton variant="card" className="h-64" />}>
                  <LatestResearch />
                </Suspense>
              </motion.section>
            </div>
          </div>
        </PullToRefresh>
        
        <NativeInstallPrompt />
      </div>
    </ErrorBoundary>
  );
};

export default memo(Dashboard);


import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useModules } from '@/contexts/ModulesContext';
import { PageTransition } from '@/components/ui/page-transition';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ModuleGrid } from '@/components/dashboard/ModuleGrid';
import { Star, TrendingUp, Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ScientificStudies from '@/components/homepage/ScientificStudies';
import PersonalizedSummary from '@/components/homepage/PersonalizedSummary';
import NotificationsSummary from '@/components/dashboard/NotificationsSummary';
import { useIsMobile } from '@/hooks/use-mobile';
import GoalsAchievementsHubOptimized from '@/components/GoalsAchievementsHubOptimized';
import { useFavorites } from '@/hooks/useFavorites';
import { InstantLoader } from '@/components/ui/instant-loader';
import { SmoothTransition } from '@/components/ui/smooth-transition';
import { MobileOptimized, TouchButton } from '@/components/ui/mobile-optimized';
import { useInstantModule } from '@/hooks/useInstantModule';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

const Dashboard = () => {
  const { user } = useAuth();
  const { modules } = useModules();
  const isMobile = useIsMobile();
  const [selectedModule, setSelectedModule] = useState(null);
  const [showModuleSelector, setShowModuleSelector] = useState(false);
  const { favorites, loading: favoritesLoading, toggleFavorite } = useFavorites();

  // Instant preloading with memory cache
  const { isLoading: dashboardLoading } = useInstantModule({
    moduleId: 'dashboard',
    preloadData: async () => {
      // Pre-cache essential data
      return { 
        loaded: true,
        timestamp: Date.now(),
        userProfile: user 
      };
    },
    minLoadTime: 50 // Reduced for instant feel
  });

  // Optimized module filtering with memoization
  const { regularModules, progressHubModule } = useMemo(() => {
    if (!modules || modules.length === 0) return { regularModules: [], progressHubModule: null };
    
    return {
      regularModules: modules.filter(m => m.id !== 'progress-hub'),
      progressHubModule: modules.find(m => m.id === 'progress-hub')
    };
  }, [modules]);

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

  // Instant loading - show content immediately
  if (dashboardLoading || !modules || modules.length === 0) {
    return <InstantLoader isLoading={true} variant="module" />;
  }

  if (selectedModule) {
    const ModuleComponent = selectedModule.component;
    return (
      <ErrorBoundary>
        <MobileOptimized>
          <SmoothTransition show={true} type="slideUp">
            <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white overflow-hidden">
              <ModuleComponent 
                onBack={handleBackToDashboard}
                onFoodLogged={handleFoodLogged}
              />
            </div>
          </SmoothTransition>
        </MobileOptimized>
      </ErrorBoundary>
    );
  }

  const favoriteModules = regularModules.filter(module => favorites.includes(module.id));
  const availableModules = regularModules.filter(module => !favorites.includes(module.id));

  return (
    <ErrorBoundary>
      <MobileOptimized>
        <PageTransition className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white overflow-hidden">
          <DashboardHeader />

          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-full">
            <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
              {/* Welcome section - Instant display */}
              <SmoothTransition show={true} type="slideUp">
                <div className="text-center space-y-3 sm:space-y-4">
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight bg-gradient-to-r from-white via-orange-100 to-orange-200 bg-clip-text text-transparent">
                    Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Champion'}! 👋
                  </h1>
                  <p className="text-gray-400 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
                    Ready to achieve your fitness goals with science-backed training?
                  </p>
                </div>
              </SmoothTransition>

              {/* Notifications Summary - Cached loading */}
              <SmoothTransition show={true} type="fade">
                <NotificationsSummary />
              </SmoothTransition>

              {/* Favorites Section - Optimized rendering */}
              <SmoothTransition show={!favoritesLoading} type="slideUp">
                {favoriteModules.length > 0 ? (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold flex items-center">
                        <Star className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-yellow-500 fill-current" />
                        Your Favorites
                      </h2>
                      
                      <Sheet open={showModuleSelector} onOpenChange={setShowModuleSelector}>
                        <SheetTrigger asChild>
                          <TouchButton 
                            onClick={() => setShowModuleSelector(true)}
                            className="border border-orange-500/30 text-orange-400 hover:bg-orange-500/20 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add More
                          </TouchButton>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-full sm:max-w-md bg-black/95 backdrop-blur-md border-l border-gray-800/50">
                          <SheetHeader>
                            <SheetTitle className="text-white flex items-center">
                              <Star className="w-5 h-5 mr-2 text-yellow-400" />
                              Add to Favorites
                            </SheetTitle>
                          </SheetHeader>
                          <ScrollArea className="mt-6 h-[calc(100vh-8rem)]">
                            <div className="space-y-3 pr-4">
                              {availableModules.map((module) => (
                                <div
                                  key={module.id}
                                  className="flex items-center justify-between p-4 bg-gray-900/40 border border-gray-700/50 rounded-xl hover:bg-gray-800/60 transition-all duration-200"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500/20 to-red-600/30 flex items-center justify-center">
                                      <module.icon className="w-5 h-5 text-orange-400" />
                                    </div>
                                    <div>
                                      <h3 className="text-white font-medium text-sm">{module.title}</h3>
                                      <p className="text-gray-400 text-xs">{module.description}</p>
                                    </div>
                                  </div>
                                  <TouchButton
                                    onClick={() => {
                                      toggleFavorite(module.id);
                                      setShowModuleSelector(false);
                                    }}
                                    className="text-yellow-400 hover:bg-yellow-500/20 p-2 rounded-lg transition-colors"
                                  >
                                    <Star className="w-4 h-4" />
                                  </TouchButton>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </SheetContent>
                      </Sheet>
                    </div>
                    
                    <ModuleGrid
                      modules={favoriteModules}
                      favorites={favorites}
                      onModuleClick={handleModuleClick}
                      onToggleFavorite={toggleFavorite}
                    />
                    
                    {/* Add More button below modules */}
                    <div className="flex justify-center pt-4">
                      <Sheet open={showModuleSelector} onOpenChange={setShowModuleSelector}>
                        <SheetTrigger asChild>
                          <TouchButton 
                            onClick={() => setShowModuleSelector(true)}
                            className="border border-orange-500/30 text-orange-400 hover:bg-orange-500/20 px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add More Favorites</span>
                          </TouchButton>
                        </SheetTrigger>
                      </Sheet>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="bg-gray-900/40 border border-gray-700/50 rounded-2xl p-6 sm:p-8 backdrop-blur-sm max-w-md mx-auto">
                      <Star className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 mx-auto mb-4" />
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-3 sm:mb-4">No Favorites Yet</h2>
                      <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
                        Visit the Module Library to explore and favorite modules you'd like to see here.
                      </p>
                      <Sheet open={showModuleSelector} onOpenChange={setShowModuleSelector}>
                        <SheetTrigger asChild>
                          <TouchButton
                            onClick={() => setShowModuleSelector(true)}
                            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 w-full sm:w-auto px-6 py-3 rounded-xl font-medium transition-all duration-150 active:scale-95"
                          >
                            Browse Modules
                          </TouchButton>
                        </SheetTrigger>
                      </Sheet>
                    </div>
                  </div>
                )}
              </SmoothTransition>

              {/* Progress Hub - Enhanced mobile experience */}
              {progressHubModule && (
                <SmoothTransition show={true} type="slideUp">
                  <TouchButton
                    onClick={() => handleModuleClick(progressHubModule)}
                    className="w-full h-16 sm:h-20 bg-gradient-to-r from-purple-900/60 to-purple-800/80 backdrop-blur-sm border border-purple-700/50 hover:from-purple-900/80 hover:to-purple-800/90 transition-all duration-300 text-white rounded-xl group transform hover:scale-[1.02] active:scale-[0.98]"
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
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300/80 animate-pulse" />
                        <span className="text-xs sm:text-sm text-purple-200/90 hidden sm:inline">View Progress</span>
                      </div>
                    </div>
                  </TouchButton>
                </SmoothTransition>
              )}

              {/* Dashboard Content Grid - Optimized layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <SmoothTransition show={true} type="slideUp">
                  <GoalsAchievementsHubOptimized />
                </SmoothTransition>
                <SmoothTransition show={true} type="slideUp">
                  <PersonalizedSummary />
                </SmoothTransition>
              </div>
            </div>
          </div>
        </PageTransition>
      </MobileOptimized>
    </ErrorBoundary>
  );
};

export default Dashboard;


import React, { useState, useEffect, useMemo, memo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useModules } from '@/contexts/ModulesContext';
import { useLightweightModules } from '@/hooks/useLightweightModules';
import { usePerformanceOptimizer } from '@/hooks/usePerformanceOptimizer';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Star, TrendingUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useFavorites';
import { useNavigate } from 'react-router-dom';

// Lightweight module grid component
const LightModuleGrid = memo(({ modules, favorites, onModuleClick, onToggleFavorite }: any) => {
  const { metrics } = usePerformanceOptimizer();
  
  return (
    <div className={`grid gap-3 ${
      metrics.isLowPowerMode 
        ? 'grid-cols-1' // Single column on low-power devices
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    }`}>
      {modules.map((module: any) => {
        const IconComponent = module.icon;
        const isFavorited = favorites.includes(module.id);
        
        return (
          <div 
            key={module.id}
            className={`group cursor-pointer backdrop-blur-sm border border-gray-700/50 relative overflow-hidden rounded-xl p-4 transition-colors duration-150 hover:border-gray-600/60 bg-gray-900/40 ${
              metrics.shouldReduceAnimations ? '' : 'hover:scale-[1.01] active:scale-[0.99]'
            }`}
            onClick={() => onModuleClick(module)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(module.id);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorited 
                    ? 'text-orange-400 bg-orange-500/20' 
                    : 'text-gray-400 hover:text-orange-400 hover:bg-orange-500/20'
                }`}
              >
                <Star className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>
            
            <h3 className="text-white text-base font-semibold mb-1">{module.title}</h3>
            <p className="text-gray-400 text-sm line-clamp-2">{module.description}</p>
          </div>
        );
      })}
    </div>
  );
});

LightModuleGrid.displayName = 'LightModuleGrid';

const OptimizedDashboard = () => {
  const { user } = useAuth();
  const { modules } = useModules();
  const navigate = useNavigate();
  const { metrics, requestIdleCallback } = usePerformanceOptimizer();
  const { loadModule, preloadCriticalModules, isLowPowerMode } = useLightweightModules();
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [ModuleComponent, setModuleComponent] = useState<React.ComponentType<any> | null>(null);
  const { favorites, toggleFavorite } = useFavorites();

  // Memoized module filtering
  const { regularModules, progressHubModule } = useMemo(() => {
    if (!modules || modules.length === 0) return { regularModules: [], progressHubModule: null };
    
    return {
      regularModules: modules.filter(m => m.id !== 'progress-hub'),
      progressHubModule: modules.find(m => m.id === 'progress-hub')
    };
  }, [modules]);

  // Preload critical modules on idle
  useEffect(() => {
    if (regularModules.length > 0 && !isLowPowerMode) {
      requestIdleCallback(() => {
        preloadCriticalModules(regularModules);
      });
    }
  }, [regularModules, isLowPowerMode, requestIdleCallback, preloadCriticalModules]);

  const handleModuleClick = async (module: any) => {
    try {
      setSelectedModule(module);
      const Component = await loadModule(module.id, module.loadComponent || (() => import(`@/components/ai-modules/${module.id}`)));
      setModuleComponent(() => Component);
    } catch (error) {
      console.error('Failed to load module:', error);
      setSelectedModule(null);
    }
  };

  const handleBackToDashboard = () => {
    setSelectedModule(null);
    setModuleComponent(null);
  };

  // Show loading with minimal resources
  if (!modules || modules.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/5 to-orange-800/10 text-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (selectedModule && ModuleComponent) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/5 to-orange-800/10 text-white">
          <ModuleComponent onBack={handleBackToDashboard} />
        </div>
      </ErrorBoundary>
    );
  }

  const favoriteModules = regularModules.filter(module => favorites.includes(module.id));

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/5 to-orange-800/10 text-white">
        <DashboardHeader />

        <div className="px-4 py-6 max-w-6xl mx-auto space-y-6">
          {/* Welcome section */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Champion'}! 👋
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              Ready to achieve your fitness goals?
            </p>
          </div>

          {/* Favorites Section */}
          {favoriteModules.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500 fill-current" />
                  Your Favorites
                </h2>
                
                <Button 
                  onClick={() => navigate('/modules')}
                  variant="outline"
                  size="sm"
                  className="border-orange-500/30 text-orange-400 hover:bg-orange-500/20"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add More
                </Button>
              </div>
              
              <LightModuleGrid
                modules={favoriteModules.slice(0, isLowPowerMode ? 3 : 6)}
                favorites={favorites}
                onModuleClick={handleModuleClick}
                onToggleFavorite={toggleFavorite}
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-gray-900/40 rounded-2xl p-6 max-w-md mx-auto">
                <Star className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">No Favorites Yet</h2>
                <p className="text-gray-400 mb-4 text-sm">
                  Explore modules and favorite the ones you use most.
                </p>
                <Button
                  onClick={() => navigate('/modules')}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                >
                  Browse Modules
                </Button>
              </div>
            </div>
          )}

          {/* Progress Hub */}
          {progressHubModule && (
            <button
              onClick={() => handleModuleClick(progressHubModule)}
              className="w-full bg-gradient-to-r from-purple-900/40 to-purple-800/60 border border-purple-700/40 hover:from-purple-900/60 hover:to-purple-800/80 transition-colors text-white rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-800/50 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-200" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-purple-100">Progress Hub</h3>
                    <p className="text-sm text-purple-200/80">Track your fitness journey</p>
                  </div>
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default OptimizedDashboard;

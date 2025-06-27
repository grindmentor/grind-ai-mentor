
import React, { useState, useEffect, useMemo, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Star, Grid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useModules } from '@/contexts/ModulesContext';
import { useLightweightModules } from '@/hooks/useLightweightModules';
import { usePerformanceOptimizer } from '@/hooks/usePerformanceOptimizer';
import { useFavorites } from '@/hooks/useFavorites';

// Lightweight search with debouncing
const useDebounceSearch = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const LightModuleCard = memo(({ module, isFavorited, onModuleClick, onToggleFavorite }: any) => {
  const { metrics } = usePerformanceOptimizer();
  const IconComponent = module.icon;

  return (
    <div 
      className={`cursor-pointer backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 transition-colors duration-150 hover:border-gray-600/60 bg-gray-900/40 ${
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
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <h3 className="text-white text-base font-semibold">{module.title}</h3>
          {module.isPremium && (
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
              Pro
            </Badge>
          )}
        </div>
        <p className="text-gray-400 text-sm line-clamp-2">{module.description}</p>
      </div>
    </div>
  );
});

LightModuleCard.displayName = 'LightModuleCard';

const OptimizedModuleLibrary = () => {
  const navigate = useNavigate();
  const { modules } = useModules();
  const { loadModule, isLowPowerMode } = useLightweightModules();
  const { metrics } = usePerformanceOptimizer();
  const { favorites, toggleFavorite } = useFavorites();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [ModuleComponent, setModuleComponent] = useState<React.ComponentType<any> | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const debouncedSearch = useDebounceSearch(searchQuery, 300);

  // Optimized filtering with memoization
  const filteredModules = useMemo(() => {
    if (!modules) return [];
    
    const libraryModules = modules.filter(module => module.id !== 'progress-hub');
    
    if (!debouncedSearch) return libraryModules;
    
    const query = debouncedSearch.toLowerCase();
    return libraryModules.filter(module => 
      module.title.toLowerCase().includes(query) ||
      module.description.toLowerCase().includes(query)
    );
  }, [modules, debouncedSearch]);

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

  const handleBackToLibrary = () => {
    setSelectedModule(null);
    setModuleComponent(null);
  };

  if (selectedModule && ModuleComponent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/5 to-orange-800/10 text-white">
        <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-gray-800/50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between h-14">
              <button
                onClick={handleBackToLibrary}
                className="text-white hover:text-orange-400 transition-colors font-medium flex items-center space-x-2 p-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Library</span>
              </button>
              <h1 className="text-lg font-semibold text-center flex-1 px-4 truncate">
                {selectedModule.title}
              </h1>
              <div className="w-20"></div>
            </div>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 py-6">
          <ModuleComponent onBack={handleBackToLibrary} />
        </div>
      </div>
    );
  }

  if (!modules || modules.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/5 to-orange-800/10 text-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/5 to-orange-800/10 text-white">
      <div className="p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/app')}
                className="text-white hover:bg-orange-500/20 hover:text-orange-400 p-2"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  Module Library
                </h1>
                <p className="text-gray-400 text-sm">Discover AI fitness tools</p>
              </div>
            </div>
            
            {!isLowPowerMode && (
              <div className="flex items-center space-x-1 bg-orange-900/20 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors rounded-md ${
                    viewMode === 'grid' 
                      ? 'bg-orange-500/30 text-orange-300' 
                      : 'hover:bg-orange-500/20 text-gray-400 hover:text-orange-400'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors rounded-md ${
                    viewMode === 'list' 
                      ? 'bg-orange-500/30 text-orange-300' 
                      : 'hover:bg-orange-500/20 text-gray-400 hover:text-orange-400'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 backdrop-blur-sm border border-orange-500/30 rounded-xl p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-4 h-4" />
              <Input
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-orange-800/30 border-orange-500/40 text-white placeholder:text-orange-300/70 h-12"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-orange-500/40 text-orange-300 bg-orange-500/10">
              {filteredModules.length} modules
            </Badge>
            <Badge variant="outline" className="border-orange-500/40 text-orange-400 bg-orange-500/10">
              <Star className="w-3 h-3 mr-1" />
              {favorites.length} favorites
            </Badge>
          </div>

          {/* Modules Grid */}
          {filteredModules.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Search className="w-8 h-8 text-orange-500/50" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No modules found</h3>
              <p className="text-orange-300/70">Try adjusting your search</p>
            </div>
          ) : (
            <div className={`grid gap-4 ${
              isLowPowerMode || viewMode === 'list'
                ? 'grid-cols-1' 
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}>
              {filteredModules.map((module) => (
                <LightModuleCard
                  key={module.id}
                  module={module}
                  isFavorited={favorites.includes(module.id)}
                  onModuleClick={handleModuleClick}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptimizedModuleLibrary;

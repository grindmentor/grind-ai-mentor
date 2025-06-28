
import React, { useState, useMemo, lazy, Suspense } from 'react';
import { useModules } from '@/contexts/ModulesContext';
import { useAuth } from '@/contexts/AuthContext';
import { PageTransition } from '@/components/ui/page-transition';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, Star, Filter, Grid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useFavorites } from '@/hooks/useFavorites';
import { useIsMobile } from '@/hooks/use-mobile';

const ModuleGrid = lazy(() => import('@/components/dashboard/ModuleGrid'));
const ModuleErrorBoundary = lazy(() => import('@/components/ModuleErrorBoundary'));

const ModuleLibrary = () => {
  const { user } = useAuth();
  const { modules } = useModules();
  const isMobile = useIsMobile();
  const [selectedModule, setSelectedModule] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { favorites, toggleFavorite } = useFavorites();

  const filteredModules = useMemo(() => {
    if (!modules) return [];
    
    let filtered = modules.filter(module => {
      const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          module.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFavorites = !showFavoritesOnly || favorites.includes(module.id);
      
      return matchesSearch && matchesFavorites;
    });

    return filtered;
  }, [modules, searchTerm, showFavoritesOnly, favorites]);

  const handleModuleClick = (module: any) => {
    setSelectedModule(module);
  };

  const handleBackToLibrary = () => {
    setSelectedModule(null);
  };

  const handleBackToDashboard = () => {
    window.location.href = '/dashboard';
  };

  if (!modules || modules.length === 0) {
    return <LoadingScreen message="Loading module library..." />;
  }

  if (selectedModule) {
    try {
      const ModuleComponent = selectedModule.component;
      return (
        <ErrorBoundary>
          <PageTransition>
            <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white overflow-x-hidden">
              <Suspense fallback={<LoadingScreen message="Loading module..." />}>
                <ModuleErrorBoundary moduleName={selectedModule.title} onBack={handleBackToLibrary}>
                  <ModuleComponent 
                    onBack={handleBackToLibrary}
                    navigationSource="library"
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

  return (
    <ErrorBoundary>
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white overflow-x-hidden">
          {/* Header */}
          <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800/50">
            <div className="px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={handleBackToDashboard}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white hover:bg-gray-800/50"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <h1 className="text-xl sm:text-2xl font-bold text-white">
                    Module Library
                  </h1>
                </div>

                {/* View mode toggle */}
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setViewMode('grid')}
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    className="p-2"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => setViewMode('list')}
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    className="p-2"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
            {/* Search and Filters */}
            <div className="mb-8 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search modules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-900/50 border-gray-700/50 text-white placeholder-gray-400"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    variant={showFavoritesOnly ? 'default' : 'outline'}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                    <span className="hidden sm:inline">Favorites</span>
                  </Button>
                </div>
              </div>

              {/* Results count */}
              <div className="text-sm text-gray-400">
                {filteredModules.length} {filteredModules.length === 1 ? 'module' : 'modules'} found
                {showFavoritesOnly && ' in favorites'}
              </div>
            </div>

            {/* Modules Grid/List */}
            {filteredModules.length > 0 ? (
              <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 bg-gray-900/40 rounded-xl animate-pulse" />
                ))}
              </div>}>
                <ModuleGrid
                  modules={filteredModules}
                  favorites={favorites}
                  onModuleClick={handleModuleClick}
                  onToggleFavorite={toggleFavorite}
                  viewMode={viewMode}
                />
              </Suspense>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-900/40 border border-gray-700/50 rounded-2xl p-8 max-w-md mx-auto">
                  <Filter className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-white mb-2">No modules found</h2>
                  <p className="text-gray-400 mb-4">
                    {searchTerm ? `No modules match "${searchTerm}"` : 'No modules available'}
                    {showFavoritesOnly && ' in your favorites'}
                  </p>
                  {(searchTerm || showFavoritesOnly) && (
                    <Button
                      onClick={() => {
                        setSearchTerm('');
                        setShowFavoritesOnly(false);
                      }}
                      variant="outline"
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    </ErrorBoundary>
  );
};

export default ModuleLibrary;

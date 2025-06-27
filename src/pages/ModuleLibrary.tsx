import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Star, Grid, List, Crown, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useModules } from '@/contexts/ModulesContext';
import { ModuleGrid } from '@/components/dashboard/ModuleGrid';
import { useIsMobile } from '@/hooks/use-mobile';
import { PageTransition } from '@/components/ui/page-transition';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useFavorites } from '@/hooks/useFavorites';

type ViewMode = 'grid' | 'list';

const ModuleLibrary = () => {
  const navigate = useNavigate();
  const { modules } = useModules();
  const isMobile = useIsMobile();
  const { favorites, toggleFavorite } = useFavorites();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const savedViewMode = localStorage.getItem('module-view-mode');
      if (savedViewMode && (savedViewMode === 'grid' || savedViewMode === 'list')) {
        setViewMode(savedViewMode as ViewMode);
      }
    } catch (error) {
      console.error('Error loading view mode:', error);
      setViewMode('grid');
    } finally {
      // Simulate loading delay for smooth transition
      setTimeout(() => setIsLoading(false), 500);
    }
  }, []);

  // Save view mode preference
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('module-view-mode', mode);
    } catch (error) {
      console.error('Error saving view mode:', error);
    }
  };

  // Filter modules to exclude Progress Hub from the library
  const libraryModules = modules.filter(module => module.id !== 'progress-hub');

  const filteredModules = libraryModules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'free' && !module.isPremium) ||
                         (filterType === 'premium' && module.isPremium) ||
                         (filterType === 'favorites' && favorites.includes(module.id));
    
    return matchesSearch && matchesFilter;
  });

  const sortedModules = [...filteredModules].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.title.localeCompare(b.title);
      case 'newest':
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      case 'premium':
        return (b.isPremium ? 1 : 0) - (a.isPremium ? 1 : 0);
      default:
        return 0;
    }
  });

  const handleModuleClick = (module) => {
    setSelectedModule(module);
  };

  const handleBackToLibrary = () => {
    setSelectedModule(null);
  };

  if (selectedModule) {
    const ModuleComponent = selectedModule.component;
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
          <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-gray-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <button
                  onClick={handleBackToLibrary}
                  className="text-white hover:text-orange-400 transition-colors font-medium flex items-center space-x-2"
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
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <ModuleComponent onBack={handleBackToLibrary} />
          </div>
        </div>
      </PageTransition>
    );
  }

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
          <div className="p-4 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-orange-500/20 rounded animate-pulse" />
                <div className="h-8 w-48 bg-orange-500/20 rounded animate-pulse" />
              </div>
              <LoadingSkeleton type="card" count={6} />
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
        <div className="p-4 sm:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Mobile-optimized Header */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/app')}
                    className="text-white hover:bg-orange-500/20 backdrop-blur-sm hover:text-orange-400 transition-colors p-2"
                    size="sm"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                      Module Library
                    </h1>
                    <p className="text-gray-400 text-sm">Discover AI fitness tools</p>
                  </div>
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex items-center space-x-2 bg-orange-900/20 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleViewModeChange('grid')}
                    className={`p-2 transition-all duration-200 ${
                      viewMode === 'grid' 
                        ? 'bg-orange-500/30 text-orange-300' 
                        : 'hover:bg-orange-500/20 text-gray-400 hover:text-orange-400'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleViewModeChange('list')}
                    className={`p-2 transition-all duration-200 ${
                      viewMode === 'list' 
                        ? 'bg-orange-500/30 text-orange-300' 
                        : 'hover:bg-orange-500/20 text-gray-400 hover:text-orange-400'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Enhanced Search and Filters */}
            <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 backdrop-blur-sm border border-orange-500/30 rounded-xl p-4 sm:p-6">
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-5 h-5" />
                  <Input
                    placeholder="Search modules..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 bg-orange-800/30 border-orange-500/40 text-white placeholder:text-orange-300/70 h-12 text-lg focus:border-orange-400 rounded-xl transition-all duration-200"
                  />
                </div>
                
                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="bg-orange-800/30 border-orange-500/40 text-white h-12 rounded-xl transition-all duration-200">
                      <Filter className="w-4 h-4 mr-2 text-orange-400" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900/95 backdrop-blur-md border-orange-500/40 rounded-xl">
                      <SelectItem value="all">All Modules</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="favorites">Favorites</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-orange-800/30 border-orange-500/40 text-white h-12 rounded-xl transition-all duration-200">
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900/95 backdrop-blur-md border-orange-500/40 rounded-xl">
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="premium">Premium First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="border-orange-500/40 text-orange-300 bg-orange-500/10 px-3 py-1">
                {sortedModules.length} modules
              </Badge>
              <Badge variant="outline" className="border-green-500/40 text-green-400 bg-green-500/10 px-3 py-1">
                {sortedModules.filter(m => !m.isPremium).length} free
              </Badge>
              <Badge variant="outline" className="border-yellow-500/40 text-yellow-400 bg-yellow-500/10 px-3 py-1">
                <Crown className="w-3 h-3 mr-1" />
                {sortedModules.filter(m => m.isPremium).length} premium
              </Badge>
              <Badge variant="outline" className="border-orange-500/40 text-orange-400 bg-orange-500/10 px-3 py-1">
                <Star className="w-3 h-3 mr-1" />
                {favorites.length} favorites
              </Badge>
            </div>

            {/* Modules Display */}
            {sortedModules.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Search className="w-10 h-10 text-orange-500/50" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">No modules found</h3>
                <p className="text-orange-300/70 text-lg">Try adjusting your search or filters</p>
              </div>
            ) : (
              <ModuleGrid
                modules={sortedModules}
                favorites={favorites}
                onModuleClick={handleModuleClick}
                onToggleFavorite={toggleFavorite}
                viewMode={viewMode}
              />
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ModuleLibrary;

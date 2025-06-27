
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

  // Load preferences from localStorage - no artificial delays
  useEffect(() => {
    try {
      const savedViewMode = localStorage.getItem('module-view-mode');
      if (savedViewMode && (savedViewMode === 'grid' || savedViewMode === 'list')) {
        setViewMode(savedViewMode as ViewMode);
      }
    } catch (error) {
      console.error('Error loading view mode:', error);
      setViewMode('grid');
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
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
              <div className="flex items-center justify-between h-14 sm:h-16">
                <button
                  onClick={handleBackToLibrary}
                  className="text-white hover:text-orange-400 transition-colors font-medium flex items-center space-x-2 p-3 -ml-2 min-h-[48px] min-w-[48px] justify-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  <span className="text-sm sm:text-base">Library</span>
                </button>
                <h1 className="text-base sm:text-lg font-semibold text-center flex-1 px-2 sm:px-4 truncate">
                  {selectedModule.title}
                </h1>
                <div className="w-16 sm:w-20"></div>
              </div>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
            <ModuleComponent onBack={handleBackToLibrary} />
          </div>
        </div>
      </PageTransition>
    );
  }

  // Instant loading - no skeleton or artificial delays
  if (!modules || modules.length === 0) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
        <div className="p-3 sm:p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            {/* Mobile-optimized Header with better touch targets */}
            <div className="flex flex-col space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/app')}
                    className="text-white hover:bg-orange-500/20 backdrop-blur-sm hover:text-orange-400 transition-colors p-3 min-h-[48px] min-w-[48px]"
                    size="sm"
                  >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                  <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                      Module Library
                    </h1>
                    <p className="text-gray-400 text-xs sm:text-sm">Discover AI fitness tools</p>
                  </div>
                </div>
                
                {/* View Mode Toggle - Better touch targets */}
                <div className="flex items-center space-x-1 bg-orange-900/20 rounded-lg p-1">
                  <button
                    onClick={() => handleViewModeChange('grid')}
                    className={`p-3 transition-all duration-150 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center ${
                      viewMode === 'grid' 
                        ? 'bg-orange-500/30 text-orange-300' 
                        : 'hover:bg-orange-500/20 text-gray-400 hover:text-orange-400'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleViewModeChange('list')}
                    className={`p-3 transition-all duration-150 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center ${
                      viewMode === 'list' 
                        ? 'bg-orange-500/30 text-orange-300' 
                        : 'hover:bg-orange-500/20 text-gray-400 hover:text-orange-400'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Search and Filters */}
            <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 backdrop-blur-sm border border-orange-500/30 rounded-xl p-3 sm:p-4 md:p-6">
              <div className="space-y-3 sm:space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <Input
                    placeholder="Search modules..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 sm:pl-12 bg-orange-800/30 border-orange-500/40 text-white placeholder:text-orange-300/70 h-12 sm:h-14 text-sm sm:text-lg focus:border-orange-400 rounded-xl transition-all duration-150"
                  />
                </div>
                
                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="bg-orange-800/30 border-orange-500/40 text-white h-12 sm:h-14 rounded-xl transition-all duration-150 text-sm">
                      <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-orange-400" />
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
                    <SelectTrigger className="bg-orange-800/30 border-orange-500/40 text-white h-12 sm:h-14 rounded-xl transition-all duration-150 text-sm">
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
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Badge variant="outline" className="border-orange-500/40 text-orange-300 bg-orange-500/10 px-2 sm:px-3 py-1 text-xs">
                {sortedModules.length} modules
              </Badge>
              <Badge variant="outline" className="border-green-500/40 text-green-400 bg-green-500/10 px-2 sm:px-3 py-1 text-xs">
                {sortedModules.filter(m => !m.isPremium).length} free
              </Badge>
              <Badge variant="outline" className="border-yellow-500/40 text-yellow-400 bg-yellow-500/10 px-2 sm:px-3 py-1 text-xs">
                <Crown className="w-3 h-3 mr-1" />
                {sortedModules.filter(m => m.isPremium).length} premium
              </Badge>
              <Badge variant="outline" className="border-orange-500/40 text-orange-400 bg-orange-500/10 px-2 sm:px-3 py-1 text-xs">
                <Star className="w-3 h-3 mr-1" />
                {favorites.length} favorites
              </Badge>
            </div>

            {/* Modules Display */}
            {sortedModules.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Search className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500/50" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2">No modules found</h3>
                <p className="text-orange-300/70 text-base sm:text-lg">Try adjusting your search or filters</p>
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


import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Star, Grid, List, Crown, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useModules } from '@/contexts/ModulesContext';
import { ModuleGrid } from '@/components/dashboard/ModuleGrid';
import { useIsMobile } from '@/hooks/use-mobile';
import { PageTransition } from '@/components/ui/page-transition';

const ModuleLibrary = () => {
  const navigate = useNavigate();
  const { modules } = useModules();
  const isMobile = useIsMobile();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('module-favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    }
  }, []);

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

  const toggleFavorite = (moduleId) => {
    try {
      const newFavorites = favorites.includes(moduleId) 
        ? favorites.filter(id => id !== moduleId)
        : [...favorites, moduleId];
      
      setFavorites(newFavorites);
      localStorage.setItem('module-favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

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
          <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <button
                  onClick={handleBackToLibrary}
                  className="text-white hover:text-orange-400 transition-colors font-medium"
                >
                  ← Back to Library
                </button>
                <h1 className="text-lg font-semibold text-center flex-1 px-4 truncate">
                  {selectedModule.title}
                </h1>
                <div className="w-32"></div>
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

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
        <div className="p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 mb-6 sm:mb-8">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/app')}
                  className="text-white hover:bg-gray-800/50 backdrop-blur-sm hover:text-orange-400 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Dashboard
                </Button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                    Module Library
                  </h1>
                  <p className="text-gray-400 text-sm sm:text-base">Discover powerful AI fitness tools</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="bg-gray-800/50 hover:bg-gray-700/50"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="bg-gray-800/50 hover:bg-gray-700/50"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search modules..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-800/50 border-gray-600 text-white min-h-[48px]"
                  />
                </div>
                
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full sm:w-40 bg-gray-800/50 border-gray-600 text-white min-h-[48px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="all">All Modules</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="favorites">Favorites</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-40 bg-gray-800/50 border-gray-600 text-white min-h-[48px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="premium">Premium First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Module Count and Stats */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Badge variant="outline" className="border-gray-600 text-gray-300">
                {sortedModules.length} modules found
              </Badge>
              <Badge variant="outline" className="border-green-600 text-green-400">
                {sortedModules.filter(m => !m.isPremium).length} free
              </Badge>
              <Badge variant="outline" className="border-orange-600 text-orange-400">
                <Crown className="w-3 h-3 mr-1" />
                {sortedModules.filter(m => m.isPremium).length} premium
              </Badge>
              <Badge variant="outline" className="border-yellow-600 text-yellow-400">
                <Star className="w-3 h-3 mr-1" />
                {favorites.length} favorites
              </Badge>
            </div>

            {/* Modules Display */}
            <div className="space-y-6">
              {sortedModules.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No modules found</h3>
                  <p className="text-gray-400">Try adjusting your search or filters</p>
                </div>
              ) : (
                <ModuleGrid
                  modules={sortedModules}
                  favorites={favorites}
                  onModuleClick={handleModuleClick}
                  onToggleFavorite={toggleFavorite}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ModuleLibrary;

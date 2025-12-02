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
import { ModuleGridSkeleton } from '@/components/ui/module-card-skeleton';
import { useFavorites } from '@/hooks/useFavorites';
import { useSubscription } from '@/hooks/useSubscription';
import PremiumPromoCard from '@/components/PremiumPromoCard';
import { useStableLoading } from '@/utils/flickerPrevention';

type ViewMode = 'grid' | 'list';

const ModuleLibrary = () => {
  const navigate = useNavigate();
  const { modules } = useModules();
  const isMobile = useIsMobile();
  const { favorites, toggleFavorite } = useFavorites();
  const { currentTier } = useSubscription();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const stableLoading = useStableLoading(isLoadingModules, 300);

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
    }
    
    // Check if modules are available
    if (modules && modules.length > 0) {
      setIsLoadingModules(false);
    }
  }, [modules]);

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
    console.log('Module clicked:', module.title, module.id);
    // For Blueprint AI, navigate to the specific route
    if (module.id === 'blueprint-ai') {
      navigate('/blueprint-ai');
      return;
    }
    setSelectedModule(module);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLibrary = () => {
    setSelectedModule(null);
  };

  if (selectedModule) {
    const ModuleComponent = selectedModule.component;
    return (
      <PageTransition>
        <div className="min-h-screen bg-background text-foreground">
          <ModuleComponent 
            onBack={handleBackToLibrary}
            navigationSource="library"
          />
        </div>
      </PageTransition>
    );
  }

  if (stableLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background text-foreground">
          <div className="px-4 py-6 pb-24">
            <div className="max-w-2xl mx-auto space-y-5">
              {/* Header skeleton */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted/50 rounded-full animate-shimmer" />
                  <div className="space-y-2">
                    <div className="h-7 w-32 bg-muted/50 rounded-lg animate-shimmer" />
                    <div className="h-4 w-24 bg-muted/50 rounded animate-shimmer" />
                  </div>
                </div>
                <div className="w-20 h-9 bg-muted/50 rounded-xl animate-shimmer" />
              </div>
              
              {/* Search skeleton */}
              <div className="h-12 w-full bg-muted/50 rounded-xl animate-shimmer" />
              
              {/* Filter skeleton */}
              <div className="grid grid-cols-2 gap-3">
                <div className="h-11 bg-muted/50 rounded-xl animate-shimmer" />
                <div className="h-11 bg-muted/50 rounded-xl animate-shimmer" />
              </div>
              
              {/* Module grid skeleton */}
              <ModuleGridSkeleton count={6} variant={viewMode} />
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground">
        <div className="px-4 py-6 pb-24">
          <div className="max-w-2xl mx-auto space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/app')}
                  className="p-2 h-10 w-10 rounded-full hover:bg-muted"
                  size="icon"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Modules
                  </h1>
                  <p className="text-muted-foreground text-sm">AI fitness tools</p>
                </div>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewModeChange('grid')}
                  className={`p-2 h-8 w-8 rounded-lg transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-background shadow-sm text-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewModeChange('list')}
                  className={`p-2 h-8 w-8 rounded-lg transition-all ${
                    viewMode === 'list' 
                      ? 'bg-background shadow-sm text-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none z-10" />
              <Input
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-card border-border rounded-xl text-foreground placeholder:text-muted-foreground"
              />
            </div>
            
            {/* Filters */}
            <div className="grid grid-cols-2 gap-3">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-11 bg-card border-border rounded-xl">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border rounded-xl">
                  <SelectItem value="all">All Modules</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="favorites">Favorites</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-11 bg-card border-border rounded-xl">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border rounded-xl">
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="premium">Premium First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-border text-muted-foreground bg-muted/30 px-3 py-1 text-xs">
                {sortedModules.length} modules
              </Badge>
              <Badge variant="outline" className="border-success/30 text-success bg-success/10 px-3 py-1 text-xs">
                {sortedModules.filter(m => !m.isPremium).length} free
              </Badge>
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 px-3 py-1 text-xs">
                <Crown className="w-3 h-3 mr-1" />
                {sortedModules.filter(m => m.isPremium).length} premium
              </Badge>
              <Badge variant="outline" className="border-yellow-500/30 text-yellow-500 bg-yellow-500/10 px-3 py-1 text-xs">
                <Star className="w-3 h-3 mr-1 fill-current" />
                {favorites.length}
              </Badge>
            </div>

            {/* Modules Display */}
            {sortedModules.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">No modules found</h3>
                <p className="text-muted-foreground text-sm">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Premium Promotion for Free Users */}
                {currentTier === 'free' && (
                  <PremiumPromoCard variant="compact" />
                )}
                
                <ModuleGrid
                  modules={sortedModules}
                  favorites={favorites}
                  onModuleClick={handleModuleClick}
                  onToggleFavorite={toggleFavorite}
                  onModuleHover={() => {}}
                  onModuleInteraction={() => {}}
                  viewMode={viewMode}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ModuleLibrary;

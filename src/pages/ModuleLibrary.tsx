import React, { useState, useEffect, useMemo, memo, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Star, Grid, List, Crown, Filter, Book } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useModules } from '@/contexts/ModulesContext';
import { ModuleGrid } from '@/components/dashboard/ModuleGrid';
import { useIsMobile } from '@/hooks/use-mobile';
import { ModuleGridSkeleton } from '@/components/ui/module-card-skeleton';
import { useFavorites } from '@/hooks/useFavorites';
import { useSubscription } from '@/hooks/useSubscription';
import PremiumPromoCard from '@/components/PremiumPromoCard';
import { MobileHeader } from '@/components/MobileHeader';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
  const [isLoading, setIsLoading] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts: "/" focuses search, "g" grid view, "l" list view
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;
      if (isTyping) return;

      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'g' || e.key === 'G') {
        handleViewModeChange('grid');
      } else if (e.key === 'l' || e.key === 'L') {
        handleViewModeChange('list');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

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
    
    if (modules && modules.length > 0) {
      setIsLoading(false);
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
  const libraryModules = useMemo(() => 
    modules.filter(module => module.id !== 'progress-hub'),
    [modules]
  );

  const filteredModules = useMemo(() => 
    libraryModules.filter(module => {
      const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           module.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterType === 'all' || 
                           (filterType === 'free' && !module.isPremium) ||
                           (filterType === 'premium' && module.isPremium) ||
                           (filterType === 'favorites' && favorites.includes(module.id));
      
      return matchesSearch && matchesFilter;
    }),
    [libraryModules, searchQuery, filterType, favorites]
  );

  const sortedModules = useMemo(() => 
    [...filteredModules].sort((a, b) => {
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
    }),
    [filteredModules, sortBy]
  );

  const handleModuleClick = (module) => {
    // Navigate with returnTo state for proper back navigation
    const routeMap: { [key: string]: string } = {
      'blueprint-ai': '/blueprint-ai',
      'workout-logger': '/workout-logger',
      'smart-food-log': '/smart-food-log',
      'coach-gpt': '/coach-gpt',
      'meal-plan-ai': '/meal-plan-ai',
      'recovery-coach': '/recovery-coach',
      'smart-training': '/smart-training',
      'habit-tracker': '/habit-tracker',
      'tdee-calculator': '/tdee-calculator',
      'cut-calc-pro': '/cut-calc-pro',
      'workout-timer': '/workout-timer',
      'physique-ai': '/physique-ai',
      'exercise-database': '/exercise-database',
      'research': '/research',
    };
    
    const route = routeMap[module.id];
    if (route) {
      navigate(route, { state: { returnTo: '/modules' } });
      return;
    }
    
    // Fallback to inline module rendering
    setSelectedModule(module);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLibrary = () => {
    setSelectedModule(null);
  };

  if (selectedModule) {
    const ModuleComponent = selectedModule.component;
    return (
      <div className="min-h-screen bg-background text-foreground">
        <ModuleComponent 
          onBack={handleBackToLibrary}
          navigationSource="library"
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <MobileHeader title="Modules" />
        <div className="px-4 pb-24">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="h-12 w-full bg-muted/50 rounded-xl animate-pulse" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-11 bg-muted/50 rounded-xl animate-pulse" />
              <div className="h-11 bg-muted/50 rounded-xl animate-pulse" />
            </div>
            <ModuleGridSkeleton count={6} variant={viewMode} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MobileHeader 
        title="Modules"
        rightElement={
          <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-0.5" role="group" aria-label="View mode">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewModeChange('grid')}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
              className={cn(
                "p-2 h-9 w-9 min-h-[36px] min-w-[36px] rounded-lg transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                viewMode === 'grid' 
                  ? 'bg-background shadow-sm text-foreground' 
                  : 'text-muted-foreground [@media(hover:hover)]:hover:text-foreground'
              )}
            >
              <Grid className="w-4 h-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewModeChange('list')}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
              className={cn(
                "p-2 h-9 w-9 min-h-[36px] min-w-[36px] rounded-lg transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                viewMode === 'list' 
                  ? 'bg-background shadow-sm text-foreground' 
                  : 'text-muted-foreground [@media(hover:hover)]:hover:text-foreground'
              )}
            >
              <List className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        }
      />

      <div className="px-4 pb-24">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Search */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none z-10" aria-hidden="true" />
            <Input
              ref={searchInputRef}
              placeholder="Search modules... (press /)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 min-h-[44px] bg-card border-border rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/50"
              aria-label="Search modules"
            />
          </motion.div>
          
          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex gap-2"
          >
            <Button
              onClick={() => navigate('/exercise-database', { state: { returnTo: '/modules' } })}
              variant="outline"
              size="sm"
              className="flex-1 h-11 min-h-[44px] rounded-xl focus-visible:ring-2 focus-visible:ring-primary/50"
              aria-label="Open Exercise Library"
            >
              <Book className="w-4 h-4 mr-2" aria-hidden="true" />
              Exercise Library
            </Button>
          </motion.div>

          {/* Filters */}
          <motion.div 
            className="grid grid-cols-2 gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-11 min-h-[44px] bg-card border-border rounded-xl focus-visible:ring-2 focus-visible:ring-primary/50" aria-label="Filter modules">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" aria-hidden="true" />
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
              <SelectTrigger className="h-11 min-h-[44px] bg-card border-border rounded-xl focus-visible:ring-2 focus-visible:ring-primary/50" aria-label="Sort modules">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border rounded-xl">
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="premium">Premium First</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="flex flex-wrap items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Badge variant="outline" className="border-border text-muted-foreground bg-muted/30 px-3 py-1 text-xs">
              {sortedModules.length} modules
            </Badge>
            <Badge variant="outline" className="border-green-500/30 text-green-500 bg-green-500/10 px-3 py-1 text-xs">
              {sortedModules.filter(m => !m.isPremium).length} free
            </Badge>
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 px-3 py-1 text-xs">
              <Crown className="w-3 h-3 mr-1" aria-hidden="true" />
              {sortedModules.filter(m => m.isPremium).length} premium
            </Badge>
            <Badge variant="outline" className="border-yellow-500/30 text-yellow-500 bg-yellow-500/10 px-3 py-1 text-xs">
              <Star className="w-3 h-3 mr-1 fill-current" aria-hidden="true" />
              {favorites.length}
            </Badge>
          </motion.div>

          {/* Premium Promotion for Free Users */}
          {currentTier === 'free' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <PremiumPromoCard variant="compact" />
            </motion.div>
          )}

          {/* Modules Display */}
          {sortedModules.length === 0 ? (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center" aria-hidden="true">
                <Search className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No modules found</h3>
              <p className="text-muted-foreground text-sm">Try adjusting your search or filters</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <ModuleGrid
                modules={sortedModules}
                favorites={favorites}
                onModuleClick={handleModuleClick}
                onToggleFavorite={toggleFavorite}
                onModuleHover={() => {}}
                onModuleInteraction={() => {}}
                viewMode={viewMode}
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(ModuleLibrary);
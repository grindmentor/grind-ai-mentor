
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Crown, Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  gradient: string;
  isPremium?: boolean;
  isNew?: boolean;
  component: React.ComponentType<any>;
}

interface ModuleGridProps {
  modules: Module[];
  favorites: string[];
  onModuleClick: (module: Module) => void;
  onToggleFavorite: (moduleId: string) => void;
  viewMode?: 'grid' | 'list';
}

// Enhanced module-specific color mappings that match actual module colors
const getModuleColors = (moduleId: string) => {
  const colorMap: Record<string, string> = {
    'coach-gpt': 'bg-gradient-to-br from-blue-600/80 to-indigo-700/80 border-blue-400/50',
    'smart-training': 'bg-gradient-to-br from-purple-600/80 to-pink-700/80 border-purple-400/50',
    'meal-plan-ai': 'bg-gradient-to-br from-green-600/80 to-emerald-700/80 border-green-400/50',
    'smart-food-log': 'bg-gradient-to-br from-orange-600/80 to-red-700/80 border-orange-400/50',
    'progress-ai': 'bg-gradient-to-br from-cyan-600/80 to-blue-700/80 border-cyan-400/50',
    'tdee-calculator': 'bg-gradient-to-br from-yellow-600/80 to-orange-700/80 border-yellow-400/50',
    'cut-calc-pro': 'bg-gradient-to-br from-red-600/80 to-pink-700/80 border-red-400/50',
    'workout-timer': 'bg-gradient-to-br from-indigo-600/80 to-purple-700/80 border-indigo-400/50',
    'habit-tracker': 'bg-gradient-to-br from-teal-600/80 to-green-700/80 border-teal-400/50',
    'recovery-coach': 'bg-gradient-to-br from-violet-600/80 to-indigo-700/80 border-violet-400/50',
    'workout-library': 'bg-gradient-to-br from-slate-600/80 to-gray-700/80 border-slate-400/50',
    'cardio-ai': 'bg-gradient-to-br from-pink-600/80 to-rose-700/80 border-pink-400/50',
    'workout-logger-ai': 'bg-gradient-to-br from-emerald-600/80 to-teal-700/80 border-emerald-400/50',
    'food-photo-logger': 'bg-gradient-to-br from-amber-600/80 to-yellow-700/80 border-amber-400/50'
  };

  return colorMap[moduleId] || 'bg-gradient-to-br from-gray-600/80 to-slate-700/80 border-gray-400/50';
};

export const ModuleGrid: React.FC<ModuleGridProps> = React.memo(({
  modules,
  favorites,
  onModuleClick,
  onToggleFavorite,
  viewMode = 'grid'
}) => {
  const isMobile = useIsMobile();

  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        {modules.map((module) => {
          const IconComponent = module.icon;
          const isFavorited = favorites.includes(module.id);
          const moduleColors = getModuleColors(module.id);
          
          return (
            <Card 
              key={module.id}
              className={`group cursor-pointer hover:shadow-xl backdrop-blur-sm border-opacity-60 hover:border-opacity-80 relative overflow-hidden transform hover:scale-[1.01] transition-all duration-150 active:scale-[0.99] min-h-[80px] ${moduleColors}`}
              onClick={() => onModuleClick(module)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-xl bg-white/25 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-lg">
                    <IconComponent className="w-7 h-7 text-white drop-shadow-sm" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-white text-lg truncate drop-shadow-sm">
                        {module.title}
                      </h3>
                      {module.isNew && (
                        <Badge className="bg-orange-500/70 text-orange-100 border-orange-300/70 text-xs shadow-md">
                          <Sparkles className="w-3 h-3 mr-1" />
                          New
                        </Badge>
                      )}
                      {module.isPremium && (
                        <Badge className="bg-yellow-500/70 text-yellow-100 border-yellow-300/70 text-xs shadow-md">
                          <Crown className="w-3 h-3 mr-1" />
                          Pro
                        </Badge>
                      )}
                    </div>
                    <p className="text-white/95 text-sm line-clamp-2 drop-shadow-sm">
                      {module.description}
                    </p>
                  </div>
                  
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(module.id);
                    }}
                    variant="ghost"
                    size="sm"
                    className={`flex-shrink-0 p-4 min-h-[48px] min-w-[48px] rounded-lg transition-all duration-150 ${
                      isFavorited 
                        ? 'text-orange-200 hover:text-orange-100 bg-orange-500/25' 
                        : 'text-white/80 hover:text-orange-200 hover:bg-orange-500/25'
                    }`}
                  >
                    <Star className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${
      isMobile 
        ? 'grid-cols-1 px-2' 
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    }`}>
      {modules.map((module) => {
        const IconComponent = module.icon;
        const isFavorited = favorites.includes(module.id);
        const moduleColors = getModuleColors(module.id);
        
        return (
          <Card 
            key={module.id}
            className={`group cursor-pointer hover:shadow-xl backdrop-blur-sm border-opacity-60 hover:border-opacity-80 relative overflow-hidden transform hover:scale-[1.02] transition-all duration-150 active:scale-[0.98] min-h-[200px] ${moduleColors}`}
            onClick={() => onModuleClick(module)}
          >
            <CardHeader className="relative z-10 pb-2 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-14 h-14 rounded-xl bg-white/25 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <IconComponent className="w-7 h-7 text-white drop-shadow-sm" />
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(module.id);
                  }}
                  variant="ghost"
                  size="sm"
                  className={`p-4 min-h-[48px] min-w-[48px] rounded-lg transition-all duration-150 ${
                    isFavorited 
                      ? 'text-orange-200 hover:text-orange-100 bg-orange-500/25' 
                      : 'text-white/80 hover:text-orange-200 hover:bg-orange-500/25'
                  }`}
                >
                  <Star className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-white text-lg font-bold drop-shadow-sm">
                    {module.title}
                  </CardTitle>
                  {module.isNew && (
                    <Badge className="bg-orange-500/70 text-orange-100 border-orange-300/70 text-xs shadow-md">
                      <Sparkles className="w-3 h-3 mr-1" />
                      New
                    </Badge>
                  )}
                </div>
                
                {module.isPremium && (
                  <Badge className="bg-yellow-500/70 text-yellow-100 border-yellow-300/70 w-fit shadow-md">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="relative z-10 pt-0 p-5">
              <CardDescription className="text-white/95 text-sm leading-relaxed drop-shadow-sm">
                {module.description}
              </CardDescription>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});

ModuleGrid.displayName = 'ModuleGrid';

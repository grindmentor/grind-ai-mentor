
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Crown, Sparkles, Grid, List } from "lucide-react";
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

// Enhanced function to get module-specific background colors that exactly match interior gradients
const getModuleTheme = (moduleId: string, gradient: string) => {
  const moduleThemes: { [key: string]: { bg: string; border: string; iconColor: string; accent: string } } = {
    'cut-calc-pro': {
      bg: 'bg-gradient-to-br from-red-900/50 to-pink-900/60',
      border: 'border-red-500/50',
      iconColor: 'text-red-400',
      accent: 'text-red-200'
    },
    'blueprint-ai': {
      bg: 'bg-gradient-to-br from-blue-900/50 to-indigo-900/60',
      border: 'border-blue-500/50',
      iconColor: 'text-blue-400',
      accent: 'text-blue-200'
    },
    'smart-training': {
      bg: 'bg-gradient-to-br from-blue-900/50 to-indigo-900/60',
      border: 'border-blue-500/50',
      iconColor: 'text-blue-400',
      accent: 'text-blue-200'
    },
    'meal-plan-ai': {
      bg: 'bg-gradient-to-br from-green-900/50 to-emerald-900/60',
      border: 'border-green-500/50',
      iconColor: 'text-green-400',
      accent: 'text-green-200'
    },
    'recovery-coach': {
      bg: 'bg-gradient-to-br from-purple-900/50 to-violet-900/60',
      border: 'border-purple-500/50',
      iconColor: 'text-purple-400',
      accent: 'text-purple-200'
    },
    'progress-hub': {
      bg: 'bg-gradient-to-br from-purple-900/50 to-violet-900/60',
      border: 'border-purple-500/50',
      iconColor: 'text-purple-400',
      accent: 'text-purple-200'
    },
    'tdee-calculator': {
      bg: 'bg-gradient-to-br from-green-900/50 to-emerald-900/60',
      border: 'border-green-500/50',
      iconColor: 'text-green-400',
      accent: 'text-green-200'
    },
    'smart-food-log': {
      bg: 'bg-gradient-to-br from-teal-900/50 to-cyan-900/60',
      border: 'border-teal-500/50',
      iconColor: 'text-teal-400',
      accent: 'text-teal-200'
    },
    'habit-tracker': {
      bg: 'bg-gradient-to-br from-pink-900/50 to-rose-900/60',
      border: 'border-pink-500/50',
      iconColor: 'text-pink-400',
      accent: 'text-pink-200'
    },
    'cardio-ai': {
      bg: 'bg-gradient-to-br from-indigo-900/50 to-blue-900/60',
      border: 'border-indigo-500/50',
      iconColor: 'text-indigo-400',
      accent: 'text-indigo-200'
    },
    'workout-timer': {
      bg: 'bg-gradient-to-br from-yellow-900/50 to-orange-900/60',
      border: 'border-yellow-500/50',
      iconColor: 'text-yellow-400',
      accent: 'text-yellow-200'
    },
    'coach-gpt': {
      bg: 'bg-gradient-to-br from-teal-900/50 to-cyan-900/60',
      border: 'border-cyan-500/50',
      iconColor: 'text-cyan-400',
      accent: 'text-cyan-200'
    },
    'workout-logger-ai': {
      bg: 'bg-gradient-to-br from-green-900/50 to-emerald-900/60',
      border: 'border-emerald-500/50',
      iconColor: 'text-emerald-400',
      accent: 'text-emerald-200'
    }
  };

  // Return specific theme or fallback to gradient-based theme
  return moduleThemes[moduleId] || {
    bg: getModuleBackgroundColor(gradient),
    border: 'border-gray-700/50',
    iconColor: getIconColor(gradient),
    accent: 'text-gray-300'
  };
};

// Function to convert gradient classes to background colors with exact matching
const getModuleBackgroundColor = (gradient: string) => {
  const gradientMap: { [key: string]: string } = {
    'from-blue-900/60 to-indigo-900/80': 'bg-gradient-to-br from-blue-900/50 to-indigo-900/60',
    'from-green-900/60 to-emerald-900/80': 'bg-gradient-to-br from-green-900/50 to-emerald-900/60',
    'from-orange-900/60 to-red-900/80': 'bg-gradient-to-br from-orange-900/50 to-red-900/60',
    'from-purple-900/60 to-violet-900/80': 'bg-gradient-to-br from-purple-900/50 to-violet-900/60',
    'from-red-900/60 to-pink-900/80': 'bg-gradient-to-br from-red-900/50 to-pink-900/60',
    'from-teal-900/60 to-cyan-900/80': 'bg-gradient-to-br from-teal-900/50 to-cyan-900/60',
    'from-yellow-900/60 to-orange-900/80': 'bg-gradient-to-br from-yellow-900/50 to-orange-900/60',
    'from-pink-900/60 to-rose-900/80': 'bg-gradient-to-br from-pink-900/50 to-rose-900/60',
    'from-indigo-900/60 to-blue-900/80': 'bg-gradient-to-br from-indigo-900/50 to-blue-900/60',
    'from-gray-900/60 to-slate-900/80': 'bg-gradient-to-br from-gray-900/50 to-slate-900/60',
  };
  
  return gradientMap[gradient] || 'bg-gradient-to-br from-gray-900/50 to-gray-900/60';
};

// Function to get icon color based on module theme with exact matching
const getIconColor = (gradient: string) => {
  const colorMap: { [key: string]: string } = {
    'from-blue-900/60 to-indigo-900/80': 'text-blue-400',
    'from-green-900/60 to-emerald-900/80': 'text-green-400',
    'from-orange-900/60 to-red-900/80': 'text-orange-400',
    'from-purple-900/60 to-violet-900/80': 'text-purple-400',
    'from-red-900/60 to-pink-900/80': 'text-red-400',
    'from-teal-900/60 to-cyan-900/80': 'text-teal-400',
    'from-yellow-900/60 to-orange-900/80': 'text-yellow-400',
    'from-pink-900/60 to-rose-900/80': 'text-pink-400',
    'from-indigo-900/60 to-blue-900/80': 'text-indigo-400',
    'from-gray-900/60 to-slate-900/80': 'text-gray-400',
  };
  
  return colorMap[gradient] || 'text-gray-400';
};

export const ModuleGrid: React.FC<ModuleGridProps> = ({
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
          const theme = getModuleTheme(module.id, module.gradient);
          
          return (
            <Card 
              key={module.id}
              className={`group cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl ${theme.bg} ${theme.border} backdrop-blur-sm border-opacity-30 hover:border-opacity-60`}
              onClick={() => onModuleClick(module)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 border border-white/30`}>
                    <IconComponent className={`w-6 h-6 ${theme.iconColor}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-white text-lg w-full truncate">
                        {module.title}
                      </h3>
                      {module.isNew && (
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs flex-shrink-0">
                          <Sparkles className="w-3 h-3 mr-1" />
                          New
                        </Badge>
                      )}
                      {module.isPremium && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs flex-shrink-0">
                          <Crown className="w-3 h-3 mr-1" />
                          Pro
                        </Badge>
                      )}
                    </div>
                    <p className={`text-sm line-clamp-2 ${theme.accent}`}>
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
                    className={`flex-shrink-0 transition-colors ${
                      isFavorited 
                        ? 'text-orange-400 hover:text-orange-300' 
                        : 'text-gray-400 hover:text-orange-400'
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
    <div className={`grid gap-4 sm:gap-6 ${
      isMobile 
        ? 'grid-cols-1' 
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    }`}>
      {modules.map((module) => {
        const IconComponent = module.icon;
        const isFavorited = favorites.includes(module.id);
        const theme = getModuleTheme(module.id, module.gradient);
        
        return (
          <Card 
            key={module.id}
            className={`group cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${theme.bg} ${theme.border} backdrop-blur-sm border-opacity-30 hover:border-opacity-60 relative overflow-hidden`}
            onClick={() => onModuleClick(module)}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <CardHeader className="relative z-10 pb-2">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/30`}>
                  <IconComponent className={`w-6 h-6 sm:w-7 sm:h-7 ${theme.iconColor}`} />
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(module.id);
                  }}
                  variant="ghost"
                  size="sm"
                  className={`transition-colors flex-shrink-0 ${
                    isFavorited 
                      ? 'text-orange-400 hover:text-orange-300' 
                      : 'text-gray-400 hover:text-orange-400'
                  }`}
                >
                  <Star className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                </Button>
              </div>
              
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-between w-full">
                  <CardTitle className="text-white text-lg sm:text-xl font-bold group-hover:text-orange-100 transition-colors w-full truncate pr-2">
                    {module.title}
                  </CardTitle>
                  <div className="flex flex-col space-y-1 flex-shrink-0">
                    {module.isNew && (
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs animate-pulse">
                        <Sparkles className="w-3 h-3 mr-1" />
                        New
                      </Badge>
                    )}
                    {module.isPremium && (
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                        <Crown className="w-3 h-3 mr-1" />
                        Pro
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="relative z-10 pt-0">
              <CardDescription className={`text-sm leading-relaxed ${theme.accent}`}>
                {module.description}
              </CardDescription>
            </CardContent>
            
            {/* Module-specific colored hover indicator */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.iconColor.replace('text-', 'from-').replace('-300', '-500')} to-${theme.iconColor.replace('text-', '').replace('-300', '-600')} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
          </Card>
        );
      })}
    </div>
  );
};

// Add default export for lazy loading
export default ModuleGrid;


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

// Updated function to get module-specific background colors that match AIModuleCard exactly
const getModuleTheme = (title: string) => {
  const moduleThemes: { [key: string]: { bg: string; border: string; iconBg: string; iconColor: string; accent: string } } = {
    // CoachGPT - Cyan theme
    'CoachGPT': {
      bg: 'bg-gradient-to-br from-cyan-900/50 to-blue-900/50',
      border: 'border-cyan-500/30',
      iconBg: 'bg-gradient-to-r from-cyan-500/30 to-blue-500/40 border-cyan-500/30',
      iconColor: 'text-white',
      accent: 'text-white/90'
    },
    'Coach GPT': {
      bg: 'bg-gradient-to-br from-cyan-900/50 to-blue-900/50',
      border: 'border-cyan-500/30',
      iconBg: 'bg-gradient-to-r from-cyan-500/30 to-blue-500/40 border-cyan-500/30',
      iconColor: 'text-white',
      accent: 'text-white/90'
    },
    // Habit Tracker - Yellow theme
    'Habit Tracker': {
      bg: 'bg-gradient-to-br from-yellow-900/50 to-orange-900/50',
      border: 'border-yellow-500/30',
      iconBg: 'bg-gradient-to-r from-yellow-500/30 to-orange-500/40 border-yellow-500/30',
      iconColor: 'text-white',
      accent: 'text-white/90'
    },
    // CutCalc Pro - Red theme
    'CutCalc Pro': {
      bg: 'bg-gradient-to-br from-red-900/50 to-pink-900/50',
      border: 'border-red-500/30',
      iconBg: 'bg-gradient-to-r from-red-500/30 to-pink-500/40 border-red-500/30',
      iconColor: 'text-white',
      accent: 'text-white/90'
    },
    // TDEE Calculator - Green theme
    'TDEE Calculator': {
      bg: 'bg-gradient-to-br from-green-900/50 to-emerald-900/50',
      border: 'border-green-500/30',
      iconBg: 'bg-gradient-to-r from-green-500/30 to-emerald-500/40 border-green-500/30',
      iconColor: 'text-white',
      accent: 'text-white/90'
    },
    // Smart Training - Green theme
    'Smart Training': {
      bg: 'bg-gradient-to-br from-green-900/50 to-emerald-900/50',
      border: 'border-green-500/30',
      iconBg: 'bg-gradient-to-r from-green-500/30 to-emerald-500/40 border-green-500/30',
      iconColor: 'text-white',
      accent: 'text-white/90'
    },
    // Blueprint AI - Blue to cyan theme
    'Blueprint AI': {
      bg: 'bg-gradient-to-br from-blue-900/50 to-cyan-900/50',
      border: 'border-blue-500/30',
      iconBg: 'bg-gradient-to-r from-blue-500/30 to-cyan-500/40 border-blue-500/30',
      iconColor: 'text-white',
      accent: 'text-white/90'
    },
    // Workout Timer - Orange theme
    'Workout Timer': {
      bg: 'bg-gradient-to-br from-orange-900/50 to-yellow-900/50',
      border: 'border-orange-500/30',
      iconBg: 'bg-gradient-to-r from-orange-500/30 to-yellow-500/40 border-orange-500/30',
      iconColor: 'text-white',
      accent: 'text-white/90'
    },
    // Meal Plan Generator - Green theme
    'Meal Plan Generator': {
      bg: 'bg-gradient-to-br from-green-900/50 to-emerald-900/50',
      border: 'border-green-500/30',
      iconBg: 'bg-gradient-to-r from-green-500/30 to-emerald-500/40 border-green-500/30',
      iconColor: 'text-white',
      accent: 'text-white/90'
    },
    'Meal Plan AI': {
      bg: 'bg-gradient-to-br from-green-900/50 to-emerald-900/50',
      border: 'border-green-500/30',
      iconBg: 'bg-gradient-to-r from-green-500/30 to-emerald-500/40 border-green-500/30',
      iconColor: 'text-white',
      accent: 'text-white/90'
    },
    // Progress Hub - Purple theme
    'Progress Hub': {
      bg: 'bg-gradient-to-br from-purple-900/50 to-violet-900/50',
      border: 'border-purple-500/30',
      iconBg: 'bg-gradient-to-r from-purple-500/30 to-violet-500/40 border-purple-500/30',
      iconColor: 'text-white',
      accent: 'text-white/90'
    },
    // Workout Logger AI - Green theme
    'Workout Logger AI': {
      bg: 'bg-gradient-to-br from-green-900/50 to-emerald-900/50',
      border: 'border-green-500/30',
      iconBg: 'bg-gradient-to-r from-green-500/30 to-emerald-500/40 border-green-500/30',
      iconColor: 'text-white',
      accent: 'text-white/90'
    },
    'Workout Logger': {
      bg: 'bg-gradient-to-br from-green-900/50 to-emerald-900/50',
      border: 'border-green-500/30',
      iconBg: 'bg-gradient-to-r from-green-500/30 to-emerald-500/40 border-green-500/30',
      iconColor: 'text-white',
      accent: 'text-white/90'
    },
    // Recovery Coach - Purple theme
    'Recovery Coach': {
      bg: 'bg-gradient-to-br from-purple-900/50 to-violet-900/50',
      border: 'border-purple-500/30',
      iconBg: 'bg-gradient-to-r from-purple-500/30 to-violet-500/40 border-purple-500/30',
      iconColor: 'text-white',
      accent: 'text-white/90'
    },
    // Smart Food Log - Teal theme
    'Smart Food Log': {
      bg: 'bg-gradient-to-br from-teal-900/50 to-cyan-900/50',
      border: 'border-teal-500/30',
      iconBg: 'bg-gradient-to-r from-teal-500/30 to-cyan-500/40 border-teal-500/30',
      iconColor: 'text-white',
      accent: 'text-white/90'
    },
    // Physique AI - Purple theme
    'Physique AI': {
      bg: 'bg-gradient-to-br from-purple-900/50 to-violet-900/50',
      border: 'border-purple-500/30',
      iconBg: 'bg-gradient-to-r from-purple-500/30 to-violet-500/40 border-purple-500/30',
      iconColor: 'text-white',
      accent: 'text-white/90'
    }
  };
  
  // Return specific theme or fallback to default black theme
  return moduleThemes[title] || {
    bg: 'bg-gradient-to-br from-gray-900/50 to-gray-900/50',
    border: 'border-gray-700/30',
    iconBg: 'bg-black/20 border-white/20',
    iconColor: 'text-white',
    accent: 'text-gray-300'
  };
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
          const theme = getModuleTheme(module.title);
          
          return (
            <Card 
              key={module.id}
              className={`group cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl ${theme.bg} ${theme.border} backdrop-blur-sm border-opacity-30 hover:border-opacity-60`}
              onClick={() => onModuleClick(module)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl ${theme.iconBg} flex items-center justify-center flex-shrink-0 border`}>
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
        const theme = getModuleTheme(module.title);
        
        return (
          <Card 
            key={module.id}
            className={`group cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${theme.bg} ${theme.border} backdrop-blur-sm border-opacity-30 hover:border-opacity-60 relative overflow-hidden`}
            onClick={() => onModuleClick(module)}
          >
            {/* Background pattern with reduced opacity */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
            </div>
            
            <CardHeader className="relative z-10 pb-2">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${theme.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border`}>
                  <IconComponent className={`w-6 h-6 sm:w-7 sm:h-7 ${theme.iconColor} drop-shadow-lg`} />
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
                  <CardTitle className="text-white text-lg sm:text-xl font-bold group-hover:text-orange-100 transition-colors w-full truncate pr-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {module.title}
                  </CardTitle>
                  <div className="flex flex-col space-y-1 flex-shrink-0">
                    {module.isNew && (
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs animate-pulse">
                        <Sparkles className="w-3 h-3 mr-1" />New
                      </Badge>
                    )}
                    {module.isPremium && (
                      <Badge className="bg-yellow-500/30 text-yellow-100 border-yellow-400/50 backdrop-blur-sm drop-shadow-lg">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="relative z-10 pt-0">
              <CardDescription className={`text-sm leading-relaxed ${theme.accent} drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-medium`}>
                {module.description}
              </CardDescription>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Add default export for lazy loading
export default ModuleGrid;


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

// Function to convert gradient classes to background colors with opacity
const getModuleBackgroundColor = (gradient: string) => {
  const gradientMap: { [key: string]: string } = {
    'from-blue-900/60 to-indigo-900/80': 'bg-blue-900/50',
    'from-green-900/60 to-emerald-900/80': 'bg-green-900/50',
    'from-orange-900/60 to-red-900/80': 'bg-orange-900/50',
    'from-purple-900/60 to-violet-900/80': 'bg-purple-900/50',
    'from-red-900/60 to-pink-900/80': 'bg-red-900/50',
    'from-teal-900/60 to-cyan-900/80': 'bg-teal-900/50',
    'from-yellow-900/60 to-orange-900/80': 'bg-yellow-900/50',
    'from-pink-900/60 to-rose-900/80': 'bg-pink-900/50',
    'from-indigo-900/60 to-blue-900/80': 'bg-indigo-900/50',
    'from-gray-900/60 to-slate-900/80': 'bg-gray-900/50',
  };
  
  return gradientMap[gradient] || 'bg-gray-900/50';
};

// Function to get icon color based on module theme
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
          const bgColor = getModuleBackgroundColor(module.gradient);
          const iconColor = getIconColor(module.gradient);
          
          return (
            <Card 
              key={module.id}
              className={`group cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl ${bgColor} backdrop-blur-sm border-opacity-30 hover:border-opacity-60 border-gray-700/50`}
              onClick={() => onModuleClick(module)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className={`w-6 h-6 ${iconColor}`} />
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
                    <p className="text-gray-300 text-sm line-clamp-2">
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
        const bgColor = getModuleBackgroundColor(module.gradient);
        const iconColor = getIconColor(module.gradient);
        
        return (
          <Card 
            key={module.id}
            className={`group cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${bgColor} backdrop-blur-sm border-opacity-30 hover:border-opacity-60 relative overflow-hidden border-gray-700/50`}
            onClick={() => onModuleClick(module)}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <CardHeader className="relative z-10 pb-2">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className={`w-6 h-6 sm:w-7 sm:h-7 ${iconColor}`} />
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
              <CardDescription className="text-gray-300 text-sm leading-relaxed">
                {module.description}
              </CardDescription>
            </CardContent>
            
            {/* Hover indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Card>
        );
      })}
    </div>
  );
};

// Add default export for lazy loading
export default ModuleGrid;

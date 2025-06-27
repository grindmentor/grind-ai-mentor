
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

export const ModuleGrid: React.FC<ModuleGridProps> = ({
  modules,
  favorites,
  onModuleClick,
  onToggleFavorite,
  viewMode = 'grid'
}) => {
  const isMobile = useIsMobile();

  // Get module-specific background based on gradient
  const getModuleBackground = (gradient: string) => {
    const gradientMap: { [key: string]: string } = {
      'from-orange-400 to-red-500': 'bg-gradient-to-br from-orange-500/30 to-red-600/40',
      'from-blue-400 to-purple-500': 'bg-gradient-to-br from-blue-500/30 to-purple-600/40',
      'from-green-400 to-teal-500': 'bg-gradient-to-br from-green-500/30 to-teal-600/40',
      'from-purple-400 to-pink-500': 'bg-gradient-to-br from-purple-500/30 to-pink-600/40',
      'from-yellow-400 to-orange-500': 'bg-gradient-to-br from-yellow-500/30 to-orange-600/40',
      'from-indigo-400 to-blue-500': 'bg-gradient-to-br from-indigo-500/30 to-blue-600/40',
      'from-pink-400 to-rose-500': 'bg-gradient-to-br from-pink-500/30 to-rose-600/40',
      'from-teal-400 to-cyan-500': 'bg-gradient-to-br from-teal-500/30 to-cyan-600/40',
      'from-red-400 to-pink-500': 'bg-gradient-to-br from-red-500/30 to-pink-600/40',
      'from-emerald-400 to-green-500': 'bg-gradient-to-br from-emerald-500/30 to-green-600/40'
    };
    
    return gradientMap[gradient] || 'bg-gradient-to-br from-gray-500/20 to-gray-600/30';
  };

  // Get icon background based on gradient
  const getIconBackground = (gradient: string) => {
    const iconMap: { [key: string]: string } = {
      'from-orange-400 to-red-500': 'bg-orange-500/30 border-orange-400/50',
      'from-blue-400 to-purple-500': 'bg-blue-500/30 border-blue-400/50',
      'from-green-400 to-teal-500': 'bg-green-500/30 border-green-400/50',
      'from-purple-400 to-pink-500': 'bg-purple-500/30 border-purple-400/50',
      'from-yellow-400 to-orange-500': 'bg-yellow-500/30 border-yellow-400/50',
      'from-indigo-400 to-blue-500': 'bg-indigo-500/30 border-indigo-400/50',
      'from-pink-400 to-rose-500': 'bg-pink-500/30 border-pink-400/50',
      'from-teal-400 to-cyan-500': 'bg-teal-500/30 border-teal-400/50',
      'from-red-400 to-pink-500': 'bg-red-500/30 border-red-400/50',
      'from-emerald-400 to-green-500': 'bg-emerald-500/30 border-emerald-400/50'
    };
    
    return iconMap[gradient] || 'bg-gray-500/30 border-gray-400/50';
  };

  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        {modules.map((module) => {
          const IconComponent = module.icon;
          const isFavorited = favorites.includes(module.id);
          
          return (
            <Card 
              key={module.id}
              className={`group cursor-pointer hover:shadow-xl backdrop-blur-sm border-opacity-40 hover:border-opacity-60 relative overflow-hidden transition-all duration-200 ${getModuleBackground(module.gradient)}`}
              onClick={() => onModuleClick(module)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl backdrop-blur-sm flex items-center justify-center flex-shrink-0 border ${getIconBackground(module.gradient)}`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-white text-lg truncate">
                        {module.title}
                      </h3>
                      {module.isNew && (
                        <Badge className="bg-orange-500/50 text-orange-100 border-orange-400/60 text-xs font-medium">
                          <Sparkles className="w-3 h-3 mr-1" />
                          New
                        </Badge>
                      )}
                      {module.isPremium && (
                        <Badge className="bg-yellow-500/50 text-yellow-100 border-yellow-400/60 text-xs font-medium">
                          <Crown className="w-3 h-3 mr-1" />
                          Pro
                        </Badge>
                      )}
                    </div>
                    <p className="text-white/90 text-sm line-clamp-2">
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
                    className={`flex-shrink-0 p-2 touch-manipulation transition-colors ${
                      isFavorited 
                        ? 'text-orange-300 hover:text-orange-200' 
                        : 'text-white/70 hover:text-orange-300'
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
        
        return (
          <Card 
            key={module.id}
            className={`group cursor-pointer hover:shadow-xl backdrop-blur-sm border-opacity-40 hover:border-opacity-70 relative overflow-hidden touch-manipulation transition-all duration-300 hover:scale-105 ${getModuleBackground(module.gradient)}`}
            onClick={() => onModuleClick(module)}
          >
            <CardHeader className="relative z-10 pb-2 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl backdrop-blur-sm flex items-center justify-center border ${getIconBackground(module.gradient)}`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(module.id);
                  }}
                  variant="ghost"
                  size="sm"
                  className={`p-2 touch-manipulation transition-colors ${
                    isFavorited 
                      ? 'text-orange-300 hover:text-orange-200' 
                      : 'text-white/70 hover:text-orange-300'
                  }`}
                >
                  <Star className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-white text-lg font-bold">
                    {module.title}
                  </CardTitle>
                  {module.isNew && (
                    <Badge className="bg-orange-500/50 text-orange-100 border-orange-400/60 text-xs font-medium">
                      <Sparkles className="w-3 h-3 mr-1" />
                      New
                    </Badge>
                  )}
                </div>
                
                {module.isPremium && (
                  <Badge className="bg-yellow-500/50 text-yellow-100 border-yellow-400/60 w-fit font-medium">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="relative z-10 pt-0 p-4">
              <CardDescription className="text-white/90 text-sm leading-relaxed">
                {module.description}
              </CardDescription>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

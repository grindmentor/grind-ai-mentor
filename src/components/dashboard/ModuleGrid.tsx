
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

  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        {modules.map((module) => {
          const IconComponent = module.icon;
          const isFavorited = favorites.includes(module.id);
          
          return (
            <Card 
              key={module.id}
              className={`group cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl backdrop-blur-sm border-opacity-30 hover:border-opacity-60 bg-gradient-to-br ${module.gradient} bg-opacity-80 backdrop-blur-md`}
              onClick={() => onModuleClick(module)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-white text-lg truncate drop-shadow-lg">
                        {module.title}
                      </h3>
                      {module.isNew && (
                        <Badge className="bg-orange-500/30 text-orange-200 border-orange-400/40 text-xs backdrop-blur-sm">
                          <Sparkles className="w-3 h-3 mr-1" />
                          New
                        </Badge>
                      )}
                      {module.isPremium && (
                        <Badge className="bg-yellow-500/30 text-yellow-200 border-yellow-400/40 text-xs backdrop-blur-sm">
                          <Crown className="w-3 h-3 mr-1" />
                          Pro
                        </Badge>
                      )}
                    </div>
                    <p className="text-white/90 text-sm line-clamp-2 drop-shadow-md">
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
                    className={`flex-shrink-0 transition-colors backdrop-blur-sm ${
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
    <div className={`grid gap-4 sm:gap-6 ${
      isMobile 
        ? 'grid-cols-1' 
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    }`}>
      {modules.map((module) => {
        const IconComponent = module.icon;
        const isFavorited = favorites.includes(module.id);
        
        return (
          <Card 
            key={module.id}
            className={`group cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl backdrop-blur-md border-opacity-30 hover:border-opacity-60 relative overflow-hidden bg-gradient-to-br ${module.gradient} bg-opacity-80`}
            onClick={() => onModuleClick(module)}
          >
            {/* Animated background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <CardHeader className="relative z-10 pb-2">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-lg" />
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(module.id);
                  }}
                  variant="ghost"
                  size="sm"
                  className={`transition-colors backdrop-blur-sm ${
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
                  <CardTitle className="text-white text-lg sm:text-xl font-bold group-hover:text-orange-100 transition-colors drop-shadow-lg">
                    {module.title}
                  </CardTitle>
                  {module.isNew && (
                    <Badge className="bg-orange-500/30 text-orange-200 border-orange-400/40 text-xs animate-pulse backdrop-blur-sm">
                      <Sparkles className="w-3 h-3 mr-1" />
                      New
                    </Badge>
                  )}
                </div>
                
                {module.isPremium && (
                  <Badge className="bg-yellow-500/30 text-yellow-200 border-yellow-400/40 w-fit backdrop-blur-sm">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="relative z-10 pt-0">
              <CardDescription className="text-white/90 text-sm leading-relaxed drop-shadow-md">
                {module.description}
              </CardDescription>
            </CardContent>
            
            {/* Hover indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-red-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Card>
        );
      })}
    </div>
  );
};

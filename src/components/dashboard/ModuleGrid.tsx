
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
              className="group cursor-pointer hover:shadow-lg backdrop-blur-sm border-opacity-30 hover:border-opacity-50 relative overflow-hidden bg-black/40"
              onClick={() => onModuleClick(module)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-white text-lg truncate">
                        {module.title}
                      </h3>
                      {module.isNew && (
                        <Badge className="bg-orange-500/40 text-orange-200 border-orange-400/50 text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          New
                        </Badge>
                      )}
                      {module.isPremium && (
                        <Badge className="bg-yellow-500/40 text-yellow-200 border-yellow-400/50 text-xs">
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
                    className={`flex-shrink-0 p-2 touch-manipulation ${
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
            className="group cursor-pointer hover:shadow-lg backdrop-blur-sm border-opacity-30 hover:border-opacity-50 relative overflow-hidden bg-black/40 touch-manipulation"
            onClick={() => onModuleClick(module)}
          >
            <CardHeader className="relative z-10 pb-2 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(module.id);
                  }}
                  variant="ghost"
                  size="sm"
                  className={`p-2 touch-manipulation ${
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
                    <Badge className="bg-orange-500/40 text-orange-200 border-orange-400/50 text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      New
                    </Badge>
                  )}
                </div>
                
                {module.isPremium && (
                  <Badge className="bg-yellow-500/40 text-yellow-200 border-yellow-400/50 w-fit">
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

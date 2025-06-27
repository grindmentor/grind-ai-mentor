
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
      <div className="space-y-2 sm:space-y-3">
        {modules.map((module) => {
          const IconComponent = module.icon;
          const isFavorited = favorites.includes(module.id);
          
          return (
            <Card 
              key={module.id}
              className={`group cursor-pointer transition-all duration-200 transform hover:scale-[1.01] sm:hover:scale-[1.02] hover:shadow-lg sm:hover:shadow-2xl backdrop-blur-sm border-opacity-20 hover:border-opacity-40 relative overflow-hidden`}
              style={{
                background: `linear-gradient(135deg, ${module.gradient.includes('from-') ? '' : 'rgba(0,0,0,0.3), '}${module.gradient.replace('from-', '').replace('to-', '').split(' ').map(color => {
                  if (color.includes('orange')) return 'rgba(249, 115, 22, 0.15)';
                  if (color.includes('blue')) return 'rgba(59, 130, 246, 0.15)';
                  if (color.includes('purple')) return 'rgba(147, 51, 234, 0.15)';
                  if (color.includes('green')) return 'rgba(34, 197, 94, 0.15)';
                  if (color.includes('red')) return 'rgba(239, 68, 68, 0.15)';
                  if (color.includes('yellow')) return 'rgba(234, 179, 8, 0.15)';
                  if (color.includes('pink')) return 'rgba(236, 72, 153, 0.15)';
                  if (color.includes('indigo')) return 'rgba(99, 102, 241, 0.15)';
                  return 'rgba(107, 114, 128, 0.15)';
                }).join(', ')})`
              }}
              onClick={() => onModuleClick(module)}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-white text-sm sm:text-lg truncate drop-shadow-lg">
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
                    <p className="text-white/90 text-xs sm:text-sm line-clamp-2 drop-shadow-md">
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
                    className={`flex-shrink-0 transition-colors backdrop-blur-sm p-2 ${
                      isFavorited 
                        ? 'text-orange-300 hover:text-orange-200' 
                        : 'text-white/70 hover:text-orange-300'
                    }`}
                  >
                    <Star className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorited ? 'fill-current' : ''}`} />
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
    <div className={`grid gap-3 sm:gap-4 md:gap-6 ${
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
            className={`group cursor-pointer transition-all duration-200 transform hover:scale-102 sm:hover:scale-105 hover:shadow-lg sm:hover:shadow-2xl backdrop-blur-sm border-opacity-20 hover:border-opacity-40 relative overflow-hidden`}
            style={{
              background: `linear-gradient(135deg, ${module.gradient.includes('from-') ? '' : 'rgba(0,0,0,0.3), '}${module.gradient.replace('from-', '').replace('to-', '').split(' ').map(color => {
                if (color.includes('orange')) return 'rgba(249, 115, 22, 0.2)';
                if (color.includes('blue')) return 'rgba(59, 130, 246, 0.2)';
                if (color.includes('purple')) return 'rgba(147, 51, 234, 0.2)';
                if (color.includes('green')) return 'rgba(34, 197, 94, 0.2)';
                if (color.includes('red')) return 'rgba(239, 68, 68, 0.2)';
                if (color.includes('yellow')) return 'rgba(234, 179, 8, 0.2)';
                if (color.includes('pink')) return 'rgba(236, 72, 153, 0.2)';
                if (color.includes('indigo')) return 'rgba(99, 102, 241, 0.2)';
                return 'rgba(107, 114, 128, 0.2)';
              }).join(', ')})`
            }}
            onClick={() => onModuleClick(module)}
          >
            {/* Animated background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <CardHeader className="relative z-10 pb-2 p-3 sm:p-6">
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white drop-shadow-lg" />
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(module.id);
                  }}
                  variant="ghost"
                  size="sm"
                  className={`transition-colors backdrop-blur-sm p-2 ${
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
                  <CardTitle className="text-white text-base sm:text-lg md:text-xl font-bold group-hover:text-orange-100 transition-colors drop-shadow-lg">
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
            
            <CardContent className="relative z-10 pt-0 p-3 sm:p-6 sm:pt-0">
              <CardDescription className="text-white/90 text-xs sm:text-sm leading-relaxed drop-shadow-md">
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

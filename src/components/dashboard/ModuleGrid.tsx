
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Crown, Zap } from 'lucide-react';
import { Module } from '@/contexts/ModulesContext';

interface ModuleGridProps {
  modules: Module[];
  favorites: string[];
  onModuleClick: (module: Module) => void;
  onToggleFavorite: (moduleId: string) => void;
}

export const ModuleGrid: React.FC<ModuleGridProps> = ({
  modules,
  favorites,
  onModuleClick,
  onToggleFavorite
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {modules.map((module) => {
        const IconComponent = module.icon;
        const isFavorited = favorites.includes(module.id);
        
        return (
          <Card
            key={module.id}
            className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300 cursor-pointer group overflow-hidden"
            onClick={() => onModuleClick(module)}
          >
            <CardHeader className="pb-4 p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r ${module.gradient} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex gap-1 sm:gap-2 flex-wrap">
                  {module.isPremium && (
                    <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                      <Crown className="w-3 h-3 mr-1" />
                      Pro
                    </Badge>
                  )}
                  {module.isNew && (
                    <Badge variant="secondary" className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/30 text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      New
                    </Badge>
                  )}
                </div>
              </div>
              <CardTitle className="text-base sm:text-lg font-semibold text-white group-hover:text-orange-400 transition-colors line-clamp-2">
                {module.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 p-4 sm:p-6 sm:pt-0">
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-3">
                {module.description}
              </p>
              <div className="flex justify-between items-center">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-xs sm:text-sm"
                >
                  Open
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(module.id);
                  }}
                  className={`${isFavorited ? 'text-yellow-500' : 'text-gray-500'} hover:bg-yellow-500/10 p-2`}
                >
                  <Star className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

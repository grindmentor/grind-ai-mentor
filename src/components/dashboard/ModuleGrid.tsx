
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
  // Enhanced color mapping to match internal module designs
  const getModuleCardStyle = (moduleId: string) => {
    switch (moduleId) {
      case 'smart-training':
        return 'bg-gradient-to-br from-red-500/10 to-pink-500/15 border-red-500/20 hover:from-red-500/15 hover:to-pink-500/20';
      case 'coach-gpt':
        return 'bg-gradient-to-br from-green-500/10 to-emerald-500/15 border-green-500/20 hover:from-green-500/15 hover:to-emerald-500/20';
      case 'tdee-calculator':
        return 'bg-gradient-to-br from-blue-500/10 to-cyan-500/15 border-blue-500/20 hover:from-blue-500/15 hover:to-cyan-500/20';
      case 'cut-calc-pro':
        return 'bg-gradient-to-br from-red-600/10 to-red-700/15 border-red-600/20 hover:from-red-600/15 hover:to-red-700/20';
      case 'meal-plan-generator':
        return 'bg-gradient-to-br from-yellow-500/10 to-orange-500/15 border-yellow-500/20 hover:from-yellow-500/15 hover:to-orange-500/20';
      case 'smart-food-log':
        return 'bg-gradient-to-br from-orange-500/10 to-amber-500/15 border-orange-500/20 hover:from-orange-500/15 hover:to-amber-500/20';
      case 'recovery-coach':
        return 'bg-gradient-to-br from-teal-500/10 to-green-500/15 border-teal-500/20 hover:from-teal-500/15 hover:to-green-500/20';
      case 'workout-logger':
        return 'bg-gradient-to-br from-indigo-500/10 to-violet-500/15 border-indigo-500/20 hover:from-indigo-500/15 hover:to-violet-500/20';
      case 'workout-timer':
        return 'bg-gradient-to-br from-cyan-500/10 to-blue-500/15 border-cyan-500/20 hover:from-cyan-500/15 hover:to-blue-500/20';
      case 'workout-library':
        return 'bg-gradient-to-br from-slate-500/10 to-gray-500/15 border-slate-500/20 hover:from-slate-500/15 hover:to-gray-500/20';
      case 'habit-tracker':
        return 'bg-gradient-to-br from-yellow-500/10 to-yellow-700/15 border-yellow-500/20 hover:from-yellow-500/15 hover:to-yellow-700/20';
      case 'physique-ai':
        return 'bg-gradient-to-br from-purple-500/10 to-indigo-500/15 border-purple-500/20 hover:from-purple-500/15 hover:to-indigo-500/20';
      default:
        return 'bg-gray-900/40 backdrop-blur-sm border-gray-700/50 hover:bg-gray-800/50';
    }
  };

  const getIconStyle = (moduleId: string) => {
    switch (moduleId) {
      case 'smart-training':
        return 'bg-gradient-to-r from-red-500/20 to-pink-500/30 border-red-500/30';
      case 'coach-gpt':
        return 'bg-gradient-to-r from-green-500/20 to-emerald-500/30 border-green-500/30';
      case 'tdee-calculator':
        return 'bg-gradient-to-r from-blue-500/20 to-cyan-500/30 border-blue-500/30';
      case 'cut-calc-pro':
        return 'bg-gradient-to-r from-red-600/20 to-red-700/30 border-red-600/30';
      case 'meal-plan-generator':
        return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/30 border-yellow-500/30';
      case 'smart-food-log':
        return 'bg-gradient-to-r from-orange-500/20 to-amber-500/30 border-orange-500/30';
      case 'recovery-coach':
        return 'bg-gradient-to-r from-teal-500/20 to-green-500/30 border-teal-500/30';
      case 'workout-logger':
        return 'bg-gradient-to-r from-indigo-500/20 to-violet-500/30 border-indigo-500/30';
      case 'workout-timer':
        return 'bg-gradient-to-r from-cyan-500/20 to-blue-500/30 border-cyan-500/30';
      case 'workout-library':
        return 'bg-gradient-to-r from-slate-500/20 to-gray-500/30 border-slate-500/30';
      case 'habit-tracker':
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-700/30 border-yellow-500/30';
      case 'physique-ai':
        return 'bg-gradient-to-r from-purple-500/20 to-indigo-500/30 border-purple-500/30';
      default:
        return 'bg-gradient-to-r from-gray-600/20 to-gray-700/30 border-gray-600/30';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {modules.map((module) => {
        const IconComponent = module.icon;
        const isFavorited = favorites.includes(module.id);
        
        return (
          <Card
            key={module.id}
            className={`${getModuleCardStyle(module.id)} backdrop-blur-sm transition-all duration-300 cursor-pointer group overflow-hidden border`}
            onClick={() => onModuleClick(module)}
          >
            <CardHeader className="pb-4 p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${getIconStyle(module.id)} border flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
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

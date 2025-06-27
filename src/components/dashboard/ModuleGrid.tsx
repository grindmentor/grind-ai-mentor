
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
  // Enhanced color mapping to match internal module designs with consistent purple for Progress AI
  const getModuleCardStyle = (moduleId: string) => {
    switch (moduleId) {
      case 'smart-training':
        return 'bg-gradient-to-br from-red-500/15 to-pink-500/20 border-red-500/30 hover:from-red-500/20 hover:to-pink-500/25';
      case 'coach-gpt':
        return 'bg-gradient-to-br from-green-500/15 to-emerald-500/20 border-green-500/30 hover:from-green-500/20 hover:to-emerald-500/25';
      case 'tdee-calculator':
        return 'bg-gradient-to-br from-blue-500/15 to-cyan-500/20 border-blue-500/30 hover:from-blue-500/20 hover:to-cyan-500/25';
      case 'cut-calc-pro':
        return 'bg-gradient-to-br from-red-600/15 to-red-700/20 border-red-600/30 hover:from-red-600/20 hover:to-red-700/25';
      case 'meal-plan-generator':
        return 'bg-gradient-to-br from-yellow-500/15 to-orange-500/20 border-yellow-500/30 hover:from-yellow-500/20 hover:to-orange-500/25';
      case 'smart-food-log':
        return 'bg-gradient-to-br from-orange-500/15 to-amber-500/20 border-orange-500/30 hover:from-orange-500/20 hover:to-amber-500/25';
      case 'recovery-coach':
        return 'bg-gradient-to-br from-teal-500/15 to-green-500/20 border-teal-500/30 hover:from-teal-500/20 hover:to-green-500/25';
      case 'workout-logger':
        return 'bg-gradient-to-br from-indigo-500/15 to-violet-500/20 border-indigo-500/30 hover:from-indigo-500/20 hover:to-violet-500/25';
      case 'workout-timer':
        return 'bg-gradient-to-br from-cyan-500/15 to-blue-500/20 border-cyan-500/30 hover:from-cyan-500/20 hover:to-blue-500/25';
      case 'workout-library':
        return 'bg-gradient-to-br from-slate-500/15 to-gray-500/20 border-slate-500/30 hover:from-slate-500/20 hover:to-gray-500/25';
      case 'habit-tracker':
        return 'bg-gradient-to-br from-yellow-500/15 to-yellow-700/20 border-yellow-500/30 hover:from-yellow-500/20 hover:to-yellow-700/25';
      case 'physique-ai':
        return 'bg-gradient-to-br from-purple-500/15 to-indigo-500/20 border-purple-500/30 hover:from-purple-500/20 hover:to-indigo-500/25';
      case 'progress-ai':
        return 'bg-gradient-to-br from-purple-500/15 to-purple-700/20 border-purple-500/30 hover:from-purple-500/20 hover:to-purple-700/25';
      default:
        return 'bg-gray-900/40 backdrop-blur-sm border-gray-700/50 hover:bg-gray-800/50';
    }
  };

  const getIconStyle = (moduleId: string) => {
    switch (moduleId) {
      case 'smart-training':
        return 'bg-gradient-to-r from-red-500/30 to-pink-500/40 border-red-500/40 text-red-300';
      case 'coach-gpt':
        return 'bg-gradient-to-r from-green-500/30 to-emerald-500/40 border-green-500/40 text-green-300';
      case 'tdee-calculator':
        return 'bg-gradient-to-r from-blue-500/30 to-cyan-500/40 border-blue-500/40 text-blue-300';
      case 'cut-calc-pro':
        return 'bg-gradient-to-r from-red-600/30 to-red-700/40 border-red-600/40 text-red-300';
      case 'meal-plan-generator':
        return 'bg-gradient-to-r from-yellow-500/30 to-orange-500/40 border-yellow-500/40 text-yellow-300';
      case 'smart-food-log':
        return 'bg-gradient-to-r from-orange-500/30 to-amber-500/40 border-orange-500/40 text-orange-300';
      case 'recovery-coach':
        return 'bg-gradient-to-r from-teal-500/30 to-green-500/40 border-teal-500/40 text-teal-300';
      case 'workout-logger':
        return 'bg-gradient-to-r from-indigo-500/30 to-violet-500/40 border-indigo-500/40 text-indigo-300';
      case 'workout-timer':
        return 'bg-gradient-to-r from-cyan-500/30 to-blue-500/40 border-cyan-500/40 text-cyan-300';
      case 'workout-library':
        return 'bg-gradient-to-r from-slate-500/30 to-gray-500/40 border-slate-500/40 text-slate-300';
      case 'habit-tracker':
        return 'bg-gradient-to-r from-yellow-500/30 to-yellow-700/40 border-yellow-500/40 text-yellow-300';
      case 'physique-ai':
        return 'bg-gradient-to-r from-purple-500/30 to-indigo-500/40 border-purple-500/40 text-purple-300';
      case 'progress-ai':
        return 'bg-gradient-to-r from-purple-500/30 to-purple-700/40 border-purple-500/40 text-purple-300';
      default:
        return 'bg-gradient-to-r from-gray-600/30 to-gray-700/40 border-gray-600/40 text-gray-300';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 w-full max-w-full overflow-hidden">
      {modules.map((module) => {
        const IconComponent = module.icon;
        const isFavorited = favorites.includes(module.id);
        
        return (
          <Card
            key={module.id}
            className={`${getModuleCardStyle(module.id)} backdrop-blur-sm transition-all duration-300 cursor-pointer group overflow-hidden border w-full max-w-full touch-manipulation`}
            onClick={() => onModuleClick(module)}
          >
            <CardHeader className="pb-3 p-3 sm:p-4 lg:p-6 lg:pb-4">
              <div className="flex items-start justify-between">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl ${getIconStyle(module.id)} border flex items-center justify-center mb-2 sm:mb-3 lg:mb-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </div>
                <div className="flex gap-1 flex-wrap ml-2">
                  {module.isPremium && (
                    <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30 text-xs px-1 py-0.5">
                      <Crown className="w-2.5 h-2.5 mr-0.5" />
                      Pro
                    </Badge>
                  )}
                  {module.isNew && (
                    <Badge variant="secondary" className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/30 text-xs px-1 py-0.5">
                      <Zap className="w-2.5 h-2.5 mr-0.5" />
                      New
                    </Badge>
                  )}
                </div>
              </div>
              <CardTitle className="text-sm sm:text-base lg:text-lg font-semibold text-white group-hover:text-orange-400 transition-colors line-clamp-2 leading-tight">
                {module.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 p-3 sm:p-4 lg:p-6 lg:pt-0">
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">
                {module.description}
              </p>
              <div className="flex justify-between items-center gap-2">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-xs sm:text-sm flex-1 min-w-0 touch-manipulation h-8 sm:h-9"
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
                  className={`${isFavorited ? 'text-yellow-500' : 'text-gray-500'} hover:bg-yellow-500/10 p-1.5 sm:p-2 h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 touch-manipulation`}
                >
                  <Star className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorited ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

import React from 'react';
import { Star, Crown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSubscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";

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
  onModuleHover?: (moduleId: string) => void;
  onModuleInteraction?: (moduleId: string) => void;
  viewMode?: 'grid' | 'list';
  enableReorder?: boolean;
  onReorder?: (modules: Module[]) => void;
}

const getAccentColor = (title: string) => {
  const colorMap: { [key: string]: { bg: string; border: string; icon: string } } = {
    'CoachGPT': { bg: 'bg-cyan-500/15', border: 'border-cyan-500/30', icon: 'text-cyan-400' },
    'Coach GPT': { bg: 'bg-cyan-500/15', border: 'border-cyan-500/30', icon: 'text-cyan-400' },
    'Habit Tracker': { bg: 'bg-yellow-500/15', border: 'border-yellow-500/30', icon: 'text-yellow-400' },
    'CutCalc Pro': { bg: 'bg-red-500/15', border: 'border-red-500/30', icon: 'text-red-400' },
    'TDEE Calculator': { bg: 'bg-purple-500/15', border: 'border-purple-500/30', icon: 'text-purple-400' },
    'Smart Training': { bg: 'bg-blue-500/15', border: 'border-blue-500/30', icon: 'text-blue-400' },
    'Blueprint AI': { bg: 'bg-indigo-500/15', border: 'border-indigo-500/30', icon: 'text-indigo-400' },
    'Workout Timer': { bg: 'bg-orange-500/15', border: 'border-orange-500/30', icon: 'text-orange-400' },
    'Meal Plan Generator': { bg: 'bg-green-500/15', border: 'border-green-500/30', icon: 'text-green-400' },
    'Meal Plan AI': { bg: 'bg-green-500/15', border: 'border-green-500/30', icon: 'text-green-400' },
    'Progress Hub': { bg: 'bg-purple-500/15', border: 'border-purple-500/30', icon: 'text-purple-400' },
    'Workout Logger AI': { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', icon: 'text-emerald-400' },
    'Workout Logger': { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', icon: 'text-emerald-400' },
    'Recovery Coach': { bg: 'bg-violet-500/15', border: 'border-violet-500/30', icon: 'text-violet-400' },
    'Smart Food Log': { bg: 'bg-amber-500/15', border: 'border-amber-500/30', icon: 'text-amber-400' },
    'Food Photo Logger': { bg: 'bg-pink-500/15', border: 'border-pink-500/30', icon: 'text-pink-400' },
    'Physique AI': { bg: 'bg-rose-500/15', border: 'border-rose-500/30', icon: 'text-rose-400' },
  };
  
  return colorMap[title] || { bg: 'bg-primary/15', border: 'border-primary/30', icon: 'text-primary' };
};

export const ModuleGrid: React.FC<ModuleGridProps> = ({
  modules,
  favorites,
  onModuleClick,
  onToggleFavorite,
  onModuleHover,
  onModuleInteraction,
  viewMode = 'list',
  enableReorder = false,
  onReorder
}) => {
  const isMobile = useIsMobile();
  const { isSubscribed } = useSubscription();

  const renderModuleCard = (module: Module) => {
    const IconComponent = module.icon;
    const isFavorited = favorites.includes(module.id);
    const colors = getAccentColor(module.title);

    return (
      <button
        key={module.id}
        onClick={() => {
          onModuleInteraction?.(module.id);
          onModuleClick(module);
        }}
        onMouseEnter={() => onModuleHover?.(module.id)}
        className={cn(
          "w-full p-4 rounded-2xl text-left transition-all duration-200",
          "bg-card/50 border border-border/50 backdrop-blur-sm",
          "active:scale-[0.98] active:bg-card/70",
          "[@media(hover:hover)]:hover:bg-card/70 [@media(hover:hover)]:hover:border-border",
          module.isPremium && !isSubscribed && 'opacity-70'
        )}
      >
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
            colors.bg, colors.border, "border"
          )}>
            <IconComponent className={cn("w-6 h-6", colors.icon)} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-semibold text-foreground text-sm truncate">
                {module.title}
              </h3>
              {module.isPremium && (
                <Crown className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {module.description}
            </p>
          </div>
          
          {/* Favorite button */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(module.id);
            }}
            variant="ghost"
            size="sm"
            className={cn(
              "h-9 w-9 p-0 rounded-full flex-shrink-0",
              isFavorited ? "text-yellow-500" : "text-muted-foreground/50"
            )}
          >
            <Star className={cn("w-4 h-4", isFavorited && "fill-current")} />
          </Button>
          
          {/* Arrow */}
          <ChevronRight className="w-5 h-5 text-muted-foreground/30 flex-shrink-0" />
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-2">
      {modules.map(module => renderModuleCard(module))}
    </div>
  );
};

export default ModuleGrid;

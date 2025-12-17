import React, { memo } from 'react';
import { Star, Crown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const colorMap: { [key: string]: { bg: string; border: string; icon: string; glow: string } } = {
    'CoachGPT': { bg: 'bg-cyan-500/12', border: 'border-cyan-500/25', icon: 'text-cyan-400', glow: 'shadow-cyan-500/10' },
    'Coach GPT': { bg: 'bg-cyan-500/12', border: 'border-cyan-500/25', icon: 'text-cyan-400', glow: 'shadow-cyan-500/10' },
    'Habit Tracker': { bg: 'bg-yellow-500/12', border: 'border-yellow-500/25', icon: 'text-yellow-400', glow: 'shadow-yellow-500/10' },
    'CutCalc Pro': { bg: 'bg-red-500/12', border: 'border-red-500/25', icon: 'text-red-400', glow: 'shadow-red-500/10' },
    'TDEE Calculator': { bg: 'bg-purple-500/12', border: 'border-purple-500/25', icon: 'text-purple-400', glow: 'shadow-purple-500/10' },
    'Smart Training': { bg: 'bg-blue-500/12', border: 'border-blue-500/25', icon: 'text-blue-400', glow: 'shadow-blue-500/10' },
    'Blueprint AI': { bg: 'bg-indigo-500/12', border: 'border-indigo-500/25', icon: 'text-indigo-400', glow: 'shadow-indigo-500/10' },
    'Workout Timer': { bg: 'bg-orange-500/12', border: 'border-orange-500/25', icon: 'text-orange-400', glow: 'shadow-orange-500/10' },
    'Meal Plan Generator': { bg: 'bg-green-500/12', border: 'border-green-500/25', icon: 'text-green-400', glow: 'shadow-green-500/10' },
    'Meal Plan AI': { bg: 'bg-green-500/12', border: 'border-green-500/25', icon: 'text-green-400', glow: 'shadow-green-500/10' },
    'Progress Hub': { bg: 'bg-purple-500/12', border: 'border-purple-500/25', icon: 'text-purple-400', glow: 'shadow-purple-500/10' },
    'Workout Logger AI': { bg: 'bg-emerald-500/12', border: 'border-emerald-500/25', icon: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
    'Workout Logger': { bg: 'bg-emerald-500/12', border: 'border-emerald-500/25', icon: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
    'Recovery Coach': { bg: 'bg-violet-500/12', border: 'border-violet-500/25', icon: 'text-violet-400', glow: 'shadow-violet-500/10' },
    'Smart Food Log': { bg: 'bg-amber-500/12', border: 'border-amber-500/25', icon: 'text-amber-400', glow: 'shadow-amber-500/10' },
    'Food Photo Logger': { bg: 'bg-pink-500/12', border: 'border-pink-500/25', icon: 'text-pink-400', glow: 'shadow-pink-500/10' },
    'Physique AI': { bg: 'bg-rose-500/12', border: 'border-rose-500/25', icon: 'text-rose-400', glow: 'shadow-rose-500/10' },
  };
  
  return colorMap[title] || { bg: 'bg-primary/12', border: 'border-primary/25', icon: 'text-primary', glow: 'shadow-primary/10' };
};

// Memoized module card for better performance
const ModuleCard = memo<{
  module: Module;
  isFavorited: boolean;
  isSubscribed: boolean;
  onModuleClick: (module: Module) => void;
  onToggleFavorite: (moduleId: string) => void;
  onModuleHover?: (moduleId: string) => void;
  onModuleInteraction?: (moduleId: string) => void;
}>(({ module, isFavorited, isSubscribed, onModuleClick, onToggleFavorite, onModuleHover, onModuleInteraction }) => {
  const IconComponent = module.icon;
  const colors = getAccentColor(module.title);
  const isPremiumLocked = module.isPremium && !isSubscribed;

  return (
    <button
      onClick={() => {
        onModuleInteraction?.(module.id);
        onModuleClick(module);
      }}
      onMouseEnter={() => onModuleHover?.(module.id)}
      aria-label={`Open ${module.title}${module.isPremium ? ' (Premium)' : ''}`}
      className={cn(
        "w-full p-3 rounded-xl text-left transition-all duration-150",
        "bg-card border border-border/50",
        "active:scale-[0.98] active:bg-muted/50",
        "[@media(hover:hover)]:hover:bg-muted/30 [@media(hover:hover)]:hover:border-border/80",
        "min-h-[60px]", // Consistent card height
        isPremiumLocked && 'opacity-60'
      )}
      style={{ 
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      <div className="flex items-center gap-3">
        {/* Icon - Fixed size for consistency */}
        <div className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border",
          colors.bg, colors.border
        )}>
          <IconComponent className={cn("w-5 h-5", colors.icon)} aria-hidden="true" />
        </div>
        
        {/* Content - Flex grow with consistent alignment */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-foreground text-[13px] truncate leading-tight">
              {module.title}
            </h3>
            {module.isPremium && (
              <Crown className="w-3 h-3 text-yellow-500 flex-shrink-0" aria-label="Premium" />
            )}
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-1 leading-snug mt-0.5">
            {module.description}
          </p>
        </div>
        
        {/* Favorite button - 44px touch target */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(module.id);
          }}
          variant="ghost"
          size="sm"
          aria-label={isFavorited ? `Remove ${module.title} from favorites` : `Add ${module.title} to favorites`}
          aria-pressed={isFavorited}
          className={cn(
            "h-11 w-11 p-0 rounded-full flex-shrink-0 min-h-[44px] min-w-[44px]",
            isFavorited ? "text-yellow-500" : "text-muted-foreground/40"
          )}
        >
          <Star className={cn("w-4 h-4", isFavorited && "fill-current")} aria-hidden="true" />
        </Button>
        
        {/* Arrow indicator */}
        <ChevronRight className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" aria-hidden="true" />
      </div>
    </button>
  );
});

ModuleCard.displayName = 'ModuleCard';

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
  const { isSubscribed } = useSubscription();

  return (
    <div className="space-y-2">
      {modules.map(module => (
        <ModuleCard
          key={module.id}
          module={module}
          isFavorited={favorites.includes(module.id)}
          isSubscribed={isSubscribed}
          onModuleClick={onModuleClick}
          onToggleFavorite={onToggleFavorite}
          onModuleHover={onModuleHover}
          onModuleInteraction={onModuleInteraction}
        />
      ))}
    </div>
  );
};

export default memo(ModuleGrid);

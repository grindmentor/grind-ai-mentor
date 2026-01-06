import React, { memo } from 'react';
import { Star, Crown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";
import { getModuleAccent, type ModuleAccent } from "@/theme/moduleAccents";

interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  isPremium?: boolean;
  isNew?: boolean;
  component: React.ComponentType<unknown>;
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

// Fixed dimensions for consistent layout
const CARD_MIN_HEIGHT = 72; // px - same across all cards
const ICON_SIZE = 44; // px - 11 * 4 = 44px (w-11 h-11)

// Memoized module card for better performance
const ModuleCard = memo<{
  module: Module;
  isFavorited: boolean;
  isSubscribed: boolean;
  onModuleClick: (module: Module) => void;
  onToggleFavorite: (moduleId: string) => void;
  onModuleHover?: (moduleId: string) => void;
  onModuleInteraction?: (moduleId: string) => void;
  isGridView?: boolean;
}>(({ module, isFavorited, isSubscribed, onModuleClick, onToggleFavorite, onModuleHover, onModuleInteraction, isGridView = false }) => {
  const IconComponent = module.icon;
  const colors: ModuleAccent = getModuleAccent(module.id);
  const isPremiumLocked = module.isPremium && !isSubscribed;

  // Grid view: vertical card layout - optimized for mobile
  if (isGridView) {
    return (
      <button
        onClick={() => {
          onModuleInteraction?.(module.id);
          onModuleClick(module);
        }}
        onMouseEnter={() => onModuleHover?.(module.id)}
        aria-label={`Open ${module.title}${module.isPremium ? ' (Premium)' : ''}`}
        className={cn(
          "w-full p-4 rounded-xl text-left transition-colors duration-150",
          "bg-card border border-border/50",
          "active:bg-muted/50",
          "[@media(hover:hover)]:hover:bg-muted/30 [@media(hover:hover)]:hover:border-border/80",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          colors.ring,
          isPremiumLocked && "opacity-60"
        )}
        style={{ 
          WebkitTapHighlightColor: 'transparent',
          minHeight: '140px',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Top row: icon and favorite */}
          <div className="flex items-start justify-between mb-3">
            <div 
              className={cn(
                "rounded-xl flex items-center justify-center flex-shrink-0 border",
                colors.bg, colors.border
              )}
              style={{ width: ICON_SIZE, height: ICON_SIZE }}
              aria-hidden="true"
            >
              <IconComponent className={cn("w-5 h-5", colors.text)} aria-hidden="true" />
            </div>
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
                "p-0 rounded-full flex-shrink-0",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/50",
                isFavorited ? "text-yellow-500" : "text-muted-foreground/40"
              )}
              style={{ 
                width: 40, 
                height: 40,
                minWidth: 40,
                minHeight: 40,
              }}
            >
              <Star className={cn("w-4 h-4", isFavorited && "fill-current")} aria-hidden="true" />
            </Button>
          </div>
          
          {/* Title and description */}
          <div className="flex-1 flex flex-col justify-end min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-1">
                {module.title}
              </h3>
              {module.isPremium && (
                <Crown className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" aria-hidden="true" />
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {module.description}
            </p>
          </div>
        </div>
      </button>
    );
  }

  // List view: horizontal card layout - optimized for mobile
  return (
    <button
      onClick={() => {
        onModuleInteraction?.(module.id);
        onModuleClick(module);
      }}
      onMouseEnter={() => onModuleHover?.(module.id)}
      aria-label={`Open ${module.title}${module.isPremium ? ' (Premium)' : ''}`}
      className={cn(
        "w-full p-4 rounded-xl text-left transition-colors duration-150",
        "bg-card border border-border/50",
        "active:bg-muted/50",
        "[@media(hover:hover)]:hover:bg-muted/30 [@media(hover:hover)]:hover:border-border/80",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        colors.ring,
        isPremiumLocked && "opacity-60"
      )}
      style={{ 
        WebkitTapHighlightColor: 'transparent',
        minHeight: '80px',
      }}
    >
      <div className="flex items-center gap-4">
        {/* Icon - Fixed size for consistency across all cards */}
        <div 
          className={cn(
            "rounded-xl flex items-center justify-center flex-shrink-0 border",
            colors.bg, colors.border
          )}
          style={{ width: ICON_SIZE, height: ICON_SIZE }}
          aria-hidden="true"
        >
          <IconComponent className={cn("w-5 h-5", colors.text)} aria-hidden="true" />
        </div>
        
        {/* Content - Flex grow with consistent alignment */}
        <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground text-sm leading-tight truncate">
              {module.title}
            </h3>
            {module.isPremium && (
              <Crown className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" aria-hidden="true" />
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-1">
            {module.description}
          </p>
        </div>
        
        {/* Favorite button - 44px touch target minimum */}
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
            "p-0 rounded-full flex-shrink-0",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            isFavorited ? "text-yellow-500" : "text-muted-foreground/40"
          )}
          style={{ 
            width: ICON_SIZE, 
            height: ICON_SIZE,
            minWidth: ICON_SIZE,
            minHeight: ICON_SIZE,
          }}
        >
          <Star className={cn("w-4 h-4", isFavorited && "fill-current")} aria-hidden="true" />
        </Button>
        
        {/* Arrow indicator */}
        <ChevronRight className="w-5 h-5 text-muted-foreground/40 flex-shrink-0" aria-hidden="true" />
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
}) => {
  const { isSubscribed } = useSubscription();

  const isGrid = viewMode === 'grid';

  return (
    <div 
      className={cn(
        isGrid 
          ? "grid grid-cols-2 gap-4" 
          : "flex flex-col gap-3"
      )} 
      role="list" 
      aria-label="Module list"
    >
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
          isGridView={isGrid}
        />
      ))}
    </div>
  );
};

export default memo(ModuleGrid);

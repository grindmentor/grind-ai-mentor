import React, { memo } from 'react';
import { Crown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getModuleAccent, getModuleAccentByTitle, type ModuleAccent } from '@/theme/moduleAccents';

interface AIModuleCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  isPremium?: boolean;
  onClick: () => void;
  isSubscribed?: boolean;
  onHover?: (moduleId: string) => void;
  onInteraction?: (moduleId: string) => void;
}

// Fixed dimensions for consistent layout - matches ModuleGrid
const CARD_MIN_HEIGHT = 72; // px - same across all module cards
const ICON_SIZE = 44; // px - accessibility minimum (44x44)

const AIModuleCard: React.FC<AIModuleCardProps> = ({
  id,
  title,
  description,
  icon: Icon,
  isPremium,
  onClick,
  isSubscribed = false,
  onHover,
  onInteraction
}) => {
  // Use ID-based accent lookup, fallback to title-based for legacy support
  const colors: ModuleAccent = id ? getModuleAccent(id) : getModuleAccentByTitle(title);

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
    setTimeout(() => onInteraction?.(id), 0);
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => onHover?.(id)}
      aria-label={`Open ${title}${isPremium ? ' (Premium)' : ''}`}
      className={cn(
        // Base styles
        "w-full p-4 rounded-2xl text-left transition-colors duration-200",
        "bg-card/50 border border-border/50 backdrop-blur-sm",
        // Interactive states - NO dimension changes
        "active:bg-card/70",
        "[@media(hover:hover)]:hover:bg-card/70 [@media(hover:hover)]:hover:border-border",
        // Focus visible ring - NO size change
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        colors.ring,
        // Premium locked state - opacity only
        isPremium && !isSubscribed && "opacity-70"
      )}
      style={{
        minHeight: `${CARD_MIN_HEIGHT}px`,
      }}
    >
      <div className="flex items-center gap-4">
        {/* Icon - Fixed dimensions for layout consistency */}
        <div 
          className={cn(
            "rounded-xl flex items-center justify-center flex-shrink-0 border",
            colors.bg, colors.border
          )}
          style={{ width: ICON_SIZE, height: ICON_SIZE }}
          aria-hidden="true"
        >
          <Icon className={cn("w-5 h-5", colors.text)} aria-hidden="true" />
        </div>
        
        {/* Content - Consistent alignment */}
        <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground text-sm truncate">
              {title}
            </h3>
            {isPremium && (
              <Crown className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" aria-hidden="true" />
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {description}
          </p>
        </div>
        
        {/* Arrow indicator */}
        <ChevronRight className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" aria-hidden="true" />
      </div>
    </button>
  );
};

export default memo(AIModuleCard);

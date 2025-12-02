import React, { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const AIModuleCard: React.FC<AIModuleCardProps> = ({
  id,
  title,
  description,
  icon: Icon,
  gradient,
  isPremium,
  onClick,
  isSubscribed = false,
  onHover,
  onInteraction
}) => {
  // Simplified color mapping for native feel
  const getAccentColor = (title: string) => {
    const colorMap: { [key: string]: { bg: string; border: string; icon: string } } = {
      'CoachGPT': { bg: 'bg-cyan-500/15', border: 'border-cyan-500/30', icon: 'text-cyan-400' },
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
      'Recovery Coach': { bg: 'bg-violet-500/15', border: 'border-violet-500/30', icon: 'text-violet-400' },
      'Smart Food Log': { bg: 'bg-teal-500/15', border: 'border-teal-500/30', icon: 'text-teal-400' },
      'Food Photo Logger': { bg: 'bg-pink-500/15', border: 'border-pink-500/30', icon: 'text-pink-400' },
      'Physique AI': { bg: 'bg-rose-500/15', border: 'border-rose-500/30', icon: 'text-rose-400' },
    };
    
    return colorMap[title] || { bg: 'bg-primary/15', border: 'border-primary/30', icon: 'text-primary' };
  };

  const colors = getAccentColor(title);

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
      className={cn(
        "w-full p-4 rounded-2xl text-left transition-all duration-200",
        "bg-card/50 border border-border/50 backdrop-blur-sm",
        "active:scale-[0.98] active:bg-card/70",
        "[@media(hover:hover)]:hover:bg-card/70 [@media(hover:hover)]:hover:border-border",
        isPremium && !isSubscribed && 'opacity-70'
      )}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
          colors.bg, colors.border, "border"
        )}>
          <Icon className={cn("w-6 h-6", colors.icon)} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-foreground text-sm truncate">
              {title}
            </h3>
            {isPremium && (
              <Crown className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {description}
          </p>
        </div>
        
        {/* Arrow */}
        <ChevronRight className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
      </div>
    </button>
  );
};

export default memo(AIModuleCard);

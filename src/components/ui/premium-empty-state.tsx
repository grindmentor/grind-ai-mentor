import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PremiumEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  variant?: 'default' | 'compact' | 'card';
}

export const PremiumEmptyState: React.FC<PremiumEmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className = '',
  variant = 'default'
}) => {
  const isCompact = variant === 'compact';
  const isCard = variant === 'card';

  return (
    <motion.div 
      className={cn(
        "flex flex-col items-center text-center",
        isCard && "bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl",
        isCompact ? "py-8 px-4" : "py-12 px-6",
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className={cn(
        "rounded-2xl flex items-center justify-center bg-muted/50 border border-border/50",
        isCompact ? "w-14 h-14 mb-4" : "w-20 h-20 mb-6"
      )}>
        <Icon className={cn(
          "text-muted-foreground",
          isCompact ? "w-6 h-6" : "w-10 h-10"
        )} />
      </div>
      
      <h3 className={cn(
        "font-semibold text-foreground mb-2",
        isCompact ? "text-base" : "text-xl"
      )}>
        {title}
      </h3>
      
      <p className={cn(
        "text-muted-foreground max-w-sm leading-relaxed",
        isCompact ? "text-xs" : "text-sm"
      )}>
        {description}
      </p>
      
      {(action || secondaryAction) && (
        <div className={cn(
          "flex flex-col sm:flex-row items-center gap-3",
          isCompact ? "mt-4" : "mt-6"
        )}>
          {action && (
            <Button 
              onClick={action.onClick} 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              size={isCompact ? "sm" : "default"}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button 
              onClick={secondaryAction.onClick} 
              variant="outline"
              size={isCompact ? "sm" : "default"}
              className="border-border text-muted-foreground hover:text-foreground"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default PremiumEmptyState;

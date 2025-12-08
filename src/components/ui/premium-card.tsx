import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'glass' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onClick?: () => void;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  interactive = false,
  onClick
}) => {
  const baseStyles = "rounded-2xl border transition-all duration-200";
  
  const variantStyles = {
    default: "bg-card/50 backdrop-blur-sm border-border/50",
    elevated: "bg-card/70 backdrop-blur-md border-border/40 shadow-lg shadow-black/10",
    glass: "bg-white/5 backdrop-blur-xl border-white/10",
    outline: "bg-transparent border-border hover:border-primary/40"
  };

  const paddingStyles = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6"
  };

  if (interactive) {
    return (
      <motion.div
        className={cn(
          baseStyles,
          variantStyles[variant],
          paddingStyles[padding],
          "cursor-pointer hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98] touch-manipulation"
        )}
        onClick={onClick}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 } as any}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Section divider for cards
export const CardDivider: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("w-full h-px bg-border/50 my-4", className)} />
);

// Card header with icon
interface PremiumCardHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const PremiumCardHeader: React.FC<PremiumCardHeaderProps> = ({
  icon,
  title,
  subtitle,
  action,
  className
}) => (
  <div className={cn("flex items-center justify-between mb-4", className)}>
    <div className="flex items-center gap-3 min-w-0">
      {icon && (
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <h3 className="font-semibold text-foreground truncate">{title}</h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>
    </div>
    {action && <div className="shrink-0 ml-2">{action}</div>}
  </div>
);

export default PremiumCard;

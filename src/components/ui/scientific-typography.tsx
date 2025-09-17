import React from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

// Scientific Typography Hierarchy
export const ScientificHeading: React.FC<TypographyProps & { level?: 1 | 2 | 3 | 4 }> = ({ 
  children, 
  level = 1, 
  className = '' 
}) => {
  const baseClasses = "font-display tracking-tight text-gradient";
  const levelClasses = {
    1: "text-4xl lg:text-5xl font-bold leading-tight",
    2: "text-3xl lg:text-4xl font-semibold leading-tight",
    3: "text-2xl lg:text-3xl font-semibold leading-snug",
    4: "text-xl lg:text-2xl font-medium leading-snug"
  };

  const Component = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Component className={cn(baseClasses, levelClasses[level], className)}>
      {children}
    </Component>
  );
};

export const ScientificSubheading: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <p className={cn("text-lg text-muted-foreground font-medium leading-relaxed", className)}>
    {children}
  </p>
);

export const ScientificBody: React.FC<TypographyProps & { size?: 'sm' | 'base' | 'lg' }> = ({ 
  children, 
  size = 'base',
  className = '' 
}) => {
  const sizeClasses = {
    sm: "text-sm leading-relaxed",
    base: "text-base leading-relaxed",
    lg: "text-lg leading-relaxed"
  };

  return (
    <p className={cn("text-foreground/90", sizeClasses[size], className)}>
      {children}
    </p>
  );
};

export const ScientificMetric: React.FC<TypographyProps & { 
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
}> = ({ 
  value, 
  unit = '', 
  trend,
  children, 
  className = '' 
}) => {
  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    stable: 'text-amber-400'
  };

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-baseline space-x-1">
        <span className={cn("text-2xl font-bold font-mono", trend && trendColors[trend])}>
          {value}
        </span>
        {unit && (
          <span className="text-sm text-muted-foreground font-medium">
            {unit}
          </span>
        )}
      </div>
      {children && (
        <div className="text-xs text-muted-foreground font-medium">
          {children}
        </div>
      )}
    </div>
  );
};

export const ScientificLabel: React.FC<TypographyProps & { 
  variant?: 'default' | 'research' | 'warning' | 'success' 
}> = ({ 
  children, 
  variant = 'default',
  className = '' 
}) => {
  const variantClasses = {
    default: 'text-muted-foreground',
    research: 'text-primary font-medium',
    warning: 'text-amber-400 font-medium',
    success: 'text-emerald-400 font-medium'
  };

  return (
    <span className={cn("text-sm font-medium tracking-wide uppercase", variantClasses[variant], className)}>
      {children}
    </span>
  );
};

export const ScientificCode: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <code className={cn(
    "px-2 py-1 text-sm font-mono bg-muted/50 text-primary border border-primary/20 rounded-md",
    className
  )}>
    {children}
  </code>
);

export const ScientificQuote: React.FC<TypographyProps & { source?: string }> = ({ 
  children, 
  source,
  className = '' 
}) => (
  <blockquote className={cn(
    "border-l-4 border-primary/50 pl-6 py-4 italic text-muted-foreground bg-muted/20 rounded-r-lg",
    className
  )}>
    <div className="space-y-2">
      <div>{children}</div>
      {source && (
        <cite className="text-sm font-medium text-primary not-italic">
          — {source}
        </cite>
      )}
    </div>
  </blockquote>
);

export const ScientificEmphasis: React.FC<TypographyProps & { 
  strength?: 'light' | 'medium' | 'strong' 
}> = ({ 
  children, 
  strength = 'medium',
  className = '' 
}) => {
  const strengthClasses = {
    light: 'font-medium text-primary/80',
    medium: 'font-semibold text-primary',
    strong: 'font-bold text-primary drop-shadow-sm'
  };

  return (
    <strong className={cn(strengthClasses[strength], className)}>
      {children}
    </strong>
  );
};
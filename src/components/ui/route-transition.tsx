import React from 'react';
import { cn } from '@/lib/utils';

interface RouteTransitionProps {
  children: React.ReactNode;
  className?: string;
}

// Simplified - no sliding animations for "strong" feel
export const RouteTransition: React.FC<RouteTransitionProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn("w-full", className)}>
      {children}
    </div>
  );
};

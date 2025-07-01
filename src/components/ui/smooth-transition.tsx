
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { usePerformanceContext } from './performance-provider';

interface SmoothTransitionProps {
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
  transitionKey: string;
}

export const SmoothTransition: React.FC<SmoothTransitionProps> = ({
  children,
  isLoading = false,
  className,
  transitionKey
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentKey, setCurrentKey] = useState(transitionKey);
  const { optimizedSettings } = usePerformanceContext();

  useEffect(() => {
    if (transitionKey !== currentKey) {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setCurrentKey(transitionKey);
        setIsVisible(true);
      }, optimizedSettings.reduceAnimations ? 50 : 150);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [transitionKey, currentKey, optimizedSettings.reduceAnimations]);

  useEffect(() => {
    if (!isLoading) {
      setIsVisible(true);
    }
  }, [isLoading]);

  return (
    <div
      className={cn(
        "transition-opacity duration-200",
        isVisible && !isLoading ? "opacity-100" : "opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
};

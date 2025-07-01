
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { usePerformanceContext } from './performance-provider';

interface TabTransitionProps {
  children: React.ReactNode;
  isActive: boolean;
  tabKey: string;
  className?: string;
}

export const TabTransition: React.FC<TabTransitionProps> = ({
  children,
  isActive,
  tabKey,
  className
}) => {
  const [isVisible, setIsVisible] = useState(isActive);
  const [shouldRender, setShouldRender] = useState(isActive);
  const { optimizedSettings } = usePerformanceContext();
  const previousActiveRef = useRef(isActive);

  useEffect(() => {
    if (isActive && !previousActiveRef.current) {
      // Tab is becoming active
      setShouldRender(true);
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else if (!isActive && previousActiveRef.current) {
      // Tab is becoming inactive
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), optimizedSettings.animationDuration || 200);
      return () => clearTimeout(timer);
    }
    previousActiveRef.current = isActive;
  }, [isActive, optimizedSettings.animationDuration]);

  if (!shouldRender) return null;

  const transitionDuration = optimizedSettings.reduceAnimations ? 150 : 200;

  return (
    <div
      className={cn(
        "transition-all ease-out transform-gpu",
        isVisible 
          ? "opacity-100 translate-x-0 scale-100" 
          : "opacity-0 translate-x-2 scale-98",
        className
      )}
      style={{
        transitionDuration: `${transitionDuration}ms`,
        transitionProperty: 'opacity, transform'
      }}
    >
      {children}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

interface RouteTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const RouteTransition: React.FC<RouteTransitionProps> = ({ 
  children, 
  className 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState<'entering' | 'visible' | 'exiting'>('entering');

  // Check for reduced motion preference
  const prefersReducedMotion = 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReducedMotion) {
      // Skip animations if reduced motion is preferred
      setIsVisible(true);
      setTransitionStage('visible');
      setDisplayLocation(location);
      return;
    }

    if (location.pathname !== displayLocation.pathname) {
      // Start exit animation
      setTransitionStage('exiting');
      setIsVisible(false);

      const exitTimer = setTimeout(() => {
        // Update content
        setDisplayLocation(location);
        setTransitionStage('entering');
        
        // Start enter animation
        const enterTimer = setTimeout(() => {
          setIsVisible(true);
          setTransitionStage('visible');
        }, 50);

        return () => clearTimeout(enterTimer);
      }, 200); // Exit duration

      return () => clearTimeout(exitTimer);
    } else {
      // Initial mount
      const timer = setTimeout(() => {
        setIsVisible(true);
        setTransitionStage('visible');
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, displayLocation.pathname, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={cn(
        "transition-opacity ease-out",
        isVisible && transitionStage === 'visible'
          ? "opacity-100" 
          : "opacity-0",
        className
      )}
      style={{
        transitionDuration: '200ms',
        transitionProperty: 'opacity',
      }}
    >
      {children}
    </div>
  );
};

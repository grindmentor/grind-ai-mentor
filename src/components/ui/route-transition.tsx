import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useLocation, useNavigationType } from 'react-router-dom';

interface RouteTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const RouteTransition: React.FC<RouteTransitionProps> = ({ 
  children, 
  className 
}) => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionClass, setTransitionClass] = useState('');
  const isFirstRender = useRef(true);

  // Check for reduced motion preference
  const prefersReducedMotion = 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayChildren(children);
      return;
    }

    if (isFirstRender.current) {
      isFirstRender.current = false;
      setDisplayChildren(children);
      setTransitionClass('animate-slide-in');
      return;
    }

    // Determine direction based on navigation type
    const isBack = navigationType === 'POP';
    
    // Start exit animation
    setTransitionClass(isBack ? 'animate-slide-out-right' : 'animate-slide-out-left');

    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setTransitionClass(isBack ? 'animate-slide-in-left' : 'animate-slide-in');
    }, 150);

    return () => clearTimeout(timer);
  }, [location.pathname, children, navigationType, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={cn(
        "w-full",
        transitionClass,
        className
      )}
    >
      {displayChildren}
    </div>
  );
};

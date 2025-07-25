// Anti-flicker utility for loading states
export class FlickerPrevention {
  private static loadingStates = new Map<string, boolean>();
  private static timers = new Map<string, NodeJS.Timeout>();
  
  static setLoadingState(componentId: string, isLoading: boolean, minDisplayTime = 500) {
    // Clear any existing timer
    const existingTimer = this.timers.get(componentId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    const currentState = this.loadingStates.get(componentId);
    
    if (isLoading) {
      // Immediately set loading state
      this.loadingStates.set(componentId, true);
    } else if (currentState) {
      // Delay hiding loading state to prevent flicker
      const timer = setTimeout(() => {
        this.loadingStates.set(componentId, false);
        this.timers.delete(componentId);
      }, minDisplayTime);
      
      this.timers.set(componentId, timer);
    } else {
      // Not currently loading, safe to set immediately
      this.loadingStates.set(componentId, false);
    }
  }
  
  static getLoadingState(componentId: string): boolean {
    return this.loadingStates.get(componentId) ?? false;
  }
  
  static cleanup(componentId: string) {
    const timer = this.timers.get(componentId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(componentId);
    }
    this.loadingStates.delete(componentId);
  }
}

// Stable loading hook to prevent flicker
import React, { useState, useEffect, useRef } from 'react';

export const useStableLoading = (isLoading: boolean, minDisplayTime = 300) => {
  const [stableLoading, setStableLoading] = useState(isLoading);
  const timerRef = useRef<NodeJS.Timeout>();
  const mountTimeRef = useRef(Date.now());
  
  useEffect(() => {
    if (isLoading) {
      // Immediately show loading
      setStableLoading(true);
      mountTimeRef.current = Date.now();
    } else {
      // Delay hiding loading to prevent flicker
      const elapsedTime = Date.now() - mountTimeRef.current;
      const remainingTime = Math.max(0, minDisplayTime - elapsedTime);
      
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      timerRef.current = setTimeout(() => {
        setStableLoading(false);
      }, remainingTime);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isLoading, minDisplayTime]);
  
  return stableLoading;
};

// Component wrapper to prevent flickering
export const withStableLoading = <P extends object>(
  Component: React.ComponentType<P>,
  minDisplayTime = 300
) => {
  return React.forwardRef<any, P & { isLoading?: boolean }>((props, ref) => {
    const { isLoading = false, ...otherProps } = props;
    const stableLoading = useStableLoading(isLoading, minDisplayTime);
    
    return React.createElement(Component, { ...(otherProps as P), isLoading: stableLoading, ref });
  });
};
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SmoothPageTransitionProps {
  children: React.ReactNode;
  className?: string;
  transition?: "fade" | "slide" | "scale";
  duration?: number;
}

export const SmoothPageTransition: React.FC<SmoothPageTransitionProps> = ({
  children,
  className,
  transition = "fade",
  duration = 300
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const getTransitionClass = () => {
    switch (transition) {
      case "slide":
        return isVisible 
          ? "translate-y-0 opacity-100" 
          : "translate-y-4 opacity-0";
      case "scale":
        return isVisible 
          ? "scale-100 opacity-100" 
          : "scale-95 opacity-0";
      default: // fade
        return isVisible ? "opacity-100" : "opacity-0";
    }
  };

  return (
    <div
      className={cn(
        "transition-all ease-out transform-gpu will-change-transform",
        getTransitionClass(),
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        backfaceVisibility: 'hidden',
      }}
    >
      {children}
    </div>
  );
};
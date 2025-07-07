import React from "react";
import { cn } from "@/lib/utils";

interface PerformanceOptimizedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gradient?: string;
  hoverEffect?: boolean;
  clickable?: boolean;
}

// Ultra-optimized card component with GPU acceleration and minimal DOM operations
export const PerformanceOptimizedCard = React.memo(({ 
  children, 
  className, 
  gradient,
  hoverEffect = true,
  clickable = false,
  ...props 
}: PerformanceOptimizedCardProps) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl backdrop-blur-sm border border-opacity-30",
        "transform-gpu will-change-transform", // GPU acceleration
        gradient || "bg-gradient-to-br from-gray-900/50 to-gray-900/50 border-gray-700/30",
        hoverEffect && "transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-opacity-60",
        clickable && "cursor-pointer",
        className
      )}
      style={{
        backfaceVisibility: 'hidden',
        perspective: '1000px',
      }}
      {...props}
    >
      {/* Optimized background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
});

PerformanceOptimizedCard.displayName = "PerformanceOptimizedCard";
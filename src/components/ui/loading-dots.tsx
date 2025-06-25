
import React from "react";
import { cn } from "@/lib/utils";

interface LoadingDotsProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ 
  size = "md", 
  color = "bg-orange-500",
  className 
}) => {
  const sizeClasses = {
    sm: "w-1 h-1",
    md: "w-2 h-2",
    lg: "w-3 h-3"
  };

  return (
    <div className={cn("flex space-x-1 items-center justify-center", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            sizeClasses[size],
            color,
            "rounded-full animate-pulse"
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.2s'
          }}
        />
      ))}
    </div>
  );
};

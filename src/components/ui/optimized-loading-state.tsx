import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface OptimizedLoadingStateProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
  overlay?: boolean;
}

export const OptimizedLoadingState: React.FC<OptimizedLoadingStateProps> = ({
  className,
  size = "md",
  text,
  overlay = false,
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-4 h-4";
      case "lg":
        return "w-8 h-8";
      default:
        return "w-6 h-6";
    }
  };

  const content = (
    <div className={cn(
      "flex items-center justify-center space-x-2",
      overlay && "absolute inset-0 bg-black/20 backdrop-blur-sm z-50",
      className
    )}>
      <Loader2 className={cn(
        "animate-spin text-orange-400",
        getSizeClasses()
      )} />
      {text && (
        <span className="text-sm text-gray-300 font-medium animate-pulse">
          {text}
        </span>
      )}
    </div>
  );

  return overlay ? (
    <div className="relative">
      {content}
    </div>
  ) : content;
};
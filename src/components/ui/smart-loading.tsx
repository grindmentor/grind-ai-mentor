import React from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Zap, Brain, Target } from "lucide-react";

interface SmartLoadingProps {
  message?: string;
  type?: 'default' | 'ai' | 'analysis' | 'processing';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SmartLoading: React.FC<SmartLoadingProps> = ({ 
  message = "Loading...", 
  type = 'default',
  size = 'md',
  className 
}) => {
  const icons = {
    default: <Sparkles className="w-4 h-4" />,
    ai: <Brain className="w-4 h-4" />,
    analysis: <Target className="w-4 h-4" />,
    processing: <Zap className="w-4 h-4" />
  };

  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <div className="relative">
        {/* Spinning outer ring */}
        <div className={cn(
          "animate-spin rounded-full border-2 border-primary/20 border-t-primary",
          sizes[size]
        )} />
        
        {/* Inner icon */}
        <div className="absolute inset-0 flex items-center justify-center text-primary">
          {React.cloneElement(icons[type], { 
            className: cn("animate-pulse", size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3')
          })}
        </div>
      </div>
      
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">{message}</span>
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-primary rounded-full animate-bounce" />
          <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>
    </div>
  );
};

export default SmartLoading;
import React from "react";
import { cn } from "@/lib/utils";
import { Brain, Sparkles, Target, Zap, Bot, User, ChefHat, Timer, BarChart3, Camera } from "lucide-react";

interface EnhancedLoadingProps {
  message?: string;
  type?: 'ai' | 'analysis' | 'coach' | 'training' | 'nutrition' | 'timer' | 'progress' | 'photo' | 'default';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const moduleIcons = {
  ai: Brain,
  analysis: Target, 
  coach: User,
  training: Zap,
  nutrition: ChefHat,
  timer: Timer,
  progress: BarChart3,
  photo: Camera,
  default: Sparkles
};

const moduleMessages = {
  ai: "AI is thinking...",
  analysis: "Analyzing data...",
  coach: "Getting coaching advice...",
  training: "Building your program...",
  nutrition: "Calculating nutrition...",
  timer: "Timer loading...",
  progress: "Tracking progress...",
  photo: "Analyzing photo...",
  default: "Loading..."
};

export const EnhancedLoading: React.FC<EnhancedLoadingProps> = ({ 
  message, 
  type = 'default',
  size = 'md',
  className 
}) => {
  const Icon = moduleIcons[type];
  const defaultMessage = message || moduleMessages[type];

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-6 h-6"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
      {/* Animated container */}
      <div className="relative">
        {/* Spinning ring */}
        <div className={cn(
          "animate-spin rounded-full border-2 border-primary/20 border-t-primary",
          sizeClasses[size]
        )} />
        
        {/* Pulsing inner circle */}
        <div className={cn(
          "absolute inset-1 rounded-full bg-primary/10 animate-pulse",
          size === 'sm' ? 'inset-1' : size === 'lg' ? 'inset-2' : 'inset-1.5'
        )} />
        
        {/* Icon in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className={cn("text-primary animate-pulse", iconSizes[size])} />
        </div>
      </div>
      
      {/* Loading text */}
      <div className="text-center space-y-2">
        <p className={cn(
          "font-medium text-foreground",
          size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
        )}>
          {defaultMessage}
        </p>
        
        {/* Animated dots */}
        <div className="flex justify-center space-x-1">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>
    </div>
  );
};

export default EnhancedLoading;
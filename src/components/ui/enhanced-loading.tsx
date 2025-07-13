import React from "react";
import { cn } from "@/lib/utils";
import { Brain, Sparkles, Target, Zap, Bot, User, ChefHat, Timer, BarChart3, Camera, Dumbbell, TrendingUp, Activity, Heart } from "lucide-react";

interface EnhancedLoadingProps {
  message?: string;
  type?: 'ai' | 'analysis' | 'coach' | 'training' | 'nutrition' | 'timer' | 'progress' | 'photo' | 'default' | 'dashboard' | 'module';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  skeleton?: boolean;
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
  dashboard: TrendingUp,
  module: Activity,
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
  dashboard: "Loading dashboard...",
  module: "Loading module...",
  default: "Loading..."
};

const DashboardSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 p-4 animate-fade-in">
    {/* Header Skeleton */}
    <div className="flex items-center justify-between mb-8">
      <div className="h-8 w-32 bg-gray-800/50 rounded-lg animate-pulse" />
      <div className="flex space-x-2">
        <div className="h-8 w-8 bg-gray-800/50 rounded-lg animate-pulse" />
        <div className="h-8 w-8 bg-gray-800/50 rounded-lg animate-pulse" />
        <div className="h-8 w-8 bg-gray-800/50 rounded-lg animate-pulse" />
      </div>
    </div>
    
    {/* Welcome Section Skeleton */}
    <div className="text-center mb-12">
      <div className="h-10 w-96 bg-gray-800/50 rounded-lg animate-pulse mx-auto mb-4" />
      <div className="h-6 w-64 bg-gray-800/30 rounded-lg animate-pulse mx-auto" />
    </div>
    
    {/* Module Grid Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-32 bg-gray-900/40 border border-gray-700/50 rounded-xl animate-pulse"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  </div>
);

const ProgressSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-purple-800/30 p-4 animate-fade-in">
    {/* Header */}
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-3">
        <div className="h-8 w-8 bg-purple-500/20 rounded-lg animate-pulse" />
        <div className="h-8 w-48 bg-gray-800/50 rounded-lg animate-pulse" />
      </div>
      <div className="h-8 w-20 bg-purple-500/20 rounded-lg animate-pulse" />
    </div>
    
    {/* Overall Score Skeleton */}
    <div className="h-24 bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-xl mb-8 animate-pulse" />
    
    {/* Progress Grid Skeleton */}
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="h-32 bg-gray-900/40 border border-gray-700/50 rounded-lg animate-pulse"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  </div>
);

const ModuleSkeleton = ({ message }: { message: string }) => (
  <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 p-4 animate-fade-in">
    <div className="flex flex-col items-center justify-center space-y-6 min-h-[60vh]">
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-500/30 to-orange-600/20 rounded-xl flex items-center justify-center animate-bounce">
          <Activity className="w-8 h-8 text-orange-500" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500/40 rounded-full animate-ping" />
      </div>
      
      <div className="text-center space-y-2">
        <div className="text-white font-medium text-lg">{message}</div>
        <div className="flex space-x-1 justify-center">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 bg-orange-500/60 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const EnhancedLoading: React.FC<EnhancedLoadingProps> = ({ 
  message, 
  type = 'default',
  size = 'md',
  className,
  skeleton = false
}) => {
  const Icon = moduleIcons[type];
  const defaultMessage = message || moduleMessages[type];

  // Use skeleton versions for full-page loading
  if (skeleton) {
    if (type === 'dashboard') return <DashboardSkeleton />;
    if (type === 'progress') return <ProgressSkeleton />;
    if (type === 'module') return <ModuleSkeleton message={defaultMessage} />;
  }

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
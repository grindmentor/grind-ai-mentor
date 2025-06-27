
import React from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AITypingIndicatorProps {
  isVisible: boolean;
  message?: string;
  variant?: 'dots' | 'shimmer' | 'pulse';
  className?: string;
}

export const AITypingIndicator: React.FC<AITypingIndicatorProps> = ({
  isVisible,
  message = "AI is thinking...",
  variant = 'shimmer',
  className
}) => {
  if (!isVisible) return null;

  const TypingDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );

  const ShimmerEffect = () => (
    <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-500/10 via-orange-400/20 to-orange-500/10 rounded-lg p-3 animate-pulse">
      <Sparkles className="w-4 h-4 text-orange-400 animate-spin" />
      <div className="flex-1 space-y-2">
        <div className="h-2 bg-gradient-to-r from-orange-400/30 to-transparent rounded animate-pulse" />
        <div className="h-2 bg-gradient-to-r from-orange-400/20 to-transparent rounded animate-pulse w-3/4" />
      </div>
    </div>
  );

  const PulseEffect = () => (
    <div className="flex items-center space-x-3 p-3 bg-gray-900/40 rounded-lg border border-orange-500/20">
      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center animate-pulse">
        <MessageSquare className="w-4 h-4 text-white" />
      </div>
      <span className="text-orange-300 text-sm font-medium">{message}</span>
    </div>
  );

  return (
    <div className={cn("transition-all duration-300", className)}>
      {variant === 'dots' && <TypingDots />}
      {variant === 'shimmer' && <ShimmerEffect />}
      {variant === 'pulse' && <PulseEffect />}
    </div>
  );
};

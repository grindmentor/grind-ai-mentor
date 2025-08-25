
import React from 'react';
import { Dumbbell } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  const containerSizes = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`${containerSizes[size]} bg-gradient-to-r from-orange-500/80 to-orange-600/60 rounded-xl flex items-center justify-center animate-pulse`}>
        <div className="text-primary-foreground animate-bounce font-bold tracking-wider font-mono">
          {size === 'sm' && 'M'}
          {size === 'md' && 'MY'}
          {size === 'lg' && 'MYO'}
        </div>
      </div>
      {text && (
        <p className="text-muted-foreground text-sm font-medium">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;

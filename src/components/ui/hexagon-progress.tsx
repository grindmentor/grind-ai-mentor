import React, { memo, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';

interface HexagonProgressProps {
  score: number;
  size: 'small' | 'medium' | 'large';
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

const HexagonProgressComponent: React.FC<HexagonProgressProps> = ({ 
  score, 
  size, 
  label, 
  icon: Icon,
  className = ''
}) => {
  // Memoize calculations
  const { hexSize, strokeWidth, circumference, strokeDashoffset, color, badgeColor, scoreLabel } = useMemo(() => {
    const isLarge = size === 'large';
    const isMedium = size === 'medium';
    const hexSize = isLarge ? 120 : isMedium ? 100 : 80;
    const strokeWidth = isLarge ? 8 : isMedium ? 7 : 6;
    const circumference = hexSize * 0.6 * 6;
    const strokeDashoffset = circumference * (1 - score / 100);
    
    const getColor = (s: number): string => {
      if (s >= 90) return '#a855f7';
      if (s >= 80) return '#f59e0b';
      if (s >= 70) return '#10b981';
      if (s >= 50) return '#3b82f6';
      return '#ef4444';
    };
    
    const getLabel = (s: number): string => {
      if (s >= 95) return 'Elite';
      if (s >= 85) return 'Advanced';
      if (s >= 70) return 'Intermediate';
      if (s >= 50) return 'Developing';
      return 'Beginner';
    };
    
    const getBadgeColor = (s: number): string => {
      if (s >= 90) return 'text-purple-400 bg-purple-500/20 border-purple-500/40';
      if (s >= 80) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40';
      if (s >= 70) return 'text-green-400 bg-green-500/20 border-green-500/40';
      if (s >= 50) return 'text-blue-400 bg-blue-500/20 border-blue-500/40';
      return 'text-red-400 bg-red-500/20 border-red-500/40';
    };
    
    return {
      hexSize,
      strokeWidth,
      circumference,
      strokeDashoffset,
      color: getColor(score),
      badgeColor: getBadgeColor(score),
      scoreLabel: getLabel(score)
    };
  }, [score, size]);
  
  const isLarge = size === 'large';
  const isMedium = size === 'medium';
  
  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <div className={`relative ${isLarge ? 'w-32 h-32' : isMedium ? 'w-26 h-26' : 'w-20 h-20'}`}>
        <svg 
          className="absolute inset-0 transform -rotate-90" 
          width={hexSize + 20} 
          height={hexSize + 20}
          viewBox={`0 0 ${hexSize + 20} ${hexSize + 20}`}
        >
          <polygon
            points={`${(hexSize + 20) / 2},${10} ${hexSize - 5},${(hexSize + 20) / 4} ${hexSize - 5},${3 * (hexSize + 20) / 4} ${(hexSize + 20) / 2},${hexSize + 10} ${15},${3 * (hexSize + 20) / 4} ${15},${(hexSize + 20) / 4}`}
            fill="none"
            stroke="rgb(55, 65, 81)"
            strokeWidth={strokeWidth}
            opacity="0.3"
          />
          <polygon
            points={`${(hexSize + 20) / 2},${10} ${hexSize - 5},${(hexSize + 20) / 4} ${hexSize - 5},${3 * (hexSize + 20) / 4} ${(hexSize + 20) / 2},${hexSize + 10} ${15},${3 * (hexSize + 20) / 4} ${15},${(hexSize + 20) / 4}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
          <polygon
            points={`${(hexSize + 20) / 2},${10} ${hexSize - 5},${(hexSize + 20) / 4} ${hexSize - 5},${3 * (hexSize + 20) / 4} ${(hexSize + 20) / 2},${hexSize + 10} ${15},${3 * (hexSize + 20) / 4} ${15},${(hexSize + 20) / 4}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth + 2}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            opacity="0.3"
            filter="blur(2px)"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {Icon && !isLarge && (
            <Icon className={`text-orange-400 mb-1 ${isMedium ? 'w-5 h-5' : 'w-4 h-4'}`} />
          )}
          <span className={`font-bold text-white ${isLarge ? 'text-2xl' : isMedium ? 'text-lg' : 'text-sm'}`}>
            {score}%
          </span>
          {isLarge && (
            <Badge className={`${badgeColor} text-xs mt-2 border`}>
              {scoreLabel}
            </Badge>
          )}
        </div>
      </div>
      
      <span className={`text-center font-medium mt-2 ${isLarge ? 'text-lg text-white' : isMedium ? 'text-sm text-gray-200' : 'text-xs text-gray-300'}`}>
        {label}
      </span>
    </div>
  );
};

// Export memoized version
export const HexagonProgress = memo(HexagonProgressComponent);
export default HexagonProgress;
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface HexagonProgressProps {
  score: number;
  size: 'small' | 'medium' | 'large';
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export const HexagonProgress: React.FC<HexagonProgressProps> = ({ 
  score, 
  size, 
  label, 
  icon: Icon,
  className = ''
}) => {
  const isLarge = size === 'large';
  const isMedium = size === 'medium';
  const hexSize = isLarge ? 120 : isMedium ? 100 : 80;
  const strokeWidth = isLarge ? 8 : isMedium ? 7 : 6;
  const circumference = hexSize * 0.6 * 6; // Approximate hexagon perimeter
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - score / 100);
  
  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#a855f7'; // purple
    if (score >= 80) return '#f59e0b'; // yellow
    if (score >= 70) return '#10b981'; // green
    if (score >= 50) return '#3b82f6'; // blue
    return '#ef4444'; // red
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 95) return 'Elite';
    if (score >= 85) return 'Advanced';
    if (score >= 70) return 'Intermediate';
    if (score >= 50) return 'Developing';
    return 'Beginner';
  };

  const getBadgeColor = (score: number): string => {
    if (score >= 90) return 'text-purple-400 bg-purple-500/20 border-purple-500/40';
    if (score >= 80) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40';
    if (score >= 70) return 'text-green-400 bg-green-500/20 border-green-500/40';
    if (score >= 50) return 'text-blue-400 bg-blue-500/20 border-blue-500/40';
    return 'text-red-400 bg-red-500/20 border-red-500/40';
  };
  
  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <div className={`relative ${isLarge ? 'w-32 h-32' : isMedium ? 'w-26 h-26' : 'w-20 h-20'}`}>
        {/* Hexagon SVG */}
        <svg 
          className="absolute inset-0 transform -rotate-90" 
          width={hexSize + 20} 
          height={hexSize + 20}
          viewBox={`0 0 ${hexSize + 20} ${hexSize + 20}`}
        >
          {/* Background hexagon */}
          <polygon
            points={`${(hexSize + 20) / 2},${10} ${hexSize - 5},${(hexSize + 20) / 4} ${hexSize - 5},${3 * (hexSize + 20) / 4} ${(hexSize + 20) / 2},${hexSize + 10} ${15},${3 * (hexSize + 20) / 4} ${15},${(hexSize + 20) / 4}`}
            fill="none"
            stroke="rgb(55, 65, 81)"
            strokeWidth={strokeWidth}
            opacity="0.3"
          />
          {/* Progress hexagon */}
          <polygon
            points={`${(hexSize + 20) / 2},${10} ${hexSize - 5},${(hexSize + 20) / 4} ${hexSize - 5},${3 * (hexSize + 20) / 4} ${(hexSize + 20) / 2},${hexSize + 10} ${15},${3 * (hexSize + 20) / 4} ${15},${(hexSize + 20) / 4}`}
            fill="none"
            stroke={getScoreColor(score)}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          
          {/* Glow effect */}
          <polygon
            points={`${(hexSize + 20) / 2},${10} ${hexSize - 5},${(hexSize + 20) / 4} ${hexSize - 5},${3 * (hexSize + 20) / 4} ${(hexSize + 20) / 2},${hexSize + 10} ${15},${3 * (hexSize + 20) / 4} ${15},${(hexSize + 20) / 4}`}
            fill="none"
            stroke={getScoreColor(score)}
            strokeWidth={strokeWidth + 2}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            opacity="0.3"
            filter="blur(2px)"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {Icon && !isLarge && (
            <Icon className={`text-orange-400 mb-1 ${isMedium ? 'w-5 h-5' : 'w-4 h-4'}`} />
          )}
          <span className={`font-bold text-white ${isLarge ? 'text-2xl' : isMedium ? 'text-lg' : 'text-sm'}`}>
            {score}%
          </span>
          {isLarge && (
            <Badge className={`${getBadgeColor(score)} text-xs mt-2 border`}>
              {getScoreLabel(score)}
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

export default HexagonProgress;
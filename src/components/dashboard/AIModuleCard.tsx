
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';

interface AIModuleCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  isPremium?: boolean;
  onClick: () => void;
}

const AIModuleCard: React.FC<AIModuleCardProps> = ({
  title,
  description,
  icon: Icon,
  gradient,
  isPremium,
  onClick
}) => {
  // Enhanced gradient mapping for better color consistency
  const getEnhancedGradient = (originalGradient: string) => {
    const gradientMap: { [key: string]: string } = {
      // CoachGPT - Cyan theme
      'from-green-900/20 to-emerald-900/30': 'from-cyan-900/20 to-blue-900/30',
      // Habit Tracker - Yellow theme  
      'from-yellow-900/20 to-orange-900/30': 'from-yellow-900/20 to-orange-900/30',
      // CutCalc Pro - Red theme
      'from-red-900/20 to-orange-900/30': 'from-red-900/20 to-orange-900/30',
      // TDEE Calculator - Purple theme
      'from-purple-900/20 to-indigo-900/30': 'from-purple-900/20 to-indigo-900/30',
      // Smart Training - Blue theme
      'from-blue-900/20 to-indigo-900/30': 'from-blue-900/20 to-indigo-900/30',
      // Workout Timer - Cyan theme
      'from-cyan-900/20 to-blue-900/30': 'from-cyan-900/20 to-blue-900/30',
      // Meal Plan - Green theme
      'from-green-900/20 to-teal-900/30': 'from-green-900/20 to-teal-900/30',
    };
    
    return gradientMap[originalGradient] || originalGradient;
  };

  const getBorderColor = (gradient: string) => {
    const borderMap: { [key: string]: string } = {
      'from-cyan-900/20 to-blue-900/30': 'border-cyan-500/30',
      'from-yellow-900/20 to-orange-900/30': 'border-yellow-500/30',
      'from-red-900/20 to-orange-900/30': 'border-red-500/30',
      'from-purple-900/20 to-indigo-900/30': 'border-purple-500/30',
      'from-blue-900/20 to-indigo-900/30': 'border-blue-500/30',
      'from-green-900/20 to-teal-900/30': 'border-green-500/30',
    };
    
    return borderMap[gradient] || 'border-white/20';
  };

  const getIconBgColor = (gradient: string) => {
    const iconBgMap: { [key: string]: string } = {
      'from-cyan-900/20 to-blue-900/30': 'bg-gradient-to-r from-cyan-500/30 to-blue-500/40 border-cyan-500/30',
      'from-yellow-900/20 to-orange-900/30': 'bg-gradient-to-r from-yellow-500/30 to-orange-500/40 border-yellow-500/30',
      'from-red-900/20 to-orange-900/30': 'bg-gradient-to-r from-red-500/30 to-orange-500/40 border-red-500/30',
      'from-purple-900/20 to-indigo-900/30': 'bg-gradient-to-r from-purple-500/30 to-indigo-500/40 border-purple-500/30',
      'from-blue-900/20 to-indigo-900/30': 'bg-gradient-to-r from-blue-500/30 to-indigo-500/40 border-blue-500/30',
      'from-green-900/20 to-teal-900/30': 'bg-gradient-to-r from-green-500/30 to-teal-500/40 border-green-500/30',
    };
    
    return iconBgMap[gradient] || 'bg-black/20 border-white/20';
  };

  const enhancedGradient = getEnhancedGradient(gradient);
  const borderColor = getBorderColor(enhancedGradient);
  const iconBgColor = getIconBgColor(enhancedGradient);

  return (
    <Card 
      className={`bg-gradient-to-br ${enhancedGradient} backdrop-blur-sm cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl group relative overflow-hidden ${borderColor}`}
      onClick={onClick}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
      </div>
      
      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Icon */}
          <div className={`w-16 h-16 ${iconBgColor} backdrop-blur-sm rounded-2xl flex items-center justify-center border group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-8 h-8 text-white drop-shadow-lg" />
          </div>
          
          {/* Title */}
          <h3 className="text-white font-bold text-lg leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {title}
          </h3>
          
          {/* Description */}
          <p className="text-white/90 text-sm leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-medium">
            {description}
          </p>
          
          {/* Premium Badge */}
          {isPremium && (
            <Badge className="bg-yellow-500/30 text-yellow-100 border-yellow-400/50 backdrop-blur-sm drop-shadow-lg">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIModuleCard;

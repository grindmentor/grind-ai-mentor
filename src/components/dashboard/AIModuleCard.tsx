
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIModuleCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  isPremium?: boolean;
  onClick: () => void;
  isSubscribed?: boolean;
  onHover?: (moduleId: string) => void;
  onInteraction?: (moduleId: string) => void;
}

const AIModuleCard: React.FC<AIModuleCardProps> = ({
  id,
  title,
  description,
  icon: Icon,
  gradient,
  isPremium,
  onClick,
  isSubscribed = false,
  onHover,
  onInteraction
}) => {
  // Enhanced module color mapping with proper 50% opacity to match interior themes
  const getModuleGradient = (originalGradient: string, title: string) => {
    const moduleColorMap: { [key: string]: string } = {
      // CoachGPT - Cyan theme with 50% opacity to match interior
      'CoachGPT': 'from-cyan-900/50 to-blue-900/50',
      // Habit Tracker - Yellow theme with 50% opacity to match interior
      'Habit Tracker': 'from-yellow-900/50 to-orange-900/50',
      // CutCalc Pro - Red theme with 50% opacity to match interior
      'CutCalc Pro': 'from-red-900/50 to-pink-900/50',
      // TDEE Calculator - Green theme with 50% opacity to match interior
      'TDEE Calculator': 'from-green-900/50 to-emerald-900/50',
      // Smart Training - Green theme with 50% opacity to match interior
      'Smart Training': 'from-green-900/50 to-emerald-900/50',
      // Blueprint AI - Blue to cyan theme with 50% opacity to match interior
      'Blueprint AI': 'from-blue-900/50 to-cyan-900/50',
      // Workout Timer - Orange theme with 50% opacity to match interior
      'Workout Timer': 'from-orange-900/50 to-yellow-900/50',
      // Meal Plan Generator - Green theme with 50% opacity to match interior
      'Meal Plan Generator': 'from-green-900/50 to-emerald-900/50',
      'Meal Plan AI': 'from-green-900/50 to-emerald-900/50',
      // Progress Hub - Purple theme with 50% opacity to match interior
      'Progress Hub': 'from-purple-900/50 to-violet-900/50',
      // Workout Logger AI - Green theme with 50% opacity to match interior
      'Workout Logger AI': 'from-green-900/50 to-emerald-900/50',
      // Recovery Coach - Purple theme with 50% opacity to match interior
      'Recovery Coach': 'from-purple-900/50 to-violet-900/50',
      // Smart Food Log - Teal theme with 50% opacity to match interior
      'Smart Food Log': 'from-teal-900/50 to-cyan-900/50',
    };
    
    return moduleColorMap[title] || originalGradient.replace(/\/\d+/g, '/50');
  };

  const getBorderColor = (gradient: string, title: string) => {
    const borderMap: { [key: string]: string } = {
      'CoachGPT': 'border-cyan-500/30',
      'Habit Tracker': 'border-yellow-500/30',
      'CutCalc Pro': 'border-red-500/30',
      'TDEE Calculator': 'border-green-500/30',
      'Smart Training': 'border-green-500/30',
      'Blueprint AI': 'border-blue-500/30',
      'Workout Timer': 'border-orange-500/30',
      'Meal Plan Generator': 'border-green-500/30',
      'Meal Plan AI': 'border-green-500/30',
      'Progress Hub': 'border-purple-500/30',
      'Workout Logger AI': 'border-green-500/30',
      'Recovery Coach': 'border-purple-500/30',
      'Smart Food Log': 'border-teal-500/30',
    };
    
    return borderMap[title] || 'border-white/20';
  };

  const getIconBgColor = (title: string) => {
    const iconBgMap: { [key: string]: string } = {
      'CoachGPT': 'bg-gradient-to-r from-cyan-500/30 to-blue-500/40 border-cyan-500/30',
      'Habit Tracker': 'bg-gradient-to-r from-yellow-500/30 to-orange-500/40 border-yellow-500/30',
      'CutCalc Pro': 'bg-gradient-to-r from-red-500/30 to-pink-500/40 border-red-500/30',
      'TDEE Calculator': 'bg-gradient-to-r from-green-500/30 to-emerald-500/40 border-green-500/30',
      'Smart Training': 'bg-gradient-to-r from-green-500/30 to-emerald-500/40 border-green-500/30',
      'Blueprint AI': 'bg-gradient-to-r from-blue-500/30 to-cyan-500/40 border-blue-500/30',
      'Workout Timer': 'bg-gradient-to-r from-orange-500/30 to-yellow-500/40 border-orange-500/30',
      'Meal Plan Generator': 'bg-gradient-to-r from-green-500/30 to-emerald-500/40 border-green-500/30',
      'Meal Plan AI': 'bg-gradient-to-r from-green-500/30 to-emerald-500/40 border-green-500/30',
      'Progress Hub': 'bg-gradient-to-r from-purple-500/30 to-violet-500/40 border-purple-500/30',
      'Workout Logger AI': 'bg-gradient-to-r from-green-500/30 to-emerald-500/40 border-green-500/30',
      'Recovery Coach': 'bg-gradient-to-r from-purple-500/30 to-violet-500/40 border-purple-500/30',
      'Smart Food Log': 'bg-gradient-to-r from-teal-500/30 to-cyan-500/40 border-teal-500/30',
    };
    
    return iconBgMap[title] || 'bg-black/20 border-white/20';
  };

  const moduleGradient = getModuleGradient(gradient, title);
  const borderColor = getBorderColor(moduleGradient, title);
  const iconBgColor = getIconBgColor(title);

  const handleClick = () => {
    onInteraction?.(id);
    if (isPremium && !isSubscribed) {
      // Don't prevent click for premium modules - let the module handle its own restriction
      onClick();
    } else {
      onClick();
    }
  };

  const handleMouseEnter = () => {
    onHover?.(id);
  };

  return (
    <Card 
      className={cn(
        `bg-gradient-to-br ${moduleGradient} backdrop-blur-sm cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl group relative overflow-hidden border ${borderColor}`,
        "animate-fade-in hover-scale transform-gpu",
        isPremium && !isSubscribed ? 'opacity-75' : ''
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
      {/* Background pattern with reduced opacity */}
      <div className="absolute inset-0 opacity-5">
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

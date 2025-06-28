
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
  // Enhanced module color mapping with proper 50% opacity
  const getModuleGradient = (originalGradient: string, title: string) => {
    const moduleColorMap: { [key: string]: string } = {
      // CoachGPT - Cyan theme with 50% opacity
      'CoachGPT': 'from-cyan-900/50 to-blue-900/50',
      // Habit Tracker - Yellow theme with 50% opacity  
      'Habit Tracker': 'from-yellow-900/50 to-orange-900/50',
      // CutCalc Pro - Red theme with 50% opacity
      'CutCalc Pro': 'from-red-900/50 to-pink-900/50',
      // TDEE Calculator - Purple theme with 50% opacity
      'TDEE Calculator': 'from-purple-900/50 to-indigo-900/50',
      // Smart Training - Blue theme with 50% opacity
      'Smart Training': 'from-blue-900/50 to-indigo-900/50',
      // Blueprint AI - Blue to cyan theme with 50% opacity
      'Blueprint AI': 'from-blue-900/50 to-cyan-900/50',
      // Workout Timer - Cyan theme with 50% opacity
      'Workout Timer': 'from-cyan-900/50 to-teal-900/50',
      // Meal Plan Generator - Green theme with 50% opacity
      'Meal Plan Generator': 'from-green-900/50 to-emerald-900/50',
      'Meal Plan AI': 'from-green-900/50 to-emerald-900/50',
      // Progress Hub - Purple theme with 50% opacity
      'Progress Hub': 'from-purple-900/50 to-violet-900/50',
      // Workout Logger AI - Blue theme with 50% opacity
      'Workout Logger AI': 'from-blue-900/50 to-indigo-900/50',
    };
    
    return moduleColorMap[title] || originalGradient.replace(/\/\d+/g, '/50');
  };

  const getBorderColor = (gradient: string, title: string) => {
    const borderMap: { [key: string]: string } = {
      'CoachGPT': 'border-cyan-500/30',
      'Habit Tracker': 'border-yellow-500/30',
      'CutCalc Pro': 'border-red-500/30',
      'TDEE Calculator': 'border-purple-500/30',
      'Smart Training': 'border-blue-500/30',
      'Blueprint AI': 'border-blue-500/30',
      'Workout Timer': 'border-cyan-500/30',
      'Meal Plan Generator': 'border-green-500/30',
      'Meal Plan AI': 'border-green-500/30',
      'Progress Hub': 'border-purple-500/30',
      'Workout Logger AI': 'border-blue-500/30',
    };
    
    return borderMap[title] || 'border-white/20';
  };

  const getIconBgColor = (title: string) => {
    const iconBgMap: { [key: string]: string } = {
      'CoachGPT': 'bg-gradient-to-r from-cyan-500/30 to-blue-500/40 border-cyan-500/30',
      'Habit Tracker': 'bg-gradient-to-r from-yellow-500/30 to-orange-500/40 border-yellow-500/30',
      'CutCalc Pro': 'bg-gradient-to-r from-red-500/30 to-pink-500/40 border-red-500/30',
      'TDEE Calculator': 'bg-gradient-to-r from-purple-500/30 to-indigo-500/40 border-purple-500/30',
      'Smart Training': 'bg-gradient-to-r from-blue-500/30 to-indigo-500/40 border-blue-500/30',
      'Blueprint AI': 'bg-gradient-to-r from-blue-500/30 to-cyan-500/40 border-blue-500/30',
      'Workout Timer': 'bg-gradient-to-r from-cyan-500/30 to-teal-500/40 border-cyan-500/30',
      'Meal Plan Generator': 'bg-gradient-to-r from-green-500/30 to-emerald-500/40 border-green-500/30',
      'Meal Plan AI': 'bg-gradient-to-r from-green-500/30 to-emerald-500/40 border-green-500/30',
      'Progress Hub': 'bg-gradient-to-r from-purple-500/30 to-violet-500/40 border-purple-500/30',
      'Workout Logger AI': 'bg-gradient-to-r from-blue-500/30 to-indigo-500/40 border-blue-500/30',
    };
    
    return iconBgMap[title] || 'bg-black/20 border-white/20';
  };

  const moduleGradient = getModuleGradient(gradient, title);
  const borderColor = getBorderColor(moduleGradient, title);
  const iconBgColor = getIconBgColor(title);

  return (
    <Card 
      className={`bg-gradient-to-br ${moduleGradient} backdrop-blur-sm cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl group relative overflow-hidden border ${borderColor}`}
      onClick={onClick}
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

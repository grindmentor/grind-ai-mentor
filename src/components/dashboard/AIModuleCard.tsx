
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
  return (
    <Card 
      className={`bg-gradient-to-br ${gradient} backdrop-blur-sm cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl group relative overflow-hidden border-opacity-30`}
      onClick={onClick}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
      </div>
      
      <CardContent className="p-4 sm:p-6 relative z-10">
        <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
          {/* Icon */}
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
          </div>
          
          {/* Title */}
          <h3 className="text-white font-bold text-sm sm:text-lg leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {title}
          </h3>
          
          {/* Description */}
          <p className="text-white/90 text-xs sm:text-sm leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-medium">
            {description}
          </p>
          
          {/* Premium Badge */}
          {isPremium && (
            <Badge className="bg-yellow-500/30 text-yellow-100 border-yellow-400/50 backdrop-blur-sm drop-shadow-lg text-xs">
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

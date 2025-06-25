
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LucideIcon, Crown, Lock, Zap } from "lucide-react";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { useMemo } from "react";

interface AIModule {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  isNew?: boolean;
  isPremium?: boolean;
  usageKey: string;
}

interface AIModuleCardProps {
  module: AIModule;
  onModuleClick: (moduleId: string) => void;
}

const AIModuleCard = ({ module, onModuleClick }: AIModuleCardProps) => {
  const IconComponent = module.icon;
  const { canAccess, canUse, remaining, isUnlimited, tierRequired } = useFeatureAccess(module.usageKey);

  const statusInfo = useMemo(() => {
    if (!canAccess) {
      return {
        status: 'locked',
        buttonText: 'Upgrade Required',
        buttonIcon: Crown,
        statusText: `${tierRequired.charAt(0).toUpperCase() + tierRequired.slice(1)} Required`,
        buttonDisabled: true
      };
    }

    if (!canUse && !isUnlimited) {
      return {
        status: 'limit-reached',
        buttonText: 'Limit Reached',
        buttonIcon: Lock,
        statusText: '0 remaining',
        buttonDisabled: true
      };
    }

    return {
      status: 'available',
      buttonText: 'Launch',
      buttonIcon: Zap,
      statusText: isUnlimited ? 'Unlimited' : `${remaining} remaining`,
      buttonDisabled: false
    };
  }, [canAccess, canUse, remaining, isUnlimited, tierRequired]);

  const handleClick = () => {
    if (statusInfo.buttonDisabled) {
      return;
    }
    onModuleClick(module.id);
  };

  return (
    <Card 
      className={`bg-gradient-to-br ${module.gradient} border-0 text-white cursor-pointer hover:scale-[1.02] transition-transform duration-200 ${
        statusInfo.buttonDisabled ? 'opacity-75' : ''
      }`}
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            {statusInfo.status === 'locked' ? (
              <Lock className="w-6 h-6 text-white" />
            ) : (
              <IconComponent className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="flex flex-col items-end space-y-1">
            {module.isNew && (
              <Badge className="bg-white/20 text-white text-xs">New</Badge>
            )}
            {module.isPremium && (
              <Badge className="bg-yellow-500/20 text-yellow-300 text-xs border-yellow-500/30">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
        </div>
        <CardTitle className="text-white text-lg leading-tight">{module.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="text-white/80 text-sm leading-relaxed">
          {module.description}
        </CardDescription>
        
        <div className="space-y-3">
          <div className="text-center">
            <span className="text-white/70 text-xs block">
              {statusInfo.statusText}
            </span>
          </div>
          <Button 
            variant="secondary" 
            size="sm"
            className={`w-full text-white border-0 min-h-[36px] ${
              statusInfo.status === 'locked' 
                ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300' 
                : statusInfo.status === 'limit-reached'
                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300'
                : 'bg-white/20 hover:bg-white/30'
            }`}
            disabled={statusInfo.buttonDisabled}
          >
            <statusInfo.buttonIcon className="w-3 h-3 mr-1" />
            {statusInfo.buttonText}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIModuleCard;

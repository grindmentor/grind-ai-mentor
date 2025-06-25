
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LucideIcon, Crown, Lock } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useUsageTracking } from "@/hooks/useUsageTracking";
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
  const { currentTier, isSubscribed, isLoading } = useSubscription();
  const { canUseFeature, getRemainingUsage } = useUsageTracking();
  const IconComponent = module.icon;

  const moduleStatus = useMemo(() => {
    if (isLoading) return { canAccess: true, remaining: 0, canUse: false };
    
    const canAccess = !module.isPremium || isSubscribed;
    const remaining = getRemainingUsage(module.usageKey as any);
    const canUse = canUseFeature(module.usageKey as any);
    
    return { canAccess, remaining, canUse };
  }, [module.isPremium, module.usageKey, isSubscribed, isLoading]);

  const handleClick = () => {
    if (!moduleStatus.canAccess) {
      // Show upgrade prompt or redirect to upgrade
      return;
    }
    onModuleClick(module.id);
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700 animate-pulse">
        <CardHeader>
          <div className="h-4 bg-gray-600 rounded w-3/4"></div>
        </CardHeader>
        <CardContent>
          <div className="h-3 bg-gray-600 rounded w-full mb-2"></div>
          <div className="h-8 bg-gray-600 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`bg-gradient-to-br ${module.gradient} border-0 text-white cursor-pointer hover:scale-105 ${
        !moduleStatus.canAccess ? 'opacity-75' : ''
      }`}
      onClick={handleClick}
      style={{ transition: 'transform 0.1s ease' }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            {!moduleStatus.canAccess ? (
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
        <CardTitle className="text-white text-lg">{module.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-white/80 text-sm mb-6">
          {module.description}
        </CardDescription>
        
        {moduleStatus.canAccess ? (
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-white/70 text-xs block mb-2">
                {moduleStatus.remaining === -1 ? 'Unlimited' : `${moduleStatus.remaining} remaining`}
              </span>
            </div>
            <Button 
              variant="secondary" 
              size="sm"
              className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
              disabled={!moduleStatus.canUse}
            >
              {moduleStatus.canUse ? 'Launch' : 'Limit reached'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-white/70 text-xs block mb-2">Premium Required</span>
            </div>
            <Button 
              variant="secondary" 
              size="sm"
              className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border-0"
            >
              <Crown className="w-3 h-3 mr-1" />
              Upgrade
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIModuleCard;

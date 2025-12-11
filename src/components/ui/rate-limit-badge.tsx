import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, Zap, Crown, Infinity } from "lucide-react";
import { useUsageTracking, type UsageLimits } from "@/hooks/useUsageTracking";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";

interface RateLimitBadgeProps {
  featureKey: keyof UsageLimits;
  featureName?: string;
  showProgress?: boolean;
  className?: string;
}

export const RateLimitBadge = ({ 
  featureKey, 
  featureName,
  showProgress = false,
  className 
}: RateLimitBadgeProps) => {
  const { currentUsage, userTier, getRemainingUsage, getUsagePercentage, limits, loading } = useUsageTracking();
  const { isSubscribed, currentTier } = useSubscription();
  const navigate = useNavigate();

  const remaining = getRemainingUsage(featureKey);
  const percentage = getUsagePercentage(featureKey);
  const isUnlimited = remaining === -1 || currentTier === 'premium';
  const isAtLimit = remaining === 0 && !isUnlimited;
  const isLow = !isUnlimited && percentage >= 70 && !isAtLimit;
  const isCritical = !isUnlimited && percentage >= 90 && !isAtLimit;

  if (loading || !currentUsage) return null;

  // Premium users always see unlimited badge
  if (isUnlimited || currentTier === 'premium') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={cn(
              "bg-primary/10 text-primary border-primary/30 gap-1.5",
              className
            )}>
              <Infinity className="w-3 h-3" />
              <span className="text-xs font-medium">Unlimited</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Premium - Unlimited {featureName || 'usage'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const getStatusColor = () => {
    if (isAtLimit) return "bg-destructive/20 text-destructive border-destructive/30";
    if (isCritical) return "bg-orange-500/20 text-orange-400 border-orange-500/30 animate-pulse";
    if (isLow) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-muted text-muted-foreground border-border";
  };

  const getIcon = () => {
    if (isAtLimit) return <AlertTriangle className="w-3 h-3" />;
    if (isCritical) return <AlertTriangle className="w-3 h-3" />;
    if (isLow) return <Zap className="w-3 h-3" />;
    return <Zap className="w-3 h-3" />;
  };

  const limit = limits?.[featureKey] || 0;
  const used = currentUsage[featureKey] || 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn("inline-flex flex-col gap-1 cursor-pointer", className)}
            onClick={() => isAtLimit && navigate('/pricing')}
          >
            <Badge 
              variant="outline" 
              className={cn(
                "gap-1.5 transition-colors",
                getStatusColor()
              )}
            >
              {getIcon()}
              <span className="text-xs font-medium">
                {isAtLimit ? 'Limit reached' : `${remaining} left`}
              </span>
            </Badge>
            
            {showProgress && !isUnlimited && (
              <div className="w-full min-w-[80px]">
                <Progress 
                  value={percentage} 
                  className={cn(
                    "h-1",
                    isAtLimit && "[&>div]:bg-destructive",
                    isCritical && "[&>div]:bg-orange-500",
                    isLow && "[&>div]:bg-yellow-500"
                  )}
                />
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px]">
          <div className="space-y-1">
            <p className="font-medium">{featureName || 'Feature'} Usage</p>
            <p className="text-xs text-muted-foreground">
              {used} of {limit} used this month
            </p>
            {isAtLimit && (
              <p className="text-xs text-destructive">
                Upgrade to continue using this feature
              </p>
            )}
            {isCritical && !isAtLimit && (
              <p className="text-xs text-orange-400">
                Running very low - consider upgrading
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Floating warning component for critical usage
export const RateLimitWarning = ({ 
  featureKey, 
  featureName,
  onDismiss 
}: { 
  featureKey: keyof UsageLimits; 
  featureName: string;
  onDismiss?: () => void;
}) => {
  const { getRemainingUsage, getUsagePercentage, limits, currentUsage } = useUsageTracking();
  const { currentTier } = useSubscription();
  const navigate = useNavigate();

  const remaining = getRemainingUsage(featureKey);
  const percentage = getUsagePercentage(featureKey);
  const isUnlimited = remaining === -1 || currentTier === 'premium';
  const isAtLimit = remaining === 0 && !isUnlimited;
  const isCritical = !isUnlimited && percentage >= 90;

  // Premium users never see warnings
  if (isUnlimited || currentTier === 'premium' || (!isAtLimit && !isCritical)) return null;

  const limit = limits?.[featureKey] || 0;
  const used = currentUsage[featureKey] || 0;

  return (
    <div className={cn(
      "p-3 rounded-xl border flex items-center justify-between gap-3",
      isAtLimit 
        ? "bg-destructive/10 border-destructive/30" 
        : "bg-orange-500/10 border-orange-500/30"
    )}>
      <div className="flex items-center gap-3">
        <AlertTriangle className={cn(
          "w-4 h-4 flex-shrink-0",
          isAtLimit ? "text-destructive" : "text-orange-400"
        )} />
        <div>
          <p className={cn(
            "text-sm font-medium",
            isAtLimit ? "text-destructive" : "text-orange-400"
          )}>
            {isAtLimit 
              ? `${featureName} limit reached` 
              : `Only ${remaining} ${featureName} uses left`}
          </p>
          <p className="text-xs text-muted-foreground">
            {used}/{limit} used this month
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/pricing')}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors min-h-[32px]",
            isAtLimit 
              ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              : "bg-orange-500 text-white hover:bg-orange-600"
          )}
        >
          Upgrade
        </button>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground text-xs min-h-[32px] px-2"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};

export default RateLimitBadge;
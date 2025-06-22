
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Zap } from "lucide-react";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useNavigate } from "react-router-dom";

interface UsageIndicatorProps {
  featureKey: keyof typeof import('@/hooks/useUsageTracking').TIER_LIMITS.free;
  featureName: string;
  compact?: boolean;
}

const UsageIndicator = ({ featureKey, featureName, compact = false }: UsageIndicatorProps) => {
  const { currentUsage, userTier, getRemainingUsage, getUsagePercentage, limits } = useUsageTracking();
  const navigate = useNavigate();

  if (!currentUsage) return null;

  const remaining = getRemainingUsage(featureKey);
  const percentage = getUsagePercentage(featureKey);
  const isUnlimited = remaining === -1;
  const isAtLimit = remaining === 0 && !isUnlimited;

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <Badge 
          className={`${
            isUnlimited ? 'bg-green-500/20 text-green-400 border-green-500/30' :
            isAtLimit ? 'bg-red-500/20 text-red-400 border-red-500/30' :
            percentage > 80 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
            'bg-blue-500/20 text-blue-400 border-blue-500/30'
          }`}
        >
          {isUnlimited ? 'Unlimited' : `${remaining} left`}
        </Badge>
        {userTier === 'premium' && <Crown className="w-4 h-4 text-yellow-500" />}
      </div>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm">{featureName} Usage</CardTitle>
          {userTier === 'premium' && <Crown className="w-4 h-4 text-yellow-500" />}
        </div>
        <CardDescription className="text-gray-400">
          {isUnlimited ? 'Unlimited usage' : `${remaining} uses remaining this month`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isUnlimited && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Used: {currentUsage[featureKey]}</span>
              <span className="text-gray-400">Limit: {limits[featureKey]}</span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
        )}

        {isAtLimit && (
          <div className="text-center space-y-3">
            <p className="text-red-400 text-sm">You've reached your monthly limit</p>
            <Button 
              onClick={() => navigate('/pricing')}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              size="sm"
            >
              <Zap className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Button>
          </div>
        )}

        {!isUnlimited && percentage > 80 && !isAtLimit && (
          <div className="text-center">
            <p className="text-orange-400 text-sm mb-2">Running low on usage</p>
            <Button 
              onClick={() => navigate('/pricing')}
              variant="outline"
              className="w-full border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
              size="sm"
            >
              Consider Upgrading
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UsageIndicator;


import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, ArrowRight } from 'lucide-react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { useNavigate } from 'react-router-dom';

interface UsageLimitGuardProps {
  featureKey: string;
  featureName: string;
  children: React.ReactNode;
  onUpgrade?: () => void;
}

export const UsageLimitGuard: React.FC<UsageLimitGuardProps> = ({
  featureKey,
  featureName,
  children,
  onUpgrade
}) => {
  const navigate = useNavigate();
  const { canUse, remaining, isUnlimited, tierRequired, upgradeMessage } = useFeatureAccess(featureKey);

  if (canUse) {
    return <>{children}</>;
  }

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate('/pricing');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-sm border-orange-500/30">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500/30 to-red-500/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/30">
            <Crown className="w-8 h-8 text-orange-400" />
          </div>
          <CardTitle className="text-white text-xl">Usage Limit Reached</CardTitle>
          <CardDescription className="text-orange-200/80">
            You've reached the limit for {featureName}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 text-center">
          <div className="space-y-2">
            <p className="text-gray-300 text-sm">
              {upgradeMessage}
            </p>
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              {remaining === 0 ? 'No uses remaining' : `${remaining} uses remaining`}
            </Badge>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
            >
              <Zap className="w-4 h-4 mr-2" />
              Upgrade to {tierRequired.charAt(0).toUpperCase() + tierRequired.slice(1)}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button
              onClick={() => navigate('/app')}
              variant="outline"
              className="w-full border-orange-500/30 text-orange-300 hover:bg-orange-500/10"
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

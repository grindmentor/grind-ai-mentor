
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Zap, Eye } from 'lucide-react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { useNavigate } from 'react-router-dom';

interface FeatureGateProps {
  featureKey: string;
  children: React.ReactNode;
  fallbackComponent?: React.ReactNode;
  showUpgradePrompt?: boolean;
  previewMode?: boolean;
}

const FeatureGate: React.FC<FeatureGateProps> = ({
  featureKey,
  children,
  fallbackComponent,
  showUpgradePrompt = true,
  previewMode = false
}) => {
  const navigate = useNavigate();
  const { canAccess, canUse, canPreview, remaining, isUnlimited, tierRequired, upgradeMessage } = useFeatureAccess(featureKey);

  // If user can access and use the feature, render children
  if (canAccess && canUse && !previewMode) {
    return <>{children}</>;
  }

  // If in preview mode and can preview, show preview version
  if (previewMode && canPreview) {
    return <>{children}</>;
  }

  // If user can access but has reached limit
  if (canAccess && !canUse && !isUnlimited && !previewMode) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
        <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="w-6 h-6 text-orange-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Usage Limit Reached</h3>
        <p className="text-gray-400 mb-4">
          You've used all {remaining === 0 ? 'available uses' : `${remaining} remaining uses`} for this feature this month.
        </p>
        {showUpgradePrompt && (
          <Button
            onClick={() => navigate('/pricing')}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade for Unlimited Access
          </Button>
        )}
      </div>
    );
  }

  // If user cannot access the feature at all but can preview
  if (!canAccess && previewMode) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Preview Mode</h3>
            <p className="text-gray-400 mb-4">{upgradeMessage}</p>
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 mb-4">
              <Crown className="w-3 h-3 mr-1" />
              {tierRequired.charAt(0).toUpperCase() + tierRequired.slice(1)} Required
            </Badge>
            {showUpgradePrompt && (
              <div>
                <Button
                  onClick={() => navigate('/pricing')}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="opacity-30 pointer-events-none">{children}</div>
      </div>
    );
  }

  // If user cannot access the feature at all
  if (!canAccess) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
        <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-yellow-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Premium Feature</h3>
        <p className="text-gray-400 mb-4">{upgradeMessage}</p>
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 mb-4">
          <Crown className="w-3 h-3 mr-1" />
          {tierRequired.charAt(0).toUpperCase() + tierRequired.slice(1)} Required
        </Badge>
        {showUpgradePrompt && (
          <div>
            <Button
              onClick={() => navigate('/pricing')}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

export default FeatureGate;

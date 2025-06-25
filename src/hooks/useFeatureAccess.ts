
import { useSubscription } from './useSubscription';
import { useUsageTracking } from './useUsageTracking';
import { useMemo } from 'react';

export interface FeatureAccessInfo {
  canAccess: boolean;
  canUse: boolean;
  remaining: number;
  isUnlimited: boolean;
  tierRequired: string;
  upgradeMessage: string;
}

export const useFeatureAccess = (featureKey: string) => {
  const { currentTier, currentTierData, isSubscribed } = useSubscription();
  const { canUseFeature, getRemainingUsage } = useUsageTracking();

  return useMemo(() => {
    // Default blocked state
    if (!currentTierData) {
      return {
        canAccess: false,
        canUse: false,
        remaining: 0,
        isUnlimited: false,
        tierRequired: 'basic',
        upgradeMessage: 'Please upgrade to access this feature'
      };
    }

    const limit = currentTierData.limits[featureKey as keyof typeof currentTierData.limits];
    const remaining = getRemainingUsage(featureKey as any);
    const isUnlimited = limit === -1;
    
    // Feature access logic
    const canAccess = limit > 0 || isUnlimited;
    const canUse = canAccess && (isUnlimited || remaining > 0);

    // Determine required tier for upgrade messaging
    let tierRequired = 'basic';
    let upgradeMessage = 'Upgrade to Basic to access this feature';

    if (currentTier === 'free') {
      tierRequired = 'basic';
      upgradeMessage = 'Upgrade to Basic to unlock this feature';
    } else if (currentTier === 'basic' && !canAccess) {
      tierRequired = 'premium';
      upgradeMessage = 'Upgrade to Premium for unlimited access';
    }

    return {
      canAccess,
      canUse,
      remaining: isUnlimited ? -1 : remaining,
      isUnlimited,
      tierRequired,
      upgradeMessage
    };
  }, [currentTier, currentTierData, featureKey, canUseFeature, getRemainingUsage]);
};

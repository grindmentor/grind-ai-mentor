
import { useSubscription } from './useSubscription';
import { useUsageTracking } from './useUsageTracking';
import { useMemo } from 'react';

export interface FeatureAccessInfo {
  canAccess: boolean;
  canUse: boolean;
  canPreview: boolean;
  remaining: number;
  isUnlimited: boolean;
  tierRequired: string;
  upgradeMessage: string;
}

export const useFeatureAccess = (featureKey: string) => {
  const { currentTier, currentTierData, isSubscribed, isLoading: subscriptionLoading } = useSubscription();
  const { canUseFeature, getRemainingUsage, loading: usageLoading } = useUsageTracking();

  return useMemo(() => {
    // If still loading subscription or usage data, provide conservative defaults
    if (subscriptionLoading || usageLoading || !currentTierData) {
      return {
        canAccess: currentTier !== 'free',
        canUse: currentTier !== 'free',
        canPreview: true, // Always allow preview
        remaining: 0,
        isUnlimited: currentTier === 'premium',
        tierRequired: 'basic',
        upgradeMessage: 'Checking access...'
      };
    }

    const limit = currentTierData.limits[featureKey as keyof typeof currentTierData.limits];
    const remaining = getRemainingUsage(featureKey as any);
    const isUnlimited = limit === -1;
    
    // All users can preview premium features
    const canPreview = true;
    
    // Feature access logic - fix Smart Training and Meal Plan access
    const canAccess = limit > 0 || isUnlimited || isSubscribed;
    const canUse = canAccess && (isUnlimited || remaining > 0 || isSubscribed);

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
      canPreview,
      remaining: isUnlimited ? -1 : remaining,
      isUnlimited,
      tierRequired,
      upgradeMessage
    };
  }, [currentTier, currentTierData, featureKey, canUseFeature, getRemainingUsage, subscriptionLoading, usageLoading, isSubscribed]);
};

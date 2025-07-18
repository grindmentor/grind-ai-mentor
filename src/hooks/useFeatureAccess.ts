
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
        tierRequired: 'premium',
        upgradeMessage: 'Checking access...'
      };
    }

    const limit = currentTierData.limits[featureKey as keyof typeof currentTierData.limits];
    const remaining = getRemainingUsage(featureKey as any);
    const isUnlimited = limit === -1;
    
    // Debug logging for feature access
    console.log('🔍 FEATURE ACCESS DEBUG:', {
      featureKey,
      currentTier,
      limit,
      remaining,
      isUnlimited,
      currentTierData: currentTierData.limits
    });
    
    // All users can preview premium features
    const canPreview = true;
    
    // Feature access logic - premium users have access to everything
    const canAccess = currentTier === 'premium' || limit > 0 || isSubscribed;
    const canUse = canAccess && (currentTier === 'premium' || isUnlimited || remaining > 0);

    console.log('🔍 ACCESS RESULT:', { canAccess, canUse, canPreview });

    // Determine required tier for upgrade messaging
    let tierRequired = 'premium';
    let upgradeMessage = 'Upgrade to Premium to access this feature';

    if (currentTier === 'free') {
      tierRequired = 'premium';
      upgradeMessage = 'Upgrade to Premium to unlock this feature';
    } else if (currentTier === 'premium') {
      // Premium users should never see upgrade messages
      upgradeMessage = 'You have full access to this feature';
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

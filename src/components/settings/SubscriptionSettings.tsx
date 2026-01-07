import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, User, Settings, Calendar, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SubscriptionSettings = () => {
  const navigate = useNavigate();
  const { currentTier, currentTierData, subscriptionEnd, billingCycle, isLoading } = useSubscription();
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getTierIcon = (tier: string) => {
    return tier === 'premium' ? Crown : User;
  };

  const handleManageSubscription = async () => {
    try {
      setIsManagingSubscription(true);
      
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        console.error('Error opening customer portal:', error);
        toast.error('Failed to open subscription management');
        return;
      }
      
      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success('Opening subscription management...');
      }
    } catch (error) {
      console.error('Error invoking customer portal:', error);
      toast.error('Failed to open subscription management');
    } finally {
      setIsManagingSubscription(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const TierIcon = getTierIcon(currentTier);

  return (
    <div className="space-y-4">
      {/* Current Plan */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-foreground text-sm font-semibold flex items-center gap-2">
            <TierIcon className="w-4 h-4 text-primary" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
            <span className="text-muted-foreground text-sm">Plan</span>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
              currentTier === 'premium' 
                ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-primary border border-primary/30' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {currentTier.toUpperCase()}
            </span>
          </div>

          {currentTierData && (
            <>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <span className="text-muted-foreground text-sm">Price</span>
                <span className="text-foreground font-medium">
                  {currentTier === 'free' ? 'Free' : `$${billingCycle === 'annual' ? currentTierData.annualPrice : currentTierData.monthlyPrice}/${billingCycle === 'annual' ? 'yr' : 'mo'}`}
                </span>
              </div>
              
              {billingCycle && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <span className="text-muted-foreground text-sm">Billing Cycle</span>
                  <span className="text-foreground capitalize">{billingCycle}</span>
                </div>
              )}
          
              {subscriptionEnd && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <span className="text-muted-foreground text-sm flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Next Billing
                  </span>
                  <span className="text-foreground">{formatDate(subscriptionEnd)}</span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Plan Features */}
      {currentTierData && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-sm font-semibold">
              Plan Features
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ul className="space-y-2">
              {currentTierData.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-0.5">•</span>
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card className="bg-card border-border">
        <CardContent className="pt-4 space-y-3">
          {currentTier === 'free' ? (
            <Button
              onClick={() => navigate('/pricing')}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          ) : (
            <Button
              onClick={handleManageSubscription}
              disabled={isManagingSubscription}
              variant="outline"
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {isManagingSubscription ? 'Opening...' : 'Manage Subscription'}
            </Button>
          )}
          
          <Button
            onClick={() => navigate('/usage')}
            variant="ghost"
            className="w-full text-muted-foreground"
          >
            View Usage Details
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSettings;

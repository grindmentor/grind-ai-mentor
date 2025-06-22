
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, CreditCard } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const SubscriptionManager = () => {
  const { currentTier, currentTierData, isSubscribed } = useSubscription();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async (tier: 'basic' | 'premium') => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { tier }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getTierBadge = () => {
    if (currentTier === 'premium') {
      return <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white"><Crown className="w-3 h-3 mr-1" />Premium</Badge>;
    }
    if (currentTier === 'basic') {
      return <Badge className="bg-blue-500 text-white"><Zap className="w-3 h-3 mr-1" />Basic</Badge>;
    }
    return <Badge variant="secondary">Free</Badge>;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Manage your plan and billing</CardDescription>
            </div>
          </div>
          {getTierBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="font-medium">{currentTierData?.name} Plan</p>
          <p className="text-sm text-muted-foreground">
            {currentTier === 'free' 
              ? 'Limited usage - upgrade for more features'
              : `$${currentTierData?.price}/month - ${currentTierData?.features[0]}`
            }
          </p>
        </div>

        {!isSubscribed && (
          <div className="space-y-2">
            <Button 
              onClick={() => handleUpgrade('basic')}
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Upgrade to Basic - $10/month
            </Button>
            <Button 
              onClick={() => handleUpgrade('premium')}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium - $15/month
            </Button>
          </div>
        )}

        {isSubscribed && (
          <div className="text-center p-4 bg-muted/50 rounded">
            <p className="text-sm text-muted-foreground">
              You have an active {currentTier} subscription
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionManager;


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SoundButton } from "@/components/SoundButton";
import { Crown, Zap, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const SubscriptionManager = () => {
  const navigate = useNavigate();
  const { currentTier, isSubscribed } = useSubscription();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        console.error('Error accessing customer portal:', error);
        toast({
          title: "Error",
          description: "Unable to access subscription management. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        // Open Stripe customer portal in new tab
        window.open(data.url, '_blank');
      } else {
        toast({
          title: "Error",
          description: "No subscription management URL received.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Subscription management error:', error);
      toast({
        title: "Error",
        description: "Failed to access subscription management. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center">
          <Crown className="w-5 h-5 mr-2 text-orange-500" />
          Subscription
        </CardTitle>
        <CardDescription>
          Current plan and billing information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Badge className={`${isSubscribed ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
              {currentTier === 'free' ? 'Free Plan' : `${currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} Plan`}
            </Badge>
            <p className="text-sm text-muted-foreground mt-1">
              {isSubscribed ? 'Premium features unlocked' : 'Limited AI interactions per month'}
            </p>
          </div>
        </div>
        
        {!isSubscribed && (
          <SoundButton
            onClick={() => navigate('/pricing')}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
            soundType="click"
          >
            <Zap className="w-4 h-4 mr-2" />
            Upgrade Plan
          </SoundButton>
        )}

        {isSubscribed && (
          <SoundButton
            variant="outline"
            onClick={handleManageSubscription}
            disabled={isLoading}
            className="w-full border-border hover:bg-accent text-foreground"
            soundType="click"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Loading...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4 mr-2" />
                Manage Subscription
              </>
            )}
          </SoundButton>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionManager;

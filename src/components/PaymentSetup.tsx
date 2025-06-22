
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Zap, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PaymentSetupProps {
  onUpgrade?: () => void;
}

const PaymentSetup = ({ onUpgrade }: PaymentSetupProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUpgrade = async (tier: 'basic' | 'premium') => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { tier }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        if (onUpgrade) onUpgrade();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gray-900 border-orange-500/30 transition-colors">
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-white text-xl">Increase Your Usage Limits</CardTitle>
        <CardDescription className="text-gray-400">
          Get higher monthly usage limits for all AI fitness features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div 
            className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
            onClick={() => handleUpgrade('basic')}
          >
            <div>
              <h3 className="text-white font-medium">Basic Plan</h3>
              <p className="text-sm text-gray-400">Higher monthly usage limits</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-white">$10</div>
              <div className="text-xs text-gray-400">/month</div>
            </div>
          </div>
          
          <div 
            className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-500/10 to-red-600/10 border border-orange-500/30 rounded-lg cursor-pointer hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-red-600/20 transition-colors"
            onClick={() => handleUpgrade('premium')}
          >
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-white font-medium">Premium Plan</h3>
                <Crown className="w-4 h-4 text-yellow-500" />
              </div>
              <p className="text-sm text-gray-400">Unlimited most features, 15 progress analyses/month</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-white">$15</div>
              <div className="text-xs text-gray-400">/month</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2 text-sm text-gray-300">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            AI meal plans & coaching
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            Science-backed recommendations
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            TDEE & FFMI calculators
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            Training & cardio programs
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            Progress photo analysis
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={() => handleUpgrade('basic')}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {isLoading ? "Processing..." : "Basic Plan - $10/month"}
          </Button>
          <Button 
            onClick={() => handleUpgrade('premium')}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
          >
            <Crown className="w-4 h-4 mr-2" />
            {isLoading ? "Processing..." : "Premium Plan - $15/month"}
          </Button>
        </div>
        
        <Badge className="w-full justify-center bg-blue-500/20 text-blue-400 border-blue-500/30">
          Secure payments powered by Stripe
        </Badge>
      </CardContent>
    </Card>
  );
};

export default PaymentSetup;

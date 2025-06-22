
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Check } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const UpgradeSection = () => {
  const { currentTier, isSubscribed } = useSubscription();
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

  if (isSubscribed) {
    return null;
  }

  const plans = [
    {
      name: "Basic",
      price: "$10",
      period: "/month",
      icon: Zap,
      color: "bg-blue-600",
      hoverColor: "hover:bg-blue-700",
      features: [
        "Increased usage limits",
        "Priority support",
        "Advanced AI features"
      ],
      tier: 'basic' as const
    },
    {
      name: "Premium",
      price: "$15",
      period: "/month",
      icon: Crown,
      color: "bg-gradient-to-r from-orange-500 to-red-600",
      hoverColor: "hover:from-orange-600 hover:to-red-700",
      features: [
        "Unlimited usage",
        "Premium AI models",
        "Custom meal plans",
        "Advanced analytics"
      ],
      tier: 'premium' as const,
      popular: true
    }
  ];

  return (
    <div className="mt-8">
      <div className="text-center mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-white mb-2">
          Unlock Your Full Potential
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {plans.map((plan) => {
          const IconComponent = plan.icon;
          return (
            <Card key={plan.name} className={`bg-gray-900 border-gray-800 relative ${plan.popular ? 'ring-1 ring-orange-500/50' : ''}`}>
              {plan.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs">
                  Popular
                </Badge>
              )}
              <CardHeader className="text-center pb-3">
                <div className={`w-12 h-12 mx-auto ${plan.color} rounded-full flex items-center justify-center mb-3`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white text-lg">{plan.name}</CardTitle>
                <div className="text-2xl font-bold text-white">
                  {plan.price}<span className="text-sm text-gray-400">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-300 text-sm">
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleUpgrade(plan.tier)}
                  disabled={isProcessing}
                  className={`w-full ${plan.color} ${plan.hoverColor} text-white text-sm`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Processing...' : `Get ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default UpgradeSection;

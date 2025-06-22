
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
    <div className="mt-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Unlock Your Full Potential
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {plans.map((plan) => {
          const IconComponent = plan.icon;
          return (
            <Card key={plan.name} className={`bg-gray-900 border-gray-800 relative ${plan.popular ? 'ring-2 ring-orange-500' : ''}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <div className={`w-16 h-16 mx-auto ${plan.color} rounded-full flex items-center justify-center mb-4`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-white">
                  {plan.price}<span className="text-lg text-gray-400">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleUpgrade(plan.tier)}
                  disabled={isProcessing}
                  className={`w-full ${plan.color} ${plan.hoverColor} text-white`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Processing...' : `Upgrade to ${plan.name}`}
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

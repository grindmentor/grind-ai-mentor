
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap } from "lucide-react";
import { SubscriptionTier } from "@/hooks/useSubscription";

interface SubscriptionCardProps {
  tier: SubscriptionTier;
  isCurrentTier: boolean;
  isPopular?: boolean;
  onSelect: () => void;
  billingPeriod: 'monthly' | 'annual';
  isProcessing?: boolean;
}

const SubscriptionCard = ({ 
  tier, 
  isCurrentTier, 
  isPopular = false, 
  onSelect,
  billingPeriod,
  isProcessing = false
}: SubscriptionCardProps) => {
  const annualPrice = Math.round(tier.price * 10); // ~2 months free
  const currentPrice = billingPeriod === 'monthly' ? tier.price : annualPrice;
  const savings = billingPeriod === 'annual' && tier.price > 0 ? 
    `Save $${(tier.price * 12) - annualPrice}/year` : null;

  return (
    <Card className={`bg-gray-900 border-gray-800 relative ${
      isPopular ? 'border-orange-500/50 ring-1 ring-orange-500/50' : ''
    } ${isCurrentTier ? 'border-green-500/50 ring-1 ring-green-500/50' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
            <Crown className="w-3 h-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}
      
      {isCurrentTier && (
        <div className="absolute -top-3 right-4">
          <Badge className="bg-green-500 text-white">
            Current Plan
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl text-white">{tier.name}</CardTitle>
        <div className="flex items-baseline justify-center space-x-1">
          <span className="text-4xl font-bold text-white">
            ${tier.price === 0 ? '0' : currentPrice}
          </span>
          {tier.price > 0 && (
            <span className="text-gray-400">
              {billingPeriod === 'monthly' ? '/month' : '/year'}
            </span>
          )}
        </div>
        {savings && (
          <div className="text-sm text-green-400">{savings}</div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        <ul className="space-y-3">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button 
          onClick={onSelect}
          disabled={isCurrentTier || isProcessing}
          className={`w-full ${
            isCurrentTier 
              ? 'bg-gray-600 cursor-not-allowed' 
              : isPopular 
                ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          {isProcessing ? 'Processing...' : isCurrentTier ? 'Current Plan' : `Choose ${tier.name}`}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SubscriptionCard;

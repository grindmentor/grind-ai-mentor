
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSubscription, SUBSCRIPTION_TIERS } from "@/hooks/useSubscription";
import SubscriptionCard from "@/components/SubscriptionCard";
import EnhancedPaymentMethods from "@/components/subscription/EnhancedPaymentMethods";
import { useToast } from "@/hooks/use-toast";

const Pricing = () => {
  const navigate = useNavigate();
  const { currentTier, refreshSubscription } = useSubscription();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const { toast } = useToast();

  const handleSelectPlan = (tierKey: string) => {
    if (tierKey === 'free' || tierKey === currentTier) return;
    
    if (tierKey === 'premium') {
      setShowPaymentMethods(true);
    }
  };

  const handlePaymentSuccess = () => {
    toast({
      title: "Welcome to Premium!",
      description: "Your subscription has been activated. Enjoy unlimited access to all features.",
    });
    setTimeout(() => {
      refreshSubscription();
      navigate('/app');
    }, 2000);
  };

  if (showPaymentMethods) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4 mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setShowPaymentMethods(false)} 
              className="text-white hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Plans
            </Button>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Complete Your Subscription</h1>
            <p className="text-gray-400">
              {billingPeriod === 'annual' ? 'Annual' : 'Monthly'} Premium Plan
            </p>
          </div>

          <EnhancedPaymentMethods 
            tier="premium"
            billingPeriod={billingPeriod}
            onSuccess={handlePaymentSuccess}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/app')} className="text-white hover:bg-gray-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Unlock Premium Myotopia</h1>
          <p className="text-gray-400 text-lg">
            Get unlimited access to all AI-powered fitness features with science-backed recommendations
          </p>
          
          {/* Billing Period Toggle */}
          <div className="mt-6 flex items-center justify-center space-x-4">
            <Button
              variant={billingPeriod === 'monthly' ? 'default' : 'ghost'}
              onClick={() => setBillingPeriod('monthly')}
              className={billingPeriod === 'monthly' 
                ? "bg-white text-black hover:bg-gray-200" 
                : "text-gray-300 hover:text-white hover:bg-gray-800"
              }
            >
              Monthly
            </Button>
            <Button
              variant={billingPeriod === 'annual' ? 'default' : 'ghost'}
              onClick={() => setBillingPeriod('annual')}
              className={`relative ${billingPeriod === 'annual' 
                ? "bg-white text-black hover:bg-gray-200" 
                : "text-gray-300 hover:text-white hover:bg-gray-800"
              }`}
            >
              Annual
              {billingPeriod === 'annual' && (
                <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs">
                  Save 17%
                </Badge>
              )}
            </Button>
          </div>
          
          <div className="mt-6 space-y-2">
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              Cancel anytime • No hidden fees
            </Badge>
            {billingPeriod === 'annual' && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Annual plans: Save $19.89 compared to monthly
              </Badge>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
          {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => (
            <SubscriptionCard
              key={key}
              tier={tier}
              isCurrentTier={key === currentTier}
              isPopular={key === 'premium'}
              onSelect={() => handleSelectPlan(key)}
              billingPeriod={billingPeriod}
              isProcessing={false}
            />
          ))}
        </div>

        <div className="text-center mt-12 space-y-4">
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <span>✓ No refunds policy</span>
            <span>✓ Secure payment processing</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;

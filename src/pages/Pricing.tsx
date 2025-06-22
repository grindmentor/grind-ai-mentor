
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSubscription, SUBSCRIPTION_TIERS } from "@/hooks/useSubscription";
import SubscriptionCard from "@/components/SubscriptionCard";
import PaymentMethods from "@/components/PaymentMethods";

const Pricing = () => {
  const navigate = useNavigate();
  const { currentTier } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: number, period: string} | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const handleSelectPlan = (tierKey: string) => {
    const tier = SUBSCRIPTION_TIERS[tierKey];
    if (tierKey === 'free' || tierKey === currentTier) return;
    
    const annualPrice = Math.round(tier.price * 10);
    const price = billingPeriod === 'monthly' ? tier.price : annualPrice;
    const period = billingPeriod === 'monthly' ? '/month' : '/year';
    
    setSelectedPlan({ name: tier.name, price, period });
  };

  const handlePaymentSuccess = () => {
    setSelectedPlan(null);
    alert('Welcome to your new plan! You now have access to all features.');
    navigate('/app');
  };

  if (selectedPlan) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center space-x-4 mb-8">
            <Button variant="ghost" onClick={() => setSelectedPlan(null)} className="text-white hover:bg-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Plans
            </Button>
            <h1 className="text-3xl font-bold text-white">Complete Your Purchase</h1>
          </div>

          <PaymentMethods
            planName={`${selectedPlan.name} ${selectedPlan.period === '/year' ? 'Annual' : 'Monthly'}`}
            amount={selectedPlan.price}
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
          <h1 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
          <p className="text-gray-400 text-lg">
            All plans include science-backed AI recommendations with peer-reviewed research citations
          </p>
          
          {/* Billing Period Toggle */}
          <div className="mt-6 flex items-center justify-center space-x-4">
            <Button
              variant={billingPeriod === 'monthly' ? 'default' : 'ghost'}
              onClick={() => setBillingPeriod('monthly')}
              className="text-white"
            >
              Monthly
            </Button>
            <Button
              variant={billingPeriod === 'annual' ? 'default' : 'ghost'}
              onClick={() => setBillingPeriod('annual')}
              className="text-white relative"
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
                Annual plans: ~2 months free
              </Badge>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => (
            <SubscriptionCard
              key={key}
              tier={tier}
              isCurrentTier={key === currentTier}
              isPopular={key === 'premium'}
              onSelect={() => handleSelectPlan(key)}
              billingPeriod={billingPeriod}
            />
          ))}
        </div>

        <div className="text-center mt-12 space-y-4">
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <span>✓ 30-day money-back guarantee</span>
            <span>✓ Secure payment processing</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;

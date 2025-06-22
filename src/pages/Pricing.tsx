
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import PaymentMethods from "@/components/PaymentMethods";

const Pricing = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: number, period: string} | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: "Basic",
      monthlyPrice: 10,
      annualPrice: 100, // 2 months free
      period: billingPeriod === 'monthly' ? "/month" : "/year",
      description: "Perfect for regular fitness enthusiasts",
      features: [
        "30 CoachGPT queries per month",
        "8 MealPlanAI generations",
        "25 Smart Food Log analyses",
        "10 TDEE calculations",
        "5 Smart Training programs",
        "5 Progress photo analyses",
        "100 Habit checks",
        "Science-backed recommendations"
      ],
      note: "Designed for consistent monthly usage",
      buttonText: "Get Basic",
      popular: false,
      savings: billingPeriod === 'annual' ? "Save $20/year" : null
    },
    {
      name: "Premium",
      monthlyPrice: 15,
      annualPrice: 150, // 3 months free
      period: billingPeriod === 'monthly' ? "/month" : "/year",
      description: "Unlimited access with smart limits",
      features: [
        "Unlimited CoachGPT queries",
        "Unlimited MealPlanAI generations",
        "Unlimited Smart Food Log analyses",
        "Unlimited TDEE calculations",
        "Unlimited Smart Training programs",
        "15 Progress photo analyses",
        "Unlimited Habit tracking",
        "Priority support",
        "All future features included"
      ],
      note: "Unlimited with reasonable photo analysis limits",
      buttonText: "Go Premium",
      popular: true,
      savings: billingPeriod === 'annual' ? "Save $30/year" : null
    }
  ];

  const handleSelectPlan = (plan: typeof plans[0]) => {
    const price = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
    setSelectedPlan({ name: plan.name, price, period: plan.period });
  };

  const handlePaymentSuccess = () => {
    setSelectedPlan(null);
    alert('Welcome to your new plan! You now have access to all features.');
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
      <div className="max-w-4xl mx-auto">
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
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              Free tier: Very limited usage (testing only)
            </Badge>
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              Cancel anytime • No hidden fees
            </Badge>
            {billingPeriod === 'annual' && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Annual plans: 2-3 months free
              </Badge>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => {
            const currentPrice = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
            const originalAnnualPrice = plan.monthlyPrice * 12;
            
            return (
              <Card key={plan.name} className={`bg-gray-900 border-gray-800 relative ${
                plan.popular ? 'border-orange-500/50 ring-1 ring-orange-500/50' : ''
              }`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-4xl font-bold text-white">${currentPrice}</span>
                    <span className="text-gray-400">{plan.period}</span>
                  </div>
                  {billingPeriod === 'annual' && (
                    <div className="text-sm text-gray-400">
                      <span className="line-through">${originalAnnualPrice}/year</span>
                      <span className="text-green-400 ml-2">{plan.savings}</span>
                    </div>
                  )}
                  <CardDescription className="text-gray-400 mt-2">
                    {plan.description}
                  </CardDescription>
                  <Badge className={`mt-2 ${
                    plan.name === 'Premium' 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                      : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  }`}>
                    {plan.note}
                  </Badge>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700' 
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12 space-y-4">
          <p className="text-gray-400">
            Free tier includes very limited usage designed for testing only
          </p>
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


import { useState } from 'react';
import { Check, Star, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for getting started',
      icon: <Star className="w-6 h-6" />,
      features: [
        'Access to basic AI modules',
        'Limited workout tracking',
        'Basic progress analytics',
        'Community support'
      ],
      limitations: [
        'Limited AI interactions',
        'Basic features only'
      ],
      popular: false,
      buttonText: 'Get Started',
      buttonVariant: 'outline' as const
    },
    {
      name: 'Basic',
      price: { monthly: 9.99, yearly: 99.99 },
      description: 'Everything you need for serious training',
      icon: <Zap className="w-6 h-6" />,
      features: [
        'All AI modules unlocked',
        'Unlimited workout tracking',
        'Advanced progress analytics',
        'Personalized meal planning',
        'Recovery optimization',
        'Priority support'
      ],
      limitations: [],
      popular: true,
      buttonText: 'Start Basic Plan',
      buttonVariant: 'default' as const
    },
    {
      name: 'Premium',
      price: { monthly: 19.99, yearly: 199.99 },
      description: 'For serious athletes and fitness enthusiasts',
      icon: <Crown className="w-6 h-6" />,
      features: [
        'Everything in Basic',
        'Advanced AI coaching',
        'Custom workout programming',
        '1-on-1 expert consultations',
        'Advanced biometric tracking',
        'Research paper access',
        'Priority feature requests'
      ],
      limitations: [],
      popular: false,
      buttonText: 'Go Premium',
      buttonVariant: 'default' as const
    }
  ];

  const yearlyDiscount = (monthlyPrice: number) => {
    const yearlyEquivalent = monthlyPrice * 12;
    const actualYearly = monthlyPrice * 10; // 2 months free
    return Math.round(((yearlyEquivalent - actualYearly) / yearlyEquivalent) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            onClick={() => window.history.back()}
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-gray-800/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Choose Your Fitness Journey
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Science-backed training plans for every fitness level
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className={`text-sm ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-400'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-400'}`}>
                Yearly
              </span>
              {billingCycle === 'yearly' && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  Save 17%
                </Badge>
              )}
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative bg-gray-900/40 backdrop-blur-sm border rounded-2xl p-8 ${
                  plan.popular
                    ? 'border-orange-500/50 ring-2 ring-orange-500/20'
                    : 'border-gray-700/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="text-center">
                  <div className={`inline-flex p-3 rounded-full mb-4 ${
                    plan.popular ? 'bg-orange-500/20' : 'bg-gray-800/50'
                  }`}>
                    {plan.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-400 mb-6">{plan.description}</p>

                  <div className="mb-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold">
                        ${plan.price[billingCycle]}
                      </span>
                      {plan.price[billingCycle] > 0 && (
                        <span className="text-gray-400 ml-2">
                          /{billingCycle === 'monthly' ? 'month' : 'year'}
                        </span>
                      )}
                    </div>
                    {billingCycle === 'yearly' && plan.price.monthly > 0 && (
                      <p className="text-sm text-green-400 mt-1">
                        Save {yearlyDiscount(plan.price.monthly)}% annually
                      </p>
                    )}
                  </div>

                  <Button
                    className={`w-full mb-6 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'
                        : ''
                    }`}
                    variant={plan.buttonVariant}
                  >
                    {plan.buttonText}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3 text-green-400">What's included:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <Check className="w-4 h-4 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.limitations.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-400">Limitations:</h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, limitIndex) => (
                          <li key={limitIndex} className="flex items-start">
                            <span className="w-4 h-4 text-gray-500 mr-3 mt-0.5">•</span>
                            <span className="text-sm text-gray-400">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
                <p className="text-gray-400">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
              </div>
              <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <h3 className="font-semibold mb-2">Is there a free trial?</h3>
                <p className="text-gray-400">Yes, all paid plans come with a 7-day free trial. No credit card required to start.</p>
              </div>
              <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <h3 className="font-semibold mb-2">What makes Myotopia different?</h3>
                <p className="text-gray-400">All our recommendations are backed by peer-reviewed scientific research, ensuring you get the most effective and safe training methods.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

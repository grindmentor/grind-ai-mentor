
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Crown, Zap, Star } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface PricingTableProps {
  onUpgrade?: (plan: 'basic' | 'premium') => void;
}

const PricingTable = ({ onUpgrade }: PricingTableProps) => {
  const isMobile = useIsMobile();

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      icon: <Zap className="w-5 h-5" />,
      color: 'from-gray-500 to-gray-600',
      borderColor: 'border-gray-600',
      bgColor: 'bg-gray-900/40',
      features: [
        { name: 'Basic AI Coach', included: true },
        { name: 'Workout Logging', included: true },
        { name: 'Basic Calculators', included: true },
        { name: 'Limited Food Logging', included: true },
        { name: 'Photo Uploads', included: false },
        { name: 'Advanced AI Features', included: false },
        { name: 'Meal Planning', included: false },
        { name: 'Progress Analytics', included: false },
        { name: 'Premium Support', included: false }
      ]
    },
    {
      id: 'basic',
      name: 'Basic',
      price: '$9.99',
      period: 'per month',
      description: 'Enhanced features for serious training',
      icon: <Star className="w-5 h-5" />,
      color: 'from-orange-500 to-red-500',
      borderColor: 'border-orange-500',
      bgColor: 'bg-orange-500/10',
      popular: true,
      features: [
        { name: 'Everything in Free', included: true },
        { name: 'Advanced AI Coach', included: true },
        { name: 'Unlimited Food Logging', included: true },
        { name: 'Basic Meal Planning', included: true },
        { name: 'Progress Tracking', included: true },
        { name: 'Photo Uploads (Limited)', included: true },
        { name: 'Advanced Analytics', included: false },
        { name: 'Custom Programs', included: false },
        { name: 'Priority Support', included: false }
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$19.99',
      period: 'per month',
      description: 'Complete fitness transformation toolkit',
      icon: <Crown className="w-5 h-5" />,
      color: 'from-yellow-500 to-orange-500',
      borderColor: 'border-yellow-500',
      bgColor: 'bg-yellow-500/10',
      features: [
        { name: 'Everything in Basic', included: true },
        { name: 'Unlimited AI Features', included: true },
        { name: 'Advanced Meal Planning', included: true },
        { name: 'Photo Uploads (5/day)', included: true },
        { name: 'Advanced Analytics', included: true },
        { name: 'Custom Programs', included: true },
        { name: 'Priority Support', included: true },
        { name: 'Export Data', included: true },
        { name: 'API Access', included: true }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          Choose Your <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Myotopia</span> Plan
        </h2>
        <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
          Unlock your fitness potential with science-backed AI coaching and comprehensive tracking tools
        </p>
      </div>

      <div className={`grid gap-4 sm:gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`${plan.bgColor} backdrop-blur-sm ${plan.borderColor} border-2 relative overflow-hidden transition-all duration-300 hover:scale-105`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-0 right-0">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-2 text-sm font-semibold">
                  Most Popular
                </div>
              </div>
            )}
            
            <CardHeader className={`text-center ${plan.popular ? 'pt-12' : 'pt-6'} pb-4`}>
              <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                {plan.icon}
              </div>
              <CardTitle className="text-white text-xl sm:text-2xl">{plan.name}</CardTitle>
              <CardDescription className="text-gray-400">{plan.description}</CardDescription>
              <div className="text-center mt-4">
                <div className="text-3xl sm:text-4xl font-bold text-white">{plan.price}</div>
                <div className="text-gray-400 text-sm">{plan.period}</div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${feature.included ? 'text-white' : 'text-gray-500'}`}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="pt-4">
                {plan.id === 'free' ? (
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-600 text-white hover:bg-gray-800"
                    disabled
                  >
                    Current Plan
                  </Button>
                ) : (
                  <Button 
                    onClick={() => onUpgrade?.(plan.id as 'basic' | 'premium')}
                    className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white font-semibold transition-all duration-300`}
                  >
                    {plan.id === 'basic' ? 'Upgrade to Basic' : 'Upgrade to Premium'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8">
        <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 max-w-2xl mx-auto">
          <p className="text-gray-400 text-sm">
            💡 <strong>Image Upload Note:</strong> To keep our AI affordable and fast, image uploads are limited even on Premium (5/day). This helps cover AI processing costs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingTable;

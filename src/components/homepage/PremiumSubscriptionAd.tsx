
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, Zap, Brain, Target, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PremiumSubscriptionAd = () => {
  const navigate = useNavigate();

  const premiumFeatures = [
    {
      icon: <Brain className="w-4 h-4" />,
      title: "Advanced AI Coaching",
      description: "Unlimited access to Smart Training and personalized workout generation"
    },
    {
      icon: <Target className="w-4 h-4" />,
      title: "Meal Plan Generator",
      description: "Custom meal plans based on your goals, preferences, and dietary restrictions"
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      title: "Advanced Analytics",
      description: "Detailed progress tracking with comprehensive insights and recommendations"
    },
    {
      icon: <Zap className="w-4 h-4" />,
      title: "Priority Support",
      description: "Get help faster with priority customer support and feature requests"
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-sm border-orange-500/30">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Crown className="w-6 h-6 text-orange-400 mr-2" />
          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
            Premium
          </Badge>
        </div>
        <CardTitle className="text-white text-2xl">
          Unlock Your Full Potential
        </CardTitle>
        <CardDescription className="text-gray-300">
          Take your fitness journey to the next level with premium features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {premiumFeatures.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-black/20 rounded-lg">
              <div className="text-orange-400 mt-0.5">
                {feature.icon}
              </div>
              <div>
                <h4 className="text-white font-medium text-sm">{feature.title}</h4>
                <p className="text-gray-400 text-xs mt-1">{feature.description}</p>
              </div>
              <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            </div>
          ))}
        </div>

        <div className="text-center pt-4 border-t border-orange-500/20">
          <div className="mb-4">
            <div className="text-2xl font-bold text-white">
              $9.99<span className="text-lg text-gray-400">/month</span>
            </div>
            <p className="text-gray-400 text-sm">Cancel anytime • 7-day free trial</p>
          </div>
          
          <Button 
            onClick={() => navigate('/pricing')}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-3"
          >
            <Crown className="w-4 h-4 mr-2" />
            Start Free Trial
          </Button>
          
          <p className="text-xs text-gray-500 mt-2">
            No commitment • Premium features available immediately
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PremiumSubscriptionAd;

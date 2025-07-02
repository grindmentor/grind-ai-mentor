import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Brain, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PremiumPromoCardProps {
  variant?: 'compact' | 'full';
  className?: string;
}

const PremiumPromoCard: React.FC<PremiumPromoCardProps> = ({ 
  variant = 'compact',
  className = ''
}) => {
  const navigate = useNavigate();

  if (variant === 'compact') {
    return (
      <Card className={`bg-gradient-to-r from-orange-900/50 to-red-900/50 border-orange-500/30 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Unlock Premium</h3>
                <p className="text-orange-200/80 text-xs">Enhanced AI + 30 uploads/mo</p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/pricing')}
              size="sm"
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
            >
              Upgrade
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br from-orange-900/30 via-red-900/30 to-orange-900/30 border-orange-500/30 backdrop-blur-sm ${className}`}>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <Crown className="w-8 h-8 text-white" />
          </div>
          
          <div>
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 mb-2">
              Limited Time Offer
            </Badge>
            <h3 className="text-xl font-bold text-white mb-2">
              Upgrade to Premium
            </h3>
            <p className="text-gray-300 text-sm">
              Enhanced AI features, 30 photo uploads/month, and premium tools
            </p>
          </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center space-x-2 text-orange-200">
              <Brain className="w-4 h-4" />
              <span>Enhanced AI Features</span>
            </div>
            <div className="flex items-center space-x-2 text-orange-200">
              <Zap className="w-4 h-4" />
              <span>30 Photo Uploads/month</span>
            </div>
            <div className="flex items-center space-x-2 text-orange-200">
              <TrendingUp className="w-4 h-4" />
              <span>Advanced Analytics</span>
            </div>
            <div className="flex items-center space-x-2 text-orange-200">
              <Crown className="w-4 h-4" />
              <span>Priority Support</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-center">
              <span className="text-2xl font-bold text-white">$9.99</span>
              <span className="text-gray-400 text-sm">/month</span>
            </div>
            <p className="text-orange-200/80 text-xs">
              Or save 17% with annual billing at $99.99/year
            </p>
          </div>

          <Button
            onClick={() => navigate('/pricing')}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold"
          >
            Start Premium Today
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PremiumPromoCard;
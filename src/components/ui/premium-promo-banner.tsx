import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Camera, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';

interface PremiumPromoBannerProps {
  context?: 'photo-limit' | 'ai-limit' | 'feature-locked' | 'general';
  className?: string;
}

export const PremiumPromoBanner: React.FC<PremiumPromoBannerProps> = ({ 
  context = 'general',
  className = ''
}) => {
  const navigate = useNavigate();
  const { currentTier } = useSubscription();

  if (currentTier === 'premium') return null;

  const getPromoContent = () => {
    switch (context) {
      case 'photo-limit':
        return {
          icon: <Camera className="w-5 h-5" />,
          title: 'Photo Upload Limit Reached',
          description: 'Get 30 photo uploads/month with Premium',
          cta: 'Upgrade for Photos'
        };
      case 'ai-limit':
        return {
          icon: <Zap className="w-5 h-5" />,
          title: 'AI Query Limit Reached',
          description: 'Get unlimited AI prompts with Premium',
          cta: 'Get Unlimited AI'
        };
      case 'feature-locked':
        return {
          icon: <Sparkles className="w-5 h-5" />,
          title: 'Premium Feature',
          description: 'Unlock exclusive AI tools with Premium',
          cta: 'Unlock Premium'
        };
      default:
        return {
          icon: <Sparkles className="w-5 h-5" />,
          title: 'Upgrade to Premium',
          description: 'Unlimited AI, 30 photos/month, exclusive features',
          cta: 'Get Premium'
        };
    }
  };

  const content = getPromoContent();

  return (
    <div className={`bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-500/30 rounded-full flex items-center justify-center text-orange-400">
            {content.icon}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-white">{content.title}</h3>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                Premium
              </Badge>
            </div>
            <p className="text-sm text-orange-200/80">{content.description}</p>
          </div>
        </div>
        <Button
          onClick={() => navigate('/pricing')}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium"
        >
          {content.cta}
        </Button>
      </div>
    </div>
  );
};
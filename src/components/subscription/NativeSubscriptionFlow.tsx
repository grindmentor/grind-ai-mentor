import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Shield, Users, Sparkles } from "lucide-react";
import { useSubscription, SUBSCRIPTION_TIERS } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NativeSubscriptionFlowProps {
  onClose?: () => void;
}

const NativeSubscriptionFlow: React.FC<NativeSubscriptionFlowProps> = ({ onClose }) => {
  const { currentTier, refreshSubscription } = useSubscription();
  const { toast } = useToast();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Native app-like animations
  const [slideIn, setSlideIn] = useState(false);
  
  useEffect(() => {
    setSlideIn(true);
  }, []);

  const handleSubscribe = async (tier: 'premium') => {
    if (currentTier === tier) return;
    
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: { tier, billing: billingPeriod }
      });

      if (error) {
        console.error('Subscription error:', error);
        toast({
          title: "Subscription Error",
          description: "Unable to process subscription. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        // Native-like experience: slide out current view, open payment
        setSlideIn(false);
        
        // Detect PWA/mobile environment
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isStandalone || isMobile) {
          // Keep in same window for PWA
          window.location.href = data.url;
        } else {
          // Open in new tab for desktop
          window.open(data.url, '_blank');
        }

        // Listen for success
        setTimeout(() => {
          checkPaymentSuccess();
        }, 1000);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Error",
        description: "Failed to start subscription process.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const checkPaymentSuccess = async () => {
    let attempts = 0;
    const maxAttempts = 20;
    
    const checkStatus = async () => {
      await refreshSubscription();
      attempts++;
      
      if (attempts < maxAttempts) {
        setTimeout(checkStatus, 3000);
      }
    };
    
    checkStatus();
  };

  const handlePaymentSuccess = () => {
    setShowSuccess(true);
    toast({
      title: "🎉 Welcome to Premium!",
      description: "Your premium features are now active.",
    });
    
    setTimeout(() => {
      onClose?.();
    }, 2000);
  };

  // Success animation
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
        <Card className="bg-gradient-to-br from-orange-500 to-red-600 border-none text-white max-w-md w-full animate-slide-up">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Premium Activated!</h3>
            <p className="text-white/90">Welcome to unlimited AI-powered fitness coaching</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`w-full max-w-4xl transition-all duration-500 ${slideIn ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        <Card className="bg-black border-gray-800 text-white">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Unlock Premium Myotopia
            </CardTitle>
            <p className="text-gray-400 mt-2">Join thousands achieving their fitness goals</p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center mt-6 bg-gray-900 rounded-lg p-1 max-w-xs mx-auto">
              <Button
                variant={billingPeriod === 'monthly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBillingPeriod('monthly')}
                className={`flex-1 ${billingPeriod === 'monthly' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
              >
                Monthly
              </Button>
              <Button
                variant={billingPeriod === 'annual' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBillingPeriod('annual')}
                className={`flex-1 relative ${billingPeriod === 'annual' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
              >
                Annual
                <Badge className="absolute -top-2 -right-1 bg-green-500 text-white text-xs px-1 py-0">
                  17% OFF
                </Badge>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Premium Features Grid */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-orange-400" />
                  </div>
                  <span className="text-sm">Unlimited AI Chat & Coaching</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-sm">Advanced Physique Analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-sm">30 Photo Uploads/Month</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-sm">Smart Training Programs</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-red-400" />
                  </div>
                  <span className="text-sm">AI Meal Planning</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <Check className="w-4 h-4 text-yellow-400" />
                  </div>
                  <span className="text-sm">Priority Support</span>
                </div>
              </div>
            </div>

            {/* Premium Plan Card */}
            <Card className="bg-gradient-to-br from-orange-500/10 to-red-600/10 border-orange-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-orange-500 to-red-600 text-white px-3 py-1 text-xs font-bold">
                MOST POPULAR
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">Premium</h3>
                    <p className="text-gray-400 text-sm">Everything you need to excel</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">
                      ${billingPeriod === 'annual' ? '8.33' : '9.99'}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {billingPeriod === 'annual' ? 'per month (billed annually)' : 'per month'}
                    </div>
                    {billingPeriod === 'annual' && (
                      <div className="text-green-400 text-xs">Save $19.89/year</div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => handleSubscribe('premium')}
                  disabled={isProcessing || currentTier === 'premium'}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-3 text-lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : currentTier === 'premium' ? (
                    'Current Plan'
                  ) : (
                    `Start Premium ${billingPeriod === 'annual' ? 'Annual' : 'Monthly'}`
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <div className="text-center text-gray-400 text-sm space-y-2">
              <div className="flex items-center justify-center space-x-4">
                <span>🔒 Secure Payment</span>
                <span>🚫 Cancel Anytime</span>
                <span>⚡ Instant Access</span>
              </div>
              <p>Powered by Stripe • Your payment information is secure and encrypted</p>
            </div>

            {/* Close Button */}
            {onClose && (
              <div className="text-center">
                <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
                  Maybe Later
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NativeSubscriptionFlow;

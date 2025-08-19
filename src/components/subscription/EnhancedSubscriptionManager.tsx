import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Crown, 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Smartphone,
  Globe
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SubscriptionCard from '../SubscriptionCard';
import { PaymentMethods } from '../PaymentMethods';

export const EnhancedSubscriptionManager: React.FC = () => {
  const { user } = useAuth();
  const { currentTier, currentTierData, subscriptionEnd, refreshSubscription } = useSubscription();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [isIOSPlatform, setIsIOSPlatform] = useState(false);
  const [canUseiOSPurchases, setCanUseiOSPurchases] = useState(false);

  useEffect(() => {
    // Detect iOS platform
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isIOSPWA = window.matchMedia('(display-mode: standalone)').matches && isIOS;
    
    setIsIOSPlatform(isIOS);
    setCanUseiOSPurchases(isIOSPWA);
  }, []);

  const handleTierSelect = (tier: string) => {
    if (tier === 'free') {
      handleDowngrade();
    } else {
      setSelectedTier(tier);
      setShowPayment(true);
    }
  };

  const handleDowngrade = async () => {
    try {
      const { error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      
      toast.success('Opening subscription management...');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Unable to open subscription management');
    }
  };

  const handleCustomerPortal = async () => {
    try {
      setIsProcessing(true);
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        // Open in new tab for web, redirect for mobile
        if (isIOSPlatform && canUseiOSPurchases) {
          window.location.href = data.url;
        } else {
          window.open(data.url, '_blank');
        }
        toast.success('Opening subscription management...');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Unable to open subscription management');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleiOSPurchase = async (tier: string) => {
    // For iOS PWA, we'll redirect to a specific URL that can trigger App Store billing
    toast.info('iOS in-app purchases will be available when published to App Store');
    
    // For now, fallback to web payment
    setSelectedTier(tier);
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setSelectedTier('');
    refreshSubscription();
    toast.success('Subscription updated successfully!');
  };

  if (showPayment && selectedTier) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => setShowPayment(false)}
            variant="outline"
            size="sm"
          >
            ← Back
          </Button>
          <h2 className="text-xl font-bold text-white">Complete Your Subscription</h2>
        </div>
        
        <PaymentMethods
          planName={selectedTier}
          amount={billingPeriod === 'monthly' ? 15 : 150}
          onSuccess={handlePaymentSuccess}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Crown className="w-5 h-5 mr-2 text-yellow-400" />
            Current Subscription
          </CardTitle>
          <CardDescription className="text-purple-200/80">
            Manage your Myotopia subscription and billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white capitalize">
                {currentTier} Plan
              </h3>
              {subscriptionEnd && (
                <p className="text-sm text-gray-300">
                  {currentTier === 'free' ? 'No expiration' : 
                   `Expires: ${new Date(subscriptionEnd).toLocaleDateString()}`}
                </p>
              )}
            </div>
            <Badge 
              className={
                currentTier === 'premium' 
                  ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-gray-500/20 text-gray-300 border-gray-500/40'
              }
            >
              {currentTier === 'premium' ? 'Premium Active' : 'Free Plan'}
            </Badge>
          </div>

          {currentTier === 'premium' && (
            <div className="flex space-x-2">
              <Button 
                onClick={handleCustomerPortal}
                disabled={isProcessing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage Subscription
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* iOS-specific notice */}
      {isIOSPlatform && (
        <Alert className="bg-blue-900/20 border-blue-500/30">
          <Smartphone className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-200">
            {canUseiOSPurchases ? (
              <>
                <strong>iOS App Store Integration:</strong> When this app is published to the App Store, 
                you'll be able to use Apple's secure in-app purchase system for subscriptions.
              </>
            ) : (
              <>
                <strong>Mobile Web:</strong> For the full iOS experience with App Store billing, 
                install this app from the App Store when available.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Billing Period Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-800/50 p-1 rounded-lg flex space-x-1">
          <Button
            onClick={() => setBillingPeriod('monthly')}
            variant={billingPeriod === 'monthly' ? 'default' : 'ghost'}
            size="sm"
            className="text-sm"
          >
            Monthly
          </Button>
          <Button
            onClick={() => setBillingPeriod('annual')}
            variant={billingPeriod === 'annual' ? 'default' : 'ghost'}
            size="sm"
            className="text-sm"
          >
            Annual
            <Badge className="ml-2 bg-green-500/20 text-green-400 text-xs">
              Save 17%
            </Badge>
          </Button>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SubscriptionCard
          tier={{
            name: 'Free',
            monthlyPrice: 0,
            annualPrice: 0,
            features: [
              'Basic workout tracking',
              'Limited AI coaching sessions (5/month)',
              'Basic progress photos',
              'Community access',
              'Standard exercise library'
            ]
          }}
          isCurrentTier={currentTier === 'free'}
          onSelect={() => handleTierSelect('free')}
          billingPeriod={billingPeriod}
          isProcessing={isProcessing}
        />

        <SubscriptionCard
          tier={{
            name: 'Premium',
            monthlyPrice: 15,
            annualPrice: 150,
            features: [
              'Unlimited AI coaching & analysis',
              'Advanced physique analysis',
              'Personalized meal planning',
              'Progress tracking & analytics',
              'Custom workout programs',
              'Priority support',
              'Advanced recovery insights',
              'Detailed body composition analysis'
            ]
          }}
          isCurrentTier={currentTier === 'premium'}
          isPopular={true}
          onSelect={() => {
            if (isIOSPlatform && canUseiOSPurchases) {
              handleiOSPurchase('premium');
            } else {
              handleTierSelect('premium');
            }
          }}
          billingPeriod={billingPeriod}
          isProcessing={isProcessing}
        />
      </div>

      {/* Feature Comparison */}
      <Card className="bg-gray-900/40 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
            Why Upgrade to Premium?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Crown className="w-6 h-6 text-purple-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Unlimited AI Access</h4>
              <p className="text-sm text-gray-300">
                Get unlimited coaching sessions, physique analysis, and meal planning
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Advanced Analytics</h4>
              <p className="text-sm text-gray-300">
                Detailed progress tracking, body composition analysis, and insights
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Personalized Plans</h4>
              <p className="text-sm text-gray-300">
                Custom workout programs and meal plans tailored to your goals
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform-specific Payment Info */}
      <Card className="bg-gray-900/40 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-blue-400" />
            Payment & Billing Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Globe className="w-5 h-5 text-blue-400 mt-1" />
              <div>
                <h4 className="font-medium text-white">Web Platform</h4>
                <p className="text-sm text-gray-300">
                  Secure payments via Stripe. All major credit cards accepted.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Smartphone className="w-5 h-5 text-green-400 mt-1" />
              <div>
                <h4 className="font-medium text-white">iOS App Store</h4>
                <p className="text-sm text-gray-300">
                  When published: Secure Apple billing with Face ID/Touch ID.
                </p>
              </div>
            </div>
          </div>
          
          <Alert className="bg-gray-800/50 border-gray-700/50">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-gray-300">
              <strong>Secure & Safe:</strong> All payments are processed securely. 
              Cancel anytime with full data export available.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedSubscriptionManager;
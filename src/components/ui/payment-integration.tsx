import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Smartphone, Shield, Check, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

interface PaymentIntegrationProps {
  tier: 'premium';
  billingPeriod: 'monthly' | 'annual';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const PaymentIntegration: React.FC<PaymentIntegrationProps> = ({
  tier,
  billingPeriod,
  onSuccess,
  onError
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'ios' | null>(null);
  const { refreshSubscription } = useSubscription();
  
  // Detect iOS environment
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;
  const isCapacitor = !!(window as any).Capacitor;

  const handleStripePayment = async () => {
    setIsProcessing(true);
    setPaymentMethod('stripe');
    
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: { 
          tier,
          billing_period: billingPeriod
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Enhanced mobile payment handling
        if (isIOS && (isPWA || isCapacitor)) {
          // iOS PWA/Capacitor: use same window for better user experience
          window.location.href = data.url;
        } else if (window.innerWidth <= 768) {
          // Mobile browsers: use same window
          window.location.href = data.url;
        } else {
          // Desktop: open in new tab
          const newWindow = window.open(data.url, '_blank', 'width=800,height=600');
          
          if (newWindow) {
            // Monitor for payment completion
            let attempts = 0;
            const maxAttempts = 120; // 10 minutes
            
            const checkPayment = async () => {
              attempts++;
              
              try {
                await refreshSubscription();
                
                if (newWindow.closed) {
                  // Window closed, do final verification
                  setTimeout(async () => {
                    await refreshSubscription();
                    setIsProcessing(false);
                    if (onSuccess) onSuccess();
                  }, 2000);
                  return;
                }
                
                if (attempts < maxAttempts) {
                  setTimeout(checkPayment, 5000);
                }
              } catch (error) {
                console.error('Payment check error:', error);
              }
            };
            
            // Start monitoring after delay
            setTimeout(checkPayment, 3000);
            
            toast.success('Payment window opened. Complete your purchase to activate premium features.');
          }
        }
      }
    } catch (error: any) {
      console.error('Stripe payment error:', error);
      const errorMessage = error?.message || 'Payment processing failed';
      
      setIsProcessing(false);
      setPaymentMethod(null);
      
      if (onError) {
        onError(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleiOSInAppPurchase = async () => {
    if (!isCapacitor) {
      toast.error('In-app purchases are only available in the native iOS app');
      return;
    }

    setIsProcessing(true);
    setPaymentMethod('ios');
    
    try {
      // iOS In-App Purchase placeholder - will be implemented when app is published to App Store
      toast.info('iOS in-app purchases will be available in the App Store version');
      
      // For now, fallback to Stripe payment
      setTimeout(() => {
        setIsProcessing(false);
        setPaymentMethod(null);
        handleStripePayment();
      }, 1000);
      
    } catch (error: any) {
      console.error('iOS purchase error:', error);
      setIsProcessing(false);
      setPaymentMethod(null);
      
      const errorMessage = 'In-app purchase not available';
      if (onError) {
        onError(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const price = billingPeriod === 'annual' ? 99.99 : 9.99;
  const savings = billingPeriod === 'annual' ? 'Save $19.89/year' : '';

  return (
    <Card className="bg-gray-900/80 border-orange-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-orange-400" />
          Secure Payment
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
            ${price}{billingPeriod === 'monthly' ? '/month' : '/year'}
          </Badge>
          {savings && (
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              {savings}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stripe Payment (Web) */}
        <div className="space-y-3">
          <Button
            onClick={handleStripePayment}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
            size="lg"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {isProcessing && paymentMethod === 'stripe' ? 'Processing...' : 'Pay with Card'}
          </Button>
          
          <div className="text-xs text-gray-400 text-center">
            Visa, Mastercard, American Express, and more
          </div>
        </div>

        {/* iOS In-App Purchase (if available) */}
        {isIOS && isCapacitor && (
          <div className="border-t border-gray-700/50 pt-4">
            <Button
              onClick={handleiOSInAppPurchase}
              disabled={isProcessing}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
              size="lg"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              {isProcessing && paymentMethod === 'ios' ? 'Processing...' : 'iOS In-App Purchase'}
            </Button>
            
            <div className="text-xs text-gray-400 text-center mt-2">
              Use your Apple ID and Touch ID/Face ID
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mt-4">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-200/90">
              <div className="font-medium mb-1">Secure & Encrypted</div>
              <div>All payments are processed securely. Your card information is never stored on our servers.</div>
            </div>
          </div>
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
              <div className="text-sm text-orange-300">
                {paymentMethod === 'ios' ? 'Processing in-app purchase...' : 'Redirecting to secure payment...'}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentIntegration;
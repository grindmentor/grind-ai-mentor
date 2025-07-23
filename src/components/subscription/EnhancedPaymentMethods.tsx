import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Smartphone, 
  Building, 
  Clock, 
  CheckCircle, 
  Shield,
  Zap 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import ApplePayButton from "@/components/ui/apple-pay-button";

interface EnhancedPaymentMethodsProps {
  tier: 'premium';
  billingPeriod: 'monthly' | 'annual';
  onSuccess: () => void;
}

const EnhancedPaymentMethods = ({ 
  tier, 
  billingPeriod, 
  onSuccess 
}: EnhancedPaymentMethodsProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStarted, setPaymentStarted] = useState(false);
  const { toast } = useToast();
  const { checkPaymentStatus } = usePaymentStatus();

  // Calculate pricing
  const monthlyPrice = 9.99;
  const annualPrice = 99.99;
  const currentPrice = billingPeriod === 'annual' ? annualPrice : monthlyPrice;
  const savings = billingPeriod === 'annual' ? (monthlyPrice * 12) - annualPrice : 0;

  const handleStripeSubscription = async () => {
    setIsProcessing(true);
    setPaymentStarted(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: { 
          tier: tier,
          billing: billingPeriod 
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Enhanced mobile/PWA detection
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isPWA = window.matchMedia('(display-mode: standalone)').matches;
        const isIOSPWA = /iPad|iPhone|iPod/.test(navigator.userAgent) && isPWA;
        
        if (isMobile || isPWA) {
          // Mobile/PWA: redirect in same tab for better UX
          window.location.href = data.url;
        } else {
          // Desktop: open in new tab with enhanced monitoring
          const newWindow = window.open(data.url, '_blank');
          
          // Enhanced payment status monitoring
          let attempts = 0;
          const maxAttempts = 120; // 20 minutes max
          
          const monitorPayment = async () => {
            attempts++;
            await checkPaymentStatus();
            
            if (attempts < maxAttempts && newWindow && !newWindow.closed) {
              setTimeout(monitorPayment, 10000); // Check every 10 seconds
            } else if (newWindow?.closed) {
              // Window closed - do final verification
              setTimeout(async () => {
                await checkPaymentStatus();
                // Double check after 3 seconds
                setTimeout(async () => {
                  await checkPaymentStatus();
                  toast({
                    title: "Verifying Payment",
                    description: "We're confirming your subscription status. Please wait...",
                  });
                }, 3000);
              }, 1000);
            }
          };

          // Start monitoring after initial delay
          setTimeout(monitorPayment, 5000);
          
          toast({
            title: "Stripe Checkout Opened",
            description: `Complete your ${billingPeriod} subscription in the new tab. We'll update your account automatically.`,
            duration: 10000,
          });
        }
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription Error",
        description: "Unable to start subscription. Please try again or contact support.",
        variant: "destructive",
      });
      setPaymentStarted(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplePaySuccess = async (paymentResult: any) => {
    console.log('Apple Pay payment successful:', paymentResult);
    
    // Here you would process the Apple Pay payment with your backend
    // For now, we'll show success and trigger the onSuccess callback
    toast({
      title: "Apple Pay Successful!",
      description: "Your premium subscription is being activated...",
    });
    
    // Check subscription status
    setTimeout(async () => {
      await checkPaymentStatus();
      onSuccess();
    }, 2000);
  };

  const handleApplePayError = (error: any) => {
    console.error('Apple Pay error:', error);
    toast({
      title: "Apple Pay Error",
      description: "Apple Pay payment failed. Please try another payment method.",
      variant: "destructive",
    });
  };

  // Future payment methods
  const comingSoonMethods = [
    { 
      name: "Google Pay", 
      icon: Smartphone, 
      description: "Google Pay integration",
      eta: "Coming Soon"
    },
    { 
      name: "PayPal", 
      icon: CreditCard, 
      description: "PayPal payments",
      eta: "Next Update"
    },
    { 
      name: "Bank Transfer", 
      icon: Building, 
      description: "Direct bank transfer",
      eta: "Q2 2024"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Pricing Summary */}
      <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-white">
              Premium Myotopia - {billingPeriod === 'annual' ? 'Annual' : 'Monthly'}
            </h3>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-3xl font-bold text-orange-400">
                ${currentPrice}
              </span>
              <span className="text-gray-400">
                /{billingPeriod === 'annual' ? 'year' : 'month'}
              </span>
            </div>
            {billingPeriod === 'annual' && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Save ${savings.toFixed(2)} per year
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Shield className="w-5 h-5 mr-2 text-orange-400" />
            Secure Payment Methods
          </CardTitle>
          <CardDescription className="text-gray-400">
            Choose your preferred payment method. All payments are secured with 256-bit SSL encryption.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Stripe Credit Card - Primary Method */}
          <Card className={`bg-gray-800 border-gray-700 transition-all ${
            paymentStarted ? 'border-orange-500/50 bg-orange-500/5' : 'hover:border-orange-500/50'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {paymentStarted ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <CreditCard className="w-6 h-6 text-orange-400" />
                  )}
                  <div>
                    <h3 className="text-white font-medium flex items-center">
                      {paymentStarted ? "Processing Payment" : "Credit/Debit Card"}
                      <Badge className="ml-2 bg-orange-500/20 text-orange-400 text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        Instant
                      </Badge>
                    </h3>
                    <p className="text-sm text-gray-400">
                      {paymentStarted 
                        ? "Complete your subscription in the Stripe checkout" 
                        : "Visa, Mastercard, American Express, and more"
                      }
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleStripeSubscription}
                  disabled={isProcessing || paymentStarted}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-50"
                >
                  {isProcessing ? "Opening Stripe..." : paymentStarted ? "In Progress" : "Subscribe Now"}
                </Button>
              </div>
              {paymentStarted && (
                <div className="mt-3 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <p className="text-sm text-orange-400">
                    ✓ Stripe checkout opened. Complete your payment and we'll activate your subscription immediately.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Apple Pay - Available on supported devices */}
          <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-6 h-6 text-gray-300" />
                  <div>
                    <h3 className="text-white font-medium flex items-center">
                      Apple Pay
                      <Badge className="ml-2 bg-gray-600 text-gray-300 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        Beta
                      </Badge>
                    </h3>
                    <p className="text-sm text-gray-400">
                      Touch ID, Face ID, or Apple Watch
                    </p>
                  </div>
                </div>
                <ApplePayButton
                  amount={currentPrice}
                  onSuccess={handleApplePaySuccess}
                  onError={handleApplePayError}
                  className="bg-black text-white hover:bg-gray-800"
                />
              </div>
            </CardContent>
          </Card>

          {/* Coming Soon Methods */}
          {comingSoonMethods.map((method) => (
            <Card key={method.name} className="bg-gray-800/50 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 opacity-60">
                    <method.icon className="w-6 h-6 text-gray-400" />
                    <div>
                      <h3 className="text-gray-300 font-medium">{method.name}</h3>
                      <p className="text-sm text-gray-500">{method.description}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-gray-600 text-gray-300">
                    <Clock className="w-3 h-3 mr-1" />
                    {method.eta}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="text-center text-sm text-gray-400 space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Shield className="w-4 h-4 text-green-400" />
          <span>256-bit SSL encryption • PCI DSS compliant</span>
        </div>
        <p>Your subscription will be activated immediately after payment confirmation</p>
        <p>Cancel anytime • No hidden fees • Full premium access</p>
      </div>
    </div>
  );
};

export default EnhancedPaymentMethods;
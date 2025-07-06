
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone, Building, Clock, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";

interface PaymentMethodsProps {
  planName: string;
  amount: number;
  onSuccess: () => void;
}

const PaymentMethods = ({ planName, amount, onSuccess }: PaymentMethodsProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStarted, setPaymentStarted] = useState(false);
  const { toast } = useToast();
  const { checkPaymentStatus } = usePaymentStatus();

  const handleStripePayment = async () => {
    setIsProcessing(true);
    setPaymentStarted(true);
    
    try {
      const tier = 'premium'; // Only premium tier available
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { tier }
      });

      if (error) throw error;

      if (data?.url) {
        // Better mobile handling - use location.href for mobile, window.open for desktop
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isPWA = window.matchMedia('(display-mode: standalone)').matches;
        
        if (isMobile || isPWA) {
          // On mobile/PWA, redirect in same tab for better compatibility
          window.location.href = data.url;
        } else {
          // Desktop: open in new tab
          const newWindow = window.open(data.url, '_blank');
          
          // Enhanced payment monitoring for desktop
          let attempts = 0;
          const maxAttempts = 60;
          
          const checkStatus = async () => {
            attempts++;
            await checkPaymentStatus();
            
            if (attempts < maxAttempts && newWindow && !newWindow.closed) {
              setTimeout(checkStatus, 10000);
            } else if (newWindow?.closed) {
              // Window was closed, do final checks
              setTimeout(async () => {
                await checkPaymentStatus();
                // Additional verification
                setTimeout(async () => {
                  await checkPaymentStatus();
                  toast({
                    title: "Checking Payment Status",
                    description: "We're verifying your payment. This may take a moment...",
                  });
                }, 3000);
              }, 2000);
            }
          };

          // Start checking after a short delay
          setTimeout(checkStatus, 3000);
          
          toast({
            title: "Redirected to Stripe",
            description: "Complete your payment in the new tab. We'll automatically update your account.",
            duration: 8000,
          });
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "Unable to process payment. Please try again or contact support.",
        variant: "destructive",
      });
      setPaymentStarted(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const comingSoonMethods = [
    { name: "Vipps", icon: Smartphone, description: "Popular Norwegian mobile payment" },
    { name: "Bank Transfer", icon: Building, description: "Direct bank transfer" },
    { name: "PayPal", icon: CreditCard, description: "PayPal payments" },
    { name: "Apple Pay", icon: Smartphone, description: "Apple Pay integration" }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Payment Methods</CardTitle>
          <CardDescription className="text-gray-400">
            Choose your preferred payment method for {planName} (${amount}/month)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stripe Payment - Active */}
          <Card className={`bg-gray-800 border-gray-700 transition-all ${
            paymentStarted ? 'border-orange-500/50 bg-orange-500/5' : 'hover:border-orange-500/50'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {paymentStarted ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <CreditCard className="w-6 h-6 text-white" />
                  )}
                  <div>
                    <h3 className="text-white font-medium">
                      {paymentStarted ? "Payment Processing" : "Credit/Debit Card"}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {paymentStarted ? "Complete payment in the new tab" : "Visa, Mastercard, American Express"}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleStripePayment}
                  disabled={isProcessing || paymentStarted}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-50"
                >
                  {isProcessing ? "Processing..." : paymentStarted ? "In Progress" : "Pay Now"}
                </Button>
              </div>
              {paymentStarted && (
                <div className="mt-3 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <p className="text-sm text-orange-400">
                    ✓ Payment window opened. Complete your payment and we'll automatically update your account.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coming Soon Methods */}
          {comingSoonMethods.map((method) => (
            <Card key={method.name} className="bg-gray-800/50 border-gray-700">
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
                    Coming Soon
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-400">
        <p>🔒 Secure payments powered by Stripe</p>
        <p className="mt-1">Your account will be updated automatically after payment</p>
      </div>
    </div>
  );
};

export default PaymentMethods;

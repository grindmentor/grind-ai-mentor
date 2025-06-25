
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone, Building, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";

interface PaymentMethodsProps {
  planName: string;
  amount: number;
  onSuccess: () => void;
}

const PaymentMethods = ({ planName, amount, onSuccess }: PaymentMethodsProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { refreshSubscription } = useSubscription();

  const handleStripePayment = async () => {
    setIsProcessing(true);
    
    try {
      const tier = planName.toLowerCase().includes('basic') ? 'basic' : 'premium';
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { tier }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in a new tab
        const newWindow = window.open(data.url, '_blank');
        
        // Listen for payment completion
        const checkPaymentStatus = async () => {
          try {
            // Wait a bit then refresh subscription status
            await new Promise(resolve => setTimeout(resolve, 3000));
            await refreshSubscription();
            
            toast({
              title: "Payment Successful!",
              description: "Your premium features are now active.",
              duration: 5000,
            });
            
            onSuccess();
          } catch (error) {
            console.error('Error checking payment status:', error);
          }
        };

        // Check payment status after a delay
        setTimeout(checkPaymentStatus, 5000);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      });
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
          <Card className="bg-gray-800 border-gray-700 hover:border-orange-500/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-6 h-6 text-white" />
                  <div>
                    <h3 className="text-white font-medium">Credit/Debit Card</h3>
                    <p className="text-sm text-gray-400">Visa, Mastercard, American Express</p>
                  </div>
                </div>
                <Button 
                  onClick={handleStripePayment}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                >
                  {isProcessing ? "Processing..." : "Pay Now"}
                </Button>
              </div>
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
        <p>Secure payments powered by Stripe</p>
        <p className="mt-1">More payment methods coming soon</p>
      </div>
    </div>
  );
};

export default PaymentMethods;

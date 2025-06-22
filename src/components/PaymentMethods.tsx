
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone, Building, DollarSign, Banknote } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface PaymentMethodsProps {
  planName: string;
  amount: number;
  onSuccess?: () => void;
}

const PaymentMethods = ({ planName, amount, onSuccess }: PaymentMethodsProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const { user } = useAuth();

  const paymentMethods = [
    {
      id: "card",
      name: "Credit/Debit Card",
      description: "Visa, Mastercard, American Express",
      icon: <CreditCard className="w-6 h-6" />,
      available: true
    },
    {
      id: "apple_pay",
      name: "Apple Pay",
      description: "Quick and secure payment",
      icon: <Smartphone className="w-6 h-6" />,
      available: true
    },
    {
      id: "google_pay",
      name: "Google Pay",
      description: "Pay with your Google account",
      icon: <Smartphone className="w-6 h-6" />,
      available: true
    },
    {
      id: "klarna",
      name: "Klarna",
      description: "Buy now, pay later in installments",
      icon: <Banknote className="w-6 h-6" />,
      available: true
    },
    {
      id: "bank_transfer",
      name: "Bank Transfer",
      description: "Direct bank account transfer",
      icon: <Building className="w-6 h-6" />,
      available: true
    },
    {
      id: "paypal",
      name: "PayPal",
      description: "Pay with your PayPal account",
      icon: <DollarSign className="w-6 h-6" />,
      available: true
    }
  ];

  const handlePayment = async () => {
    if (!selectedMethod || !user) return;

    setProcessing(true);

    try {
      // Record payment attempt in database
      const { error } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          payment_method: selectedMethod,
          amount: amount * 100, // Convert to cents
          status: 'completed', // For demo purposes
          subscription_tier: planName
        });

      if (error) {
        console.error('Error recording payment:', error);
        alert('Payment failed. Please try again.');
      } else {
        alert(`Payment of $${amount} via ${selectedMethod} successful!`);
        onSuccess?.();
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Payment Methods</CardTitle>
        <CardDescription className="text-gray-400">
          Choose your preferred payment method for {planName} - ${amount}/month
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedMethod === method.id
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-gray-700 hover:border-gray-600'
              } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => method.available && setSelectedMethod(method.id)}
            >
              <div className="flex items-center space-x-3">
                <div className="text-white">{method.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-white font-medium">{method.name}</h3>
                    {method.available && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                        Available
                      </Badge>
                    )}
                    {method.id === 'klarna' && (
                      <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30 text-xs">
                        Pay Later
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{method.description}</p>
                </div>
                {selectedMethod === method.id && (
                  <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={handlePayment}
          disabled={!selectedMethod || processing}
          className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
        >
          {processing ? 'Processing...' : `Pay $${amount} with ${selectedMethod}`}
        </Button>

        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>✓ Secure payment processing</p>
          <p>✓ Cancel anytime</p>
          <p>✓ 30-day money-back guarantee</p>
          {selectedMethod === 'klarna' && (
            <p className="text-pink-400">✓ Split into 4 interest-free payments</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethods;

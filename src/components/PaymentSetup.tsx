
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Zap } from "lucide-react";

interface PaymentSetupProps {
  onUpgrade?: () => void;
}

const PaymentSetup = ({ onUpgrade }: PaymentSetupProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    
    // Redirect to pricing page
    setTimeout(() => {
      setIsLoading(false);
      if (onUpgrade) onUpgrade();
    }, 500);
  };

  return (
    <Card className="bg-gray-900 border-orange-500/30">
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-white text-xl">Upgrade to Premium</CardTitle>
        <CardDescription className="text-gray-400">
          Unlock unlimited access to all AI features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            Starting at $10<span className="text-sm text-gray-400">/month</span>
          </div>
          <Badge className="mt-2 bg-orange-500/20 text-orange-400 border-orange-500/30">
            Two plans available
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm text-gray-300">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            AI meal plans & coaching
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            Science-backed recommendations
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            TDEE & FFMI calculators
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            Advanced training programs
          </div>
        </div>

        <Button 
          onClick={handleUpgrade}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          {isLoading ? "Loading..." : "View Plans"}
        </Button>
        
        <p className="text-xs text-gray-500 text-center mt-2">
          Choose between Basic ($10) and Premium ($20)
        </p>
      </CardContent>
    </Card>
  );
};

export default PaymentSetup;

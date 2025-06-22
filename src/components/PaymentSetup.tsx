
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PaymentSetupProps {
  onUpgrade?: () => void;
}

const PaymentSetup = ({ onUpgrade }: PaymentSetupProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    setIsLoading(true);
    
    // Navigate to pricing page
    navigate('/pricing');
    
    setTimeout(() => {
      setIsLoading(false);
      if (onUpgrade) onUpgrade();
    }, 500);
  };

  return (
    <Card className="bg-gray-900 border-orange-500/30 cursor-pointer hover:border-orange-400/50 transition-colors" onClick={handleUpgrade}>
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-white text-xl">Increase Your Usage Limits</CardTitle>
        <CardDescription className="text-gray-400">
          Get higher monthly usage limits for all AI fitness features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
            <div>
              <h3 className="text-white font-medium">Basic Plan</h3>
              <p className="text-sm text-gray-400">Higher monthly usage limits</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-white">$10</div>
              <div className="text-xs text-gray-400">/month</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-500/10 to-red-600/10 border border-orange-500/30 rounded-lg">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-white font-medium">Premium Plan</h3>
                <Zap className="w-4 h-4 text-yellow-500" />
              </div>
              <p className="text-sm text-gray-400">Unlimited most features, limited progress analysis</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-white">$15</div>
              <div className="text-xs text-gray-400">/month</div>
            </div>
          </div>
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
            Training & cardio programs
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            Progress photo analysis (15/month premium)
          </div>
        </div>

        <Button 
          onClick={(e) => {
            e.stopPropagation();
            handleUpgrade();
          }}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          {isLoading ? "Loading..." : "Choose Your Plan"}
        </Button>
        
        <Badge className="w-full justify-center bg-blue-500/20 text-blue-400 border-blue-500/30">
          Higher usage limits available with paid plans
        </Badge>
      </CardContent>
    </Card>
  );
};

export default PaymentSetup;

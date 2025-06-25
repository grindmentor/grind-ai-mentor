
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, TrendingUp } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";

const UpgradeSection = () => {
  const { currentTier, isSubscribed } = useSubscription();
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  // Don't show upgrade section for subscribed users
  if (isSubscribed) {
    return null;
  }

  const benefits = [
    {
      icon: Crown,
      title: "Unlimited AI Interactions",
      description: "No limits on CoachGPT queries, meal plans, and most features"
    },
    {
      icon: TrendingUp,
      title: "Advanced Analytics",
      description: "Detailed progress tracking and personalized insights"
    },
    {
      icon: Zap,
      title: "Priority Support", 
      description: "Get help faster with premium customer support"
    }
  ];

  return (
    <div className="mt-8">
      <Card className="bg-gradient-to-br from-orange-500/10 to-red-600/10 border-orange-500/20">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl text-white mb-2">
            Unlock Your Full Potential
          </CardTitle>
          <p className="text-gray-400">
            Get unlimited access to all AI modules and premium features
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="text-center space-y-2">
                  <div className="w-10 h-10 mx-auto bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-orange-400" />
                  </div>
                  <h4 className="font-medium text-white text-sm">{benefit.title}</h4>
                  <p className="text-xs text-gray-400">{benefit.description}</p>
                </div>
              );
            })}
          </div>
          
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center space-x-2">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                Save 25% Annually
              </Badge>
              <span className="text-gray-400 text-sm">•</span>
              <span className="text-gray-400 text-sm">Cancel anytime</span>
            </div>
            
            <Button
              onClick={handleUpgrade}
              className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpgradeSection;

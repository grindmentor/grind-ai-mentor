
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Basic",
      price: "$10",
      period: "/month",
      description: "Essential AI coaching tools",
      features: [
        "CoachGPT - 24/7 AI coaching",
        "MealPlanAI - Personalized nutrition",
        "Smart Food Log - Photo recognition",
        "TDEE & FFMI Calculator",
        "Science-backed recommendations",
        "Basic progress tracking"
      ],
      buttonText: "Get Basic",
      popular: false
    },
    {
      name: "Premium",
      price: "$15",
      period: "/month",
      description: "Complete fitness transformation suite",
      features: [
        "Everything in Basic, plus:",
        "Smart Training - Advanced programs",
        "CutCalc Pro - Body composition analysis",
        "Advanced progress tracking",
        "Priority support",
        "Unlimited AI interactions",
        "Custom meal plans & training"
      ],
      buttonText: "Get Premium",
      popular: true
    }
  ];

  const handleUpgrade = (planName: string) => {
    // For demo purposes, simulate upgrade process
    alert(`Upgrading to ${planName} plan... This would redirect to Stripe checkout in a real implementation.`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/app')} className="text-white hover:bg-gray-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
          <p className="text-gray-400 text-lg">
            All plans include science-backed AI recommendations with peer-reviewed research citations
          </p>
          <Badge className="mt-4 bg-orange-500/20 text-orange-400 border-orange-500/30">
            Cancel anytime • No hidden fees
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className={`bg-gray-900 border-gray-800 relative ${
              plan.popular ? 'border-orange-500/50 ring-1 ring-orange-500/50' : ''
            }`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                <div className="flex items-baseline justify-center space-x-1">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                <CardDescription className="text-gray-400 mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className={`text-sm ${
                        feature.startsWith('Everything in') ? 'text-orange-400 font-medium' : 'text-gray-300'
                      }`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handleUpgrade(plan.name)}
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700' 
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 space-y-4">
          <p className="text-gray-400">
            Both plans include access to our science-backed AI with research citations
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <span>✓ 30-day money-back guarantee</span>
            <span>✓ Secure payment processing</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;

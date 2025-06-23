
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PaymentMethods from "./PaymentMethods";
import DashboardHeader from "./dashboard/DashboardHeader";
import AIModuleCard from "./dashboard/AIModuleCard";
import { aiModules } from "./dashboard/AIModuleData";
import { ArrowLeft, Star, Zap } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSubscription } from "@/hooks/useSubscription";
import { useUserData } from "@/contexts/UserDataContext";

const Dashboard = () => {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: number} | null>(null);
  const isMobile = useIsMobile();
  const { currentTier, isSubscribed } = useSubscription();
  const { refreshUserData } = useUserData();

  const handleModuleClick = (moduleId: string) => {
    setActiveModule(moduleId);
  };

  const handleBack = () => {
    setActiveModule(null);
    setSelectedPlan(null);
  };

  const handleUpgrade = (planName: string, price: number) => {
    setSelectedPlan({ name: planName, price: price });
  };

  const handlePaymentSuccess = () => {
    setSelectedPlan(null);
    console.log('Payment successful! Premium features unlocked.');
  };

  const handleFoodLogged = () => {
    // Refresh user data when food is logged
    refreshUserData();
  };

  if (selectedPlan) {
    return (
      <div className="min-h-screen bg-black text-white p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6 md:mb-8">
            <Button 
              variant="ghost" 
              onClick={handleBack} 
              className="text-white hover:bg-gray-800 hover:text-orange-400 transition-colors w-fit"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-xl md:text-2xl font-bold text-white">Complete Your Purchase</h1>
          </div>

          <PaymentMethods
            planName={selectedPlan.name}
            amount={selectedPlan.price}
            onSuccess={handlePaymentSuccess}
          />
        </div>
      </div>
    );
  }

  if (activeModule) {
    const module = aiModules.find(m => m.id === activeModule);
    if (module) {
      const ModuleComponent = module.component;
      
      // Special handling for FoodPhotoLogger which needs onFoodLogged prop
      if (module.id === 'food-photo-logger') {
        return <ModuleComponent onBack={handleBack} onFoodLogged={handleFoodLogged} />;
      }
      
      return <ModuleComponent onBack={handleBack} />;
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <DashboardHeader />

          {/* Minimal Upgrade Prompt - Only show for free users */}
          {currentTier === 'free' && (
            <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30 mb-6">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-white">Unlock Premium Features</h3>
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                          <Star className="w-3 h-3 mr-1" />
                          Popular
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm">Unlimited AI queries, meal plans, and advanced analytics</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                    <Button 
                      onClick={() => handleUpgrade('Basic', 10)}
                      variant="outline"
                      size="sm"
                      className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 w-full sm:w-auto"
                    >
                      Basic $10/mo
                    </Button>
                    <Button 
                      onClick={() => handleUpgrade('Premium', 15)}
                      size="sm"
                      className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 w-full sm:w-auto"
                    >
                      Premium $15/mo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className={`grid gap-4 sm:gap-6 ${
            isMobile 
              ? 'grid-cols-1 sm:grid-cols-2' 
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}>
            {aiModules.map((module) => (
              <AIModuleCard
                key={module.id}
                module={module}
                onModuleClick={handleModuleClick}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

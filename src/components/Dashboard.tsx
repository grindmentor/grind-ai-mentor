
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PaymentMethods from "./PaymentMethods";
import DashboardHeader from "./dashboard/DashboardHeader";
import AIModuleCard from "./dashboard/AIModuleCard";
import MobileModuleSelector from "./dashboard/MobileModuleSelector";
import { useModules } from "@/contexts/ModulesContext";
import { ArrowLeft, Star, Zap, FileText, Shield, Info } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSubscription } from "@/hooks/useSubscription";
import { useUserData } from "@/contexts/UserDataContext";
import { useNavigate, Link } from "react-router-dom";

const Dashboard = () => {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: number} | null>(null);
  const { modules, isInitialized } = useModules();
  const isMobile = useIsMobile();
  const { currentTier, isSubscribed, refreshSubscription } = useSubscription();
  const { refreshUserData } = useUserData();
  const navigate = useNavigate();

  const handleModuleClick = (moduleId: string) => {
    setActiveModule(moduleId);
  };

  const handleBack = () => {
    setActiveModule(null);
    setSelectedPlan(null);
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  const handlePaymentSuccess = async () => {
    setSelectedPlan(null);
    await refreshSubscription();
    refreshUserData();
  };

  const handleFoodLogged = () => {
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
              className="text-white hover:bg-gray-800 hover:text-orange-400 w-fit"
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

  if (activeModule && isInitialized) {
    const module = modules.find(m => m.id === activeModule);
    if (module) {
      const ModuleComponent = module.component;
      return <ModuleComponent onBack={handleBack} onFoodLogged={handleFoodLogged} />;
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <DashboardHeader />

          {/* Minimal Upgrade Prompt - Only show for free users */}
          {currentTier === 'free' && (
            <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30 mb-4 sm:mb-6">
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base sm:text-lg font-semibold text-white">Unlock Premium</h3>
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                          <Star className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                          Popular
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-xs sm:text-sm">Higher usage limits & meal plans</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                    <Button 
                      onClick={handleUpgrade}
                      size="sm"
                      className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 w-full sm:w-auto text-xs sm:text-sm"
                    >
                      View Plans
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mobile: Dropdown Selector, Desktop: Grid Layout */}
          {isMobile ? (
            <MobileModuleSelector
              modules={modules}
              onModuleSelect={handleModuleClick}
            />
          ) : (
            <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {modules.map((module) => (
                <AIModuleCard
                  key={module.id}
                  module={module}
                  onModuleClick={handleModuleClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Links */}
      <div className="border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/about">
              <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-gray-800 flex items-center">
                <Info className="w-4 h-4 mr-2" />
                About
              </Button>
            </Link>
            <Link to="/terms">
              <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-gray-800 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Terms
              </Button>
            </Link>
            <Link to="/privacy">
              <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-gray-800 flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Privacy
              </Button>
            </Link>
          </div>
          
          <div className="text-center text-gray-500 mt-6 pt-6 border-t border-gray-800">
            <p>&copy; 2025 GrindMentor. All rights reserved. Your fitness journey starts here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

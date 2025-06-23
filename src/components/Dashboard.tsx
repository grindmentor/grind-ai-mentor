
import { useState } from "react";
import { Button } from "@/components/ui/button";
import PaymentMethods from "./PaymentMethods";
import DashboardHeader from "./dashboard/DashboardHeader";
import AIModuleCard from "./dashboard/AIModuleCard";
import { aiModules } from "./dashboard/AIModuleData";
import { ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Dashboard = () => {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: number} | null>(null);
  const isMobile = useIsMobile();

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
            <h1 className="text-2xl md:text-3xl font-bold text-white">Complete Your Purchase</h1>
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
      return <ModuleComponent onBack={handleBack} />;
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader />

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
  );
};

export default Dashboard;

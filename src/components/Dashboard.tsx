
import { useState } from "react";
import { Button } from "@/components/ui/button";
import PaymentMethods from "./PaymentMethods";
import DashboardHeader from "./dashboard/DashboardHeader";
import AIModuleCard from "./dashboard/AIModuleCard";
import UpgradeSection from "./dashboard/UpgradeSection";
import { aiModules } from "./dashboard/AIModuleData";

const Dashboard = () => {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: number} | null>(null);

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
    alert('Payment successful! You now have access to all premium features.');
  };

  if (selectedPlan) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center space-x-4 mb-8">
            <Button variant="ghost" onClick={handleBack} className="text-white hover:bg-gray-800">
              ← Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-white">Complete Your Purchase</h1>
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
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {aiModules.map((module) => (
            <AIModuleCard
              key={module.id}
              module={module}
              onModuleClick={handleModuleClick}
            />
          ))}
        </div>

        <UpgradeSection onUpgrade={handleUpgrade} />
      </div>
    </div>
  );
};

export default Dashboard;

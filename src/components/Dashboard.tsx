
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, TrendingUp, Brain, Zap, Target, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSubscription } from "@/hooks/useSubscription";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useNavigate } from "react-router-dom";
import { useModules } from "@/contexts/ModulesContext";
import AIModuleCard from "./dashboard/AIModuleCard";
import MobileModuleSelector from "./dashboard/MobileModuleSelector";
import UpgradeSection from "./dashboard/UpgradeSection";
import DashboardSkeleton from "./dashboard/DashboardSkeleton";

const Dashboard = () => {
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [showModule, setShowModule] = useState(false);
  const [isFullyInitialized, setIsFullyInitialized] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { currentTier, isSubscribed, isLoading: subscriptionLoading } = useSubscription();
  const { currentUsage, loading: usageLoading } = useUsageTracking();
  const { modules, isInitialized: modulesInitialized } = useModules();

  // Wait for all systems to be fully initialized
  useEffect(() => {
    const allSystemsReady = modulesInitialized && !subscriptionLoading && !usageLoading;
    
    if (allSystemsReady && !isFullyInitialized) {
      // Add a small delay to ensure all state updates are complete
      const timer = setTimeout(() => {
        setIsFullyInitialized(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [modulesInitialized, subscriptionLoading, usageLoading, isFullyInitialized]);

  const handleModuleSelect = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (module) {
      setSelectedModule(moduleId);
      setShowModule(true);
    }
  };

  const handleBackToDashboard = () => {
    setShowModule(false);
    setSelectedModule("");
  };

  // Show skeleton until everything is fully initialized
  if (!isFullyInitialized) {
    return <DashboardSkeleton />;
  }

  if (showModule && selectedModule) {
    const module = modules.find(m => m.id === selectedModule);
    if (module) {
      const ModuleComponent = module.component;
      return <ModuleComponent onBack={handleBackToDashboard} />;
    }
  }

  const totalUsage = Object.values(currentUsage).reduce((sum, val) => sum + val, 0);

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header Section */}
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Your <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">AI Coach</span> Dashboard
          </h1>
          <p className="text-gray-400 text-lg">
            Science-backed fitness guidance powered by AI
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-500 mb-1">{totalUsage}</div>
              <p className="text-gray-400 text-sm">Total Interactions</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500 mb-1">{currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}</div>
              <p className="text-gray-400 text-sm">Current Plan</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500 mb-1">{modules.length}</div>
              <p className="text-gray-400 text-sm">AI Modules</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-500 mb-1">24/7</div>
              <p className="text-gray-400 text-sm">AI Support</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Modules Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">AI Modules</h2>
            {!isSubscribed && (
              <Button
                onClick={() => navigate('/pricing')}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                size="sm"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade
              </Button>
            )}
          </div>

          {isMobile ? (
            <MobileModuleSelector
              modules={modules}
              onModuleSelect={handleModuleSelect}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {modules.map((module) => (
                <AIModuleCard
                  key={module.id}
                  module={module}
                  onModuleClick={handleModuleSelect}
                />
              ))}
            </div>
          )}
        </div>

        {/* Upgrade Section - Only show for non-subscribers */}
        {!isSubscribed && <UpgradeSection />}

        {/* Quick Actions */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-orange-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="ghost"
                className="h-auto p-4 justify-start hover:bg-gray-800"
                onClick={() => handleModuleSelect('coach-gpt')}
              >
                <div className="flex items-center space-x-3">
                  <Brain className="w-8 h-8 text-blue-500" />
                  <div className="text-left">
                    <div className="font-medium">Ask CoachGPT</div>
                    <div className="text-sm text-gray-400">Get instant answers</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Button>
              
              <Button
                variant="ghost"
                className="h-auto p-4 justify-start hover:bg-gray-800"
                onClick={() => handleModuleSelect('meal-plan-ai')}
              >
                <div className="flex items-center space-x-3">
                  <Target className="w-8 h-8 text-green-500" />
                  <div className="text-left">
                    <div className="font-medium">Create Meal Plan</div>
                    <div className="text-sm text-gray-400">Nutrition planning</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Button>
              
              <Button
                variant="ghost"
                className="h-auto p-4 justify-start hover:bg-gray-800"
                onClick={() => handleModuleSelect('physique-ai')}
              >
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                  <div className="text-left">
                    <div className="font-medium">Track Progress</div>
                    <div className="text-sm text-gray-400">Physique analysis</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

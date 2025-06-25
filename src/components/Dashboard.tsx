
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
import FooterLinks from "./dashboard/FooterLinks";
import { AnimatedCard } from "@/components/ui/animated-card";
import { SmoothButton } from "@/components/ui/smooth-button";
import { PageTransition } from "@/components/ui/page-transition";
import { playSuccessSound } from "@/utils/soundEffects";

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
        playSuccessSound();
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
      return (
        <PageTransition>
          <ModuleComponent onBack={handleBackToDashboard} />
        </PageTransition>
      );
    }
  }

  const totalUsage = Object.values(currentUsage).reduce((sum, val) => sum + val, 0);

  return (
    <PageTransition>
      <div className="min-h-screen bg-black text-white p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
          {/* Header Section */}
          <div className="text-center md:text-left animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white via-orange-100 to-white bg-clip-text text-transparent">
              Your <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">AI Coach</span> Dashboard
            </h1>
            <p className="text-gray-400 text-lg">
              Science-backed fitness guidance powered by AI
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: totalUsage, label: "Total Interactions", color: "text-orange-500", delay: 0 },
              { value: currentTier.charAt(0).toUpperCase() + currentTier.slice(1), label: "Current Plan", color: "text-blue-500", delay: 100 },
              { value: modules.length, label: "AI Modules", color: "text-green-500", delay: 200 },
              { value: "24/7", label: "AI Support", color: "text-purple-500", delay: 300 }
            ].map((stat, index) => (
              <AnimatedCard key={index} className="bg-gray-900 border-gray-800" delay={stat.delay}>
                <CardContent className="p-4 text-center">
                  <div className={`text-2xl font-bold ${stat.color} mb-1 transition-all duration-300 hover:scale-110`}>
                    {stat.value}
                  </div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </CardContent>
              </AnimatedCard>
            ))}
          </div>

          {/* AI Modules Section */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">AI Modules</h2>
              {!isSubscribed && (
                <SmoothButton
                  onClick={() => navigate('/pricing')}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  size="sm"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade
                </SmoothButton>
              )}
            </div>

            {isMobile ? (
              <MobileModuleSelector
                modules={modules}
                onModuleSelect={handleModuleSelect}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {modules.map((module, index) => (
                  <AnimatedCard
                    key={module.id}
                    delay={500 + index * 100}
                    hoverEffect={false}
                    className="p-0 border-0 bg-transparent"
                  >
                    <AIModuleCard
                      module={module}
                      onModuleClick={handleModuleSelect}
                    />
                  </AnimatedCard>
                ))}
              </div>
            )}
          </div>

          {/* Upgrade Section - Only show for non-subscribers */}
          {!isSubscribed && (
            <div className="animate-fade-in" style={{ animationDelay: '600ms' }}>
              <UpgradeSection />
            </div>
          )}

          {/* Quick Actions */}
          <AnimatedCard className="bg-gray-900 border-gray-800" delay={700}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2 text-orange-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'coach-gpt', icon: Brain, title: 'Ask CoachGPT', subtitle: 'Get instant answers', color: 'text-blue-500' },
                  { id: 'meal-plan-ai', icon: Target, title: 'Create Meal Plan', subtitle: 'Nutrition planning', color: 'text-green-500' },
                  { id: 'physique-ai', icon: TrendingUp, title: 'Track Progress', subtitle: 'Physique analysis', color: 'text-purple-500' }
                ].map((action, index) => (
                  <SmoothButton
                    key={action.id}
                    variant="ghost"
                    className="h-auto p-4 justify-start hover:bg-gray-800 transform transition-all duration-200"
                    onClick={() => handleModuleSelect(action.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <action.icon className={`w-8 h-8 ${action.color}`} />
                      <div className="text-left">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-sm text-gray-400">{action.subtitle}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 ml-auto transition-transform group-hover:translate-x-1" />
                  </SmoothButton>
                ))}
              </div>
            </CardContent>
          </AnimatedCard>

          {/* Footer Links */}
          <div className="animate-fade-in" style={{ animationDelay: '800ms' }}>
            <FooterLinks />
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;

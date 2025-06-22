
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Calculator, TrendingUp, Camera, Utensils, Dumbbell, Timer, FileImage, CreditCard, Target, Heart } from "lucide-react";
import CoachGPT from "./ai-modules/CoachGPT";
import TDEECalculator from "./ai-modules/TDEECalculator";
import CutCalcPro from "./ai-modules/CutCalcPro";
import ProgressAI from "./ai-modules/ProgressAI";
import MealPlanAI from "./ai-modules/MealPlanAI";
import SmartTraining from "./ai-modules/SmartTraining";
import CardioAI from "./ai-modules/CardioAI";
import WorkoutTimer from "./ai-modules/WorkoutTimer";
import SmartFoodLog from "./ai-modules/SmartFoodLog";
import HabitTracker from "./ai-modules/HabitTracker";
import PaymentMethods from "./PaymentMethods";

const Dashboard = () => {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: number} | null>(null);

  const aiModules = [
    {
      id: 'coach-gpt',
      name: 'CoachGPT',
      description: '24/7 AI fitness coaching with research citations',
      icon: <Brain className="w-6 h-6" />,
      color: 'bg-blue-500',
      component: CoachGPT,
      tier: 'free'
    },
    {
      id: 'meal-plan-ai',
      name: 'MealPlanAI',
      description: 'Custom meal plans and nutrition guidance',
      icon: <Utensils className="w-6 h-6" />,
      color: 'bg-green-500',
      component: MealPlanAI,
      tier: 'free'
    },
    {
      id: 'smart-food-log',
      name: 'Smart Food Log',
      description: 'Photo-based food tracking and analysis',
      icon: <FileImage className="w-6 h-6" />,
      color: 'bg-yellow-500',
      component: SmartFoodLog,
      tier: 'free'
    },
    {
      id: 'tdee-calculator',
      name: 'TDEE & FFMI Calculator',
      description: 'Calculate metabolic needs and muscle potential',
      icon: <Calculator className="w-6 h-6" />,
      color: 'bg-indigo-500',
      component: TDEECalculator,
      tier: 'free'
    },
    {
      id: 'habit-tracker',
      name: 'Habit Tracker',
      description: 'Build consistent fitness and wellness habits',
      icon: <Target className="w-6 h-6" />,
      color: 'bg-gradient-to-r from-green-500 to-blue-500',
      component: HabitTracker,
      tier: 'free',
      trending: true
    },
    {
      id: 'smart-training',
      name: 'Smart Training',
      description: 'AI-generated personalized weight training programs',
      icon: <Dumbbell className="w-6 h-6" />,
      color: 'bg-red-500',
      component: SmartTraining,
      tier: 'free'
    },
    {
      id: 'cardio-ai',
      name: 'CardioAI',
      description: 'Science-based cardiovascular training programs',
      icon: <Heart className="w-6 h-6" />,
      color: 'bg-red-600',
      component: CardioAI,
      tier: 'free',
      trending: true
    },
    {
      id: 'progress-ai',
      name: 'ProgressAI',
      description: 'AI photo analysis & body composition tracking',
      icon: <Camera className="w-6 h-6" />,
      color: 'bg-purple-500',
      component: ProgressAI,
      tier: 'free',
      trending: true
    },
    {
      id: 'cut-calc-pro',
      name: 'CutCalc Pro',
      description: 'Advanced body composition & cutting calculator',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-pink-500',
      component: CutCalcPro,
      tier: 'free'
    },
    {
      id: 'workout-timer',
      name: 'Workout Timer',
      description: 'Smart rest periods and workout timing',
      icon: <Timer className="w-6 h-6" />,
      color: 'bg-teal-500',
      component: WorkoutTimer,
      tier: 'free'
    }
  ];

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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            AI Fitness Dashboard
          </h1>
          <p className="text-gray-400 text-lg">
            Choose from our science-backed AI modules to optimize your fitness journey
          </p>
          <Badge className="mt-4 bg-orange-500/20 text-orange-400 border-orange-500/30">
            All recommendations backed by peer-reviewed research
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {aiModules.map((module) => (
            <Card key={module.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all cursor-pointer relative">
              {module.trending && (
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs">
                    🔥 Trending
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${module.color} rounded-lg flex items-center justify-center text-white`}>
                    {module.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg">{module.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                        Free Access
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-gray-400 text-sm mb-4">
                  {module.description}
                </CardDescription>
                <Button 
                  onClick={() => handleModuleClick(module.id)}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white"
                >
                  Open Module
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upgrade section */}
        <Card className="bg-gradient-to-r from-orange-500/10 to-red-600/10 border-orange-500/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Unlock Higher Usage Limits</h3>
              <p className="text-gray-300 mb-6">
                Get more usage per month and support the development of new AI features
              </p>
              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={() => handleUpgrade('Basic', 10)}
                  className="bg-gray-700 hover:bg-gray-600 text-white"
                >
                  Basic Plan - $10/mo
                </Button>
                <Button 
                  onClick={() => handleUpgrade('Premium', 15)}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                >
                  Premium Plan - $15/mo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Utensils, Dumbbell, Camera, TrendingUp, Calculator, Timer } from "lucide-react";
import { useState } from "react";
import MealPlanAI from "./ai-modules/MealPlanAI";
import CoachGPT from "./ai-modules/CoachGPT";
import SmartTraining from "./ai-modules/SmartTraining";
import CutCalcPro from "./ai-modules/CutCalcPro";
import SmartFoodLog from "./ai-modules/SmartFoodLog";
import TDEECalculator from "./ai-modules/TDEECalculator";
import WorkoutTimer from "./ai-modules/WorkoutTimer";

const Dashboard = () => {
  const [activeModule, setActiveModule] = useState<string | null>(null);

  // Mock subscription tier - in real app this would come from auth context
  const subscriptionTier = "free"; // "free", "basic", "premium"

  const modules = [
    {
      id: "workout-timer",
      title: "Workout Timer",
      description: "Basic interval and rest timer for workouts",
      icon: Timer,
      color: "bg-blue-500",
      features: ["Customizable intervals", "Rest timer", "Workout logging"],
      component: WorkoutTimer,
      requiredTier: "free"
    },
    {
      id: "coach-gpt",
      title: "CoachGPT",
      description: "24/7 AI coaching with research citations",
      icon: Brain,
      color: "bg-blue-500",
      features: ["Research-backed advice", "Study citations", "Personalized guidance"],
      component: CoachGPT,
      requiredTier: "basic"
    },
    {
      id: "meal-plan",
      title: "MealPlanAI",
      description: "Science-backed personalized nutrition plans",
      icon: Utensils,
      color: "bg-green-500",
      features: ["Evidence-based macros", "Budget optimization", "Dietary restrictions"],
      component: MealPlanAI,
      requiredTier: "basic"
    },
    {
      id: "food-log",
      title: "Smart Food Log",
      description: "AI-powered nutrition tracking",
      icon: Camera,
      color: "bg-yellow-500",
      features: ["Photo recognition", "Accurate portions", "Database validation"],
      component: SmartFoodLog,
      requiredTier: "basic"
    },
    {
      id: "tdee-calc",
      title: "TDEE & FFMI Calculator",
      description: "Calculate metabolic needs & muscle mass potential",
      icon: Calculator,
      color: "bg-indigo-500",
      features: ["TDEE calculation", "FFMI analysis", "Body composition estimates"],
      component: TDEECalculator,
      requiredTier: "basic"
    },
    {
      id: "training",
      title: "Smart Training",
      description: "Programs based on exercise science",
      icon: Dumbbell,
      color: "bg-purple-500",
      features: ["Periodization principles", "Progressive overload", "Recovery optimization"],
      component: SmartTraining,
      requiredTier: "premium"
    },
    {
      id: "progress",
      title: "CutCalc Pro",
      description: "Body composition analysis",
      icon: TrendingUp,
      color: "bg-pink-500",
      features: ["Visual tracking", "Body fat estimation", "Phase recommendations"],
      component: CutCalcPro,
      requiredTier: "premium"
    }
  ];

  const isModuleAccessible = (requiredTier: string) => {
    if (requiredTier === "free") return true;
    if (subscriptionTier === "free") return false;
    if (subscriptionTier === "premium") return true;
    if (subscriptionTier === "basic" && requiredTier === "basic") return true;
    return false;
  };

  // If a module is active, render its component
  if (activeModule) {
    const module = modules.find(m => m.id === activeModule);
    if (module) {
      const ModuleComponent = module.component;
      return <ModuleComponent onBack={() => setActiveModule(null)} />;
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Your AI Fitness Dashboard</h1>
        <p className="text-gray-400">All responses are backed by scientific research and peer-reviewed studies</p>
        <Badge className="mt-2 bg-orange-500/20 text-orange-400 border-orange-500/30">
          Science-Backed AI
        </Badge>
      </div>

      {subscriptionTier === "free" && (
        <Card className="bg-gradient-to-r from-orange-500/10 to-red-600/10 border-orange-500/30">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Unlock AI-Powered Fitness</h3>
            <p className="text-gray-300 mb-4">
              Get access to science-backed AI coaching, meal plans, and training programs
            </p>
            <Button 
              onClick={() => window.open('/pricing', '_blank')}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              View Pricing Plans
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const isAccessible = isModuleAccessible(module.requiredTier);
          
          return (
            <Card key={module.id} className={`bg-gray-900 border-gray-800 hover:border-orange-500/50 transition-all group cursor-pointer ${
              !isAccessible ? 'opacity-60' : ''
            }`}>
              <CardHeader>
                <div className={`w-12 h-12 ${module.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <module.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-xl">{module.title}</CardTitle>
                  {!isAccessible && (
                    <Badge variant="outline" className="text-orange-400 border-orange-400">
                      {module.requiredTier === "premium" ? "Premium" : "Basic"}
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-gray-400">
                  {module.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-400 text-sm mb-4">
                  {module.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => {
                    if (isAccessible) {
                      setActiveModule(module.id);
                    } else {
                      window.open('/pricing', '_blank');
                    }
                  }}
                  className={`w-full ${
                    isAccessible 
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                >
                  {isAccessible ? `Launch ${module.title}` : 'Upgrade to Access'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Scientific Backing</CardTitle>
          <CardDescription className="text-gray-400">
            Our AI responses are grounded in evidence-based research
          </CardDescription>
        </CardHeader>
        <CardContent className="text-gray-300">
          <p>
            Every recommendation, meal plan, and training program is backed by peer-reviewed studies 
            and scientific literature. Our AI includes citations and research references to ensure 
            you receive the most accurate and effective fitness guidance available.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

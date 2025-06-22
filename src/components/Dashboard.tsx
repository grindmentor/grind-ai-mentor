
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Utensils, Dumbbell, Camera, TrendingUp, MessageSquare } from "lucide-react";
import { useState } from "react";
import MealPlanAI from "./ai-modules/MealPlanAI";
import CoachGPT from "./ai-modules/CoachGPT";
import SmartTraining from "./ai-modules/SmartTraining";
import CutCalcPro from "./ai-modules/CutCalcPro";
import SmartFoodLog from "./ai-modules/SmartFoodLog";
import AIAssistant from "./ai-modules/AIAssistant";

const Dashboard = () => {
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const modules = [
    {
      id: "meal-plan",
      title: "MealPlanAI",
      description: "Science-backed personalized nutrition plans",
      icon: Utensils,
      color: "bg-green-500",
      features: ["Evidence-based macros", "Budget optimization", "Dietary restrictions"],
      component: MealPlanAI
    },
    {
      id: "coach-gpt",
      title: "CoachGPT",
      description: "24/7 AI coaching with research citations",
      icon: Brain,
      color: "bg-blue-500",
      features: ["Research-backed advice", "Study citations", "Personalized guidance"],
      component: CoachGPT
    },
    {
      id: "training",
      title: "Smart Training",
      description: "Programs based on exercise science",
      icon: Dumbbell,
      color: "bg-purple-500",
      features: ["Periodization principles", "Progressive overload", "Recovery optimization"],
      component: SmartTraining
    },
    {
      id: "progress",
      title: "CutCalc Pro",
      description: "Body composition analysis",
      icon: TrendingUp,
      color: "bg-pink-500",
      features: ["Visual tracking", "Body fat estimation", "Phase recommendations"],
      component: CutCalcPro
    },
    {
      id: "food-log",
      title: "Smart Food Log",
      description: "AI-powered nutrition tracking",
      icon: Camera,
      color: "bg-yellow-500",
      features: ["Photo recognition", "Accurate portions", "Database validation"],
      component: SmartFoodLog
    },
    {
      id: "chat",
      title: "AI Assistant",
      description: "Ask anything about fitness & nutrition",
      icon: MessageSquare,
      color: "bg-indigo-500",
      features: ["Science-backed answers", "Study references", "Personalized advice"],
      component: AIAssistant
    }
  ];

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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card key={module.id} className="bg-gray-900 border-gray-800 hover:border-orange-500/50 transition-all group cursor-pointer">
            <CardHeader>
              <div className={`w-12 h-12 ${module.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <module.icon className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white text-xl">{module.title}</CardTitle>
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
                onClick={() => setActiveModule(module.id)}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              >
                Launch {module.title}
              </Button>
            </CardContent>
          </Card>
        ))}
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

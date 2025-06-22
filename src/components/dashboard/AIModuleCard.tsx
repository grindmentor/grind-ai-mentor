
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";  
import { LucideIcon, Settings } from "lucide-react";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useSubscription } from "@/hooks/useSubscription";

interface AIModule {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  tier: string;
  trending?: boolean;
  buttonText: string;
}

interface AIModuleCardProps {
  module: AIModule;
  onModuleClick: (moduleId: string) => void;
}

const getUsageKey = (moduleId: string) => {
  const mapping: Record<string, string> = {
    'coach-gpt': 'coach_gpt_queries',
    'meal-plan-ai': 'meal_plan_generations',
    'smart-food-log': 'food_log_analyses',
    'tdee-calculator': 'tdee_calculations',
    'habit-tracker': 'habit_checks',
    'smart-training': 'training_programs',
    'progress-ai': 'progress_analyses',
    'cut-calc-pro': 'cut_calc_uses',
    'workout-timer': 'workout_timer_sessions',
    'food-photo-logger': 'food_photo_analyses'
  };
  return mapping[moduleId];
};

const AIModuleCard = ({ module, onModuleClick }: AIModuleCardProps) => {
  const IconComponent = module.icon;
  const { currentUsage, limits } = useUsageTracking();
  const { currentTier } = useSubscription();
  
  const usageKey = getUsageKey(module.id);
  const currentCount = currentUsage?.[usageKey as keyof typeof currentUsage] || 0;
  const limit = limits?.[usageKey as keyof typeof limits] || 0;
  
  const isUnlimited = limit === -1;
  const isPremium = currentTier !== 'free';
  
  return (
    <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all cursor-pointer relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${module.color} rounded-lg flex items-center justify-center text-white`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-white text-lg">{module.name}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={`text-xs ${isPremium ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
                  {isPremium ? 'Premium' : 'Free'}
                </Badge>
                {usageKey && (
                  <Badge variant="outline" className="text-xs text-white border-gray-600">
                    {isUnlimited ? (
                      <span className="text-orange-400 font-semibold">Unlimited</span>
                    ) : (
                      `${currentCount}/${limit} left`
                    )}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              // Handle settings for this module
            }}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-gray-400 text-sm mb-4 line-clamp-2">
          {module.description}
        </CardDescription>
        <Button 
          onClick={() => onModuleClick(module.id)}
          className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
        >
          {module.buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AIModuleCard;

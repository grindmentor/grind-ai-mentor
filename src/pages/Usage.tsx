import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MobileHeader } from "@/components/MobileHeader";
import { useSubscription } from "@/hooks/useSubscription";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { 
  MessageSquare, 
  Utensils, 
  Camera, 
  Calculator, 
  Dumbbell, 
  TrendingUp,
  CheckCircle,
  Timer,
  BarChart3,
  Crown,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface UsageItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const Usage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentTier, currentTierData } = useSubscription();
  const { currentUsage, limits, loading } = useUsageTracking();
  const [totalInteractions, setTotalInteractions] = useState(0);

  useEffect(() => {
    if (user) {
      fetchTotalInteractions();
    }
  }, [user]);

  const fetchTotalInteractions = async () => {
    if (!user) return;
    
    try {
      const { count } = await supabase
        .from('interaction_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      setTotalInteractions(count || 0);
    } catch (error) {
      console.error('Error fetching interactions:', error);
    }
  };

  const usageItems: UsageItem[] = [
    {
      key: 'coach_gpt_queries',
      label: 'CoachGPT Queries',
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20'
    },
    {
      key: 'meal_plan_generations',
      label: 'Meal Plans Generated',
      icon: <Utensils className="w-5 h-5" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      key: 'food_photo_analyses',
      label: 'Food Photo Analyses',
      icon: <Camera className="w-5 h-5" />,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/20'
    },
    {
      key: 'tdee_calculations',
      label: 'TDEE Calculations',
      icon: <Calculator className="w-5 h-5" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    },
    {
      key: 'training_programs',
      label: 'Training Programs',
      icon: <Dumbbell className="w-5 h-5" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      key: 'progress_analyses',
      label: 'Progress Analyses',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/20'
    },
    {
      key: 'habit_checks',
      label: 'Habit Check-ins',
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20'
    },
    {
      key: 'workout_timer_sessions',
      label: 'Workout Sessions',
      icon: <Timer className="w-5 h-5" />,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20'
    }
  ];

  const getUsageValue = (key: string): number => {
    return currentUsage?.[key as keyof typeof currentUsage] || 0;
  };

  const getLimit = (key: string): number => {
    return limits?.[key as keyof typeof limits] || 0;
  };

  const getPercentage = (key: string): number => {
    const limit = getLimit(key);
    if (limit === -1) return 0; // Unlimited
    if (limit === 0) return 100;
    return Math.min(100, (getUsageValue(key) / limit) * 100);
  };

  const isUnlimited = (key: string): boolean => {
    return getLimit(key) === -1;
  };

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader title="Usage Stats" onBack={() => navigate(-1)} />
      
      <div className="px-4 pb-24 max-w-2xl mx-auto" style={{ paddingTop: 'calc(80px + env(safe-area-inset-top))' }}>
        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">Plan</p>
                  <div className="flex items-center gap-2 mt-1">
                    {currentTier === 'premium' ? (
                      <Crown className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <Zap className="w-5 h-5 text-muted-foreground" />
                    )}
                    <span className="text-xl font-bold text-foreground capitalize">
                      {currentTier}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">Interactions</p>
                  <p className="text-2xl font-bold text-foreground">{totalInteractions}</p>
                </div>
              </div>

              {currentTier === 'free' && (
                <Button
                  onClick={() => navigate('/pricing')}
                  className="w-full mt-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Usage Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            This Month
          </h2>

          <div className="space-y-2">
            {usageItems.map((item, index) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.03 }}
              >
                <Card className="bg-card border-border">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${item.bgColor} flex items-center justify-center ${item.color}`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground truncate">
                            {item.label}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {isUnlimited(item.key) ? (
                              <span className="text-primary font-medium">∞</span>
                            ) : (
                              `${getUsageValue(item.key)}/${getLimit(item.key)}`
                            )}
                          </span>
                        </div>
                        {!isUnlimited(item.key) && (
                          <Progress 
                            value={getPercentage(item.key)} 
                            className="h-1.5"
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Info Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-muted-foreground text-xs mt-6"
        >
          Resets monthly.
          {currentTier === 'premium' && ' Premium = unlimited.'}
        </motion.p>
      </div>
    </div>
  );
};

export default Usage;

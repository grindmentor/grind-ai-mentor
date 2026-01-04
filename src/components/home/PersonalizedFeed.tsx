import React, { useMemo, useCallback, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  Dumbbell, 
  Utensils, 
  Sparkles, 
  TrendingUp,
  Flame,
  Zap,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useModuleNavigation } from '@/hooks/useModuleNavigation';
import { useNativeHaptics } from '@/hooks/useNativeHaptics';
import { Skeleton } from '@/components/ui/skeleton';
import { TodaysSession } from '@/components/dashboard/TodaysSession';

const quickActions = [
  {
    id: 'action-1',
    title: 'Log Workout',
    icon: Dumbbell,
    path: '/workout-logger',
    gradient: 'from-blue-500/15 to-cyan-500/10',
    border: 'border-blue-500/20',
    iconColor: 'text-blue-500'
  },
  {
    id: 'action-2', 
    title: 'Log Food',
    icon: Utensils,
    path: '/smart-food-log',
    gradient: 'from-green-500/15 to-emerald-500/10',
    border: 'border-green-500/20',
    iconColor: 'text-green-500'
  },
  {
    id: 'action-3',
    title: 'AI Coach',
    icon: Sparkles,
    path: '/coach-gpt',
    gradient: 'from-purple-500/15 to-violet-500/10',
    border: 'border-purple-500/20',
    iconColor: 'text-purple-500'
  }
];

const PersonalizedFeedComponent: React.FC = () => {
  const { user } = useAuth();
  const { navigateToModule } = useModuleNavigation();
  const { trigger } = useNativeHaptics();

  // Fetch recent workouts
  const { data: recentWorkouts, isLoading: workoutsLoading } = useQuery({
    queryKey: ['recent-workouts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('id, workout_name, duration_minutes, calories_burned, session_date')
        .eq('user_id', user.id)
        .order('session_date', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000
  });

  // Fetch recent food logs
  const { data: recentMeals, isLoading: mealsLoading } = useQuery({
    queryKey: ['recent-meals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('food_log_entries')
        .select('id, food_name, calories, protein, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000
  });

  // Calculate today's stats
  const todayStats = useMemo(() => {
    const today = new Date().toDateString();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const todaysCalories = recentMeals?.filter(m => 
      new Date(m.created_at).toDateString() === today
    ).reduce((sum, m) => sum + (m.calories || 0), 0) || 0;

    const todaysProtein = recentMeals?.filter(m => 
      new Date(m.created_at).toDateString() === today
    ).reduce((sum, m) => sum + (m.protein || 0), 0) || 0;

    const weeklyWorkouts = recentWorkouts?.filter(w => 
      new Date(w.session_date) > weekAgo
    ).length || 0;

    const todaysWorkouts = recentWorkouts?.filter(w => 
      new Date(w.session_date).toDateString() === today
    ).length || 0;

    return { todaysCalories, todaysProtein, weeklyWorkouts, todaysWorkouts };
  }, [recentMeals, recentWorkouts]);

  const handleActionPress = useCallback((path: string) => {
    trigger('light');
    navigateToModule(path);
  }, [trigger, navigateToModule]);

  const isLoading = workoutsLoading || mealsLoading;

  return (
    <div className="space-y-5">
      {/* Today's Workout Session */}
      <TodaysSession />
      
      {/* Quick Actions - Primary CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.25 }}
      >
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                onClick={() => handleActionPress(action.path)}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-2xl",
                  "bg-gradient-to-br border",
                  "active:scale-95 transition-transform touch-manipulation",
                  "min-h-[88px]",
                  action.gradient,
                  action.border
                )}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + index * 0.03, duration: 0.2 }}
                aria-label={action.title}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center mb-2",
                  "bg-background/50"
                )}>
                  <Icon className={cn("w-5 h-5", action.iconColor)} aria-hidden="true" />
                </div>
                <span className="text-xs font-semibold text-foreground">{action.title}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Today's Stats - Clean Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.25 }}
      >
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Target className="w-3.5 h-3.5" aria-hidden="true" />
          Today's Snapshot
        </h3>
        
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[72px] rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={Flame}
              label="Calories"
              value={todayStats.todaysCalories.toLocaleString()}
              iconColor="text-orange-500"
              bgColor="from-orange-500/10 to-red-500/5"
              borderColor="border-orange-500/20"
            />
            <StatCard
              icon={Zap}
              label="Protein"
              value={`${todayStats.todaysProtein}g`}
              iconColor="text-yellow-500"
              bgColor="from-yellow-500/10 to-amber-500/5"
              borderColor="border-yellow-500/20"
            />
            <StatCard
              icon={Dumbbell}
              label="Today"
              value={todayStats.todaysWorkouts === 0 ? 'Rest day' : `${todayStats.todaysWorkouts} workout${todayStats.todaysWorkouts > 1 ? 's' : ''}`}
              iconColor="text-blue-500"
              bgColor="from-blue-500/10 to-cyan-500/5"
              borderColor="border-blue-500/20"
            />
            <StatCard
              icon={TrendingUp}
              label="This Week"
              value={`${todayStats.weeklyWorkouts} workout${todayStats.weeklyWorkouts !== 1 ? 's' : ''}`}
              iconColor="text-emerald-500"
              bgColor="from-emerald-500/10 to-green-500/5"
              borderColor="border-emerald-500/20"
            />
          </div>
        )}
      </motion.div>
    </div>
  );
};

// Memoized stat card component
const StatCard = memo<{
  icon: React.ElementType;
  label: string;
  value: string;
  iconColor: string;
  bgColor: string;
  borderColor: string;
}>(({ icon: Icon, label, value, iconColor, bgColor, borderColor }) => (
  <div className={cn(
    "p-3.5 rounded-xl bg-gradient-to-br border min-h-[72px]",
    bgColor,
    borderColor
  )}>
    <div className="flex items-center gap-2 mb-1.5">
      <Icon className={cn("w-4 h-4", iconColor)} aria-hidden="true" />
      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
  </div>
));

StatCard.displayName = 'StatCard';

export const PersonalizedFeed = memo(PersonalizedFeedComponent);
export default PersonalizedFeed;

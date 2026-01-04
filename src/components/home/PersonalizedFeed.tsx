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
    path: '/workout-logger'
  },
  {
    id: 'action-2', 
    title: 'Log Food',
    icon: Utensils,
    path: '/smart-food-log'
  },
  {
    id: 'action-3',
    title: 'AI Coach',
    icon: Sparkles,
    path: '/coach-gpt'
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
                  "bg-muted/50 border border-border/40",
                  "hover:bg-muted active:scale-95 transition-all touch-manipulation",
                  "min-h-[88px]"
                )}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + index * 0.03, duration: 0.2 }}
                aria-label={action.title}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 bg-background">
                  <Icon className="w-5 h-5 text-foreground" aria-hidden="true" />
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
            />
            <StatCard
              icon={Zap}
              label="Protein"
              value={`${todayStats.todaysProtein}g`}
            />
            <StatCard
              icon={Dumbbell}
              label="Workouts"
              value={todayStats.todaysWorkouts === 0 ? 'None yet' : `${todayStats.todaysWorkouts} done`}
            />
            <StatCard
              icon={TrendingUp}
              label="This Week"
              value={`${todayStats.weeklyWorkouts} workout${todayStats.weeklyWorkouts !== 1 ? 's' : ''}`}
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
}>(({ icon: Icon, label, value }) => (
  <div className="p-3.5 rounded-xl bg-muted/50 border border-border/40 min-h-[72px]">
    <div className="flex items-center gap-2 mb-1.5">
      <Icon className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
  </div>
));

StatCard.displayName = 'StatCard';

export const PersonalizedFeed = memo(PersonalizedFeedComponent);
export default PersonalizedFeed;

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  Dumbbell, 
  Utensils, 
  Sparkles, 
  Calendar,
  Clock,
  TrendingUp,
  ChevronRight,
  Flame
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useNativeHaptics } from '@/hooks/useNativeHaptics';
import { Skeleton } from '@/components/ui/skeleton';

interface FeedItem {
  id: string;
  type: 'workout' | 'meal' | 'recommendation';
  title: string;
  subtitle: string;
  timestamp?: Date;
  icon: React.ElementType;
  color: string;
  action?: () => void;
}

const recommendations = [
  {
    id: 'rec-1',
    title: 'Log your workout',
    subtitle: "Track today's progress",
    icon: Dumbbell,
    path: '/workout-logger'
  },
  {
    id: 'rec-2', 
    title: 'Analyze your physique',
    subtitle: 'Get AI-powered insights',
    icon: Sparkles,
    path: '/physique-ai'
  },
  {
    id: 'rec-3',
    title: 'Plan your meals',
    subtitle: 'Smart nutrition tracking',
    icon: Utensils,
    path: '/smart-food-log'
  }
];

export const PersonalizedFeed: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { trigger } = useNativeHaptics();

  // Fetch recent workouts
  const { data: recentWorkouts, isLoading: workoutsLoading } = useQuery({
    queryKey: ['recent-workouts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('session_date', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000
  });

  // Fetch recent food logs
  const { data: recentMeals, isLoading: mealsLoading } = useQuery({
    queryKey: ['recent-meals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('food_log_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000
  });

  const feedItems = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [];

    // Add workouts
    recentWorkouts?.forEach((workout) => {
      items.push({
        id: `workout-${workout.id}`,
        type: 'workout',
        title: workout.workout_name || 'Workout',
        subtitle: `${workout.duration_minutes} min${workout.calories_burned ? ` • ${workout.calories_burned} cal` : ''}`,
        timestamp: new Date(workout.session_date),
        icon: Dumbbell,
        color: 'text-blue-500 bg-blue-500/10',
        action: () => navigate('/workout-logger')
      });
    });

    // Add meals
    recentMeals?.forEach((meal) => {
      items.push({
        id: `meal-${meal.id}`,
        type: 'meal',
        title: meal.food_name,
        subtitle: `${meal.calories || 0} cal • ${meal.protein || 0}g protein`,
        timestamp: new Date(meal.created_at),
        icon: Utensils,
        color: 'text-green-500 bg-green-500/10',
        action: () => navigate('/smart-food-log')
      });
    });

    // Sort by timestamp
    items.sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    return items.slice(0, 5);
  }, [recentWorkouts, recentMeals, navigate]);

  const handleItemPress = (item: FeedItem) => {
    trigger('light');
    item.action?.();
  };

  const handleRecommendationPress = (rec: typeof recommendations[0]) => {
    trigger('light');
    navigate(rec.path);
  };

  const isLoading = workoutsLoading || mealsLoading;

  return (
    <div className="space-y-6">
      {/* AI Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Suggested for you
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {recommendations.map((rec, index) => {
            const Icon = rec.icon;
            return (
              <motion.button
                key={rec.id}
                onClick={() => handleRecommendationPress(rec)}
                className="flex-shrink-0 p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 min-w-[140px] text-left active:scale-95 transition-transform"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="font-semibold text-foreground text-sm">{rec.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{rec.subtitle}</p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Recent Activity
        </h3>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : feedItems.length > 0 ? (
          <div className="space-y-2">
            {feedItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleItemPress(item)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 text-left active:scale-[0.98] transition-transform"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                    item.color
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                  </div>
                  {item.timestamp && (
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-card border border-border/50 text-center">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground mb-1">No activity yet</p>
            <p className="text-sm text-muted-foreground">
              Start logging workouts and meals to see your feed
            </p>
          </div>
        )}
      </motion.div>

      {/* Today's Stats Quick View */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-3"
      >
        <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-medium text-muted-foreground">Today's Calories</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {recentMeals?.filter(m => 
              new Date(m.created_at).toDateString() === new Date().toDateString()
            ).reduce((sum, m) => sum + (m.calories || 0), 0) || 0}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-muted-foreground">Workouts This Week</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {recentWorkouts?.filter(w => {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return new Date(w.session_date) > weekAgo;
            }).length || 0}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PersonalizedFeed;

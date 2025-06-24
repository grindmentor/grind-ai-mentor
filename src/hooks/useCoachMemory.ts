
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserContext {
  profile?: any;
  recentWorkouts?: any[];
  recentFoodLogs?: any[];
  progressData?: any[];
  tdeeData?: any;
  goals?: string;
  preferences?: any;
  lastUpdated: string;
}

export const useCoachMemory = () => {
  const { user } = useAuth();
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserContext = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Fetch recent workouts (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { data: recentWorkouts } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('session_date', weekAgo.toISOString().split('T')[0])
        .order('session_date', { ascending: false })
        .limit(10);

      // Fetch recent food logs (last 3 days)
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const { data: recentFoodLogs } = await supabase
        .from('food_log_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_date', threeDaysAgo.toISOString().split('T')[0])
        .order('logged_date', { ascending: false })
        .limit(20);

      // Fetch recent progress data
      const { data: progressData } = await supabase
        .from('progressive_overload_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('workout_date', { ascending: false })
        .limit(15);

      // Fetch latest TDEE calculation
      const { data: tdeeData } = await supabase
        .from('tdee_calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Fetch user preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const context: UserContext = {
        profile,
        recentWorkouts: recentWorkouts || [],
        recentFoodLogs: recentFoodLogs || [],
        progressData: progressData || [],
        tdeeData,
        preferences,
        lastUpdated: new Date().toISOString()
      };

      setUserContext(context);
    } catch (error) {
      console.error('Error fetching user context:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getContextPrompt = () => {
    if (!userContext) return '';

    const { profile, recentWorkouts, recentFoodLogs, progressData, tdeeData, preferences } = userContext;

    let contextPrompt = `# User Context & Memory\n\n`;

    // User Profile
    if (profile) {
      contextPrompt += `## User Profile\n`;
      contextPrompt += `- Name: ${profile.display_name || 'Not set'}\n`;
      contextPrompt += `- Age: ${profile.birthday ? Math.floor((Date.now() - new Date(profile.birthday).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 'Not set'}\n`;
      contextPrompt += `- Height: ${profile.height ? `${profile.height}cm` : 'Not set'}\n`;
      contextPrompt += `- Weight: ${profile.weight ? `${profile.weight}kg` : 'Not set'}\n`;
      contextPrompt += `- Goal: ${profile.goal || 'Not set'}\n`;
      contextPrompt += `- Experience: ${profile.experience || 'Not set'}\n`;
      contextPrompt += `- Activity Level: ${profile.activity || 'Not set'}\n\n`;
    }

    // TDEE & Nutrition
    if (tdeeData) {
      contextPrompt += `## Nutrition Baseline\n`;
      contextPrompt += `- TDEE: ${tdeeData.tdee} calories\n`;
      contextPrompt += `- BMR: ${tdeeData.bmr} calories\n`;
      contextPrompt += `- Recommended Calories: ${tdeeData.recommended_calories || 'Not calculated'}\n`;
      contextPrompt += `- Activity Level: ${tdeeData.activity_level}\n\n`;
    }

    // Recent Workouts
    if (recentWorkouts && recentWorkouts.length > 0) {
      contextPrompt += `## Recent Workouts (Last 7 Days)\n`;
      recentWorkouts.slice(0, 5).forEach((workout, index) => {
        contextPrompt += `${index + 1}. ${workout.workout_name} - ${workout.duration_minutes}min (${workout.session_date})\n`;
        if (workout.notes) contextPrompt += `   Notes: ${workout.notes}\n`;
      });
      contextPrompt += `\n`;
    }

    // Recent Nutrition
    if (recentFoodLogs && recentFoodLogs.length > 0) {
      const dailyTotals: { [key: string]: { calories: number; protein: number; carbs: number; fat: number } } = {};
      
      recentFoodLogs.forEach(entry => {
        const date = entry.logged_date;
        if (!dailyTotals[date]) {
          dailyTotals[date] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        }
        dailyTotals[date].calories += entry.calories || 0;
        dailyTotals[date].protein += entry.protein || 0;
        dailyTotals[date].carbs += entry.carbs || 0;
        dailyTotals[date].fat += entry.fat || 0;
      });

      contextPrompt += `## Recent Nutrition (Last 3 Days)\n`;
      Object.entries(dailyTotals).slice(0, 3).forEach(([date, totals]) => {
        contextPrompt += `${date}: ${totals.calories} cal | ${totals.protein}g protein | ${totals.carbs}g carbs | ${totals.fat}g fat\n`;
      });
      contextPrompt += `\n`;
    }

    // Progress Data
    if (progressData && progressData.length > 0) {
      contextPrompt += `## Recent Strength Progress\n`;
      const exerciseProgress: { [key: string]: any[] } = {};
      
      progressData.forEach(entry => {
        if (!exerciseProgress[entry.exercise_name]) {
          exerciseProgress[entry.exercise_name] = [];
        }
        exerciseProgress[entry.exercise_name].push(entry);
      });

      Object.entries(exerciseProgress).slice(0, 5).forEach(([exercise, entries]) => {
        const latest = entries[0];
        contextPrompt += `${exercise}: ${latest.weight}kg x ${latest.reps} (${latest.sets} sets) - ${latest.workout_date}\n`;
      });
      contextPrompt += `\n`;
    }

    // Preferences
    if (preferences) {
      contextPrompt += `## User Preferences\n`;
      contextPrompt += `- Weight Unit: ${preferences.weight_unit || 'lbs'}\n`;
      contextPrompt += `- Height Unit: ${preferences.height_unit || 'ft-in'}\n`;
      contextPrompt += `- Dark Mode: ${preferences.dark_mode ? 'Yes' : 'No'}\n\n`;
    }

    contextPrompt += `**Important**: Use this context to provide personalized, consistent coaching. Reference specific workouts, nutrition patterns, and progress when relevant. Always maintain continuity with previous conversations and user data.\n\n`;

    return contextPrompt;
  };

  useEffect(() => {
    if (user) {
      fetchUserContext();
    }
  }, [user]);

  return {
    userContext,
    isLoading,
    fetchUserContext,
    getContextPrompt
  };
};

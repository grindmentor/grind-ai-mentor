
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UsageContextType {
  coachGptQueries: number;
  mealPlanGenerations: number;
  foodLogAnalyses: number;
  tdeeCalculations: number;
  habitChecks: number;
  trainingPrograms: number;
  progressAnalyses: number;
  cutCalcUses: number;
  workoutTimerSessions: number;
  incrementUsage: (type: UsageType) => void;
  isLoading: boolean;
}

export type UsageType = 
  | 'coachGptQueries'
  | 'mealPlanGenerations'
  | 'foodLogAnalyses'
  | 'tdeeCalculations'
  | 'habitChecks'
  | 'trainingPrograms'
  | 'progressAnalyses'
  | 'cutCalcUses'
  | 'workoutTimerSessions';

const UsageContext = createContext<UsageContextType | undefined>(undefined);

export const UsageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [usage, setUsage] = useState({
    coachGptQueries: 0,
    mealPlanGenerations: 0,
    foodLogAnalyses: 0,
    tdeeCalculations: 0,
    habitChecks: 0,
    trainingPrograms: 0,
    progressAnalyses: 0,
    cutCalcUses: 0,
    workoutTimerSessions: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUsage();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadUsage = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_current_usage', {
        p_user_id: user.id
      });

      if (data && data.length > 0 && !error) {
        const currentUsage = data[0];
        setUsage({
          coachGptQueries: currentUsage.coach_gpt_queries || 0,
          mealPlanGenerations: currentUsage.meal_plan_generations || 0,
          foodLogAnalyses: currentUsage.food_log_analyses || 0,
          tdeeCalculations: currentUsage.tdee_calculations || 0,
          habitChecks: currentUsage.habit_checks || 0,
          trainingPrograms: currentUsage.training_programs || 0,
          progressAnalyses: currentUsage.progress_analyses || 0,
          cutCalcUses: currentUsage.cut_calc_uses || 0,
          workoutTimerSessions: currentUsage.workout_timer_sessions || 0
        });
      }
    } catch (error) {
      console.error('Error loading usage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const incrementUsage = async (type: UsageType) => {
    if (!user) return;

    // Update local state immediately
    setUsage(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));

    // Update database
    try {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      
      const { error } = await supabase
        .from('user_usage')
        .upsert({
          user_id: user.id,
          month_year: currentMonth,
          [getDbFieldName(type)]: usage[type] + 1
        }, {
          onConflict: 'user_id,month_year'
        });

      if (error) {
        console.error('Error updating usage:', error);
        // Revert local state if database update fails
        setUsage(prev => ({
          ...prev,
          [type]: prev[type] - 1
        }));
      }
    } catch (error) {
      console.error('Error updating usage:', error);
    }
  };

  const getDbFieldName = (type: UsageType): string => {
    const mapping: Record<UsageType, string> = {
      coachGptQueries: 'coach_gpt_queries',
      mealPlanGenerations: 'meal_plan_generations',
      foodLogAnalyses: 'food_log_analyses',
      tdeeCalculations: 'tdee_calculations',
      habitChecks: 'habit_checks',
      trainingPrograms: 'training_programs',
      progressAnalyses: 'progress_analyses',
      cutCalcUses: 'cut_calc_uses',
      workoutTimerSessions: 'workout_timer_sessions'
    };
    return mapping[type];
  };

  return (
    <UsageContext.Provider value={{
      ...usage,
      incrementUsage,
      isLoading
    }}>
      {children}
    </UsageContext.Provider>
  );
};

export const useUsage = () => {
  const context = useContext(UsageContext);
  if (context === undefined) {
    throw new Error('useUsage must be used within a UsageProvider');
  }
  return context;
};

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  CheckCircle, 
  Play, 
  Trash2, 
  Clock,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useActivePlan, ActivePlan } from '@/hooks/useActivePlan';
import { useNativeHaptics } from '@/hooks/useNativeHaptics';
import { WorkoutTemplate } from '@/data/expandedWorkoutTemplates';
import { Skeleton } from '@/components/ui/skeleton';

interface SavedPlansSectionProps {
  onSelectTemplate: (template: WorkoutTemplate) => void;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SavedPlansSectionComponent: React.FC<SavedPlansSectionProps> = ({ onSelectTemplate }) => {
  const { 
    allPlans, 
    activePlan, 
    isLoadingAllPlans,
    switchPlan,
    isSwitching,
    deletePlan,
    stopPlan
  } = useActivePlan();
  const { trigger } = useNativeHaptics();

  const handleSwitchPlan = (planId: string) => {
    trigger('medium');
    switchPlan(planId);
  };

  const handleDeletePlan = (planId: string) => {
    trigger('light');
    if (confirm('Delete this plan? This will remove all scheduled workouts.')) {
      deletePlan(planId);
    }
  };

  const handleStopPlan = () => {
    trigger('light');
    stopPlan();
  };

  const formatScheduleDays = (plan: ActivePlan) => {
    return plan.schedule
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
      .map(s => DAY_NAMES[s.dayOfWeek])
      .join(', ');
  };

  if (isLoadingAllPlans) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-[100px] rounded-2xl" />
        <Skeleton className="h-[100px] rounded-2xl" />
      </div>
    );
  }

  // No saved plans
  if (allPlans.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
          <Calendar className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">No Saved Plans</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
          Browse programs below and follow one to create your first workout plan.
        </p>
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <span>Scroll down</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Active Plan Section */}
      {activePlan && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active Plan
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStopPlan}
              className="text-xs text-muted-foreground h-7 px-2"
            >
              Pause
            </Button>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-4 rounded-2xl",
              "bg-gradient-to-br from-primary/15 to-primary/5",
              "border-2 border-primary/30"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-foreground">{activePlan.template_title}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatScheduleDays(activePlan)}
                </p>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30 text-[10px]">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{activePlan.schedule.length}x per week</span>
              <span className="text-border">•</span>
              <span>Week {activePlan.current_week}</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Saved Plans (inactive) */}
      {allPlans.filter(p => !p.is_active).length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Saved Plans</h3>
          <div className="space-y-2">
            {allPlans
              .filter(p => !p.is_active)
              .map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "p-4 rounded-xl",
                    "bg-card/50 border border-border/50",
                    "hover:border-muted-foreground/50 transition-colors"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-sm truncate">
                        {plan.template_title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatScheduleDays(plan)}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSwitchPlan(plan.id)}
                        disabled={isSwitching}
                        className="h-8 w-8 p-0 text-primary hover:bg-primary/10"
                        aria-label="Activate this plan"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeletePlan(plan.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        aria-label="Delete plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{plan.schedule.length}x per week</span>
                    <span className="text-border">•</span>
                    <span>Created {new Date(plan.created_at).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      )}

      {/* Quick tip */}
      <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          <span className="font-medium text-foreground">Tip:</span> You can save multiple plans and switch between them anytime.
        </p>
      </div>
    </div>
  );
};

export const SavedPlansSection = memo(SavedPlansSectionComponent);
export default SavedPlansSection;

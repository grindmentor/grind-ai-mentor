
-- Add notification_preferences column to user_preferences table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'notification_preferences'
    ) THEN
        ALTER TABLE public.user_preferences 
        ADD COLUMN notification_preferences jsonb DEFAULT '{
            "hydrationReminders": false,
            "workoutReminders": false,
            "achievementAlerts": false,
            "progressUpdates": false,
            "nutritionTips": false,
            "recoveryAlerts": false,
            "goalDeadlines": false,
            "weeklyReports": false
        }'::jsonb;
    END IF;
END $$;

-- Create user_notifications table for storing user notifications
CREATE TABLE IF NOT EXISTS public.user_notifications (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL DEFAULT 'info',
    read boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on user_notifications
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_notifications
CREATE POLICY "Users can view their own notifications" 
ON public.user_notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.user_notifications FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
ON public.user_notifications FOR DELETE 
USING (auth.uid() = user_id);

-- Add achievements data table for showing available achievements
CREATE TABLE IF NOT EXISTS public.available_achievements (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    category text NOT NULL DEFAULT 'General',
    points integer NOT NULL DEFAULT 0,
    icon_name text DEFAULT 'trophy',
    unlock_criteria jsonb NOT NULL DEFAULT '{}',
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert some sample achievements
INSERT INTO public.available_achievements (title, description, category, points, icon_name, unlock_criteria) VALUES
('First Workout', 'Complete your first workout session', 'Training', 10, 'dumbbell', '{"workouts_completed": 1}'),
('Consistent Week', 'Work out 5 times in one week', 'Training', 25, 'calendar-check', '{"weekly_workouts": 5}'),
('Nutrition Tracker', 'Log food for 7 consecutive days', 'Nutrition', 20, 'apple', '{"consecutive_food_logs": 7}'),
('Goal Setter', 'Create your first fitness goal', 'Goals', 15, 'target', '{"goals_created": 1}'),
('Progress Photographer', 'Upload your first progress photo', 'Progress', 10, 'camera', '{"progress_photos": 1}')
ON CONFLICT DO NOTHING;

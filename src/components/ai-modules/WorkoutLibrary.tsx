
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Dumbbell, Target, Zap, Heart, Users, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserData } from '@/contexts/UserDataContext';
import FormattedAIResponse from '../FormattedAIResponse';

interface WorkoutLibraryProps {
  onBack: () => void;
}

interface ExerciseCategory {
  name: string;
  icon: React.ReactNode;
  description: string;
  examples: string[];
}

const WorkoutLibrary: React.FC<WorkoutLibraryProps> = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { getCleanUserContext } = useUserData();

  const categories: ExerciseCategory[] = [
    {
      name: 'Strength Training',
      icon: <Dumbbell className="w-5 h-5" />,
      description: 'Build muscle and strength with compound movements',
      examples: ['Deadlifts', 'Squats', 'Bench Press', 'Pull-ups']
    },
    {
      name: 'Cardio & Conditioning',
      icon: <Heart className="w-5 h-5" />,
      description: 'Improve cardiovascular health and endurance',
      examples: ['HIIT', 'Running', 'Cycling', 'Rowing']
    },
    {
      name: 'Functional Training',
      icon: <Target className="w-5 h-5" />,
      description: 'Movement patterns for daily life activities',
      examples: ['Kettlebell Swings', 'Turkish Get-ups', 'Farmer Walks']
    },
    {
      name: 'High-Intensity',
      icon: <Zap className="w-5 h-5" />,
      description: 'Time-efficient workouts for maximum results',
      examples: ['Burpees', 'Mountain Climbers', 'Battle Ropes']
    },
    {
      name: 'Group Workouts',
      icon: <Users className="w-5 h-5" />,
      description: 'Exercises perfect for training with others',
      examples: ['Partner Exercises', 'Team Challenges', 'Circuit Training']
    },
    {
      name: 'Quick Sessions',
      icon: <Clock className="w-5 h-5" />,
      description: '15-30 minute efficient workouts',
      examples: ['Tabata', 'Quick HIIT', 'Express Strength']
    }
  ];

  const handleCategorySelect = async (category: ExerciseCategory) => {
    setSelectedCategory(category.name);
    setIsLoading(true);
    setAiResponse('');

    try {
      const userContext = getCleanUserContext();
      
      const prompt = `${userContext}

Generate a comprehensive exercise guide for "${category.name}" based on the latest 2024 exercise science research. Include:

## Exercise Selection
- 8-10 specific exercises with proper form cues
- Beginner, intermediate, and advanced variations
- Equipment needed for each exercise
- Primary and secondary muscles worked

## Scientific Rationale
- Recent 2024 research supporting these exercise choices
- Biomechanical benefits and movement patterns
- Injury prevention considerations
- Performance optimization tips

## Programming Guidelines
- Sets and reps recommendations based on goals
- Rest periods between sets
- Weekly frequency suggestions
- Progressive overload strategies

## Form & Technique
- Step-by-step execution for key exercises
- Common mistakes to avoid
- Breathing patterns
- Setup and safety considerations

Base all recommendations on peer-reviewed exercise physiology research from 2023-2024, particularly focusing on optimal training methodologies and biomechanical efficiency.`;

      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: {
          prompt,
          feature: 'workout_library'
        }
      });

      if (error) throw error;
      setAiResponse(data.response);
    } catch (error) {
      console.error('Error generating workout guide:', error);
      setAiResponse('Sorry, there was an error generating the workout guide. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setAiResponse('');
  };

  if (selectedCategory) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            onClick={handleBackToCategories}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-white">{selectedCategory}</h2>
            <p className="text-slate-400">Science-based exercise guide</p>
          </div>
        </div>

        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="ml-3 text-slate-400">Generating exercise guide...</span>
              </div>
            ) : aiResponse ? (
              <FormattedAIResponse content={aiResponse} />
            ) : (
              <div className="text-center py-8 text-slate-400">
                Select a category to view exercises
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-white">Exercise Library</h2>
          <p className="text-slate-400">Science-backed exercise guides and techniques</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card 
            key={category.name}
            className="bg-slate-900 border-slate-700 hover:border-slate-600 transition-all duration-200 cursor-pointer group"
            onClick={() => handleCategorySelect(category)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center space-x-3 text-lg group-hover:text-orange-400 transition-colors">
                <div className="text-slate-400 group-hover:text-orange-400 transition-colors">
                  {category.icon}
                </div>
                <span>{category.name}</span>
              </CardTitle>
              <CardDescription className="text-slate-400 text-sm">
                {category.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-1">
                {category.examples.slice(0, 3).map((example, index) => (
                  <span 
                    key={index}
                    className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-md"
                  >
                    {example}
                  </span>
                ))}
                {category.examples.length > 3 && (
                  <span className="text-xs text-slate-500 px-2 py-1">
                    +{category.examples.length - 3} more
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WorkoutLibrary;

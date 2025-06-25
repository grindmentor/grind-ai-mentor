
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Dumbbell, Target, Zap, Heart, Users, Clock, Sparkles, Brain } from 'lucide-react';
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
  gradient: string;
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
      examples: ['Deadlifts', 'Squats', 'Bench Press', 'Pull-ups'],
      gradient: 'from-red-500 to-orange-600'
    },
    {
      name: 'Cardio & Conditioning',
      icon: <Heart className="w-5 h-5" />,
      description: 'Improve cardiovascular health and endurance',
      examples: ['HIIT', 'Running', 'Cycling', 'Rowing'],
      gradient: 'from-pink-500 to-red-600'
    },
    {
      name: 'Functional Training',
      icon: <Target className="w-5 h-5" />,
      description: 'Movement patterns for daily life activities',
      examples: ['Kettlebell Swings', 'Turkish Get-ups', 'Farmer Walks'],
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      name: 'High-Intensity',
      icon: <Zap className="w-5 h-5" />,
      description: 'Time-efficient workouts for maximum results',
      examples: ['Burpees', 'Mountain Climbers', 'Battle Ropes'],
      gradient: 'from-yellow-500 to-orange-600'
    },
    {
      name: 'Group Workouts',
      icon: <Users className="w-5 h-5" />,
      description: 'Exercises perfect for training with others',
      examples: ['Partner Exercises', 'Team Challenges', 'Circuit Training'],
      gradient: 'from-purple-500 to-indigo-600'
    },
    {
      name: 'Quick Sessions',
      icon: <Clock className="w-5 h-5" />,
      description: '15-30 minute efficient workouts',
      examples: ['Tabata', 'Quick HIIT', 'Express Strength'],
      gradient: 'from-green-500 to-emerald-600'
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
    const category = categories.find(c => c.name === selectedCategory);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
        <div className="p-6">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={handleBackToCategories}
                className="text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Categories
              </Button>
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 bg-gradient-to-r ${category?.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <div className="text-white">
                    {category?.icon}
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{selectedCategory}</h1>
                  <p className="text-slate-400">Science-based exercise guide</p>
                </div>
              </div>
            </div>

            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="p-8">
                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                      <h3 className="text-white font-medium mb-2">Generating Exercise Guide</h3>
                      <p className="text-slate-400 text-sm">Analyzing latest 2024 research...</p>
                    </div>
                  </div>
                ) : aiResponse ? (
                  <FormattedAIResponse content={aiResponse} />
                ) : (
                  <div className="text-center py-16 text-slate-400">
                    Select a category to view exercises
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Dashboard
            </Button>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  Exercise Library
                </h1>
                <p className="text-slate-400 text-lg">Science-backed exercise guides and techniques</p>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <div className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-4 py-2 rounded-full text-sm flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              Research-backed exercise science from 2024
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card 
                key={category.name}
                className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-200 cursor-pointer group"
                onClick={() => handleCategorySelect(category)}
              >
                <CardHeader className="pb-4">
                  <div className={`w-14 h-14 bg-gradient-to-r ${category.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200`}>
                    <div className="text-white">
                      {category.icon}
                    </div>
                  </div>
                  <CardTitle className="text-white text-xl group-hover:text-orange-400 transition-colors">
                    {category.name}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="text-white font-medium text-sm">Featured Exercises:</h4>
                    <div className="flex flex-wrap gap-2">
                      {category.examples.slice(0, 3).map((example, index) => (
                        <span 
                          key={index}
                          className="text-xs bg-slate-800/50 text-slate-300 px-3 py-1 rounded-full border border-slate-700/50"
                        >
                          {example}
                        </span>
                      ))}
                      {category.examples.length > 3 && (
                        <span className="text-xs text-slate-500 px-3 py-1">
                          +{category.examples.length - 3} more
                        </span>
                      )}
                    </div>
                    <div className="pt-2">
                      <div className="flex items-center text-orange-400 text-sm group-hover:text-orange-300 transition-colors">
                        <span>Explore Exercises</span>
                        <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutLibrary;

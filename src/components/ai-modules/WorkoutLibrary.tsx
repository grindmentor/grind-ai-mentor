
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Dumbbell, Target, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import FormattedAIResponse from '../FormattedAIResponse';

interface WorkoutLibraryProps {
  onBack: () => void;
}

const WorkoutLibrary: React.FC<WorkoutLibraryProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [exerciseInfo, setExerciseInfo] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const exerciseCategories = [
    { name: 'Chest', icon: '💪', description: 'Bench press, push-ups, flyes' },
    { name: 'Back', icon: '🔄', description: 'Pull-ups, rows, deadlifts' },
    { name: 'Shoulders', icon: '🌟', description: 'Press, raises, shrugs' },
    { name: 'Arms', icon: '💪', description: 'Biceps, triceps, forearms' },
    { name: 'Legs', icon: '🦵', description: 'Squats, lunges, calves' },
    { name: 'Core', icon: '⚡', description: 'Planks, crunches, twists' },
    { name: 'Cardio', icon: '❤️', description: 'Running, cycling, HIIT' },
    { name: 'Full Body', icon: '🏋️', description: 'Compound movements' }
  ];

  const searchExerciseInfo = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setExerciseInfo('');

    try {
      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: {
          prompt: `Provide comprehensive information about "${query}" exercise(s). Use the latest 2024 exercise science research and biomechanics studies. Include:

## Exercise Overview
- Primary muscles worked
- Secondary muscles worked
- Movement pattern and biomechanics
- Equipment needed

## Proper Form & Technique
- Step-by-step execution guide
- Common mistakes to avoid (cite 2024 injury prevention research)
- Breathing pattern
- Range of motion considerations

## Programming Guidelines
- Beginner recommendations (sets, reps, frequency)
- Intermediate progression
- Advanced variations
- Rest periods between sets

## Scientific Benefits
- Muscle activation patterns (reference recent EMG studies if available)
- Strength and hypertrophy benefits
- Functional movement benefits
- Injury prevention aspects

## Variations & Progressions
- Easier modifications for beginners
- Advanced variations
- Equipment alternatives
- Similar exercises for muscle groups

## Safety Considerations
- Contraindications
- Who should avoid this exercise
- Injury prevention tips based on 2024 research

Base all recommendations on peer-reviewed exercise science research from 2023-2024, particularly biomechanics, sports medicine, and strength training studies. Be specific, practical, and science-backed.`,
          feature: 'training_programs'
        }
      });

      if (error) throw error;
      setExerciseInfo(data.response);
    } catch (error) {
      console.error('Error searching exercise:', error);
      toast.error('Failed to get exercise information');
    } finally {
      setIsSearching(false);
    }
  };

  const searchCategoryExercises = async (category: string) => {
    setSelectedCategory(category);
    setIsSearching(true);
    setExerciseInfo('');

    try {
      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: {
          prompt: `Provide a comprehensive guide to ${category.toLowerCase()} exercises. Use the latest 2024 exercise science and training research. Include:

## Best ${category} Exercises
List 8-12 top exercises for ${category.toLowerCase()} development, including:
- Primary compound movements
- Isolation exercises  
- Bodyweight alternatives
- Equipment-based options

For each exercise, provide:
- **Exercise Name**
- Primary muscles targeted
- Difficulty level (Beginner/Intermediate/Advanced)
- Equipment needed
- Key benefits

## Training Principles for ${category}
- Optimal training frequency (cite 2024 research)
- Volume recommendations (sets/reps)
- Progressive overload strategies
- Recovery considerations

## Program Structure Examples
- Beginner ${category.toLowerCase()} routine
- Intermediate progression
- Advanced training methods

## Common Mistakes & Injury Prevention
- Most frequent form errors
- How to prevent common ${category.toLowerCase()} injuries
- Red flags to watch for

## Evidence-Based Recommendations
- Latest research on ${category.toLowerCase()} training (2023-2024 studies)
- Optimal programming based on current science
- Muscle activation research findings

Format the response clearly with proper headings and structure. Base all recommendations on peer-reviewed research from 2023-2024.`,
          feature: 'training_programs'
        }
      });

      if (error) throw error;
      setExerciseInfo(data.response);
    } catch (error) {
      console.error('Error getting category info:', error);
      toast.error('Failed to get exercise category information');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-white">Exercise Library</h2>
            <p className="text-gray-400">AI-powered exercise guidance and information</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Search Exercises</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-3">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for any exercise (e.g., bench press, squats, deadlift)"
              className="bg-gray-800 border-gray-700 text-white"
              onKeyPress={(e) => e.key === 'Enter' && searchExerciseInfo(searchQuery)}
            />
            <Button
              onClick={() => searchExerciseInfo(searchQuery)}
              disabled={isSearching || !searchQuery.trim()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-blue-400 font-medium mb-2">AI-Powered Exercise Guide</h4>
                <p className="text-sm text-gray-300">
                  Search for any exercise or muscle group to get comprehensive, science-based guidance including 
                  proper form, programming, variations, and the latest research from 2024 studies.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Categories */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Browse by Muscle Group</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {exerciseCategories.map((category) => (
              <Button
                key={category.name}
                onClick={() => searchCategoryExercises(category.name)}
                disabled={isSearching}
                variant="outline"
                className={`h-auto p-4 border-gray-700 hover:bg-gray-800 transition-colors ${
                  selectedCategory === category.name ? 'bg-orange-600 border-orange-600 text-white' : 'text-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <div className="font-medium">{category.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{category.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isSearching && (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <div>
                <h3 className="text-lg font-medium text-white">Analyzing Exercise</h3>
                <p className="text-gray-400">Gathering the latest science-based information...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise Information */}
      {exerciseInfo && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Dumbbell className="w-5 h-5" />
              <span>Exercise Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormattedAIResponse content={exerciseInfo} />
          </CardContent>
        </Card>
      )}

      {/* Getting Started */}
      {!exerciseInfo && !isSearching && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Welcome to the Exercise Library</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-300 space-y-4">
              <p>
                Get comprehensive, science-based exercise guidance powered by AI. Our library provides:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                  <span>Detailed form and technique instructions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                  <span>Programming recommendations based on 2024 research</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                  <span>Exercise variations and progressions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                  <span>Injury prevention and safety guidelines</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                  <span>Latest scientific findings and muscle activation data</span>
                </li>
              </ul>
              <p className="text-sm text-gray-400 mt-4">
                Start by searching for a specific exercise or browse exercises by muscle group above.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkoutLibrary;

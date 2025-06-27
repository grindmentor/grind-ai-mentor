
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Dumbbell, Book } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MobileOptimized, TouchButton } from '@/components/ui/mobile-optimized';

interface SimpleWorkoutLibraryProps {
  onBack: () => void;
}

// Sample exercise data to avoid database dependencies
const sampleExercises = [
  {
    id: '1',
    name: 'Push-ups',
    primary_muscles: ['Chest', 'Triceps'],
    equipment: 'Bodyweight',
    instructions: 'Start in a plank position with your hands slightly wider than shoulder-width apart. Lower your body until your chest nearly touches the floor, then push back up to the starting position.'
  },
  {
    id: '2',
    name: 'Squats',
    primary_muscles: ['Quadriceps', 'Glutes'],
    equipment: 'Bodyweight',
    instructions: 'Stand with feet shoulder-width apart, lower your body as if sitting back into a chair, keeping your chest up and knees behind your toes.'
  },
  {
    id: '3',
    name: 'Deadlifts',
    primary_muscles: ['Hamstrings', 'Glutes', 'Back'],
    equipment: 'Barbell',
    instructions: 'Stand with feet hip-width apart, bend at hips and knees to lower down and grab the barbell, then drive through your heels to stand up straight.'
  },
  {
    id: '4',
    name: 'Pull-ups',
    primary_muscles: ['Back', 'Biceps'],
    equipment: 'Pull-up bar',
    instructions: 'Hang from a pull-up bar with hands slightly wider than shoulder-width, pull your body up until your chin clears the bar.'
  },
  {
    id: '5',
    name: 'Bench Press',
    primary_muscles: ['Chest', 'Triceps'],
    equipment: 'Barbell',
    instructions: 'Lie on a bench with feet flat on the floor, grip the barbell slightly wider than shoulder-width, lower to chest and press back up.'
  }
];

const SimpleWorkoutLibrary: React.FC<SimpleWorkoutLibraryProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'programs' | 'exercises'>('exercises');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExercises = sampleExercises.filter(exercise => 
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.primary_muscles.some(muscle => muscle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <MobileOptimized className="min-h-screen bg-gradient-to-br from-black via-blue-900/10 to-blue-800/20 text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <TouchButton
              onClick={onBack}
              className="text-white hover:bg-blue-500/20 backdrop-blur-sm hover:text-blue-400 transition-all duration-200 font-medium flex items-center space-x-2 px-3 py-2 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </TouchButton>
            
            <h1 className="text-lg font-semibold text-center flex-1 px-4 truncate">
              Workout Library
            </h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-2">
          <TouchButton
            onClick={() => setActiveTab('programs')}
            className={`transition-all duration-200 text-sm sm:text-base px-4 py-2 rounded-xl font-medium ${
              activeTab === 'programs'
                ? 'bg-blue-500/30 text-blue-300 border border-blue-400/50'
                : 'border border-blue-500/30 text-blue-400 hover:bg-blue-500/20'
            }`}
          >
            <Dumbbell className="w-4 h-4 mr-2" />
            Programs
          </TouchButton>
          
          <TouchButton
            onClick={() => setActiveTab('exercises')}
            className={`transition-all duration-200 text-sm sm:text-base px-4 py-2 rounded-xl font-medium ${
              activeTab === 'exercises'
                ? 'bg-blue-500/30 text-blue-300 border border-blue-400/50'
                : 'border border-blue-500/30 text-blue-400 hover:bg-blue-500/20'
            }`}
          >
            <Book className="w-4 h-4 mr-2" />
            Exercises
          </TouchButton>
        </div>

        {/* Search */}
        {activeTab === 'exercises' && (
          <div className="space-y-4 bg-gradient-to-r from-blue-900/20 to-blue-800/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-4 sm:p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 pointer-events-none" />
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-blue-800/30 border-blue-500/40 text-white placeholder:text-blue-300/70 h-14 text-lg focus:border-blue-400 rounded-xl transition-all duration-200"
              />
            </div>
          </div>
        )}

        {/* Content */}
        {activeTab === 'programs' ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Dumbbell className="w-10 h-10 text-blue-400/50" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">Workout Programs Coming Soon</h3>
            <p className="text-blue-300/70 text-lg">Stay tuned for our curated workout programs</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map((exercise) => (
              <Card key={exercise.id} className="bg-blue-900/40 border-blue-600/50 backdrop-blur-sm hover:bg-blue-900/60 transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Dumbbell className="w-5 h-5 text-blue-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-white text-base font-semibold leading-tight">
                        {exercise.name}
                      </CardTitle>
                      <CardDescription className="text-blue-200/70 text-sm mt-1">
                        {exercise.primary_muscles.join(', ')}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-blue-200/80 text-sm leading-relaxed mb-3">
                    {exercise.instructions.substring(0, 120)}...
                  </p>
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    {exercise.equipment}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MobileOptimized>
  );
};

export default SimpleWorkoutLibrary;

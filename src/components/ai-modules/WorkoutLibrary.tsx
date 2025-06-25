
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BarChart3, ArrowLeft, Search, Filter, Play, Target, Dumbbell, Clock } from "lucide-react";
import { useState, useEffect } from "react";

interface WorkoutLibraryProps {
  onBack: () => void;
}

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_groups: string[];
  equipment: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  instructions: string[];
}

const WorkoutLibrary = ({ onBack }: WorkoutLibraryProps) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load sample exercises
    const sampleExercises: Exercise[] = [
      {
        id: '1',
        name: 'Push-ups',
        category: 'chest',
        muscle_groups: ['chest', 'shoulders', 'triceps'],
        equipment: 'bodyweight',
        difficulty: 'beginner',
        description: 'Classic upper body exercise targeting chest, shoulders, and triceps.',
        instructions: [
          'Start in plank position with hands shoulder-width apart',
          'Lower your body until chest nearly touches the floor',
          'Push back up to starting position',
          'Keep your body in a straight line throughout'
        ]
      },
      {
        id: '2',
        name: 'Squats',
        category: 'legs',
        muscle_groups: ['quadriceps', 'glutes', 'hamstrings'],
        equipment: 'bodyweight',
        difficulty: 'beginner',
        description: 'Fundamental lower body exercise for leg and glute strength.',
        instructions: [
          'Stand with feet shoulder-width apart',
          'Lower your body by pushing hips back and bending knees',
          'Keep chest up and weight on heels',
          'Push through heels to return to standing'
        ]
      },
      {
        id: '3',
        name: 'Deadlifts',
        category: 'back',
        muscle_groups: ['hamstrings', 'glutes', 'lower back'],
        equipment: 'barbell',
        difficulty: 'intermediate',
        description: 'Compound movement targeting posterior chain muscles.',
        instructions: [
          'Stand with feet hip-width apart, bar over mid-foot',
          'Hinge at hips and bend knees to grip the bar',
          'Keep chest up and back straight',
          'Drive through heels to lift the bar',
          'Reverse the movement to lower the bar'
        ]
      }
    ];
    
    setExercises(sampleExercises);
    setIsLoading(false);
  }, []);

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.muscle_groups.some(muscle => muscle.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || exercise.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = ['all', 'chest', 'back', 'legs', 'shoulders', 'arms', 'core'];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-900 via-violet-800 to-purple-900 text-white flex items-center justify-center" style={{fontFamily: 'Montserrat, sans-serif'}}>
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-400"></div>
          <span className="text-violet-200">Loading exercise library...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-violet-800 to-purple-900 text-white p-6" style={{fontFamily: 'Montserrat, sans-serif'}}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={onBack} 
              className="text-violet-200 hover:text-white hover:bg-violet-800/50"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Dashboard
            </Button>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-violet-700 rounded-2xl flex items-center justify-center shadow-xl shadow-violet-500/25">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-300 to-purple-200 bg-clip-text text-transparent">
                  Exercise Library
                </h1>
                <p className="text-violet-200 text-lg">Comprehensive database of exercises with detailed instructions</p>
              </div>
            </div>
          </div>
          
          <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 px-4 py-2">
            <Dumbbell className="w-4 h-4 mr-2" />
            {exercises.length} Exercises
          </Badge>
        </div>

        {/* Search and Filter Bar */}
        <Card className="bg-violet-900/50 border-violet-600/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-400 w-4 h-4" />
                  <Input
                    placeholder="Search exercises or muscle groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-violet-800/30 border-violet-600/50 text-white focus:border-violet-500"
                  />
                </div>
              </div>
              
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 bg-violet-800/30 border border-violet-600/50 text-white rounded-lg focus:border-violet-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full p-3 bg-violet-800/30 border border-violet-600/50 text-white rounded-lg focus:border-violet-500"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty === 'all' ? 'All Levels' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exercise Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <Card key={exercise.id} className="bg-violet-900/50 border-violet-600/50 backdrop-blur-sm hover:bg-violet-800/50 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white text-lg">{exercise.name}</CardTitle>
                    <CardDescription className="text-violet-200 capitalize">
                      {exercise.category} • {exercise.equipment}
                    </CardDescription>
                  </div>
                  <Badge className={getDifficultyColor(exercise.difficulty)}>
                    {exercise.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-violet-200 text-sm">{exercise.description}</p>
                
                <div className="flex flex-wrap gap-1">
                  {exercise.muscle_groups.map((muscle) => (
                    <Badge key={muscle} className="bg-violet-600/20 text-violet-300 border-violet-500/30 text-xs">
                      {muscle}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className="text-white font-medium text-sm">Instructions:</h4>
                  <ol className="text-violet-200 text-xs space-y-1">
                    {exercise.instructions.slice(0, 2).map((instruction, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-violet-400 mr-2">{index + 1}.</span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                    {exercise.instructions.length > 2 && (
                      <li className="text-violet-400 text-xs">... and {exercise.instructions.length - 2} more steps</li>
                    )}
                  </ol>
                </div>

                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full border-violet-600/50 text-violet-200 hover:bg-violet-700/50"
                >
                  <Play className="w-4 h-4 mr-2" />
                  View Full Exercise
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-violet-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-violet-400" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">No exercises found</h3>
            <p className="text-violet-300">Try adjusting your search terms or filters</p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Exercises", value: exercises.length, icon: Dumbbell },
            { label: "Categories", value: categories.length - 1, icon: Target },
            { label: "Equipment Types", value: "12+", icon: BarChart3 },
            { label: "Difficulty Levels", value: 3, icon: Clock }
          ].map((stat, index) => (
            <Card key={index} className="bg-violet-900/30 border-violet-600/30 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <stat.icon className="w-6 h-6 text-violet-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <p className="text-violet-200 text-sm">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkoutLibrary;

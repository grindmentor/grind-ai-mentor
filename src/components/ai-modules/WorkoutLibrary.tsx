
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Clock, Target, Zap, Users } from "lucide-react";
import { useState } from "react";

interface WorkoutLibraryProps {
  onBack: () => void;
}

interface Workout {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  muscles: string[];
  equipment: string;
  image: string;
  exercises: Exercise[];
}

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  notes?: string;
}

const WorkoutLibrary = ({ onBack }: WorkoutLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  const workouts: Workout[] = [
    {
      id: '1',
      name: 'Push-Pull-Legs Split',
      description: 'Classic 3-day split focusing on major movement patterns',
      duration: '45-60 min',
      difficulty: 'Intermediate',
      category: 'Strength',
      muscles: ['Chest', 'Shoulders', 'Triceps', 'Back', 'Biceps', 'Legs'],
      equipment: 'Full Gym',
      image: 'photo-1581091226825-a6a2a5aee158',
      exercises: [
        { name: 'Bench Press', sets: '4', reps: '6-8', rest: '3 min', notes: 'Focus on controlled movement' },
        { name: 'Incline Dumbbell Press', sets: '3', reps: '8-10', rest: '2 min' },
        { name: 'Shoulder Press', sets: '3', reps: '10-12', rest: '90 sec' },
        { name: 'Lateral Raises', sets: '3', reps: '12-15', rest: '60 sec' },
        { name: 'Tricep Dips', sets: '3', reps: '10-12', rest: '90 sec' },
        { name: 'Close-Grip Bench Press', sets: '2', reps: '12-15', rest: '90 sec' }
      ]
    },
    {
      id: '2',
      name: 'HIIT Fat Burner',
      description: 'High-intensity interval training for maximum calorie burn',
      duration: '20-30 min',
      difficulty: 'Advanced',
      category: 'Cardio',
      muscles: ['Full Body'],
      equipment: 'Bodyweight',
      image: 'photo-1649972904349-6e44c42644a7',
      exercises: [
        { name: 'Burpees', sets: '4', reps: '30 sec', rest: '30 sec', notes: 'Full body explosive movement' },
        { name: 'Mountain Climbers', sets: '4', reps: '30 sec', rest: '30 sec' },
        { name: 'Jump Squats', sets: '4', reps: '30 sec', rest: '30 sec' },
        { name: 'High Knees', sets: '4', reps: '30 sec', rest: '30 sec' },
        { name: 'Plank Jacks', sets: '4', reps: '30 sec', rest: '60 sec' }
      ]
    },
    {
      id: '3',
      name: 'Beginner Full Body',
      description: 'Perfect introduction to strength training',
      duration: '30-40 min',
      difficulty: 'Beginner',
      category: 'Strength',
      muscles: ['Full Body'],
      equipment: 'Minimal',
      image: 'photo-1488590528505-98d2b5aba04b',
      exercises: [
        { name: 'Bodyweight Squats', sets: '3', reps: '10-15', rest: '90 sec', notes: 'Focus on form over speed' },
        { name: 'Push-ups (Modified if needed)', sets: '3', reps: '8-12', rest: '90 sec' },
        { name: 'Plank', sets: '3', reps: '30-60 sec', rest: '60 sec' },
        { name: 'Glute Bridges', sets: '3', reps: '12-15', rest: '60 sec' },
        { name: 'Walking Lunges', sets: '2', reps: '10 each leg', rest: '90 sec' }
      ]
    },
    {
      id: '4',
      name: 'Upper Body Strength',
      description: 'Focused upper body development routine',
      duration: '40-50 min',
      difficulty: 'Intermediate',
      category: 'Strength',
      muscles: ['Chest', 'Back', 'Shoulders', 'Arms'],
      equipment: 'Full Gym',
      image: 'photo-1531297484001-80022131f5a1',
      exercises: [
        { name: 'Pull-ups/Lat Pulldowns', sets: '4', reps: '6-10', rest: '3 min' },
        { name: 'Barbell Rows', sets: '4', reps: '8-10', rest: '2-3 min' },
        { name: 'Dumbbell Bench Press', sets: '3', reps: '10-12', rest: '2 min' },
        { name: 'Cable Flies', sets: '3', reps: '12-15', rest: '90 sec' },
        { name: 'Hammer Curls', sets: '3', reps: '10-12', rest: '90 sec' },
        { name: 'Overhead Tricep Extension', sets: '3', reps: '10-12', rest: '90 sec' }
      ]
    }
  ];

  const categories = ['All', 'Strength', 'Cardio', 'Flexibility', 'HIIT'];

  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workout.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || workout.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (selectedWorkout) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => setSelectedWorkout(null)} className="text-white hover:bg-gray-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </Button>
          <h1 className="text-3xl font-bold text-white">{selectedWorkout.name}</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <img 
                  src={`https://images.unsplash.com/${selectedWorkout.image}?w=400&h=200&fit=crop`}
                  alt={selectedWorkout.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <CardTitle className="text-white">{selectedWorkout.name}</CardTitle>
                <CardDescription className="text-gray-400">
                  {selectedWorkout.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={getDifficultyColor(selectedWorkout.difficulty)}>
                    {selectedWorkout.difficulty}
                  </Badge>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    <Clock className="w-3 h-3 mr-1" />
                    {selectedWorkout.duration}
                  </Badge>
                </div>
                <div>
                  <p className="text-white font-medium mb-2">Equipment:</p>
                  <p className="text-gray-400">{selectedWorkout.equipment}</p>
                </div>
                <div>
                  <p className="text-white font-medium mb-2">Target Muscles:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedWorkout.muscles.map(muscle => (
                      <Badge key={muscle} className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                        {muscle}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Workout Plan</CardTitle>
                <CardDescription className="text-gray-400">
                  Follow this sequence for optimal results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedWorkout.exercises.map((exercise, index) => (
                    <div key={index} className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">{exercise.name}</h4>
                        <Badge className="bg-gray-700 text-gray-300">
                          Exercise {index + 1}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Sets:</span>
                          <p className="text-white font-medium">{exercise.sets}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Reps:</span>
                          <p className="text-white font-medium">{exercise.reps}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Rest:</span>
                          <p className="text-white font-medium">{exercise.rest}</p>
                        </div>
                      </div>
                      {exercise.notes && (
                        <div className="mt-2 text-sm text-gray-400">
                          💡 {exercise.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-gray-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Workout Library</h1>
            <p className="text-gray-400">Science-backed workout routines with detailed instructions</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
          <Users className="w-3 h-3 mr-1" />
          Community Curated
        </Badge>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          Free Access
        </Badge>
      </div>

      {/* Search and Filter */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search workouts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="flex gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category 
                    ? "bg-purple-600 hover:bg-purple-700" 
                    : "border-gray-700 text-gray-300 hover:bg-gray-800"
                  }
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workout Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkouts.map(workout => (
          <Card key={workout.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all cursor-pointer">
            <CardHeader className="pb-3">
              <img 
                src={`https://images.unsplash.com/${workout.image}?w=400&h=200&fit=crop`}
                alt={workout.name}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">{workout.name}</CardTitle>
                <Badge className={getDifficultyColor(workout.difficulty)}>
                  {workout.difficulty}
                </Badge>
              </div>
              <CardDescription className="text-gray-400 text-sm">
                {workout.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3 text-sm text-gray-400">
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {workout.duration}
                  </span>
                  <span className="flex items-center">
                    <Zap className="w-3 h-3 mr-1" />
                    {workout.category}
                  </span>
                </div>
              </div>
              <Button 
                onClick={() => setSelectedWorkout(workout)}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                View Workout
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredWorkouts.length === 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6 text-center">
            <Target className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500">No workouts found matching your criteria</p>
            <p className="text-gray-600 text-sm mt-2">Try adjusting your search or category filter</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkoutLibrary;

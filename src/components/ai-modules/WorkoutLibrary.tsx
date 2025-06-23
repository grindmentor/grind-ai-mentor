import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Clock, Target, Zap, Users } from "lucide-react";
import { useState } from "react";

interface WorkoutLibraryProps {
  onBack: () => void;
}

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  notes?: string;
  muscle_groups: string[];
  equipment: string;
  image: string;
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

const WorkoutLibrary = ({ onBack }: WorkoutLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState("");

  const exercises: Exercise[] = [
    {
      name: "Bench Press",
      sets: "3-4",
      reps: "8-12",
      rest: "2-3 min",
      muscle_groups: ["Chest", "Triceps", "Shoulders"],
      equipment: "Barbell, Bench",
      image: "photo-1571019613454-1cb2f99b2d8b",
      notes: "Keep shoulder blades retracted and core tight"
    },
    {
      name: "Squats",
      sets: "3-4",
      reps: "8-15",
      rest: "2-3 min",
      muscle_groups: ["Quadriceps", "Glutes", "Hamstrings"],
      equipment: "Barbell or Bodyweight",
      image: "photo-1566241440091-ec10de8db2e1",
      notes: "Keep knees in line with toes, chest up"
    },
    {
      name: "Deadlifts",
      sets: "3-4",
      reps: "5-8",
      rest: "3-4 min",
      muscle_groups: ["Hamstrings", "Glutes", "Back"],
      equipment: "Barbell",
      image: "photo-1534368270820-9de3d8053204",
      notes: "Keep bar close to body, neutral spine"
    },
    {
      name: "Pull-ups",
      sets: "3-4",
      reps: "5-12",
      rest: "2-3 min",
      muscle_groups: ["Lats", "Biceps", "Rhomboids"],
      equipment: "Pull-up Bar",
      image: "photo-1599058917765-a780eda07a3e",
      notes: "Full range of motion, control the descent"
    },
    {
      name: "Push-ups",
      sets: "3-4",
      reps: "10-20",
      rest: "1-2 min",
      muscle_groups: ["Chest", "Triceps", "Core"],
      equipment: "Bodyweight",
      image: "photo-1571019613454-1cb2f99b2d8b",
      notes: "Keep straight line from head to heels"
    },
    {
      name: "Lunges",
      sets: "3",
      reps: "10-15 each leg",
      rest: "90 sec",
      muscle_groups: ["Quadriceps", "Glutes", "Calves"],
      equipment: "Bodyweight or Dumbbells",
      image: "photo-1566241440091-ec10de8db2e1",
      notes: "Step forward, lower back knee toward ground"
    }
  ];

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
      exercises: exercises.slice(0, 4)
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
      exercises: exercises.slice(4, 6)
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
      exercises: exercises.slice(0, 3)
    }
  ];

  const categories = ['All', 'Strength', 'Cardio', 'Flexibility', 'HIIT'];

  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workout.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || workout.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(exerciseSearchTerm.toLowerCase()) ||
    exercise.muscle_groups.some(muscle => 
      muscle.toLowerCase().includes(exerciseSearchTerm.toLowerCase())
    ) ||
    exercise.equipment.toLowerCase().includes(exerciseSearchTerm.toLowerCase())
  );

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

      {/* Exercise Search */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Exercise Database</CardTitle>
          <CardDescription className="text-gray-400">
            Search our comprehensive exercise library
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search exercises by name, muscle group, or equipment..."
              value={exerciseSearchTerm}
              onChange={(e) => setExerciseSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
          
          {exerciseSearchTerm && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
              {filteredExercises.map((exercise, index) => (
                <div key={index} className="bg-gray-800 p-3 rounded-lg">
                  <img 
                    src={`https://images.unsplash.com/${exercise.image}?w=300&h=150&fit=crop`}
                    alt={exercise.name}
                    className="w-full h-20 object-cover rounded mb-2"
                  />
                  <h4 className="text-white font-medium text-sm">{exercise.name}</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {exercise.muscle_groups.slice(0, 2).map(muscle => (
                      <Badge key={muscle} className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                        {muscle}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-gray-400 text-xs mt-1">{exercise.sets} sets × {exercise.reps}</p>
                </div>
              ))}
            </div>
          )}
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

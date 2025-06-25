import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowLeft, Dumbbell, Filter, Eye, Star, Play, Book, Target, Clock, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface WorkoutLibraryProps {
  onBack: () => void;
}

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_groups: string[];
  equipment: string[];
  difficulty: string;
  description?: string;
  instructions?: string[];
  tips?: string[];
  image_url?: string;
  video_url?: string;
}

const WorkoutLibrary = ({ onBack }: WorkoutLibraryProps) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showFullView, setShowFullView] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [exercises, searchTerm, categoryFilter, difficultyFilter]);

  const loadExercises = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error loading exercises:', error);
        // Provide fallback data if database fails
        setExercises(getFallbackExercises());
      } else {
        setExercises(data || getFallbackExercises());
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
      setExercises(getFallbackExercises());
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackExercises = (): Exercise[] => {
    return [
      {
        id: '1',
        name: 'Push-ups',
        category: 'Strength',
        muscle_groups: ['Chest', 'Shoulders', 'Triceps'],
        equipment: ['Bodyweight'],
        difficulty: 'Beginner',
        description: 'A fundamental upper body exercise that targets chest, shoulders, and triceps.',
        instructions: [
          'Start in a plank position with hands slightly wider than shoulders',
          'Keep your body in a straight line from head to heels',
          'Lower your chest until it nearly touches the ground',
          'Push back up to starting position',
          'Repeat for desired repetitions'
        ],
        tips: [
          'Keep your core engaged throughout the movement',
          'Don\'t let your hips sag or pike up',
          'Control the descent - don\'t drop down quickly',
          'Breathe out as you push up, breathe in as you lower'
        ]
      },
      {
        id: '2',
        name: 'Squats',
        category: 'Strength',
        muscle_groups: ['Quadriceps', 'Glutes', 'Hamstrings'],
        equipment: ['Bodyweight'],
        difficulty: 'Beginner',
        description: 'A compound lower body exercise that works multiple muscle groups.',
        instructions: [
          'Stand with feet shoulder-width apart',
          'Lower your body by bending at hips and knees',
          'Keep your chest up and knees tracking over toes',
          'Descend until thighs are parallel to ground',
          'Drive through heels to return to starting position'
        ],
        tips: [
          'Keep your weight on your heels',
          'Don\'t let knees cave inward',
          'Maintain neutral spine throughout',
          'Go only as deep as your mobility allows'
        ]
      },
      {
        id: '3',
        name: 'Deadlifts',
        category: 'Strength',
        muscle_groups: ['Hamstrings', 'Glutes', 'Lower Back'],
        equipment: ['Barbell'],
        difficulty: 'Intermediate',
        description: 'A hip-hinge movement that targets the posterior chain.',
        instructions: [
          'Stand with feet hip-width apart, barbell over mid-foot',
          'Hinge at hips and bend knees to grip the bar',
          'Keep chest up and shoulders back',
          'Drive through heels and extend hips to lift the bar',
          'Reverse the movement to lower the bar'
        ],
        tips: [
          'Keep the bar close to your body throughout',
          'Lead with your hips, not your back',
          'Don\'t round your lower back',
          'Engage your lats to keep the bar close'
        ]
      },
      {
        id: '4',
        name: 'Pull-ups',
        category: 'Strength',
        muscle_groups: ['Latissimus Dorsi', 'Biceps', 'Rhomboids'],
        equipment: ['Pull-up Bar'],
        difficulty: 'Intermediate',
        description: 'An upper body pulling exercise that builds back and arm strength.',
        instructions: [
          'Hang from pull-up bar with palms facing away',
          'Hands should be slightly wider than shoulder-width',
          'Pull your body up until chin clears the bar',
          'Lower yourself with control to full arm extension',
          'Repeat for desired repetitions'
        ],
        tips: [
          'Engage your core to prevent swinging',
          'Focus on pulling with your back muscles',
          'Don\'t use momentum or kipping',
          'Control the negative portion of the movement'
        ]
      },
      {
        id: '5',
        name: 'Plank',
        category: 'Core',
        muscle_groups: ['Core', 'Shoulders', 'Glutes'],
        equipment: ['Bodyweight'],
        difficulty: 'Beginner',
        description: 'An isometric core exercise that builds stability and endurance.',
        instructions: [
          'Start in push-up position on forearms',
          'Keep body in straight line from head to heels',
          'Engage core and glutes',
          'Hold position for desired time',
          'Breathe normally throughout the hold'
        ],
        tips: [
          'Don\'t let hips sag or pike up',
          'Keep shoulders directly over elbows',
          'Squeeze glutes to maintain position',
          'Start with shorter holds and build up time'
        ]
      }
    ];
  };

  const filterExercises = () => {
    let filtered = exercises;

    if (searchTerm) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.muscle_groups.some(muscle => 
          muscle.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        exercise.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(exercise => 
        exercise.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    if (difficultyFilter !== "all") {
      filtered = filtered.filter(exercise => 
        exercise.difficulty.toLowerCase() === difficultyFilter.toLowerCase()
      );
    }

    setFilteredExercises(filtered);
  };

  const handleViewFullExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowFullView(true);
  };

  const handleBackToLibrary = () => {
    setShowFullView(false);
    setSelectedExercise(null);
  };

  // Full Exercise View Component
  if (showFullView && selectedExercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-900/20 to-blue-700 text-white animate-fade-in">
        <div className="p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-8">
              <Button 
                variant="ghost" 
                onClick={handleBackToLibrary}
                className="text-blue-200 hover:text-white hover:bg-blue-800/50"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Library
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-blue-700/40 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Dumbbell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{selectedExercise.name}</h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {selectedExercise.category}
                    </Badge>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      {selectedExercise.difficulty}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Exercise Details */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Main Information */}
              <Card className="bg-blue-900/20 border-blue-600/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Target className="w-5 h-5 mr-2 text-blue-400" />
                    Exercise Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Description */}
                  {selectedExercise.description && (
                    <div>
                      <h3 className="text-white font-semibold mb-2">Description</h3>
                      <p className="text-blue-200">{selectedExercise.description}</p>
                    </div>
                  )}

                  {/* Muscle Groups */}
                  <div>
                    <h3 className="text-white font-semibold mb-2">Target Muscles</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedExercise.muscle_groups.map((muscle, index) => (
                        <Badge key={index} className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Equipment */}
                  <div>
                    <h3 className="text-white font-semibold mb-2">Equipment Needed</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedExercise.equipment.map((item, index) => (
                        <Badge key={index} className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Media Placeholder */}
                  <div className="bg-blue-800/20 rounded-xl p-8 border border-blue-600/30 text-center">
                    <Play className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-white font-medium mb-2">Exercise Demonstration</h3>
                    <p className="text-blue-200 text-sm">
                      Video and image demonstrations will be available here in future updates
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Instructions and Tips */}
              <Card className="bg-blue-900/20 border-blue-600/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Book className="w-5 h-5 mr-2 text-blue-400" />
                    How to Perform
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Instructions */}
                  {selectedExercise.instructions && selectedExercise.instructions.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-3">Step-by-Step Instructions</h3>
                      <ol className="space-y-2 text-blue-200">
                        {selectedExercise.instructions.map((instruction, index) => (
                          <li key={index} className="flex items-start">
                            <span className="bg-blue-500/20 text-blue-400 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                              {index + 1}
                            </span>
                            <span>{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Tips */}
                  {selectedExercise.tips && selectedExercise.tips.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-3 flex items-center">
                        <Zap className="w-4 h-4 mr-2 text-yellow-400" />
                        Pro Tips
                      </h3>
                      <ul className="space-y-2 text-blue-200">
                        {selectedExercise.tips.map((tip, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-yellow-400 mr-2 mt-1">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Safety Note */}
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                    <div className="flex items-center mb-2">
                      <Clock className="w-4 h-4 text-yellow-400 mr-2" />
                      <h4 className="text-yellow-400 font-medium">Safety Note</h4>
                    </div>
                    <p className="text-yellow-200 text-sm">
                      Always warm up before exercising and listen to your body. If you experience pain or discomfort, stop the exercise and consult a fitness professional.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Library View
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-900/20 to-blue-700 text-white animate-fade-in">
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="text-blue-200 hover:text-white hover:bg-blue-800/50"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Dashboard
            </Button>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-blue-700/40 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/25 border border-blue-400/20">
                <Dumbbell className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
                  Workout Library
                </h1>
                <p className="text-blue-200 text-lg">Science-backed exercise database</p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="bg-blue-900/20 border-blue-600/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4" />
                    <Input
                      placeholder="Search exercises, muscles, or categories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-blue-800/30 border-blue-600/50 text-white focus:border-blue-500 backdrop-blur-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40 bg-blue-800/30 border-blue-600/50 text-white focus:border-blue-500 backdrop-blur-sm">
                      <Filter className="w-4 h-4 mr-2 text-blue-400" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="strength">Strength</SelectItem>
                      <SelectItem value="cardio">Cardio</SelectItem>
                      <SelectItem value="core">Core</SelectItem>
                      <SelectItem value="flexibility">Flexibility</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="w-40 bg-blue-800/30 border-blue-600/50 text-white focus:border-blue-500 backdrop-blur-sm">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exercise Grid */}
          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-blue-200">Loading exercises...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExercises.map((exercise) => (
                <Card key={exercise.id} className="bg-blue-900/20 border-blue-600/30 backdrop-blur-sm hover:bg-blue-800/30 transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{exercise.name}</CardTitle>
                      <Badge className={`${
                        exercise.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        exercise.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        {exercise.difficulty}
                      </Badge>
                    </div>
                    <CardDescription className="text-blue-200">
                      {exercise.category}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-white font-medium mb-2">Target Muscles</h4>
                      <div className="flex flex-wrap gap-1">
                        {exercise.muscle_groups.slice(0, 3).map((muscle, index) => (
                          <Badge key={index} className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                            {muscle}
                          </Badge>
                        ))}
                        {exercise.muscle_groups.length > 3 && (
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                            +{exercise.muscle_groups.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-medium mb-2">Equipment</h4>
                      <div className="flex flex-wrap gap-1">
                        {exercise.equipment.map((item, index) => (
                          <Badge key={index} className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() => handleViewFullExercise(exercise)}
                      className="w-full bg-gradient-to-r from-blue-500/80 to-blue-700/80 hover:from-blue-600/80 hover:to-blue-800/80 text-white font-medium py-2 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 backdrop-blur-sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Full Exercise
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredExercises.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <Dumbbell className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">No exercises found</h3>
              <p className="text-blue-200">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutLibrary;

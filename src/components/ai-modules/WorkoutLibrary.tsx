
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Dumbbell, Calendar, Heart, MessageSquare, Send, X, Filter, Grid, List, Clock, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';

interface WorkoutLibraryProps {
  onBack: () => void;
}

interface WorkoutSplit {
  id: string;
  name: string;
  description: string;
  days: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  focus: string[];
  estimatedDuration: string;
}

interface WorkoutDay {
  id: string;
  splitId: string;
  dayNumber: number;
  name: string;
  focus: string[];
  exercises: ExerciseInWorkout[];
  duration: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface ExerciseInWorkout {
  exerciseId: string;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
  weight?: string;
}

interface Exercise {
  id: string;
  name: string;
  description?: string;
  instructions?: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment: string;
  category: string;
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced';
  mechanics: string;
}

interface CardioSession {
  id: string;
  name: string;
  type: 'HIIT' | 'LISS' | 'Circuit' | 'Tabata';
  duration: number;
  intensity: 'Low' | 'Moderate' | 'High';
  description: string;
  instructions: string[];
  equipment: string;
}

const WorkoutLibrary: React.FC<WorkoutLibraryProps> = ({ onBack }) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<'splits' | 'days' | 'exercises' | 'cardio'>('splits');
  const [searchQuery, setSearchQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<string[]>([]);
  const [equipmentFilter, setEquipmentFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{type: 'user' | 'ai', message: string}>>([]);
  const [selectedSplit, setSelectedSplit] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);

  // Sample exercises data (fallback)
  const sampleExercises: Exercise[] = [
    {
      id: '1',
      name: 'Barbell Bench Press',
      description: 'The king of chest exercises targeting the entire pectoral region',
      instructions: 'Lie on bench, grip bar slightly wider than shoulders, lower to chest, press up explosively',
      primary_muscles: ['Chest'],
      secondary_muscles: ['Triceps', 'Front Deltoids'],
      equipment: 'Barbell',
      category: 'Strength',
      difficulty_level: 'Intermediate',
      mechanics: 'Compound'
    },
    {
      id: '2',
      name: 'Pull-ups',
      description: 'Bodyweight back width builder',
      instructions: 'Hang from bar, pull body up until chin over bar, lower with control',
      primary_muscles: ['Lats'],
      secondary_muscles: ['Rhomboids', 'Biceps', 'Rear Delts'],
      equipment: 'Pull-up Bar',
      category: 'Strength',
      difficulty_level: 'Intermediate',
      mechanics: 'Compound'
    },
    {
      id: '3',
      name: 'Back Squat',
      description: 'The king of leg exercises',
      instructions: 'Bar on traps, squat down until thighs parallel, drive up through heels',
      primary_muscles: ['Quadriceps', 'Glutes'],
      secondary_muscles: ['Hamstrings', 'Calves'],
      equipment: 'Barbell',
      category: 'Strength',
      difficulty_level: 'Intermediate',
      mechanics: 'Compound'
    }
  ];

  // Predefined workout splits
  const workoutSplits: WorkoutSplit[] = [
    {
      id: 'push-pull-legs',
      name: 'Push/Pull/Legs',
      description: 'Classic 3-day split focusing on movement patterns for optimal recovery and muscle growth',
      days: 3,
      difficulty: 'Intermediate',
      focus: ['Chest', 'Shoulders', 'Triceps', 'Back', 'Biceps', 'Legs'],
      estimatedDuration: '45-60 min'
    },
    {
      id: 'upper-lower',
      name: 'Upper/Lower Split',
      description: '4-day split alternating between upper and lower body training sessions',
      days: 4,
      difficulty: 'Beginner',
      focus: ['Upper Body', 'Lower Body', 'Strength'],
      estimatedDuration: '50-70 min'
    },
    {
      id: 'full-body',
      name: 'Full Body Routine',
      description: '3-day full body workout hitting all major muscle groups each session',
      days: 3,
      difficulty: 'Beginner',
      focus: ['Full Body', 'Compound Movements', 'Efficiency'],
      estimatedDuration: '60-75 min'
    }
  ];

  // Sample workout days
  const workoutDays: WorkoutDay[] = [
    {
      id: 'ppl-push',
      splitId: 'push-pull-legs',
      dayNumber: 1,
      name: 'Push Day (Chest, Shoulders, Triceps)',
      focus: ['Chest', 'Shoulders', 'Triceps'],
      difficulty: 'Intermediate',
      exercises: [
        { exerciseId: '1', name: 'Barbell Bench Press', sets: 4, reps: '6-8', rest: '3 min', weight: 'Heavy' },
        { exerciseId: '2', name: 'Overhead Press', sets: 3, reps: '8-10', rest: '2-3 min', weight: 'Moderate' },
        { exerciseId: '3', name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: '2 min', weight: 'Moderate' }
      ],
      duration: 60
    }
  ];

  // Cardio sessions
  const cardioSessions: CardioSession[] = [
    {
      id: 'hiit-fat-burn',
      name: 'Fat Burning HIIT',
      type: 'HIIT',
      duration: 20,
      intensity: 'High',
      description: 'High-intensity intervals designed to maximize fat burn and improve cardiovascular fitness',
      equipment: 'Treadmill/Bike',
      instructions: [
        'Warm up for 3 minutes at moderate pace',
        '30 seconds all-out sprint (90-95% effort)',
        '90 seconds active recovery (50-60% effort)',
        'Repeat sprint/recovery cycle for 8 rounds',
        'Cool down for 3 minutes at easy pace'
      ]
    },
    {
      id: 'liss-endurance',
      name: 'Steady State Endurance',
      type: 'LISS',
      duration: 45,
      intensity: 'Moderate',
      description: 'Low-intensity steady state cardio for building aerobic base and fat oxidation',
      equipment: 'Any cardio machine',
      instructions: [
        'Maintain 65-75% max heart rate throughout',
        'Consistent, comfortable pace you can maintain',
        'Focus on breathing rhythm and form'
      ]
    }
  ];

  useEffect(() => {
    if (activeTab === 'exercises') {
      setLoading(true);
      // Use sample exercises as fallback
      setTimeout(() => {
        setExercises(sampleExercises);
        setLoading(false);
      }, 500);
    }
  }, [activeTab]);

  const filteredSplits = workoutSplits.filter(split => {
    const matchesSearch = split.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          split.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = !difficultyFilter || split.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const filteredDays = workoutDays.filter(day => {
    const matchesSearch = day.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          day.focus.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSplit = !selectedSplit || day.splitId === selectedSplit;
    const matchesDifficulty = !difficultyFilter || day.difficulty === difficultyFilter;
    return matchesSearch && matchesSplit && matchesDifficulty;
  });

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (exercise.description && exercise.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesMuscle = muscleFilter.length === 0 || 
                          muscleFilter.some(muscle => 
                            exercise.primary_muscles.some(pm => pm.toLowerCase().includes(muscle.toLowerCase())) ||
                            exercise.secondary_muscles.some(sm => sm.toLowerCase().includes(muscle.toLowerCase()))
                          );
    const matchesEquipment = !equipmentFilter || exercise.equipment.toLowerCase().includes(equipmentFilter.toLowerCase());
    const matchesDifficulty = !difficultyFilter || exercise.difficulty_level === difficultyFilter;
    return matchesSearch && matchesMuscle && matchesEquipment && matchesDifficulty;
  });

  const filteredCardio = cardioSessions.filter(session => {
    const matchesSearch = session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          session.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !equipmentFilter || session.type === equipmentFilter;
    const matchesIntensity = !difficultyFilter || session.intensity === difficultyFilter;
    return matchesSearch && matchesType && matchesIntensity;
  });

  const handleSendMessage = () => {
    if (chatMessage.trim() !== '') {
      setChatHistory([...chatHistory, { type: 'user', message: chatMessage }]);
      
      setTimeout(() => {
        const workoutResponses = [
          "Based on scientific research, progressive overload is the key principle for muscle growth. Gradually increase weight, reps, or sets each week.",
          "Compound movements like squats, deadlifts, and bench press should form the foundation of your training for maximum efficiency.",
          "Recovery is crucial - aim for 7-9 hours of sleep and allow 48-72 hours between training the same muscle groups.",
          "Proper form always takes priority over heavy weight. Master the movement pattern first, then add load."
        ];
        const randomResponse = workoutResponses[Math.floor(Math.random() * workoutResponses.length)];
        setChatHistory(prev => [...prev, { type: 'ai', message: randomResponse }]);
      }, 1000);
      setChatMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white relative">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-white hover:bg-orange-500/20 backdrop-blur-sm hover:text-orange-400 transition-colors font-medium flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Button>
            <h1 className="text-lg font-semibold text-center flex-1 px-4 truncate">
              Workout Library
            </h1>
            <Button
              variant="outline"
              onClick={() => setShowAIChat(!showAIChat)}
              className="border-orange-500/30 text-orange-400 hover:bg-orange-500/20"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              AI Coach
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-orange-900/30 border-orange-500/40">
            <TabsTrigger value="splits" className="data-[state=active]:bg-orange-500/30 data-[state=active]:text-orange-300">
              <Target className="w-4 h-4 mr-2" />
              Splits
            </TabsTrigger>
            <TabsTrigger value="days" className="data-[state=active]:bg-orange-500/30 data-[state=active]:text-orange-300">
              <Calendar className="w-4 h-4 mr-2" />
              Days
            </TabsTrigger>
            <TabsTrigger value="exercises" className="data-[state=active]:bg-orange-500/30 data-[state=active]:text-orange-300">
              <Dumbbell className="w-4 h-4 mr-2" />
              Exercises
            </TabsTrigger>
            <TabsTrigger value="cardio" className="data-[state=active]:bg-orange-500/30 data-[state=active]:text-orange-300">
              <Heart className="w-4 h-4 mr-2" />
              Cardio
            </TabsTrigger>
          </TabsList>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-5 h-5" />
              <Input
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-orange-800/30 border-orange-500/40 text-white placeholder:text-orange-300/70 h-12 text-lg focus:border-orange-400 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {activeTab === 'exercises' && (
                <>
                  <Select onValueChange={(value) => setMuscleFilter(value === '' ? [] : [value])}>
                    <SelectTrigger className="bg-orange-800/30 border-orange-500/40 text-white h-12 rounded-xl">
                      <Filter className="w-4 h-4 mr-2 text-orange-400" />
                      <SelectValue placeholder="Filter by muscle" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900/95 backdrop-blur-md border-orange-500/40 rounded-xl">
                      <SelectItem value="">All Muscles</SelectItem>
                      <SelectItem value="Chest">Chest</SelectItem>
                      <SelectItem value="Back">Back</SelectItem>
                      <SelectItem value="Shoulders">Shoulders</SelectItem>
                      <SelectItem value="Biceps">Biceps</SelectItem>
                      <SelectItem value="Triceps">Triceps</SelectItem>
                      <SelectItem value="Quadriceps">Legs</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select onValueChange={setEquipmentFilter}>
                    <SelectTrigger className="bg-orange-800/30 border-orange-500/40 text-white h-12 rounded-xl">
                      <Filter className="w-4 h-4 mr-2 text-orange-400" />
                      <SelectValue placeholder="Equipment" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900/95 backdrop-blur-md border-orange-500/40 rounded-xl">
                      <SelectItem value="">All Equipment</SelectItem>
                      <SelectItem value="Barbell">Barbell</SelectItem>
                      <SelectItem value="Dumbbell">Dumbbell</SelectItem>
                      <SelectItem value="Machine">Machine</SelectItem>
                      <SelectItem value="Bodyweight">Bodyweight</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}

              <Select onValueChange={setDifficultyFilter}>
                <SelectTrigger className="bg-orange-800/30 border-orange-500/40 text-white h-12 rounded-xl">
                  <Filter className="w-4 h-4 mr-2 text-orange-400" />
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900/95 backdrop-blur-md border-orange-500/40 rounded-xl">
                  <SelectItem value="">All Levels</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2 bg-orange-900/20 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-orange-500/30 text-orange-300'
                      : 'hover:bg-orange-500/20 text-gray-400 hover:text-orange-400'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-orange-500/30 text-orange-300'
                      : 'hover:bg-orange-500/20 text-gray-400 hover:text-orange-400'
                  }`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <TabsContent value="splits" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSplits.map(split => (
                <Card key={split.id} className="bg-orange-900/40 border-orange-600/50 backdrop-blur-sm hover:bg-orange-900/60 transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{split.name}</CardTitle>
                      <Badge variant="outline" className="border-orange-400/50 text-orange-300">
                        {split.days} days
                      </Badge>
                    </div>
                    <CardDescription className="text-orange-200/70">
                      {split.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Difficulty</span>
                        <Badge variant={split.difficulty === 'Advanced' ? 'destructive' : split.difficulty === 'Intermediate' ? 'default' : 'secondary'}>
                          {split.difficulty}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Duration</span>
                        <span className="text-orange-300 text-sm">{split.estimatedDuration}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {split.focus.map(focus => (
                          <Badge key={focus} variant="outline" className="text-xs border-orange-500/30 text-orange-300">
                            {focus}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="days" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredDays.map(day => (
                <Card key={day.id} className="bg-orange-900/40 border-orange-600/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{day.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-orange-400" />
                        <span className="text-orange-300 text-sm">{day.duration} min</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {day.focus.map(focus => (
                        <Badge key={focus} variant="outline" className="text-xs border-orange-500/30 text-orange-300">
                          {focus}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {day.exercises.map((exercise, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-orange-800/20 rounded-lg">
                          <div className="flex-1">
                            <span className="text-white text-sm font-medium block">{exercise.name}</span>
                            <span className="text-orange-400 text-xs">{exercise.weight} • Rest: {exercise.rest}</span>
                          </div>
                          <span className="text-orange-300 text-sm font-semibold">{exercise.sets}×{exercise.reps}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="exercises" className="mt-6">
            {loading ? (
              <div className="text-center py-16">
                <div className="text-orange-400">Loading exercises...</div>
              </div>
            ) : filteredExercises.length === 0 ? (
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-orange-400/50 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-white mb-2">No Exercises Found</h3>
                <p className="text-orange-300/70">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExercises.map(exercise => (
                  <Card key={exercise.id} className="bg-orange-900/40 border-orange-600/50 backdrop-blur-sm hover:bg-orange-900/60 transition-all duration-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <CardTitle className="text-white text-base font-semibold">{exercise.name}</CardTitle>
                          <div className="flex flex-wrap gap-1">
                            {exercise.primary_muscles?.slice(0, 2).map(muscle => (
                              <Badge key={muscle} variant="outline" className="text-xs border-orange-500/30 text-orange-300">
                                {muscle}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {exercise.difficulty_level}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Equipment</span>
                          <span className="text-orange-300">{exercise.equipment}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Type</span>
                          <span className="text-orange-300">{exercise.mechanics}</span>
                        </div>
                        {exercise.description && (
                          <p className="text-orange-200/80 text-xs mt-2">
                            {exercise.description.substring(0, 100)}...
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cardio" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCardio.map(session => (
                <Card key={session.id} className="bg-orange-900/40 border-orange-600/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{session.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="border-red-400/50 text-red-300">
                          {session.type}
                        </Badge>
                        <Badge variant={session.intensity === 'High' ? 'destructive' : session.intensity === 'Moderate' ? 'default' : 'secondary'}>
                          {session.intensity}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="text-orange-200/70">
                      {session.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Duration</span>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-orange-400" />
                          <span className="text-orange-300">{session.duration} min</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Equipment</span>
                        <span className="text-orange-300 text-sm">{session.equipment}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm text-gray-400">Instructions:</span>
                        <ul className="list-disc list-inside space-y-1 text-orange-200/80 text-sm">
                          {session.instructions.slice(0, 3).map((instruction, index) => (
                            <li key={index}>{instruction}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Chat Sidebar */}
      {showAIChat && (
        <div className="fixed top-0 right-0 h-full w-80 bg-gray-900/95 backdrop-blur-md border-l border-gray-800 z-50 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">AI Workout Coach</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowAIChat(false)}>
              <X className="w-4 h-4 text-gray-400" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 mb-4">
            {chatHistory.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-8">
                Ask me about workout programming, exercise form, training principles, or nutrition for optimal results!
              </div>
            )}
            {chatHistory.map((message, index) => (
              <div key={index} className={`p-3 rounded-lg ${message.type === 'user' ? 'bg-orange-800/30 text-white ml-4' : 'bg-gray-800/30 text-gray-300 mr-4'}`}>
                {message.message}
              </div>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Ask about workouts, form, programming..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="bg-gray-800/50 border-gray-700/50 text-white flex-1"
            />
            <Button onClick={handleSendMessage} size="sm" className="bg-orange-600 hover:bg-orange-700">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutLibrary;

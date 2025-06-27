
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Dumbbell, Calendar, Heart, MessageSquare, Send, X, Filter, Grid, List, Plus, Clock, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { useExerciseDatabase } from '@/hooks/useExerciseDatabase';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

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
}

interface WorkoutDay {
  id: string;
  splitId: string;
  dayNumber: number;
  name: string;
  focus: string[];
  exercises: Array<{
    exerciseId: string;
    name: string;
    sets: number;
    reps: string;
    rest: string;
    notes?: string;
  }>;
  duration: number;
}

interface CardioSession {
  id: string;
  name: string;
  type: 'HIIT' | 'LISS' | 'Circuit' | 'Tabata';
  duration: number;
  intensity: 'Low' | 'Moderate' | 'High';
  description: string;
  instructions: string[];
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

  const { exercises, loading, getRandomExercises, searchExercises } = useExerciseDatabase();

  // Sample workout splits
  const workoutSplits: WorkoutSplit[] = [
    {
      id: '1',
      name: 'Push/Pull/Legs',
      description: 'Classic 3-day split focusing on movement patterns',
      days: 3,
      difficulty: 'Intermediate',
      focus: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms']
    },
    {
      id: '2',
      name: 'Upper/Lower',
      description: '4-day split alternating upper and lower body',
      days: 4,
      difficulty: 'Beginner',
      focus: ['Upper Body', 'Lower Body']
    },
    {
      id: '3',
      name: 'Full Body',
      description: '3-day full body routine for maximum efficiency',
      days: 3,
      difficulty: 'Beginner',
      focus: ['Full Body', 'Compound Movements']
    },
    {
      id: '4',
      name: 'Bro Split',
      description: '5-day body part split for advanced lifters',
      days: 5,
      difficulty: 'Advanced',
      focus: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms']
    }
  ];

  // Sample workout days
  const workoutDays: WorkoutDay[] = [
    {
      id: '1',
      splitId: '1',
      dayNumber: 1,
      name: 'Push Day',
      focus: ['Chest', 'Shoulders', 'Triceps'],
      exercises: [
        { exerciseId: '1', name: 'Barbell Bench Press', sets: 4, reps: '6-8', rest: '3 min' },
        { exerciseId: '2', name: 'Overhead Press', sets: 3, reps: '8-10', rest: '2-3 min' },
        { exerciseId: '3', name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: '2 min' },
        { exerciseId: '4', name: 'Lateral Raises', sets: 3, reps: '12-15', rest: '90 sec' },
        { exerciseId: '5', name: 'Tricep Pushdowns', sets: 3, reps: '12-15', rest: '90 sec' }
      ],
      duration: 60
    },
    {
      id: '2',
      splitId: '1',
      dayNumber: 2,
      name: 'Pull Day',
      focus: ['Back', 'Biceps'],
      exercises: [
        { exerciseId: '6', name: 'Deadlift', sets: 4, reps: '5-6', rest: '3-4 min' },
        { exerciseId: '7', name: 'Pull-ups', sets: 3, reps: '8-12', rest: '2-3 min' },
        { exerciseId: '8', name: 'Barbell Rows', sets: 3, reps: '8-10', rest: '2-3 min' },
        { exerciseId: '9', name: 'Cable Rows', sets: 3, reps: '10-12', rest: '2 min' },
        { exerciseId: '10', name: 'Barbell Curls', sets: 3, reps: '10-12', rest: '90 sec' }
      ],
      duration: 65
    },
    {
      id: '3',
      splitId: '1',
      dayNumber: 3,
      name: 'Leg Day',
      focus: ['Quadriceps', 'Hamstrings', 'Glutes'],
      exercises: [
        { exerciseId: '11', name: 'Back Squat', sets: 4, reps: '6-8', rest: '3-4 min' },
        { exerciseId: '12', name: 'Romanian Deadlift', sets: 3, reps: '8-10', rest: '2-3 min' },
        { exerciseId: '13', name: 'Bulgarian Split Squats', sets: 3, reps: '10-12', rest: '2 min' },
        { exerciseId: '14', name: 'Leg Curls', sets: 3, reps: '12-15', rest: '90 sec' },
        { exerciseId: '15', name: 'Leg Extensions', sets: 3, reps: '12-15', rest: '90 sec' }
      ],
      duration: 70
    }
  ];

  // Sample cardio sessions
  const cardioSessions: CardioSession[] = [
    {
      id: '1',
      name: 'Fat Burning HIIT',
      type: 'HIIT',
      duration: 20,
      intensity: 'High',
      description: 'High-intensity intervals for maximum fat burn',
      instructions: [
        'Warm up for 3 minutes at moderate pace',
        '30 seconds all-out sprint',
        '90 seconds active recovery',
        'Repeat for 8 rounds',
        'Cool down for 3 minutes'
      ]
    },
    {
      id: '2',
      name: 'Steady State Cardio',
      type: 'LISS',
      duration: 45,
      intensity: 'Moderate',
      description: 'Low-intensity steady state for endurance',
      instructions: [
        'Maintain 65-75% max heart rate',
        'Consistent pace throughout',
        'Focus on breathing rhythm',
        'Monitor heart rate regularly'
      ]
    },
    {
      id: '3',
      name: 'Tabata Blast',
      type: 'Tabata',
      duration: 16,
      intensity: 'High',
      description: '4-minute high-intensity protocol',
      instructions: [
        'Warm up for 5 minutes',
        '20 seconds maximum effort',
        '10 seconds rest',
        'Repeat for 8 rounds (4 minutes)',
        'Cool down for 5 minutes'
      ]
    },
    {
      id: '4',
      name: 'Circuit Training',
      type: 'Circuit',
      duration: 30,
      intensity: 'High',
      description: 'Full-body circuit for strength and cardio',
      instructions: [
        'Perform each exercise for 45 seconds',
        '15 seconds rest between exercises',
        '2 minutes rest between rounds',
        'Complete 3-4 rounds',
        'Exercises: Burpees, Mountain Climbers, Jump Squats, Push-ups'
      ]
    }
  ];

  useEffect(() => {
    if (activeTab === 'exercises') {
      getRandomExercises(12);
    }
  }, [activeTab]);

  useEffect(() => {
    if (searchQuery && searchQuery.length > 2) {
      searchExercises(searchQuery, muscleFilter.length > 0 ? muscleFilter : undefined, equipmentFilter || undefined);
    }
  }, [searchQuery, muscleFilter, equipmentFilter]);

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
    return matchesSearch && matchesSplit;
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
      // Simulate AI response focused on workout coaching
      setTimeout(() => {
        const responses = [
          "Based on your fitness goals, I recommend focusing on compound movements for maximum efficiency.",
          "Progressive overload is key - gradually increase weight, reps, or sets each week.",
          "Make sure to prioritize proper form over heavy weight, especially when starting out.",
          "Recovery is just as important as training - aim for 7-9 hours of sleep per night.",
          "Consider incorporating both strength training and cardio for optimal health benefits."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        setChatHistory(prev => [...prev, { type: 'ai', message: randomResponse }]);
      }, 1000);
      setChatMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-900/10 to-blue-800/20 text-white relative">
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-white hover:bg-blue-500/20 backdrop-blur-sm hover:text-blue-400 transition-colors font-medium flex items-center space-x-2"
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
              className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
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
          <TabsList className="grid w-full grid-cols-4 bg-blue-900/30 border-blue-500/40">
            <TabsTrigger value="splits" className="data-[state=active]:bg-blue-500/30 data-[state=active]:text-blue-300">
              <Target className="w-4 h-4 mr-2" />
              Splits
            </TabsTrigger>
            <TabsTrigger value="days" className="data-[state=active]:bg-blue-500/30 data-[state=active]:text-blue-300">
              <Calendar className="w-4 h-4 mr-2" />
              Days
            </TabsTrigger>
            <TabsTrigger value="exercises" className="data-[state=active]:bg-blue-500/30 data-[state=active]:text-blue-300">
              <Dumbbell className="w-4 h-4 mr-2" />
              Exercises
            </TabsTrigger>
            <TabsTrigger value="cardio" className="data-[state=active]:bg-blue-500/30 data-[state=active]:text-blue-300">
              <Heart className="w-4 h-4 mr-2" />
              Cardio
            </TabsTrigger>
          </TabsList>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
              <Input
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-blue-800/30 border-blue-500/40 text-white placeholder:text-blue-300/70 h-12 text-lg focus:border-blue-400 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {activeTab === 'exercises' && (
                <>
                  <Select onValueChange={(value) => setMuscleFilter(value === '' ? [] : [value])}>
                    <SelectTrigger className="bg-blue-800/30 border-blue-500/40 text-white h-12 rounded-xl">
                      <Filter className="w-4 h-4 mr-2 text-blue-400" />
                      <SelectValue placeholder="Filter by muscle" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900/95 backdrop-blur-md border-blue-500/40 rounded-xl">
                      <SelectItem value="">All Muscles</SelectItem>
                      <SelectItem value="Chest">Chest</SelectItem>
                      <SelectItem value="Back">Back</SelectItem>
                      <SelectItem value="Shoulders">Shoulders</SelectItem>
                      <SelectItem value="Biceps">Biceps</SelectItem>
                      <SelectItem value="Triceps">Triceps</SelectItem>
                      <SelectItem value="Quadriceps">Legs</SelectItem>
                      <SelectItem value="Core">Core</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select onValueChange={setEquipmentFilter}>
                    <SelectTrigger className="bg-blue-800/30 border-blue-500/40 text-white h-12 rounded-xl">
                      <Filter className="w-4 h-4 mr-2 text-blue-400" />
                      <SelectValue placeholder="Equipment" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900/95 backdrop-blur-md border-blue-500/40 rounded-xl">
                      <SelectItem value="">All Equipment</SelectItem>
                      <SelectItem value="Barbell">Barbell</SelectItem>
                      <SelectItem value="Dumbbells">Dumbbell</SelectItem>
                      <SelectItem value="Cable Machine">Machine</SelectItem>
                      <SelectItem value="Pull-up Bar">Bodyweight</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}

              {(activeTab === 'splits' || activeTab === 'cardio') && (
                <Select onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="bg-blue-800/30 border-blue-500/40 text-white h-12 rounded-xl">
                    <Filter className="w-4 h-4 mr-2 text-blue-400" />
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900/95 backdrop-blur-md border-blue-500/40 rounded-xl">
                    <SelectItem value="">All Levels</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {activeTab === 'days' && (
                <Select onValueChange={setSelectedSplit}>
                  <SelectTrigger className="bg-blue-800/30 border-blue-500/40 text-white h-12 rounded-xl">
                    <Filter className="w-4 h-4 mr-2 text-blue-400" />
                    <SelectValue placeholder="Filter by split" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900/95 backdrop-blur-md border-blue-500/40 rounded-xl">
                    <SelectItem value="">All Splits</SelectItem>
                    {workoutSplits.map(split => (
                      <SelectItem key={split.id} value={split.id}>{split.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <div className="flex items-center space-x-2 bg-blue-900/20 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-blue-500/30 text-blue-300'
                      : 'hover:bg-blue-500/20 text-gray-400 hover:text-blue-400'
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
                      ? 'bg-blue-500/30 text-blue-300'
                      : 'hover:bg-blue-500/20 text-gray-400 hover:text-blue-400'
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
                <Card key={split.id} className="bg-blue-900/40 border-blue-600/50 backdrop-blur-sm hover:bg-blue-900/60 transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{split.name}</CardTitle>
                      <Badge variant="outline" className="border-blue-400/50 text-blue-300">
                        {split.days} days
                      </Badge>
                    </div>
                    <CardDescription className="text-blue-200/70">
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
                      <div className="flex flex-wrap gap-1">
                        {split.focus.map(focus => (
                          <Badge key={focus} variant="outline" className="text-xs border-blue-500/30 text-blue-300">
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
                <Card key={day.id} className="bg-blue-900/40 border-blue-600/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{day.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-300 text-sm">{day.duration} min</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {day.focus.map(focus => (
                        <Badge key={focus} variant="outline" className="text-xs border-blue-500/30 text-blue-300">
                          {focus}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {day.exercises.slice(0, 3).map((exercise, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-blue-800/20 rounded-lg">
                          <span className="text-white text-sm font-medium">{exercise.name}</span>
                          <span className="text-blue-300 text-xs">{exercise.sets}x{exercise.reps}</span>
                        </div>
                      ))}
                      {day.exercises.length > 3 && (
                        <div className="text-center text-blue-400 text-sm">
                          +{day.exercises.length - 3} more exercises
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="exercises" className="mt-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <LoadingSkeleton key={i} type="exercise" />
                ))}
              </div>
            ) : exercises.length === 0 ? (
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-blue-400/50 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-white mb-2">No Exercises Found</h3>
                <p className="text-blue-300/70">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {exercises.map(exercise => (
                  <Card key={exercise.id} className="bg-blue-900/40 border-blue-600/50 backdrop-blur-sm hover:bg-blue-900/60 transition-all duration-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <CardTitle className="text-white text-base font-semibold">{exercise.name}</CardTitle>
                          <div className="flex flex-wrap gap-1">
                            {exercise.primary_muscles?.slice(0, 2).map(muscle => (
                              <Badge key={muscle} variant="outline" className="text-xs border-blue-500/30 text-blue-300">
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
                          <span className="text-blue-300">{exercise.equipment}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Type</span>
                          <span className="text-blue-300">{exercise.mechanics}</span>
                        </div>
                        {exercise.instructions && (
                          <p className="text-blue-200/80 text-xs mt-2">
                            {exercise.instructions.substring(0, 100)}...
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
                <Card key={session.id} className="bg-blue-900/40 border-blue-600/50 backdrop-blur-sm">
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
                    <CardDescription className="text-blue-200/70">
                      {session.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Duration</span>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-300">{session.duration} min</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm text-gray-400">Instructions:</span>
                        <ul className="list-disc list-inside space-y-1 text-blue-200/80 text-sm">
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
                Ask me anything about workouts, form, programming, or nutrition!
              </div>
            )}
            {chatHistory.map((message, index) => (
              <div key={index} className={`p-3 rounded-lg ${message.type === 'user' ? 'bg-blue-800/30 text-white ml-4' : 'bg-gray-800/30 text-gray-300 mr-4'}`}>
                {message.message}
              </div>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Ask about workouts, form, nutrition..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="bg-gray-800/50 border-gray-700/50 text-white flex-1"
            />
            <Button onClick={handleSendMessage} size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutLibrary;
